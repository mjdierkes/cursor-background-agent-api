import { ApiError } from '../types/index.js';
import { logger } from './logger.js';

export interface ErrorContext {
  operation: string;
  details?: Record<string, any>;
}

export class ErrorHandler {
  static handle(error: unknown, context: ErrorContext): never {
    const errorMessage = this.formatError(error);
    logger.error(`${context.operation} failed: ${errorMessage}`, context.details);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      errorMessage,
      error instanceof Error && 'status' in error ? (error as any).status : 500,
      error
    );
  }

  static formatError(error: unknown): string {
    if (error instanceof ApiError) {
      return `API Error (${error.status}): ${error.message}`;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Unknown error occurred';
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext
  ): Promise<T> {
    try {
      logger.debug(`Starting operation: ${context.operation}`);
      const result = await operation();
      logger.debug(`Operation completed successfully: ${context.operation}`);
      return result;
    } catch (error) {
      this.handle(error, context);
    }
  }

  static isRetryableError(error: unknown): boolean {
    if (error instanceof ApiError) {
      // Retry on server errors (5xx) and certain client errors
      return error.status >= 500 || error.status === 429;
    }
    
    if (error instanceof Error) {
      // Retry on network errors
      return error.message.includes('network') || 
             error.message.includes('timeout') ||
             error.message.includes('connection');
    }
    
    return false;
  }
}

export const withErrorHandling = ErrorHandler.withErrorHandling.bind(ErrorHandler); 