import fs from 'node:fs/promises';
import path from 'node:path';
import type { AgentConfig } from '../../configs/index.js';
import { CodingAgent } from '../../agents/coding-agent/CodingAgent.js';
import { MemoryStore } from '../../memory/MemoryStore.js';
import { SlackNotifier } from '../../communication/slack/notifier.js';
import type { InspectionReport, InspectionFinding } from '../../agents/types/index.js';

export class DailyInspectionWorkflow {
  private readonly codingAgent: CodingAgent;
  private readonly memory: MemoryStore;
  private readonly slack: SlackNotifier;

  constructor(private readonly config: AgentConfig) {
    this.memory = new MemoryStore(config);
    this.codingAgent = new CodingAgent(config, this.memory);
    this.slack = new SlackNotifier(config);
  }

  async run(): Promise<InspectionReport> {
    await this.slack.notifyOrchestrator('Starting daily project inspection');
    await this.memory.initialize();

    const findings: InspectionFinding[] = [];

    findings.push(...(await this.checkKeyFiles()));
    findings.push(...(await this.checkDependencies()));
    findings.push(...(await this.runTypeChecks()));

    const errorCount = findings.filter((f) => f.severity === 'error').length;
    const warningCount = findings.filter((f) => f.severity === 'warning').length;

    const projectHealth: InspectionReport['projectHealth'] =
      errorCount > 0 ? 'critical' : warningCount > 0 ? 'degraded' : 'healthy';

    const report: InspectionReport = {
      generatedAt: new Date().toISOString(),
      projectHealth,
      findings,
      summary: this.buildSummary(projectHealth, findings),
    };

    await this.persistReport(report);
    await this.slack.notifyLogs(report.summary);
    await this.slack.notifyOrchestrator(`Daily inspection complete: ${projectHealth}`);

    if (projectHealth !== 'healthy') {
      await this.slack.notifyHumanReview(`Daily inspection found issues:\n${report.summary}`);
    }

    return report;
  }

  private async checkKeyFiles(): Promise<InspectionFinding[]> {
    const reader = this.codingAgent.getReader();
    const required = [
      'frontend/package.json',
      'backend/backend/package.json',
      'backend/backend/prisma/schema.prisma',
      'backend/backend/src/server.ts',
      'frontend/src/App.tsx',
    ];

    const findings: InspectionFinding[] = [];

    for (const file of required) {
      const exists = await reader.fileExists(file);
      findings.push({
        severity: exists ? 'info' : 'error',
        category: 'structure',
        message: exists ? `Key file present: ${file}` : `Missing key file: ${file}`,
        path: file,
      });
    }

    return findings;
  }

  private async checkDependencies(): Promise<InspectionFinding[]> {
    const findings: InspectionFinding[] = [];
    const reader = this.codingAgent.getReader();

    for (const pkg of ['frontend/package.json', 'backend/backend/package.json']) {
      const file = await reader.readFile(pkg);
      if (!file.exists) {
        findings.push({ severity: 'error', category: 'dependencies', message: `Cannot read ${pkg}`, path: pkg });
        continue;
      }

      try {
        JSON.parse(file.content);
        findings.push({ severity: 'info', category: 'dependencies', message: `Valid package.json: ${pkg}`, path: pkg });
      } catch {
        findings.push({ severity: 'error', category: 'dependencies', message: `Invalid JSON in ${pkg}`, path: pkg });
      }
    }

    return findings;
  }

  private async runTypeChecks(): Promise<InspectionFinding[]> {
    const runner = this.codingAgent.getRunner();
    const findings: InspectionFinding[] = [];

    const agentTypecheck = await runner.run('npm', ['run', 'typecheck']);
    findings.push({
      severity: agentTypecheck.exitCode === 0 ? 'info' : 'warning',
      category: 'quality',
      message: `Agent system typecheck: exit ${agentTypecheck.exitCode}`,
    });

    return findings;
  }

  private buildSummary(health: InspectionReport['projectHealth'], findings: InspectionFinding[]): string {
    const errors = findings.filter((f) => f.severity === 'error');
    const warnings = findings.filter((f) => f.severity === 'warning');

    return [
      `Project health: ${health.toUpperCase()}`,
      `Findings: ${findings.length} total (${errors.length} errors, ${warnings.length} warnings)`,
      '',
      ...errors.map((f) => `[ERROR] ${f.message}`),
      ...warnings.map((f) => `[WARN] ${f.message}`),
    ].join('\n');
  }

  private async persistReport(report: InspectionReport): Promise<void> {
    const reportsDir = path.resolve(this.config.projectRoot, 'memory/data/reports');
    await fs.mkdir(reportsDir, { recursive: true });
    const filename = `inspection-${report.generatedAt.replace(/[:.]/g, '-')}.json`;
    await fs.writeFile(path.join(reportsDir, filename), JSON.stringify(report, null, 2), 'utf-8');
  }
}

export { DailyInspectionWorkflow as default };
