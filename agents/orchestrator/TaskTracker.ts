import { randomUUID } from 'node:crypto';
import type { AgentTask, Subtask, TaskStatus, ExecutionPlan } from '../types/index.js';

export class TaskTracker {
  private tasks: Map<string, AgentTask> = new Map();

  createTask(request: string, plan: ExecutionPlan): AgentTask {
    const subtasks = this.planToSubtasks(plan);
    const now = new Date().toISOString();

    const task: AgentTask = {
      id: randomUUID(),
      request,
      plan,
      subtasks,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(task.id, task);
    return task;
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  updateSubtaskStatus(taskId: string, subtaskId: string, status: TaskStatus, result?: Subtask['result']): AgentTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return undefined;

    subtask.status = status;
    if (status === 'in_progress') subtask.startedAt = new Date().toISOString();
    if (status === 'completed' || status === 'failed') subtask.completedAt = new Date().toISOString();
    if (result) subtask.result = result;

    task.updatedAt = new Date().toISOString();
    task.status = this.deriveTaskStatus(task.subtasks);

    return task;
  }

  updateTaskStatus(taskId: string, status: TaskStatus): AgentTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  getProgress(taskId: string): { completed: number; total: number; percentage: number } {
    const task = this.tasks.get(taskId);
    if (!task) return { completed: 0, total: 0, percentage: 0 };

    const total = task.subtasks.length;
    const completed = task.subtasks.filter((s) => s.status === 'completed').length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  formatStatus(task: AgentTask): string {
    const progress = this.getProgress(task.id);
    const lines = [
      `Task: ${task.id}`,
      `Request: ${task.request}`,
      `Status: ${task.status} (${progress.completed}/${progress.total})`,
      '',
      'Subtasks:',
      ...task.subtasks.map((s) => {
        const icon = s.status === 'completed' ? '✓' : s.status === 'failed' ? '✗' : s.status === 'in_progress' ? '→' : '○';
        return `  ${icon} [${s.status}] ${s.title}`;
      }),
    ];
    return lines.join('\n');
  }

  private planToSubtasks(plan: ExecutionPlan): Subtask[] {
    return plan.steps.map((step) => ({
      id: randomUUID(),
      title: step.title,
      description: step.description,
      status: 'pending' as TaskStatus,
      assignee: step.target === 'skill' ? 'skill' : step.target === 'analyze' || step.target === 'report' ? 'orchestrator' : 'coding-agent',
      skillId: step.skillId,
      order: step.order,
    }));
  }

  private deriveTaskStatus(subtasks: Subtask[]): TaskStatus {
    if (subtasks.some((s) => s.status === 'failed')) return 'failed';
    if (subtasks.every((s) => s.status === 'completed')) return 'completed';
    if (subtasks.some((s) => s.status === 'in_progress')) return 'in_progress';
    if (subtasks.some((s) => s.status === 'completed')) return 'in_progress';
    return 'pending';
  }
}
