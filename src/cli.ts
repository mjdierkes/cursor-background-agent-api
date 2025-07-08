#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CursorAPIClient } from './api-client.js';
import { logger } from './logger.js';
import { ApiError } from './types.js';

interface Arguments {
  token?: string;
  composerId?: string;
  taskTitle?: string;
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
        
      case 'github': {
        const github = await client.getGitHubInstallationsParsed();
        printParsedResponse(github, args.format);
        break;
      }
        
      case 'settings': {
        const settings = await client.getUserSettingsParsed();
        printParsedResponse(settings, args.format);
        break;
      }
        
      case 'test': {
        const results = await client.testAllEndpoints();
        if (args.format === 'json') {
          console.log(JSON.stringify(results, null, 2));
        } else {
          console.log('\n=== Test Results ===');
          results.forEach(result => {
            let status = '✗';
            if (result.status === 'success') {
              status = '✓';
            } else if (result.status === 'accessible') {
              status = '⚠';
            }
            console.log(`${status} ${result.endpoint}`);
            if (result.error) {
              const prefix = result.status === 'accessible' ? '  Expected error:' : '  Error:';
              console.log(`${prefix} ${result.error}`);
            }
          });
          
          // Summary
          const successful = results.filter(r => r.status === 'success').length;
          const accessible = results.filter(r => r.status === 'accessible').length;
          const failed = results.filter(r => r.status === 'error').length;
          
          console.log('\n=== Summary ===');
          console.log(`✓ Successful: ${successful}`);
          console.log(`⚠ Accessible: ${accessible}`);
          console.log(`✗ Failed: ${failed}`);
          console.log(`📊 Total Coverage: ${successful + accessible}/${results.length} endpoints tested`);
        }
        break;
      }
        
      case 'create': {
        if (!args.taskTitle || !args.taskDescription) {
          throw new Error('Task title and description are required for create command');
        }
        
        const taskData = {
          task_title: args.taskTitle,
          task_description: args.taskDescription,
          async: false,
          allowed_write_directories: ['/tmp']
        };
        
        const result = await client.createComposer(taskData);
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
  .command('github', 'Get GitHub installations')
  .command('settings', 'Get user settings')
  .command('test', 'Test all API endpoints')
  .command('create', 'Create a new background composer task', (yargs) => {
    return yargs
      .option('task-title', {
        alias: 't',
        describe: 'Task title',
        type: 'string',
        demandOption: true
      })
      .option('task-description', {
        alias: 'd',
        describe: 'Task description',
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