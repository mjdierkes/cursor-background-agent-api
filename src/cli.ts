#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CursorAPIClient } from './api-client.js';
import { logger } from './logger.js';
import { ApiError } from './types.js';

interface Arguments {
  token?: string;
  composerId?: string;
  taskDescription?: string;
  format: 'json' | 'table' | 'raw';
  verbose: boolean;
  _: (string | number)[];
}

function printParsedResponse(response: any, format: string) {
  if (format === 'json') {
    console.log(JSON.stringify(response, null, 2));
    return;
  }
  
  if (format === 'raw') {
    console.log(response);
    return;
  }
  
  // Table format (default)
  if (response.summary) {
    console.log(`\n${response.summary}`);
    if (response.details && response.details.length > 0) {
      response.details.forEach((detail: string) => console.log(detail));
    }
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
}

async function runCommand(args: Arguments) {
  try {
    const client = new CursorAPIClient(args.token);
    const command = args._[0] as string;
    
    switch (command) {
      case 'list': {
        const composers = await client.listComposersParsed();
        printParsedResponse(composers, args.format);
        break;
      }
        
      case 'web-access': {
        const webAccess = await client.checkWebAccessParsed();
        printParsedResponse(webAccess, args.format);
        break;
      }
        
      case 'privacy': {
        const privacy = await client.getPrivacyModeParsed();
        printParsedResponse(privacy, args.format);
        break;
      }
        
      case 'settings': {
        const settings = await client.getUserSettingsParsed();
        printParsedResponse(settings, args.format);
        break;
      }
        
      case 'test': {
        const testResult = await client.testAllEndpoints();
        if (args.format === 'json') {
          console.log(JSON.stringify(testResult, null, 2));
        } else {
          console.log('\n=== Test Results ===');
          if (testResult.success) {
            console.log('✓ API test completed successfully');
            console.log('✓ Create Background Composer - Success');
            console.log('✓ List Background Composers - Success');
            console.log('✓ Check Web Access - Success');
          } else {
            console.log('✗ API test failed');
            if (testResult.error) {
              console.log(`  Error: ${testResult.error}`);
            }
          }
          
          console.log('\n=== Summary ===');
          if (testResult.success) {
            console.log('✓ All core endpoints working correctly');
          } else {
            console.log('✗ Test failed - check your authentication and repository access');
          }
        }
        break;
      }
        
      case 'create': {
        if (!args.taskDescription) {
          throw new Error('Task description is required for create command');
        }
        
        const options = {
          taskDescription: args.taskDescription,
          repositoryUrl: 'https://github.com/mjdierkes/cursor-background-agent-api.git',
          branch: 'main',
          model: 'claude-4-sonnet-thinking'
        };
        
        const result = await client.createBackgroundComposer(options);
        printParsedResponse(result, args.format);
        break;
      }
        
      case 'details': {
        if (!args.composerId) {
          throw new Error('Composer ID is required for details command');
        }
        
        const details = await client.getDetailedComposer(args.composerId);
        printParsedResponse(details, args.format);
        break;
      }
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error(`API Error (${error.status}): ${error.message}`);
      if (args.verbose && error.response) {
        console.error('Response:', error.response);
      }
    } else if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
    } else {
      logger.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

const argv = yargs(hideBin(process.argv))
  .scriptName('cursor-api')
  .usage('Usage: $0 <command> [options]')
  .command('list', 'List background composers')
  .command('web-access', 'Check agent web access')
  .command('privacy', 'Get privacy mode settings')
  .command('settings', 'Get user settings')
  .command('test', 'Test all API endpoints')
  .command('create', 'Create a new background composer task', (yargs) => {
    return yargs
      .option('task-description', {
        alias: 'd',
        describe: 'Task description (prompt)',
        type: 'string',
        demandOption: true
      });
  })
  .command('details', 'Get detailed composer information', (yargs) => {
    return yargs
      .option('composer-id', {
        alias: 'id',
        describe: 'Composer ID',
        type: 'string',
        demandOption: true
      });
  })
  .option('token', {
    alias: 'T',
    describe: 'Session token (overrides environment variable)',
    type: 'string'
  })
  .option('format', {
    alias: 'f',
    describe: 'Output format',
    choices: ['json', 'table', 'raw'] as const,
    default: 'table' as const
  })
  .option('verbose', {
    alias: 'v',
    describe: 'Verbose output',
    type: 'boolean',
    default: false
  })
  .demandCommand(1, 'You must specify a command')
  .help()
  .alias('help', 'h')
  .parseSync() as Arguments;

// Set log level based on verbose flag
if (argv.verbose) {
  process.env.LOG_LEVEL = 'debug';
}

// Run the command
runCommand(argv); 