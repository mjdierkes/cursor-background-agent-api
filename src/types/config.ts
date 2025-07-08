export interface Config {
  baseUrl: string;
  sessionToken: string;
  userAgent: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  logLevel: string;
} 