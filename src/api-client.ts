import { HttpClient } from './http-client.js';
import { logger } from './utils/logger.js';
import { config } from './config.js';
import { ComposerService, UserService, DashboardService } from './services/index.js';
import {
  BackgroundComposer,
  CreateBackgroundComposerOptions,
  CreateBackgroundComposerResponse,
  WebAccessResponse,
  PrivacyModeResponse,
  UserSettingsResponse,
  DetailedComposerResponse,
  DiffDetailsResponse,
  ChangesHashResponse,
  OpenPrResponse,
  PauseComposerResponse,
  RevertFileResponse,
  AttachBackgroundComposerResponse
} from './types/index.js';
import {
  parseComposerList,
  parseWebAccess,
  parsePrivacyMode,
  parseUserSettings,
  ParsedResponse
} from './utils/parsers.js';

export class CursorAPIClient {
  private httpClient: HttpClient;
  private composerService: ComposerService;
  private userService: UserService;
  private dashboardService: DashboardService;

  constructor(sessionToken?: string) {
    const token = sessionToken || config.sessionToken;
    this.httpClient = new HttpClient(token);
    
    // Initialize services
    this.composerService = new ComposerService(this.httpClient);
    this.userService = new UserService(this.httpClient);
    this.dashboardService = new DashboardService(this.httpClient);
    
    logger.info(`Initialized API client with session token: ${token.substring(0, 50)}...`);
  }

  // Background Composer methods - delegate to ComposerService
  async listComposers(n: number = 100, includeStatus: boolean = true): Promise<BackgroundComposer[]> {
    logger.info('Listing background composers...');
    return this.composerService.list(n, includeStatus);
  }

  async createBackgroundComposer(options: CreateBackgroundComposerOptions): Promise<CreateBackgroundComposerResponse> {
    logger.info(`Creating background composer with task: ${options.taskDescription}`);
    const response = await this.composerService.create(options);
    logger.info(`Background composer created successfully with ID: ${response.composer?.bcId}`);
    return response;
  }

  async getDetailedComposer(composerId: string): Promise<DetailedComposerResponse> {
    logger.info('Getting detailed composer information...');
    return this.composerService.getDetailed(composerId);
  }

  async getDiffDetails(composerId: string): Promise<DiffDetailsResponse> {
    logger.info('Getting diff details...');
    return this.composerService.getDiffDetails(composerId);
  }

  async getChangesHash(composerId: string): Promise<ChangesHashResponse> {
    logger.info('Getting changes hash...');
    return this.composerService.getChangesHash(composerId);
  }

  async openPr(composerId: string, prData: any): Promise<OpenPrResponse> {
    logger.info('Opening pull request...');
    return this.composerService.openPr(composerId, prData);
  }

  async pauseComposer(composerId: string): Promise<PauseComposerResponse> {
    logger.info('Pausing composer...');
    return this.composerService.pause(composerId);
  }

  async revertFile(composerId: string, filePath: string): Promise<RevertFileResponse> {
    logger.info('Reverting file...');
    return this.composerService.revertFile(composerId, filePath);
  }

  async attachBackgroundComposer(composerId: string, attachmentData?: any): Promise<AttachBackgroundComposerResponse> {
    logger.info('Attaching background composer...');
    return this.composerService.attach(composerId, attachmentData);
  }

  async attachBackgroundComposerLogs(composerId: string): Promise<AttachBackgroundComposerResponse> {
    logger.info('Attaching background composer logs...');
    return this.composerService.attachLogs(composerId);
  }

  // User methods - delegate to UserService
  async checkWebAccess(): Promise<WebAccessResponse> {
    logger.info('Checking agent web access...');
    return this.userService.checkWebAccess();
  }

  async getUserSettings(): Promise<UserSettingsResponse> {
    logger.info('Getting user settings...');
    return this.userService.getSettings();
  }

  async updateUserSettings(settings: Partial<UserSettingsResponse>): Promise<UserSettingsResponse> {
    logger.info('Updating user settings...');
    return this.userService.updateSettings(settings);
  }

  // Dashboard methods - delegate to DashboardService
  async getPrivacyMode(): Promise<PrivacyModeResponse> {
    logger.info('Getting privacy mode...');
    return this.dashboardService.getPrivacyMode();
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
    
    try {
      // Test basic endpoints
      const webAccess = await this.checkWebAccess();
      const userSettings = await this.getUserSettings();
      const privacyMode = await this.getPrivacyMode();
      
      // Test composer creation
      const createResult = await this.createBackgroundComposer({
        taskDescription: 'Test task for endpoint testing',
        repositoryUrl: 'https://github.com/mjdierkes/Swarm',
        branch: 'main',
        model: 'claude-4-sonnet-thinking'
      });
      
      // Test composer list
      const listResult = await this.listComposers(10);
      
      logger.info('✓ All endpoints tested successfully');
      return {
        success: true,
        results: {
          create: createResult,
          list: listResult,
          webAccess: webAccess,
          userSettings: userSettings,
          privacyMode: privacyMode
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