import { 
  Composer, 
  WebAccessResponse, 
  PrivacyModeResponse, 
  UserSettings 
} from './types.js';

export interface ParsedResponse {
  summary: string;
  details: string[];
}

export function parseComposerList(data: Composer[]): ParsedResponse {
  if (!Array.isArray(data)) {
    return {
      summary: 'No background composers found',
      details: []
    };
  }

  return {
    summary: `Found ${data.length} background composers`,
    details: data.map((composer, index) => {
      const name = composer.name || 'Unnamed';
      const status = composer.status || 'Unknown';
      const description = composer.description ? `\n     Description: ${composer.description}` : '';
      return `  ${index + 1}. ${name} - Status: ${status}${description}`;
    })
  };
}

export function parseWebAccess(data: WebAccessResponse): ParsedResponse {
  const hasAccess = data.hasAccess;
  return {
    summary: `Web access: ${hasAccess ? 'Enabled' : 'Disabled'}`,
    details: []
  };
}

export function parsePrivacyMode(data: PrivacyModeResponse): ParsedResponse {
  const modes = {
    'PRIVACY_MODE_NO_TRAINING': 'Data not used for training',
    'PRIVACY_MODE_TRAINING': 'Data used for training',
    'PRIVACY_MODE_FULL_PRIVACY': 'Full privacy mode'
  };
  
  const mode = modes[data.privacyMode] || data.privacyMode;
  return {
    summary: `Privacy mode: ${mode}`,
    details: []
  };
}

export function parseUserSettings(data: UserSettings): ParsedResponse {
  const details = Object.entries(data).map(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
    return `  - ${formattedKey}: ${value ? 'enabled' : 'disabled'}`;
  });

  return {
    summary: 'User settings:',
    details
  };
} 