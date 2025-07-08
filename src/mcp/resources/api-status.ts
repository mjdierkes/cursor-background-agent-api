import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { CursorAPIClient } from '../../api-client.js';

export const apiStatusResource = {
  name: 'api-status',
  uri: 'cursor://api/status',
  description: 'Current status of the Cursor API client',
  mimeType: 'application/json',
  handler: async (): Promise<ReadResourceResult> => {
    try {
      const client = new CursorAPIClient();
      const testResult = await client.testAllEndpoints();
      
      return {
        contents: [{
          uri: 'cursor://api/status',
          text: JSON.stringify(testResult, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: 'cursor://api/status',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }]
      };
    }
  }
}; 