import { describe, test, expect } from 'vitest';
import { 
  formatComposersList, 
  formatComposerDetails, 
  formatApiError, 
  formatSuccessMessage 
} from '../../../utils/formatters.js';
import { mockComposer, mockComposerList } from '../../fixtures/mock-responses.js';
import { ApiError } from '../../../types/index.js';

describe('Formatters Unit Tests', () => {
  describe('formatComposersList', () => {
    test('should format empty list', () => {
      const result = formatComposersList([]);
      expect(result).toBe('No background composers found.');
    });

    test('should format populated list', () => {
      const result = formatComposersList(mockComposerList);
      expect(result).toContain('Found 2 background composer(s)');
      expect(result).toContain(mockComposerList[0].bcId);
    });
  });

  describe('formatComposerDetails', () => {
    test('should format details object', () => {
      const testDetails = { id: 'test', name: 'Test Composer' };
      const result = formatComposerDetails(testDetails);
      
      expect(result).toContain('"id": "test"');
      expect(result).toContain('"name": "Test Composer"');
    });
  });

  describe('formatApiError', () => {
    test('should format API error', () => {
      const apiError = new ApiError('API failed', 500, {});
      const result = formatApiError(apiError);
      expect(result).toContain('API Error (500)');
    });

    test('should format regular error', () => {
      const regularError = new Error('Regular error');
      const result = formatApiError(regularError);
      expect(result).toContain('Error: Regular error');
    });

    test('should format unknown error', () => {
      const result = formatApiError('unknown');
      expect(result).toContain('Unknown error');
    });
  });

  describe('formatSuccessMessage', () => {
    test('should format simple success message', () => {
      const result = formatSuccessMessage('Success!');
      expect(result).toBe('Success!');
    });

    test('should format success message with details', () => {
      const result = formatSuccessMessage('Success!', { id: '123', name: 'Test' });
      expect(result).toContain('Success!');
      expect(result).toContain('id: 123');
    });
  });
}); 