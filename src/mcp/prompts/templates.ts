import { z } from 'zod';
import { GetPromptResult } from '@modelcontextprotocol/sdk/types.js';
import { TASK_PREFIXES, TASK_TYPES, PRIORITY_LEVELS } from '../../utils/index.js';

interface CreateComposerTemplateParams {
  taskType: typeof TASK_TYPES[number];
  description: string;
  priority?: typeof PRIORITY_LEVELS[number];
}

export const createComposerTemplatePrompt = {
  name: 'create-composer-template',
  description: 'Template for creating a background composer with common task patterns',
  argsSchema: {
    taskType: z.enum(TASK_TYPES).describe('Type of task'),
    description: z.string().describe('Specific task description'),
    priority: z.enum(PRIORITY_LEVELS).optional().describe('Task priority')
  },
  handler: async ({ taskType, description, priority }: CreateComposerTemplateParams): Promise<GetPromptResult> => {
    const priorityText = priority ? `\n\nPriority: ${priority.toUpperCase()}` : '';
    const taskPrefix = TASK_PREFIXES[taskType];
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
}; 