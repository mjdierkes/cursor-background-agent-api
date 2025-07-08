import { BaseService } from './base-service.js';
import { endpoints } from '../config.js';
import { buildComposerPayload } from '../utils/payload-builder.js';
import {
  BackgroundComposer,
  CreateBackgroundComposerOptions,
  CreateBackgroundComposerResponse,
  DetailedComposerResponse,
  DiffDetailsResponse,
  ChangesHashResponse,
  OpenPrResponse,
  PauseComposerResponse,
  RevertFileResponse,
  AttachBackgroundComposerResponse
} from '../types/index.js';

export class ComposerService extends BaseService {
  async list(n: number = 100, includeStatus: boolean = true): Promise<BackgroundComposer[]> {
    return this.request<BackgroundComposer[]>({
      url: endpoints.backgroundComposer.list,
      method: 'POST',
      data: { n, include_status: includeStatus }
    });
  }

  async create(options: CreateBackgroundComposerOptions): Promise<CreateBackgroundComposerResponse> {
    const payload = buildComposerPayload(options);
    return this.request<CreateBackgroundComposerResponse>({
      method: 'POST',
      url: endpoints.backgroundComposer.create,
      data: payload,
    });
  }

  async getDetailed(composerId: string): Promise<DetailedComposerResponse> {
    return this.request<DetailedComposerResponse>({
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

  async getDiffDetails(composerId: string): Promise<DiffDetailsResponse> {
    return this.request<DiffDetailsResponse>({
      url: endpoints.backgroundComposer.getDiffDetails,
      method: 'POST',
      data: { bcId: composerId }
    });
  }

  async getChangesHash(composerId: string): Promise<ChangesHashResponse> {
    return this.request<ChangesHashResponse>({
      url: endpoints.backgroundComposer.getChangesHash,
      method: 'POST',
      data: { bcId: composerId }
    });
  }

  async openPr(composerId: string, prData: any): Promise<OpenPrResponse> {
    return this.request<OpenPrResponse>({
      url: endpoints.backgroundComposer.openPr,
      method: 'POST',
      data: { bcId: composerId, ...prData }
    });
  }

  async pause(composerId: string): Promise<PauseComposerResponse> {
    return this.request<PauseComposerResponse>({
      url: endpoints.backgroundComposer.pause,
      method: 'POST',
      data: { bcId: composerId }
    });
  }

  async revertFile(composerId: string, filePath: string): Promise<RevertFileResponse> {
    return this.request<RevertFileResponse>({
      url: endpoints.backgroundComposer.revertFile,
      method: 'POST',
      data: { bcId: composerId, filePath }
    });
  }

  async attach(composerId: string, attachmentData?: any): Promise<AttachBackgroundComposerResponse> {
    return this.request<AttachBackgroundComposerResponse>({
      url: endpoints.backgroundComposer.attachBackgroundComposer,
      method: 'POST',
      data: { bcId: composerId, ...attachmentData }
    });
  }

  async attachLogs(composerId: string): Promise<AttachBackgroundComposerResponse> {
    return this.request<AttachBackgroundComposerResponse>({
      url: endpoints.backgroundComposer.attachBackgroundComposerLogs,
      method: 'POST',
      data: { bcId: composerId }
    });
  }
} 