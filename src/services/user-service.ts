import { BaseService } from './base-service.js';
import { endpoints } from '../config.js';
import {
  WebAccessResponse,
  UserSettingsResponse
} from '../types/index.js';

export class UserService extends BaseService {
  async checkWebAccess(): Promise<WebAccessResponse> {
    return this.request<WebAccessResponse>({
      url: endpoints.backgroundComposer.checkWebAccess,
      method: 'POST'
    });
  }

  async getSettings(): Promise<UserSettingsResponse> {
    return this.request<UserSettingsResponse>({
      url: endpoints.backgroundComposer.userSettings,
      method: 'GET'
    });
  }

  async updateSettings(settings: Partial<UserSettingsResponse>): Promise<UserSettingsResponse> {
    return this.request<UserSettingsResponse>({
      url: endpoints.backgroundComposer.updateUserSettings,
      method: 'POST',
      data: settings
    });
  }
} 