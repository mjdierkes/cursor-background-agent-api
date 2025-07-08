import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolResult, GetPromptResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { CursorAPIClient } from './api-client.js';
import { logger } from './logger.js';
import { ApiError } from './types.js';

const createMcpServer = () => {
  const server = new McpServer({
    name: 'cursor-background-agent-mcp',
    version: '1.0.0'
  }, { 
    capabilities: { 
      logging: {},
      tools: {},
      resources: {},
      prompts: {}
    } 
  });

  // Tool: Create Background Composer
  server.registerTool(
    'create-background-composer',
    {
      title: 'Create Background Composer',
      description: 'Create a new background composer task in Cursor',
      inputSchema: {
        taskDescription: z.string().describe('Task description (prompt for the AI)'),
        repositoryUrl: z.string().describe('Repository URL (e.g., https://github.com/owner/repo.git)'),
        branch: z.string().optional().describe('Branch name (defaults to main)'),
        model: z.string().optional().describe('Model to use (defaults to claude-4-sonnet-thinking)')
      }
    },
    async ({ taskDescription, repositoryUrl, branch, model }): Promise<CallToolResult> => {
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
            text: `Background composer created successfully!\n\nComposer ID: ${result.composer?.bcId}\nTask: ${taskDescription}\nRepository: ${repositoryUrl}\nBranch: ${branch || 'main'}\nModel: ${model || 'claude-4-sonnet-thinking'}`
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof ApiError ? 
          `API Error (${error.status}): ${error.message}` : 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        return {
          content: [{
            type: 'text',
            text: `Failed to create background composer: ${errorMessage}`
          }]
        };
      }
    }
  );

  // Tool: List Background Composers
  server.registerTool(
    'list-background-composers',
    {
      title: 'List Background Composers',
      description: 'List all background composers with their status',
      inputSchema: {
        limit: z.number().optional().describe('Number of composers to return (defaults to 10)'),
        includeStatus: z.boolean().optional().describe('Include status information (defaults to true)')
      }
    },
    async ({ limit, includeStatus }): Promise<CallToolResult> => {
      try {
        const client = new CursorAPIClient();
        const composers = await client.listComposers(limit || 10, includeStatus !== false);
        
        if (composers.length === 0) {
          return {
            content: [{
              type: 'text',
              text: 'No background composers found.'
            }]
          };
        }

        const composerList = composers.map(composer => 
          `• ID: ${composer.bcId}\n  Status: ${composer.status || 'Unknown'}\n  Created: ${new Date(composer.createdAt).toLocaleString()}`
        ).join('\n\n');

        return {
          content: [{
            type: 'text',
            text: `Found ${composers.length} background composer(s):\n\n${composerList}`
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof ApiError ? 
          `API Error (${error.status}): ${error.message}` : 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        return {
          content: [{
            type: 'text',
            text: `Failed to list background composers: ${errorMessage}`
          }]
        };
      }
    }
  );

  // Tool: Get Composer Details
  server.registerTool(
    'get-composer-details',
    {
      title: 'Get Composer Details',
      description: 'Get detailed information about a specific background composer',
      inputSchema: {
        composerId: z.string().describe('Background composer ID')
      }
    },
    async ({ composerId }): Promise<CallToolResult> => {
      try {
        const client = new CursorAPIClient();
        const details = await client.getDetailedComposer(composerId);
        
        return {
          content: [{
            type: 'text',
            text: `Composer Details:\n\n${JSON.stringify(details, null, 2)}`
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof ApiError ? 
          `API Error (${error.status}): ${error.message}` : 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        return {
          content: [{
            type: 'text',
            text: `Failed to get composer details: ${errorMessage}`
          }]
        };
      }
    }
  );

  // Tool: Check Web Access
  server.registerTool(
    'check-web-access',
    {
      title: 'Check Web Access',
      description: 'Check if the agent has web access enabled',
      inputSchema: {}
    },
    async (): Promise<CallToolResult> => {
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
        const errorMessage = error instanceof ApiError ? 
          `API Error (${error.status}): ${error.message}` : 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        return {
          content: [{
            type: 'text',
            text: `Failed to check web access: ${errorMessage}`
          }]
        };
      }
    }
  );

  // Tool: Get User Settings
  server.registerTool(
    'get-user-settings',
    {
      title: 'Get User Settings',
      description: 'Get current user settings',
      inputSchema: {}
    },
    async (): Promise<CallToolResult> => {
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
        const errorMessage = error instanceof ApiError ? 
          `API Error (${error.status}): ${error.message}` : 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        return {
          content: [{
            type: 'text',
            text: `Failed to get user settings: ${errorMessage}`
          }]
        };
      }
    }
  );

  // Tool: Get Privacy Mode
  server.registerTool(
    'get-privacy-mode',
    {
      title: 'Get Privacy Mode',
      description: 'Get current privacy mode settings',
      inputSchema: {}
    },
    async (): Promise<CallToolResult> => {
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
        const errorMessage = error instanceof ApiError ? 
          `API Error (${error.status}): ${error.message}` : 
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        return {
          content: [{
            type: 'text',
            text: `Failed to get privacy mode: ${errorMessage}`
          }]
        };
      }
    }
  );

  // Resource: API Status
  server.registerResource(
    'api-status',
    'cursor://api/status',
    {
      title: 'API Status',
      description: 'Current status of the Cursor API client',
      mimeType: 'application/json'
    },
    async (): Promise<ReadResourceResult> => {
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
  );

  // Prompt: Create Composer Template
  server.registerPrompt(
    'create-composer-template',
    {
      title: 'Create Composer Template',
      description: 'Template for creating a background composer with common task patterns',
      argsSchema: {
        taskType: z.enum(['bug-fix', 'feature', 'refactor', 'documentation', 'testing', 'custom']).describe('Type of task'),
        description: z.string().describe('Specific task description'),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().describe('Task priority')
      }
    },
    async ({ taskType, description, priority }): Promise<GetPromptResult> => {
      const taskPrefixes = {
        'bug-fix': 'Fix the following bug:',
        'feature': 'Implement the following feature:',
        'refactor': 'Refactor the code to:',
        'documentation': 'Add or update documentation for:',
        'testing': 'Add tests for:',
        'custom': 'Custom task:'
      };

      const priorityText = priority ? `\n\nPriority: ${priority.toUpperCase()}` : '';
      const taskPrefix = taskPrefixes[taskType];
      const fullPrompt = `${taskPrefix} ${description}${priorityText}`;

      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: fullPrompt
          }
        }]
      };
    }
  );

  return server;
};

export const startMcpServer = async (port: number = 3001) => {
  const app = express();
  app.use(express.json());

  // Configure CORS to expose MCP session header
  app.use(cors({
    origin: '*',
    exposedHeaders: ['Mcp-Session-Id']
  }));

  // MCP endpoint
  app.post('/mcp', async (req: Request, res: Response) => {
    const server = createMcpServer();
    
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless - no session management
      });
      
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      
      res.on('close', () => {
        logger.debug('MCP request closed');
        transport.close();
        server.close();
      });
    } catch (error) {
      logger.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // Handle unsupported methods
  app.get('/mcp', (req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed. Use POST for MCP requests.'
      },
      id: null
    });
  });

  app.delete('/mcp', (req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed. Use POST for MCP requests.'
      },
      id: null
    });
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'cursor-background-agent-mcp',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Start the server
  const server = app.listen(port, () => {
    logger.info(`MCP Server listening on port ${port}`);
    logger.info(`MCP endpoint: http://localhost:${port}/mcp`);
    logger.info(`Health check: http://localhost:${port}/health`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down MCP server...');
    server.close(() => {
      logger.info('MCP server closed');
      process.exit(0);
    });
  });

  return server;
}; 