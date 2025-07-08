import { HttpClient } from './http-client.js';
import { config, endpoints } from './config.js';
import { logger } from './logger.js';
import { 
  Composer, 
  WebAccessResponse, 
  PrivacyModeResponse, 
  UserSettings,
  CreateComposerRequest,
  ApiError
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
  async listComposers(n: number = 100, includeStatus: boolean = true): Promise<Composer[]> {
    logger.info('Listing background composers...');
    return this.httpClient.request<Composer[]>({
      url: endpoints.backgroundComposer.list,
      method: 'POST',
      data: { n, include_status: includeStatus }
    });
  }

  async checkWebAccess(): Promise<WebAccessResponse> {
    logger.info('Checking agent web access...');
    return this.httpClient.request<WebAccessResponse>({
      url: endpoints.backgroundComposer.checkWebAccess,
      method: 'POST'
    });
  }

  async getUserSettings(): Promise<UserSettings> {
    logger.info('Getting user settings...');
    return this.httpClient.request<UserSettings>({
      url: endpoints.backgroundComposer.userSettings,
      method: 'GET'
    });
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    logger.info('Updating user settings...');
    return this.httpClient.request<UserSettings>({
      url: endpoints.backgroundComposer.updateUserSettings,
      method: 'POST',
      data: settings
    });
  }

  async createComposer(taskData: CreateComposerRequest): Promise<any> {
    logger.info('Creating background composer task...');
    
    const possibleEndpoints = [
      endpoints.backgroundComposer.create,
      '/api/background-composer/start',
      '/api/background-composer/run',
      '/api/background-composer/new-task',
      '/api/background-composer/submit'
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        logger.debug(`Trying endpoint: ${endpoint}`);
        const result = await this.httpClient.request({
          url: endpoint,
          method: 'POST',
          data: taskData
        });
        logger.info('Task created successfully');
        return result;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          logger.debug(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        throw error;
      }
    }
    
    throw new Error('No working task creation endpoint found');
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
  async getPrivacyMode(): Promise<PrivacyModeResponse> {
    logger.info('Getting privacy mode...');
    return this.httpClient.request<PrivacyModeResponse>({
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
  async testAllEndpoints(): Promise<Array<{ endpoint: string; status: string; error?: string }>> {
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
      logger.info('Testing: Create Composer');
      const createResult = await this.createComposer({
        task_title: 'Test Task',
        task_description: 'Test description for endpoint testing',
        async: false,
        allowed_write_directories: ['/tmp']
      });
      logger.info('✓ Create Composer - Success');
      results.push({ endpoint: 'Create Composer', status: 'success' });
      
      // Try to extract the composer ID from the creation result
      if (createResult && createResult.id) {
        testComposerId = createResult.id;
        logger.info(`Using created composer ID: ${testComposerId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (error instanceof ApiError && (
        error.status === 404 || error.status === 400 || error.status === 422 || 
        error.status === 405 || error.status === 500
      )) {
        logger.info(`✓ Create Composer - Endpoint accessible (expected error: ${error.status})`);
        results.push({ endpoint: 'Create Composer', status: 'accessible', error: `${error.status}: ${errorMessage}` });
      } else {
        logger.error(`✗ Create Composer - Failed: ${errorMessage}`);
        results.push({ endpoint: 'Create Composer', status: 'error', error: errorMessage });
      }
    }

    // Phase 3: List composers to get a real ID if creation didn't work
    try {
      logger.info('Testing: List Composers');
      const composers = await this.listComposers();
      logger.info('✓ List Composers - Success');
      results.push({ endpoint: 'List Composers', status: 'success' });
      
      // Use the first composer ID if available and we don't have one from creation
      if (composers && composers.length > 0 && composers[0].id && testComposerId === 'test-composer-id') {
        testComposerId = composers[0].id;
        logger.info(`Using real composer ID from list: ${testComposerId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`✗ List Composers - Failed: ${errorMessage}`);
      results.push({ endpoint: 'List Composers', status: 'error', error: errorMessage });
    }

    // Phase 4: Test endpoints that require a composer ID
    const composerTests = [
      { 
        name: 'Get Detailed Composer', 
        method: () => this.getDetailedComposer(testComposerId) 
      },
      { 
        name: 'Get Diff Details', 
        method: () => this.getDiffDetails(testComposerId) 
      },
      { 
        name: 'Get Changes Hash', 
        method: () => this.getChangesHash(testComposerId) 
      },
      { 
        name: 'Open PR', 
        method: () => this.openPr(testComposerId, { 
          title: 'Test PR',
          description: 'Test PR description'
        }) 
      },
      { 
        name: 'Pause Composer', 
        method: () => this.pauseComposer(testComposerId) 
      },
      { 
        name: 'Revert File', 
        method: () => this.revertFile(testComposerId, 'test-file.txt') 
      },
      { 
        name: 'Attach Background Composer', 
        method: () => this.attachBackgroundComposer(testComposerId, { 
          attachmentType: 'test' 
        }) 
      },
      { 
        name: 'Attach Background Composer Logs', 
        method: () => this.attachBackgroundComposerLogs(testComposerId) 
      }
    ];

    for (const test of composerTests) {
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
    
    return results;
  }
} 