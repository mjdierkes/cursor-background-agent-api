import { CursorAPIClient } from './api-client.js';
import { logger } from './logger.js';

async function testApiClient() {
  try {
    logger.info('Testing API client...');
    
    const client = new CursorAPIClient();
    
    // Test a simple endpoint
    const composers = await client.listComposersParsed();
    console.log('\n=== List Composers Test ===');
    console.log(composers.summary);
    composers.details.forEach(detail => console.log(detail));
    
    logger.info('API client test completed successfully!');
    
  } catch (error) {
    logger.error('API client test failed:', error);
    
    if (error instanceof Error && error.message.includes('Session token not found')) {
      logger.info('To run this test, set CURSOR_SESSION_TOKEN environment variable or provide cookies.json');
    }
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testApiClient();
} 