import express, { Request, Response } from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './index.js';
import { logger } from '../utils/logger.js';
import { MCP_SERVER_INFO } from '../utils/index.js';

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
      service: MCP_SERVER_INFO.name,
      version: MCP_SERVER_INFO.version,
      description: MCP_SERVER_INFO.description,
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