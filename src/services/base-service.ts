import { HttpClient } from '../http-client.js';
import { logger } from '../utils/logger.js';

export abstract class BaseService {
  protected httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  protected async request<T>(config: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
  }): Promise<T> {
    logger.debug(`${this.constructor.name}: ${config.method} ${config.url}`);
    return this.httpClient.request<T>(config);
  }
} 