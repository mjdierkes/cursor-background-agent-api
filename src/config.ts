import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Config } from './types/config.js';

// Load environment variables
loadEnv();

function getSessionToken(): string {
  // Try environment variable first
  if (process.env.CURSOR_SESSION_TOKEN) {
    return process.env.CURSOR_SESSION_TOKEN;
  }
  
  // Fall back to cookies.json for backward compatibility
  try {
    const cookiesPath = join(process.cwd(), 'cookies.json');
    const cookiesData = JSON.parse(readFileSync(cookiesPath, 'utf8'));
    const sessionCookie = cookiesData.find((cookie: any) => cookie.name === 'WorkosCursorSessionToken');
    
    if (sessionCookie?.value) {
      return sessionCookie.value;
    }
  } catch (error) {
    // Ignore file read errors
  }
  
  throw new Error('Session token not found. Set CURSOR_SESSION_TOKEN environment variable or provide cookies.json');
}

export const config: Config = {
  baseUrl: process.env.CURSOR_BASE_URL || 'https://cursor.com',
  sessionToken: getSessionToken(),
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  retryDelay: 1000,
  logLevel: process.env.LOG_LEVEL || 'info'
};

export const endpoints = {
  backgroundComposer: {
    list: '/api/background-composer/list',
    checkWebAccess: '/api/background-composer/check-agent-web-access',
    userSettings: '/api/background-composer/get-background-composer-user-settings',
    updateUserSettings: '/api/background-composer/update-background-composer-user-settings',
    create: '/api/auth/startBackgroundComposerFromSnapshot',
    getDetailed: '/api/background-composer/get-detailed-composer',
    getDiffDetails: '/api/background-composer/get-diff-details',
    getChangesHash: '/api/background-composer/get-changes-hash',
    openPr: '/api/background-composer/open-pr',
    pause: '/api/background-composer/pause',
    revertFile: '/api/background-composer/revert-file',
    attachBackgroundComposer: '/api/background-composer/attach-background-composer',
    attachBackgroundComposerLogs: '/api/background-composer/attach-background-composer-logs'
  },
  dashboard: {
    privacyMode: '/api/dashboard/get-user-privacy-mode'
  }
} as const; 