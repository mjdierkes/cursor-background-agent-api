import { 
  BackgroundComposer, 
  CreateBackgroundComposerResponse, 
  WebAccessResponse,
  PrivacyModeResponse,
  UserSettingsResponse,
  DetailedComposerResponse
} from '../../types/index.js';

export const mockComposer: BackgroundComposer = {
  bcId: 'test-composer-123',
  name: 'Test Composer',
  status: 'running',
  createdAtMs: Date.now(),
  updatedAtMs: Date.now(),
  source: 'BACKGROUND_COMPOSER_SOURCE_WEBSITE',
  repoUrl: 'github.com/test/repo'
};

export const mockComposerList: BackgroundComposer[] = [
  mockComposer,
  {
    bcId: 'test-composer-456',
    name: 'Another Composer',
    status: 'completed',
    createdAtMs: Date.now() - 3600000,
    updatedAtMs: Date.now() - 1800000,
    source: 'BACKGROUND_COMPOSER_SOURCE_WEBSITE',
    repoUrl: 'github.com/test/another-repo'
  }
];

export const mockCreateResponse: CreateBackgroundComposerResponse = {
  composer: {
    bcId: 'new-composer-789',
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
    workspaceRootPath: '/workspace',
    repoUrl: 'github.com/test/new-repo',
    source: 'BACKGROUND_COMPOSER_SOURCE_WEBSITE'
  },
  wasSwappedToDefault: false
};

export const mockWebAccessResponse: WebAccessResponse = {
  hasAccess: true
};

export const mockPrivacyModeResponse: PrivacyModeResponse = {
  privacyMode: 'PRIVACY_MODE_NO_TRAINING'
};

export const mockUserSettingsResponse: UserSettingsResponse = {
  enableBackgroundComposer: true,
  allowWebAccess: true,
  privacyMode: true
};

export const mockDetailedComposerResponse: DetailedComposerResponse = {
  bcId: 'detailed-composer-123',
  name: 'Detailed Test Composer',
  status: 'running',
  createdAtMs: Date.now(),
  updatedAtMs: Date.now(),
  source: 'BACKGROUND_COMPOSER_SOURCE_WEBSITE',
  repoUrl: 'github.com/test/detailed-repo',
  diff: {
    files: [
      { path: 'src/test.ts', additions: 10, deletions: 5 }
    ]
  },
  teamWide: false
}; 