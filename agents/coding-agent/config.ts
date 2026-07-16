export { loadConfig, type AgentConfig } from '../../configs/index.js';

export const codingAgentDefaults = {
  allowedCommands: ['npm', 'node', 'npx', 'tsc', 'tsx', 'git', 'prisma'],
  maxFileSizeKb: 512,
  dryRun: false,
} as const;
