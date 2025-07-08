import { HttpClient } from './http-client.js';
import { config, endpoints } from './config.js';
import { logger } from './logger.js';
import { 
  Composer, 
  WebAccessResponse, 
  PrivacyModeResponse, 
  GitHubInstallationsResponse, 
  UserSettings,
  CreateComposerRequest,
  ApiError
} from './types.js';
import {
  parseComposerList,
  parseWebAccess,
  parsePrivacyMode,
  parseGitHubInstallations,
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
  async listComposers(): Promise<Composer[]> {
    logger.info('Listing background composers...');
    return this.httpClient.request<Composer[]>({
      url: endpoints.backgroundComposer.list,
      method: 'POST'
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
      data: { composerId }
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

  async getGitHubInstallations(): Promise<GitHubInstallationsResponse> {
    logger.info('Getting GitHub installations...');
    return this.httpClient.request<GitHubInstallationsResponse>({
      url: endpoints.dashboard.githubInstallations,
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

  async getGitHubInstallationsParsed(): Promise<ParsedResponse> {
    const data = await this.getGitHubInstallations();
    return parseGitHubInstallations(data);
  }

  async getUserSettingsParsed(): Promise<ParsedResponse> {
    const data = await this.getUserSettings();
    return parseUserSettings(data);
  }

  // Test all endpoints
  async testAllEndpoints(): Promise<Array<{ endpoint: string; status: string; error?: string }>> {
    logger.info('Testing all API endpoints...');
    
    const tests = [
      { name: 'List Composers', method: () => this.listComposers() },
      { name: 'Check Web Access', method: () => this.checkWebAccess() },
      { name: 'Get Privacy Mode', method: () => this.getPrivacyMode() },
      { name: 'Get GitHub Installations', method: () => this.getGitHubInstallations() },
      { name: 'Get User Settings', method: () => this.getUserSettings() }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        logger.info(`Testing: ${test.name}`);
        await test.method();
        logger.info(`✓ ${test.name} - Success`);
        results.push({ endpoint: test.name, status: 'success' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`✗ ${test.name} - Failed: ${errorMessage}`);
        results.push({ endpoint: test.name, status: 'error', error: errorMessage });
      }
    }
    
    return results;
  }
} 