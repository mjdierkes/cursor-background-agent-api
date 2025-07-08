export interface WebAccessResponse {
  hasAccess: boolean;
}

export interface PrivacyModeResponse {
  privacyMode: 'PRIVACY_MODE_NO_TRAINING' | 'PRIVACY_MODE_TRAINING' | 'PRIVACY_MODE_FULL_PRIVACY';
}

export interface UserSettings {
  [key: string]: boolean;
}

export interface UserSettingsResponse {
  [key: string]: boolean;
} 