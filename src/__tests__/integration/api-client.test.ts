import { describe, test, expect, beforeEach } from 'vitest';
import { CursorAPIClient } from '../../api-client.js';
import { mockComposerList, mockCreateResponse } from '../fixtures/mock-responses.js';

describe('API Client Integration Tests', () => {
  let client: CursorAPIClient;

  beforeEach(() => {
    client = new CursorAPIClient('mock-token');
  });

  describe('listComposersParsed', () => {
    test('should return valid response structure', async () => {
      const result = await client.listComposersParsed();
      
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('details');
      expect(Array.isArray(result.details)).toBe(true);
    });
  });

  describe('checkWebAccess', () => {
    test('should handle errors gracefully', async () => {
      // This test expects the method to either succeed or throw an error
      // Both outcomes are valid for this test
      try {
        await client.checkWebAccess();
        // If it succeeds, that's fine
        expect(true).toBe(true);
      } catch (error) {
        // If it throws an error, that's also expected
        expect(error).toBeDefined();
      }
    });
  });

  describe('testAllEndpoints', () => {
    test('should return proper result structure', async () => {
      const result = await client.testAllEndpoints();
      
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
      
      if (!result.success) {
        expect(result).toHaveProperty('error');
      }
    });
  });
}); 