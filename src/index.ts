#!/usr/bin/env node
import 'dotenv/config';
import { loadConfig } from '../configs/index.js';
import { Orchestrator } from '../agents/orchestrator/Orchestrator.js';
import { DailyInspectionWorkflow } from '../workflows/daily-inspection/DailyInspectionWorkflow.js';
import { AutonomousScheduler } from '../workflows/daily-inspection/scheduler.js';
import { getChannelSetupGuide } from '../communication/slack/channels.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const [command, ...args] = process.argv.slice(2);
  const request = args.join(' ').trim();

  const orchestrator = new Orchestrator(config);
  await orchestrator.initialize();

  switch (command) {
    case 'plan': {
      if (!request) {
        console.error('Usage: npm run agent:plan -- "<your request>"');
        process.exit(1);
      }
      const response = await orchestrator.handleRequest({ request, autoExecute: false });
      console.log(response.message);
      console.log(`\nTask ID: ${response.task.id}`);
      break;
    }

    case 'execute': {
      const taskId = args[0];
      if (!taskId) {
        console.error('Usage: npm run agent:execute -- <task-id>');
        process.exit(1);
      }
      const task = await orchestrator.executeTask(taskId);
      console.log(orchestrator.getTaskStatus(task.id));
      break;
    }

    case 'revise': {
      const taskId = args[0];
      const feedback = args.slice(1).join(' ');
      if (!taskId || !feedback) {
        console.error('Usage: npm run agent -- revise <task-id> "<feedback>"');
        process.exit(1);
      }
      const task = await orchestrator.reviseTask(taskId, feedback);
      console.log(orchestrator.getTaskStatus(task.id));
      break;
    }

    case 'inspect': {
      const workflow = new DailyInspectionWorkflow(config);
      const report = await workflow.run();
      console.log(report.summary);
      break;
    }

    case 'schedule': {
      const scheduler = new AutonomousScheduler(config, orchestrator.getSlackNotifier());
      scheduler.start();
      console.log('Autonomous scheduler running. Press Ctrl+C to stop.');
      await new Promise(() => {});
      break;
    }

    case 'skills': {
      console.log(orchestrator.listSkills());
      break;
    }

    case 'memory': {
      const summary = await orchestrator.getMemoryStore().getContextSummary();
      console.log(summary);
      break;
    }

    case 'slack-setup': {
      console.log('Slack channel configuration:\n');
      console.log(getChannelSetupGuide());
      console.log('\nSet SLACK_ENABLED=true and SLACK_BOT_TOKEN in .env to activate.');
      break;
    }

    case 'help':
    default: {
      if (request && !command) {
        const response = await orchestrator.handleRequest({
          request,
          autoExecute: config.orchestrator.autoExecute,
        });
        console.log(response.message);
        console.log(`\nTask ID: ${response.task.id}`);
        if (!config.orchestrator.autoExecute) {
          console.log(`\nRun: npm run agent:execute -- ${response.task.id}`);
        }
        break;
      }

      console.log(`
FlagForge AI Agent System

Usage:
  npm run agent -- "<request>"              Plan (and optionally execute) a task
  npm run agent:plan -- "<request>"         Generate execution plan only
  npm run agent:execute -- <task-id>        Execute a planned task
  npm run agent -- revise <id> "<feedback>"  Revise failed task with feedback
  npm run agent:inspect                     Run daily inspection once
  npm run agent:schedule                    Start autonomous scheduler
  npm run agent -- skills                   List available skills
  npm run agent -- memory                   Show project memory context
  npm run agent -- slack-setup              Show Slack channel configuration

Configuration: copy .env.example to .env
`);
    }
  }
}

main().catch((error) => {
  console.error('Agent error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
