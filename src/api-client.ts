import { HttpClient } from './http-client.js';
import { logger } from './logger.js';
import { config, endpoints } from './config.js';
import {
  BackgroundComposer,
  BackgroundComposerRequest,
  BackgroundComposerResponse,
  ApiError,
  CreateBackgroundComposerOptions,
  CreateBackgroundComposerResponse
} from './types.js';
import {
  parseComposerList,
  parseWebAccess,
  parsePrivacyMode,
  parseUserSettings,
  ParsedResponse
} from './parsers.js';

export class CursorAPIClient {
  private httpClient: HttpClient;

  constructor(sessionToken?: string) {
    const token = sessionToken || config.sessionToken;
    this.httpClient = new HttpClient(token);
    logger.info(`Initialized API client with session token: ${token.substring(0, 50)}...`);
  }

  // Background Composer methods
  async listComposers(n: number = 100, includeStatus: boolean = true): Promise<BackgroundComposer[]> {
    logger.info('Listing background composers...');
    return this.httpClient.request<BackgroundComposer[]>({
      url: endpoints.backgroundComposer.list,
      method: 'POST',
      data: { n, include_status: includeStatus }
    });
  }

  async checkWebAccess(): Promise<any> {
    logger.info('Checking agent web access...');
    return this.httpClient.request<any>({
      url: endpoints.backgroundComposer.checkWebAccess,
      method: 'POST'
    });
  }

  async getUserSettings(): Promise<any> {
    logger.info('Getting user settings...');
    return this.httpClient.request<any>({
      url: endpoints.backgroundComposer.userSettings,
      method: 'GET'
    });
  }

  async updateUserSettings(settings: Partial<any>): Promise<any> {
    logger.info('Updating user settings...');
    return this.httpClient.request<any>({
      url: endpoints.backgroundComposer.updateUserSettings,
      method: 'POST',
      data: settings
    });
  }



  /**
   * Creates a background composer using the new documented API structure
   * @param request - The background composer request data
   * @returns Promise<BackgroundComposerResponse>
   */
  async createBackgroundComposer(options: CreateBackgroundComposerOptions): Promise<CreateBackgroundComposerResponse> {
    logger.info(`Creating background composer with task: ${options.taskDescription}`);
    
    // Generate a unique background composer ID
    const bcId = `bc-${crypto.randomUUID()}`;
    
    // Remove https:// protocol from repository URL for snapshotNameOrId and repoUrl
    const cleanUrl = options.repositoryUrl.replace(/^https?:\/\//, '');
    
    // Create the exact payload structure from the HAR file
    const payload = {
      snapshotNameOrId: cleanUrl,
      devcontainerStartingPoint: {
        url: options.repositoryUrl,
        ref: options.branch || "main"
      },
      modelDetails: {
        modelName: options.model || "claude-4-sonnet-thinking",
        maxMode: true
      },
      repositoryInfo: {},
      snapshotWorkspaceRootPath: "/workspace",
      autoBranch: true,
      returnImmediately: true,
      repoUrl: cleanUrl,
      conversationHistory: [
        {
          text: options.taskDescription,
          type: "MESSAGE_TYPE_HUMAN",
          richText: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: options.taskDescription,
                      type: "text",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                  textFormat: 0,
                  textStyle: ""
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1
            }
          })
        }
      ],
      source: "BACKGROUND_COMPOSER_SOURCE_WEBSITE",
      bcId: bcId,
      addInitialMessageToResponses: true
    };

    const response = await this.httpClient.request<CreateBackgroundComposerResponse>({
      method: 'POST',
      url: endpoints.backgroundComposer.create,
      data: payload,
    });

    logger.info(`Background composer created successfully with ID: ${response.composer?.bcId}`);
    return response;
  }

  /**
   * Create background composer (legacy method)
   * @deprecated Use createBackgroundComposer instead
   */
  async create(request: BackgroundComposerRequest): Promise<BackgroundComposerResponse> {
    logger.info('Creating background composer from snapshot...');
    
    return this.httpClient.request<BackgroundComposerResponse>({
      url: endpoints.backgroundComposer.create,
      method: 'POST',
      data: request
    });
  }

  async getDetailedComposer(composerId: string): Promise<any> {
    logger.info('Getting detailed composer information...');
    return this.httpClient.request({
      url: endpoints.backgroundComposer.getDetailed,
      method: 'POST',
      data: { 
        bcId: composerId,
        n: 1,
        includeDiff: true,
        includeTeamWide: true
      }
    });
  }

  async getDiffDetails(composerId: string): Promise<any> {
    logger.info('Getting diff details...');
    return this.httpClient.request({
      url: endpoints.backgroundComposer.getDiffDetails,
      method: 'POST',
      data: { bcId: composerId }
    });
  }

  async getChangesHash(composerId: string): Promise<any> {
    logger.info('Getting changes hash...');
    return this.httpClient.request({
      url: endpoints.backgroundComposer.getChangesHash,
      method: 'POST',
      data: { bcId: composerId }
    });
  }

  async openPr(composerId: string, prData: any): Promise<any> {
    logger.info('Opening pull request...');
    return this.httpClient.request({
      url: endpoints.backgroundComposer.openPr,
      method: 'POST',
      data: { bcId: composerId, ...prData }
    });
  }

  async pauseComposer(composerId: string): Promise<any> {
    logger.info('Pausing composer...');
    return this.httpClient.request({
      url: endpoints.backgroundComposer.pause,
      method: 'POST',
      data: { bcId: composerId }
    });
  }

  async revertFile(composerId: string, filePath: string): Promise<any> {
    logger.info('Reverting file...');
    return this.httpClient.request({
      url: endpoints.backgroundComposer.revertFile,
      method: 'POST',
      data: { bcId: composerId, filePath }
    });
  }

  async attachBackgroundComposer(composerId: string, attachmentData?: any): Promise<any> {
    logger.info('Attaching background composer...');
    return this.httpClient.request({
      url: endpoints.backgroundComposer.attachBackgroundComposer,
      method: 'POST',
      data: { bcId: composerId, ...attachmentData }
    });
  }

  async attachBackgroundComposerLogs(composerId: string): Promise<any> {
    logger.info('Attaching background composer logs...');
    return this.httpClient.request({
      url: endpoints.backgroundComposer.attachBackgroundComposerLogs,
      method: 'POST',
      data: { bcId: composerId }
    });
  }

  // Dashboard methods
  async getPrivacyMode(): Promise<any> {
    logger.info('Getting privacy mode...');
    return this.httpClient.request<any>({
      url: endpoints.dashboard.privacyMode,
      method: 'POST'
    });
  }

  // Convenience methods that return parsed responses
  async listComposersParsed(): Promise<ParsedResponse> {
    const data = await this.listComposers();
    return parseComposerList(data);
  }

  async checkWebAccessParsed(): Promise<ParsedResponse> {
    const data = await this.checkWebAccess();
    return parseWebAccess(data);
  }

  async getPrivacyModeParsed(): Promise<ParsedResponse> {
    const data = await this.getPrivacyMode();
    return parsePrivacyMode(data);
  }

  async getUserSettingsParsed(): Promise<ParsedResponse> {
    const data = await this.getUserSettings();
    return parseUserSettings(data);
  }

  // Test all endpoints
  async testAllEndpoints(): Promise<{ success: boolean; results?: any; error?: string }> {
    logger.info('Testing all API endpoints...');
    
    const results = [];
    let testComposerId = 'test-composer-id';
    
    // Phase 1: Test basic endpoints that don't require a composer ID
    const basicTests: Array<{ name: string; method: () => Promise<any> }> = [
      { name: 'Check Web Access', method: () => this.checkWebAccess() },
      { name: 'Get User Settings', method: () => this.getUserSettings() },
      { 
        name: 'Update User Settings', 
        method: () => this.updateUserSettings({ 
          enableBackgroundComposer: true 
        }) 
      },
      { name: 'Get Privacy Mode', method: () => this.getPrivacyMode() }
    ];

    for (const test of basicTests) {
      try {
        logger.info(`Testing: ${test.name}`);
        await test.method();
        logger.info(`✓ ${test.name} - Success`);
        results.push({ endpoint: test.name, status: 'success' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (error instanceof ApiError && (
          error.status === 404 || error.status === 400 || error.status === 422 || 
          error.status === 405 || error.status === 500
        )) {
          logger.info(`✓ ${test.name} - Endpoint accessible (expected error: ${error.status})`);
          results.push({ endpoint: test.name, status: 'accessible', error: `${error.status}: ${errorMessage}` });
        } else {
          logger.error(`✗ ${test.name} - Failed: ${errorMessage}`);
          results.push({ endpoint: test.name, status: 'error', error: errorMessage });
        }
      }
    }

    // Phase 2: Create a composer to use for testing
    try {
      logger.info('Testing: Create Background Composer');
      const createResult = await this.createBackgroundComposer({
        taskDescription: 'Test task for endpoint testing',
        repositoryUrl: 'github.com/mjdierkes/Swarm',
        branch: 'main',
        model: 'claude-4-sonnet-thinking'
      });
      
      logger.info('✓ Create Background Composer Success');
      results.push({
        endpoint: 'create',
        status: '✓ Success',
      });
      
      // Test other endpoints
      const listResult = await this.listComposers(10);
      logger.info('✓ List Background Composers Success');
      results.push({
        endpoint: 'list',
        status: '✓ Success',
      });
      
      const accessResult = await this.checkWebAccess();
      logger.info('✓ Check Web Access Success');
      logger.debug('Access Result:', accessResult);
      
      return {
        success: true,
        results: {
          create: createResult,
          list: listResult,
          access: accessResult
        }
      };
    } catch (error) {
      logger.error('API test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 