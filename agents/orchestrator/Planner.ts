import { randomUUID } from 'node:crypto';
import type { AgentConfig } from '../../configs/index.js';
import type { ExecutionPlan, PlanStep, LlmProvider } from '../types/index.js';
import type { MemoryStore } from '../../memory/MemoryStore.js';

const DEFAULT_PLAN_TEMPLATE: Omit<PlanStep, 'order'>[] = [
  { title: 'Analyze repository', description: 'Review project structure, memory, and relevant files', target: 'analyze' },
  { title: 'Modify backend', description: 'Apply backend changes (routes, services, validators, Prisma)', target: 'backend' },
  { title: 'Modify frontend', description: 'Apply frontend changes (pages, components, services)', target: 'frontend' },
  { title: 'Test', description: 'Run type checks and relevant test commands', target: 'test' },
  { title: 'Return result', description: 'Summarize changes and report execution outcome', target: 'report' },
];

export class Planner {
  constructor(
    private readonly config: AgentConfig,
    private readonly memory: MemoryStore,
    private readonly llm: LlmProvider,
  ) {}

  async createPlan(request: string): Promise<ExecutionPlan> {
    const memoryContext = await this.memory.getContextSummary();

    let steps: PlanStep[];

    if (this.config.orchestrator.planningEnabled && this.llm.isConfigured()) {
      steps = await this.generateLlmPlan(request, memoryContext);
    } else {
      steps = this.generateTemplatePlan(request, memoryContext);
    }

    return {
      id: randomUUID(),
      request,
      createdAt: new Date().toISOString(),
      steps,
      status: 'pending',
    };
  }

  formatPlan(plan: ExecutionPlan): string {
    const lines = [
      'Plan',
      '',
      ...plan.steps.map((step) => `${step.order}. ${step.title}`),
      '',
      'Details:',
      ...plan.steps.map(
        (step) => `  ${step.order}. ${step.title}\n     ${step.description}${step.target ? ` [${step.target}]` : ''}`,
      ),
    ];
    return lines.join('\n');
  }

  private generateTemplatePlan(request: string, memoryContext: string): PlanStep[] {
    const lower = request.toLowerCase();
    const steps = [...DEFAULT_PLAN_TEMPLATE];

    if (lower.includes('feature flag') || lower.includes('flag')) {
      steps.splice(1, 0, {
        title: 'Execute create-feature-flag skill',
        description: 'Use the create-feature-flag skill for standardized flag creation',
        target: 'skill',
        skillId: 'create-feature-flag',
      });
    }

    if (lower.includes('frontend only') || lower.includes('ui only')) {
      return steps
        .filter((s) => s.target !== 'backend')
        .map((s, i) => ({ ...s, order: i + 1 }));
    }

    if (lower.includes('backend only') || lower.includes('api only')) {
      return steps
        .filter((s) => s.target !== 'frontend')
        .map((s, i) => ({ ...s, order: i + 1 }));
    }

    void memoryContext;

    return steps.map((s, i) => ({ ...s, order: i + 1 }));
  }

  private async generateLlmPlan(request: string, memoryContext: string): Promise<PlanStep[]> {
    const systemPrompt = `You are a software engineering planner for FlagForge.
Generate a JSON array of plan steps. Each step: { "title": string, "description": string, "target": "analyze"|"backend"|"frontend"|"test"|"report"|"skill", "skillId"?: string }.
Return ONLY valid JSON array, no markdown.`;

    const userPrompt = `Request: ${request}\n\nProject context:\n${memoryContext}`;

    const response = await this.llm.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    try {
      const parsed = JSON.parse(response) as Omit<PlanStep, 'order'>[];
      return parsed.map((s, i) => ({ ...s, order: i + 1 }));
    } catch {
      return this.generateTemplatePlan(request, memoryContext);
    }
  }
}

export { DEFAULT_PLAN_TEMPLATE };
