export { SLACK_CHANNELS, resolveChannelName, getChannelSetupGuide } from '../communication/slack/channels.js';

export const slackEnvVars = [
  'SLACK_ENABLED',
  'SLACK_BOT_TOKEN',
  'SLACK_SIGNING_SECRET',
  'SLACK_CHANNEL_ORCHESTRATOR',
  'SLACK_CHANNEL_CODING',
  'SLACK_CHANNEL_LOGS',
  'SLACK_CHANNEL_HUMAN_REVIEW',
] as const;
