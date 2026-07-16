import type { AgentConfig } from '../../configs/index.js';
import type { SlackChannelType } from '../../agents/types/index.js';
import { SlackClient } from './SlackClient.js';

export class SlackNotifier {
  private readonly client: SlackClient;
  private readonly logToConsole: boolean;

  constructor(config: AgentConfig, logToConsole = true) {
    this.client = new SlackClient(config);
    this.logToConsole = logToConsole;
  }

  async notify(channel: SlackChannelType, text: string): Promise<void> {
    const prefix = `[slack:${channel}]`;
    if (this.logToConsole) {
      console.log(`${prefix} ${text.split('\n')[0]}`);
    }

    const result = await this.client.postMessage({ channel, text });

    if (!result.ok && !result.skipped && this.logToConsole) {
      console.warn(`${prefix} delivery failed: ${result.error}`);
    }
  }

  notifyOrchestrator(text: string): Promise<void> {
    return this.notify('orchestrator', text);
  }

  notifyCoding(text: string): Promise<void> {
    return this.notify('coding', text);
  }

  notifyLogs(text: string): Promise<void> {
    return this.notify('logs', text);
  }

  notifyHumanReview(text: string): Promise<void> {
    return this.notify('human_review', text);
  }
}

export { SlackNotifier as default };
