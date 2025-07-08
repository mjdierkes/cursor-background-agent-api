import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { allTools } from './tools/index.js';
import { apiStatusResource } from './resources/api-status.js';
import { createComposerTemplatePrompt } from './prompts/templates.js';
import { MCP_SERVER_INFO } from '../utils/index.js';

export const createMcpServer = () => {
  const server = new McpServer({
    name: MCP_SERVER_INFO.name,
    version: MCP_SERVER_INFO.version
  }, { 
    capabilities: { 
      logging: {},
      tools: {},
      resources: {},
      prompts: {}
    } 
  });

  // Register all tools
  allTools.forEach(tool => {
    server.registerTool(tool.name, {
      title: tool.name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: tool.description,
      inputSchema: tool.inputSchema
    }, tool.handler);
  });

  // Register resources
  server.registerResource(
    apiStatusResource.name,
    apiStatusResource.uri,
    {
      title: 'API Status',
      description: apiStatusResource.description,
      mimeType: apiStatusResource.mimeType
    },
    apiStatusResource.handler
  );

  // Register prompts
  server.registerPrompt(
    createComposerTemplatePrompt.name,
    {
      title: 'Create Composer Template',
      description: createComposerTemplatePrompt.description,
      argsSchema: createComposerTemplatePrompt.argsSchema
    },
    createComposerTemplatePrompt.handler
  );

  return server;
}; 