import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from './config.js';
import { ApiError } from './types.js';
import { logger } from './logger.js';

export class HttpClient {
  private axios: AxiosInstance;

  constructor(sessionToken: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `NEXT_LOCALE=en; WorkosCursorSessionToken=${sessionToken}`,
      'User-Agent': config.userAgent,
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"'
    };

    this.axios = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers
    });

    // Configure retry logic
    axiosRetry(this.axios, {
      retries: config.maxRetries,
      retryDelay: (retryCount) => {
        const delay = config.retryDelay * retryCount;
        logger.info(`Retrying request (${retryCount}/${config.maxRetries}) after ${delay}ms`);
        return delay;
      },
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               (error.response?.status ? error.response.status >= 500 : false);
      }
    });
  }

  async request<T>(requestConfig: AxiosRequestConfig): Promise<T> {
    try {
      logger.debug(`Making request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
      
      // Ensure Content-Type is set for POST requests with data
      if (requestConfig.method === 'POST' && requestConfig.data) {
        requestConfig.headers = {
          ...requestConfig.headers,
          'Content-Type': 'application/json'
        };
      }
      
      const response = await this.axios.request<T>(requestConfig);
      logger.debug(`Request successful: ${response.status}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status || 0;
      const message = `Request failed: ${axiosError.message}`;
      
      logger.error(message, { 
        status, 
        url: requestConfig.url, 
        method: requestConfig.method 
      });
      
      throw new ApiError(message, status, axiosError.response?.data);
    }
  }
} 