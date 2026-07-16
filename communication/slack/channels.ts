import type { AgentConfig } from '../../configs/index.js';
import type { SlackChannelType } from '../../agents/types/index.js';

export const SLACK_CHANNELS: Record<SlackChannelType, { envKey: string; defaultName: string; purpose: string }> = {
  orchestrator: {
    envKey: 'SLACK_CHANNEL_ORCHESTRATOR',
    defaultName: '#agent-orchestrator',
    purpose: 'High-level orchestration events: new requests, plan generation, task completion',
  },
  coding: {
    envKey: 'SLACK_CHANNEL_CODING',
    defaultName: '#agent-coding',
    purpose: 'Coding agent activity: subtask starts, file changes, command execution',
  },
  logs: {
    envKey: 'SLACK_CHANNEL_LOGS',
    defaultName: '#agent-logs',
    purpose: 'Detailed execution logs and plan output',
  },
  human_review: {
    envKey: 'SLACK_CHANNEL_HUMAN_REVIEW',
    defaultName: '#agent-human-review',
    purpose: 'Failures and items requiring human approval or revision',
  },
};

export function resolveChannelName(config: AgentConfig, channel: SlackChannelType): string {
  return config.slack.channels[channel === 'human_review' ? 'humanReview' : channel];
}

export function getChannelSetupGuide(): string {
  return Object.entries(SLACK_CHANNELS)
    .map(([key, meta]) => `- ${key}: ${meta.defaultName} (${meta.envKey}) — ${meta.purpose}`)
    .join('\n');
}
