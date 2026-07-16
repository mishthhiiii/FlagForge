export { loadConfig, agentConfigSchema, type AgentConfig } from '../../configs/index.js';

export const orchestratorDefaults = {
  maxSubtasks: 10,
  planningEnabled: true,
  autoExecute: false,
} as const;
