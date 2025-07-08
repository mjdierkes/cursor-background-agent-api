export interface Composer {
  id?: string;
  name?: string;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebAccessResponse {
  hasAccess: boolean;
}

export interface PrivacyModeResponse {
  privacyMode: 'PRIVACY_MODE_NO_TRAINING' | 'PRIVACY_MODE_TRAINING' | 'PRIVACY_MODE_FULL_PRIVACY';
}

export interface UserSettings {
  [key: string]: boolean;
}

export interface CreateComposerRequest {
  task_description: string;
  task_title: string;
  async?: boolean;
  allowed_write_directories?: string[];
}

export interface ApiResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 