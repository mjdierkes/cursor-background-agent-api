export interface Composer {
  id?: string;
  name?: string;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  bcId?: string;
  createdAtMs?: number;
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



// New types based on documentation
export interface FileContext {
  relative_workspace_path: string;
  contents: string;
}

export interface ModelDetails {
  model: string;
}

export interface DevcontainerStartingPoint {
  url: string;
}

export interface BackgroundComposerRequest {
  snapshot_name_or_id: string;
  prompt: string;
  rich_prompt: string;
  files: FileContext[];
  model_details: ModelDetails;
  devcontainer_starting_point?: DevcontainerStartingPoint;
}

export interface BackgroundComposer {
  bcId: string;
  name: string;
  status: string;
  createdAtMs: number;
  updatedAtMs: number;
  source: string;
  repoUrl?: string;
}

export interface BackgroundComposerResponse {
  composer?: {
    bcId: string;
    createdAtMs: number;
    updatedAtMs: number;
    workspaceRootPath: string;
    repoUrl: string;
    source: string;
  };
  was_swapped_to_default?: boolean;
  wasSwappedToDefault?: boolean;
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

export interface CreateBackgroundComposerOptions {
  repositoryUrl: string;
  taskDescription: string;
  branch?: string;
  model?: string;
}

export interface CreateBackgroundComposerResponse {
  composer?: {
    bcId: string;
    createdAtMs: number;
    updatedAtMs: number;
    workspaceRootPath: string;
    repoUrl: string;
    source: string;
  };
  wasSwappedToDefault?: boolean;
} 