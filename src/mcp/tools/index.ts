import {
  createBackgroundComposerTool,
  listBackgroundComposersTool,
  getComposerDetailsTool
} from './composer.js';

import {
  checkWebAccessTool,
  getUserSettingsTool,
  getPrivacyModeTool
} from './user.js';

// Re-export all tools
export {
  createBackgroundComposerTool,
  listBackgroundComposersTool,
  getComposerDetailsTool,
  checkWebAccessTool,
  getUserSettingsTool,
  getPrivacyModeTool
};

// Export all tools as an array for easy registration
export const allTools = [
  createBackgroundComposerTool,
  listBackgroundComposersTool,
  getComposerDetailsTool,
  checkWebAccessTool,
  getUserSettingsTool,
  getPrivacyModeTool
]; 