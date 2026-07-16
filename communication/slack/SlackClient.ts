import type { AgentConfig } from '../../configs/index.js';
import type { SlackChannelType, SlackMessage } from '../../agents/types/index.js';
import { resolveChannelName } from './channels.js';

export interface SlackPostResult {
  ok: boolean;
  channel: string;
  ts?: string;
  error?: string;
  skipped?: boolean;
}

export class SlackClient {
  constructor(private readonly config: AgentConfig) {}

  isEnabled(): boolean {
    return this.config.slack.enabled && Boolean(this.config.slack.botToken);
  }

  async postMessage(message: SlackMessage): Promise<SlackPostResult> {
    const channel = resolveChannelName(this.config, message.channel);

    if (!this.isEnabled()) {
      return { ok: true, channel, skipped: true };
    }

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${this.config.slack.botToken}`,
        },
        body: JSON.stringify({
          channel,
          text: message.text,
          blocks: message.blocks,
        }),
      });

      const data = (await response.json()) as { ok: boolean; ts?: string; error?: string };

      return {
        ok: data.ok,
        channel,
        ts: data.ts,
        error: data.error,
      };
    } catch (error) {
      return {
        ok: false,
        channel,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export { SlackClient as default };
