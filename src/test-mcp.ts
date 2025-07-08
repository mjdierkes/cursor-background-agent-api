#!/usr/bin/env tsx

import { logger } from './logger.js';

// Test MCP server endpoints
async function testMcpServer() {
  const baseUrl = 'http://localhost:3001';
  
  logger.info('Testing MCP server...');
  
  // Test 1: Health check
  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    logger.info('✓ Health check:', healthData);
  } catch (error) {
    logger.error('✗ Health check failed:', error);
    return;
  }
  
  // Test 2: MCP initialize request
  try {
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
    
    const initResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify(initializeRequest)
    });
    
    if (!initResponse.ok) {
      throw new Error(`HTTP ${initResponse.status}: ${await initResponse.text()}`);
    }
    
    const initData = await initResponse.json();
    logger.info('✓ MCP initialize:', initData);
  } catch (error) {
    logger.error('✗ MCP initialize failed:', error);
    return;
  }
  
  // Test 3: List tools
  try {
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    
    const toolsResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify(listToolsRequest)
    });
    
    if (!toolsResponse.ok) {
      throw new Error(`HTTP ${toolsResponse.status}: ${await toolsResponse.text()}`);
    }
    
    const toolsData = await toolsResponse.json();
    logger.info('✓ Tools list:', toolsData);
    
    if (toolsData.result?.tools) {
      logger.info(`Found ${toolsData.result.tools.length} tools:`);
      toolsData.result.tools.forEach((tool: any) => {
        logger.info(`  - ${tool.name}: ${tool.description}`);
      });
    }
  } catch (error) {
    logger.error('✗ Tools list failed:', error);
  }
  
  // Test 4: List resources
  try {
    const listResourcesRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'resources/list',
      params: {}
    };
    
    const resourcesResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify(listResourcesRequest)
    });
    
    if (!resourcesResponse.ok) {
      throw new Error(`HTTP ${resourcesResponse.status}: ${await resourcesResponse.text()}`);
    }
    
    const resourcesData = await resourcesResponse.json();
    logger.info('✓ Resources list:', resourcesData);
    
    if (resourcesData.result?.resources) {
      logger.info(`Found ${resourcesData.result.resources.length} resources:`);
      resourcesData.result.resources.forEach((resource: any) => {
        logger.info(`  - ${resource.uri}: ${resource.description}`);
      });
    }
  } catch (error) {
    logger.error('✗ Resources list failed:', error);
  }
  
  // Test 5: List prompts
  try {
    const listPromptsRequest = {
      jsonrpc: '2.0',
      id: 4,
      method: 'prompts/list',
      params: {}
    };
    
    const promptsResponse = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify(listPromptsRequest)
    });
    
    if (!promptsResponse.ok) {
      throw new Error(`HTTP ${promptsResponse.status}: ${await promptsResponse.text()}`);
    }
    
    const promptsData = await promptsResponse.json();
    logger.info('✓ Prompts list:', promptsData);
    
    if (promptsData.result?.prompts) {
      logger.info(`Found ${promptsData.result.prompts.length} prompts:`);
      promptsData.result.prompts.forEach((prompt: any) => {
        logger.info(`  - ${prompt.name}: ${prompt.description}`);
      });
    }
  } catch (error) {
    logger.error('✗ Prompts list failed:', error);
  }
  
  logger.info('MCP server test completed!');
}

// Run the test
testMcpServer().catch(console.error); 