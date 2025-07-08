import { BaseService } from './base-service.js';
import { endpoints } from '../config.js';
import { PrivacyModeResponse } from '../types/index.js';

export class DashboardService extends BaseService {
  async getPrivacyMode(): Promise<PrivacyModeResponse> {
    return this.request<PrivacyModeResponse>({
      url: endpoints.dashboard.privacyMode,
      method: 'POST'
    });
  }
} 