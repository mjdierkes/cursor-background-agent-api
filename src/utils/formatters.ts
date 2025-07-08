import { BackgroundComposer } from '../types/index.js';

export function formatComposersList(composers: BackgroundComposer[]): string {
  if (composers.length === 0) {
    return 'No background composers found.';
  }

  const composerList = composers.map(composer => 
    `• ID: ${composer.bcId}\n  Status: ${composer.status || 'Unknown'}\n  Created: ${new Date(composer.createdAtMs).toLocaleString()}`
  ).join('\n\n');

  return `Found ${composers.length} background composer(s):\n\n${composerList}`;
}

export function formatComposerDetails(details: any): string {
  return JSON.stringify(details, null, 2);
}

export function formatApiError(error: any): string {
  if (error.status) {
    return `API Error (${error.status}): ${error.message}`;
  }
  return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
}

export function formatSuccessMessage(message: string, details?: Record<string, any>): string {
  let result = message;
  if (details) {
    result += '\n\n';
    result += Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
  return result;
} 