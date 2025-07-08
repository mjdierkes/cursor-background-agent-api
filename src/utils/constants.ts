export const DEFAULT_TASK_MODELS = [
  'claude-4-sonnet-thinking',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku'
] as const;

export const DEFAULT_REPOSITORY_BRANCH = 'main';

export const DEFAULT_COMPOSER_LIMIT = 100;

export const TASK_PREFIXES = {
  'bug-fix': 'Fix the following bug:',
  'feature': 'Implement the following feature:',
  'refactor': 'Refactor the code to:',
  'documentation': 'Add or update documentation for:',
  'testing': 'Add tests for:',
  'custom': 'Custom task:'
} as const;

export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'] as const;

export const TASK_TYPES = ['bug-fix', 'feature', 'refactor', 'documentation', 'testing', 'custom'] as const;

export const MCP_SERVER_INFO = {
  name: 'cursor-background-agent-mcp',
  version: '1.0.0',
  description: 'MCP server for Cursor Background Agent API'
} as const; 