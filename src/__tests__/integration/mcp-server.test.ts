import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { startMcpServer } from '../../mcp/server.js';
import { Server } from 'http';

describe('MCP Server Integration Tests', () => {
  const baseUrl = 'http://localhost:3001';
  let server: Server;

  beforeAll(async () => {
    // Start the MCP server before running tests
    server = await startMcpServer(3001);
    
    // Wait a bit for the server to fully start
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Stop the MCP server after tests complete
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    }
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await fetch(`${baseUrl}/health`);
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });
  });

  describe('MCP Initialize', () => {
    test('should initialize MCP server', async () => {
      const initializeRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      };
      
      const response = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(initializeRequest)
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.result).toBeDefined();
      expect(data.result.capabilities).toBeDefined();
    });
  });

  describe('Tools List', () => {
    test('should list available tools', async () => {
      const listToolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };
      
      const response = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(listToolsRequest)
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.result).toBeDefined();
      expect(Array.isArray(data.result.tools)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle unsupported methods', async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: 'GET'
      });
      
      expect(response.status).toBe(405);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32000);
    });
  });
}); 