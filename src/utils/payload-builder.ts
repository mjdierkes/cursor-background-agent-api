import { CreateBackgroundComposerOptions } from '../types/index.js';

export function buildComposerPayload(options: CreateBackgroundComposerOptions) {
  // Generate a unique background composer ID
  const bcId = `bc-${crypto.randomUUID()}`;
  
  // Remove https:// protocol from repository URL for snapshotNameOrId and repoUrl
  const cleanUrl = options.repositoryUrl.replace(/^https?:\/\//, '');
  
  // Create the exact payload structure from the HAR file
  return {
    snapshotNameOrId: cleanUrl,
    devcontainerStartingPoint: {
      url: options.repositoryUrl,
      ref: options.branch || "main"
    },
    modelDetails: {
      modelName: options.model || "claude-4-sonnet-thinking",
      maxMode: true
    },
    repositoryInfo: {},
    snapshotWorkspaceRootPath: "/workspace",
    autoBranch: true,
    returnImmediately: true,
    repoUrl: cleanUrl,
    conversationHistory: [
      {
        text: options.taskDescription,
        type: "MESSAGE_TYPE_HUMAN",
        richText: JSON.stringify({
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: options.taskDescription,
                    type: "text",
                    version: 1
                  }
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
                textFormat: 0,
                textStyle: ""
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1
          }
        })
      }
    ],
    source: "BACKGROUND_COMPOSER_SOURCE_WEBSITE",
    bcId: bcId,
    addInitialMessageToResponses: true
  };
} 