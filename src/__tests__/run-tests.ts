#!/usr/bin/env tsx

import { logger } from '../utils/logger.js';

/**
 * Test runner for manual execution of tests
 * 
 * Note: This file is now deprecated as tests have been converted to Vitest format.
 * Use `npm run test` to run all tests with Vitest.
 * 
 * Individual test files can be run with:
 * - npx vitest src/__tests__/unit/utils/formatters.test.ts
 * - npx vitest src/__tests__/integration/api-client.test.ts
 * - npx vitest src/__tests__/integration/mcp-server.test.ts
 */

async function runAllTests() {
  logger.info('Test runner is deprecated. Use `npm run test` instead.');
  logger.info('To run specific test files:');
  logger.info('  npx vitest src/__tests__/unit/utils/formatters.test.ts');
  logger.info('  npx vitest src/__tests__/integration/api-client.test.ts');
  logger.info('  npx vitest src/__tests__/integration/mcp-server.test.ts');
  
  process.exit(0);
}

async function runMcpTests() {
  logger.info('MCP server tests are now part of the main test suite.');
  logger.info('Use `npm run test` to run all tests or:');
  logger.info('  npx vitest src/__tests__/integration/mcp-server.test.ts');
  
  process.exit(0);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testType = process.argv[2];
  
  if (testType === 'mcp') {
    runMcpTests();
  } else {
    runAllTests();
  }
}

export { runAllTests, runMcpTests }; 