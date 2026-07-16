import cron from 'node-cron';
import type { AgentConfig } from '../../configs/index.js';
import { DailyInspectionWorkflow } from './DailyInspectionWorkflow.js';
import { SlackNotifier } from '../../communication/slack/notifier.js';

export class AutonomousScheduler {
  private jobs: cron.ScheduledTask[] = [];

  constructor(
    private readonly config: AgentConfig,
    private readonly slack: SlackNotifier,
  ) {}

  start(): void {
    if (!this.config.autonomous.enabled) {
      console.log('[scheduler] Autonomous workflows disabled (AUTONOMOUS_ENABLED=false)');
      return;
    }

    const cronExpr = this.config.autonomous.dailyInspectionCron;
    const timezone = this.config.autonomous.timezone;

    if (!cron.validate(cronExpr)) {
      console.error(`[scheduler] Invalid cron expression: ${cronExpr}`);
      return;
    }

    const job = cron.schedule(
      cronExpr,
      async () => {
        try {
          const workflow = new DailyInspectionWorkflow(this.config);
          await workflow.run();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          await this.slack.notifyHumanReview(`Daily inspection failed: ${message}`);
        }
      },
      { timezone },
    );

    this.jobs.push(job);
    console.log(`[scheduler] Daily inspection scheduled: "${cronExpr}" (${timezone})`);
  }

  stop(): void {
    for (const job of this.jobs) {
      job.stop();
    }
    this.jobs = [];
  }
}

export { AutonomousScheduler as default };
