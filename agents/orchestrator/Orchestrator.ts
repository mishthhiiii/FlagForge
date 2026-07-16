import type { AgentConfig } from '../../configs/index.js';
import { MemoryStore } from '../../memory/MemoryStore.js';
import { SlackNotifier } from '../../communication/slack/notifier.js';
import { createLlmProvider } from '../shared/LlmProvider.js';
import { Planner } from './Planner.js';
import { TaskTracker } from './TaskTracker.js';
import { SkillRegistry } from './SkillRegistry.js';
import { CodingAgent } from '../coding-agent/CodingAgent.js';
import type {
  OrchestratorRequest,
  OrchestratorResponse,
  AgentTask,
  Subtask,
  TaskResult,
} from '../types/index.js';

export class Orchestrator {
  private readonly memory: MemoryStore;
  private readonly planner: Planner;
  private readonly tracker: TaskTracker;
  private readonly skills: SkillRegistry;
  private readonly codingAgent: CodingAgent;
  private readonly slack: SlackNotifier;
  private readonly llm;

  constructor(private readonly config: AgentConfig) {
    this.memory = new MemoryStore(config);
    this.llm = createLlmProvider(config);
    this.planner = new Planner(config, this.memory, this.llm);
    this.tracker = new TaskTracker();
    this.skills = new SkillRegistry(config);
    this.codingAgent = new CodingAgent(config, this.memory);
    this.slack = new SlackNotifier(config);
  }

  async initialize(): Promise<void> {
    await this.memory.initialize();
    await this.skills.loadSkills();
  }

  async handleRequest(input: OrchestratorRequest): Promise<OrchestratorResponse> {
    await this.slack.notifyOrchestrator(`New request: ${input.request}`);

    const plan = await this.planner.createPlan(input.request);
    plan.status = 'in_progress';

    const task = this.tracker.createTask(input.request, plan);
    this.tracker.updateTaskStatus(task.id, 'in_progress');

    const planText = this.planner.formatPlan(plan);
    await this.slack.notifyLogs(`Plan generated for task ${task.id}:\n${planText}`);

    const autoExecute = input.autoExecute ?? this.config.orchestrator.autoExecute;

    if (autoExecute) {
      const executed = await this.executeTask(task.id);
      return {
        task: executed,
        plan,
        message: `Task executed.\n\n${planText}\n\n${this.tracker.formatStatus(executed)}`,
      };
    }

    return {
      task,
      plan,
      message: `Plan ready. Run execute to proceed.\n\n${planText}`,
    };
  }

  async executeTask(taskId: string): Promise<AgentTask> {
    const task = this.tracker.getTask(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    this.tracker.updateTaskStatus(taskId, 'in_progress');
    await this.slack.notifyOrchestrator(`Executing task ${taskId}`);

    const memory = await this.memory.load();

    for (const subtask of task.subtasks.sort((a, b) => a.order - b.order)) {
      if (subtask.status === 'completed') continue;

      this.tracker.updateSubtaskStatus(taskId, subtask.id, 'in_progress');
      await this.slack.notifyCoding(`Starting: ${subtask.title}`);

      let result: TaskResult;

      try {
        result = await this.delegateSubtask(subtask, task.request, memory);
        this.tracker.updateSubtaskStatus(taskId, subtask.id, result.success ? 'completed' : 'failed', result);
        await this.slack.notifyLogs(`${subtask.title}: ${result.success ? 'completed' : 'failed'}`);
      } catch (error) {
        result = {
          success: false,
          output: '',
          error: error instanceof Error ? error.message : String(error),
        };
        this.tracker.updateSubtaskStatus(taskId, subtask.id, 'failed', result);
        await this.slack.notifyHumanReview(`Subtask failed: ${subtask.title}\n${result.error}`);
      }
    }

    const updated = this.tracker.getTask(taskId)!;
    const summary = this.buildSummary(updated);

    if (updated.plan) {
      updated.plan.status = updated.status;
      updated.plan.summary = summary;
    }

    await this.memory.addTaskHistory({
      id: taskId,
      request: task.request,
      status: updated.status,
      completedAt: new Date().toISOString(),
      summary,
    });

    await this.slack.notifyOrchestrator(`Task ${taskId} ${updated.status}.\n${summary}`);

    if (updated.status === 'failed') {
      await this.slack.notifyHumanReview(`Task requires review: ${taskId}\n${summary}`);
    }

    return updated;
  }

  async reviseTask(taskId: string, feedback: string): Promise<AgentTask> {
    const task = this.tracker.getTask(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    await this.slack.notifyHumanReview(`Revision requested for ${taskId}: ${feedback}`);

    const result = await this.codingAgent.revise({
      taskId,
      instruction: task.request,
      feedback,
    });

    const failedSubtasks = task.subtasks.filter((s) => s.status === 'failed');
    for (const subtask of failedSubtasks) {
      this.tracker.updateSubtaskStatus(taskId, subtask.id, 'pending');
    }

    if (failedSubtasks.length === 0) {
      const lastSubtask = task.subtasks[task.subtasks.length - 1];
      this.tracker.updateSubtaskStatus(taskId, lastSubtask.id, 'pending');
    }

    const revised = await this.executeTask(taskId);

    if (result.success) {
      await this.slack.notifyCoding(`Revision applied for task ${taskId}`);
    }

    return revised;
  }

  getTaskStatus(taskId: string): string {
    const task = this.tracker.getTask(taskId);
    if (!task) return `Task not found: ${taskId}`;
    return this.tracker.formatStatus(task);
  }

  listSkills(): string {
    const skills = this.skills.listSkills();
    if (skills.length === 0) return 'No skills loaded.';
    return skills.map((s) => `- ${s.id}: ${s.purpose}`).join('\n');
  }

  getMemoryStore(): MemoryStore {
    return this.memory;
  }

  getTaskTracker(): TaskTracker {
    return this.tracker;
  }

  getSlackNotifier(): SlackNotifier {
    return this.slack;
  }

  private async delegateSubtask(
    subtask: Subtask,
    originalRequest: string,
    memory: Awaited<ReturnType<MemoryStore['load']>>,
  ): Promise<TaskResult> {
    switch (subtask.assignee) {
      case 'skill':
        if (!subtask.skillId) {
          return { success: false, output: '', error: 'Subtask missing skillId' };
        }
        const skillResult = await this.skills.executeSkill(subtask.skillId, {
          inputs: { request: originalRequest },
          projectRoot: this.config.projectRoot,
          memory,
        });
        return {
          success: skillResult.success,
          output: skillResult.output,
          artifacts: skillResult.artifacts,
        };

      case 'orchestrator':
        if (subtask.title.toLowerCase().includes('analyze')) {
          const context = await this.memory.getContextSummary();
          const repoSummary = await this.codingAgent.analyzeRepository();
          return {
            success: true,
            output: `${context}\n\n${repoSummary}`,
            artifacts: [{ type: 'report', content: repoSummary }],
          };
        }
        return {
          success: true,
          output: this.buildSummary({ subtasks: [subtask] } as AgentTask),
        };

      case 'coding-agent':
      default:
        return this.codingAgent.execute({
          taskId: subtask.id,
          instruction: `${subtask.title}: ${subtask.description}\n\nOriginal request: ${originalRequest}`,
          dryRun: this.config.codingAgent.dryRun,
        });
    }
  }

  private buildSummary(task: AgentTask): string {
    const completed = task.subtasks.filter((s) => s.status === 'completed');
    const failed = task.subtasks.filter((s) => s.status === 'failed');

    return [
      `Completed ${completed.length}/${task.subtasks.length} subtasks.`,
      ...completed.map((s) => `✓ ${s.title}`),
      ...failed.map((s) => `✗ ${s.title}${s.result?.error ? `: ${s.result.error}` : ''}`),
    ].join('\n');
  }
}

export { Planner, TaskTracker, SkillRegistry };
