import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { CursorAPIClient } from '../../api-client.js';
import { ApiError } from '../../types/index.js';
import { formatApiError } from '../../utils/index.js';

export const checkWebAccessTool = {
  name: 'check-web-access',
  description: 'Check if the agent has web access enabled',
  inputSchema: {},
  handler: async (): Promise<CallToolResult> => {
    try {
      const client = new CursorAPIClient();
      const webAccess = await client.checkWebAccessParsed();
      
      return {
        content: [{
          type: 'text',
          text: webAccess.summary || 'Web access status retrieved successfully'
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Failed to check web access: ${formatApiError(error)}`
        }]
      };
    }
  }
};

export const getUserSettingsTool = {
  name: 'get-user-settings',
  description: 'Get current user settings',
  inputSchema: {},
  handler: async (): Promise<CallToolResult> => {
    try {
      const client = new CursorAPIClient();
      const settings = await client.getUserSettingsParsed();
      
      return {
        content: [{
          type: 'text',
          text: settings.summary || 'User settings retrieved successfully'
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get user settings: ${formatApiError(error)}`
        }]
      };
    }
  }
};

export const getPrivacyModeTool = {
  name: 'get-privacy-mode',
  description: 'Get current privacy mode settings',
  inputSchema: {},
  handler: async (): Promise<CallToolResult> => {
    try {
      const client = new CursorAPIClient();
      const privacy = await client.getPrivacyModeParsed();
      
      return {
        content: [{
          type: 'text',
          text: privacy.summary || 'Privacy mode settings retrieved successfully'
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get privacy mode: ${formatApiError(error)}`
        }]
      };
    }
  }
}; 