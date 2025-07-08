import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { CursorAPIClient } from '../../api-client.js';
import { ApiError } from '../../types/index.js';
import { formatComposersList, formatComposerDetails, formatApiError, formatSuccessMessage } from '../../utils/index.js';

export interface CreateComposerParams {
  taskDescription: string;
  repositoryUrl: string;
  branch?: string;
  model?: string;
}

export interface ListComposersParams {
  limit?: number;
  includeStatus?: boolean;
}

export interface GetComposerDetailsParams {
  composerId: string;
}

export const createBackgroundComposerTool = {
  name: 'create-background-composer',
  description: 'Create a new background composer task in Cursor',
  inputSchema: {
    taskDescription: z.string().describe('Task description (prompt for the AI)'),
    repositoryUrl: z.string().describe('Repository URL (e.g., https://github.com/owner/repo.git)'),
    branch: z.string().optional().describe('Branch name (defaults to main)'),
    model: z.string().optional().describe('Model to use (defaults to claude-4-sonnet-thinking)')
  },
  handler: async ({ taskDescription, repositoryUrl, branch, model }: CreateComposerParams): Promise<CallToolResult> => {
    try {
      const client = new CursorAPIClient();
      const result = await client.createBackgroundComposer({
        taskDescription,
        repositoryUrl,
        branch: branch || 'main',
        model: model || 'claude-4-sonnet-thinking'
      });
      
      return {
        content: [{
          type: 'text',
          text: formatSuccessMessage('Background composer created successfully!', {
            'Composer ID': result.composer?.bcId,
            'Task': taskDescription,
            'Repository': repositoryUrl,
            'Branch': branch || 'main',
            'Model': model || 'claude-4-sonnet-thinking'
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Failed to create background composer: ${formatApiError(error)}`
        }]
      };
    }
  }
};

export const listBackgroundComposersTool = {
  name: 'list-background-composers',
  description: 'List all background composers with their status',
  inputSchema: {
    limit: z.number().optional().describe('Number of composers to return (defaults to 10)'),
    includeStatus: z.boolean().optional().describe('Include status information (defaults to true)')
  },
  handler: async ({ limit, includeStatus }: ListComposersParams): Promise<CallToolResult> => {
    try {
      const client = new CursorAPIClient();
      const composers = await client.listComposers(limit || 10, includeStatus !== false);
      
      return {
        content: [{
          type: 'text',
          text: formatComposersList(composers)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Failed to list background composers: ${formatApiError(error)}`
        }]
      };
    }
  }
};

export const getComposerDetailsTool = {
  name: 'get-composer-details',
  description: 'Get detailed information about a specific background composer',
  inputSchema: {
    composerId: z.string().describe('Background composer ID')
  },
  handler: async ({ composerId }: GetComposerDetailsParams): Promise<CallToolResult> => {
    try {
      const client = new CursorAPIClient();
      const details = await client.getDetailedComposer(composerId);
      
      return {
        content: [{
          type: 'text',
          text: `Composer Details:\n\n${formatComposerDetails(details)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get composer details: ${formatApiError(error)}`
        }]
      };
    }
  }
}; 