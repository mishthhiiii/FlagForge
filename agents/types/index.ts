export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Subtask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee?: 'orchestrator' | 'coding-agent' | 'skill';
  skillId?: string;
  order: number;
  result?: TaskResult;
  startedAt?: string;
  completedAt?: string;
}

export interface ExecutionPlan {
  id: string;
  request: string;
  createdAt: string;
  steps: PlanStep[];
  status: TaskStatus;
  summary?: string;
}

export interface PlanStep {
  order: number;
  title: string;
  description: string;
  target?: 'analyze' | 'backend' | 'frontend' | 'test' | 'report' | 'skill';
  skillId?: string;
}

export interface AgentTask {
  id: string;
  request: string;
  plan?: ExecutionPlan;
  subtasks: Subtask[];
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TaskResult {
  success: boolean;
  output: string;
  artifacts?: Artifact[];
  error?: string;
  revised?: boolean;
}

export interface Artifact {
  type: 'file' | 'command_output' | 'plan' | 'report';
  path?: string;
  content: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  purpose: string;
  triggers: string[];
  inputs: SkillInput[];
  steps: string[];
  expectedOutput: string;
  path: string;
}

export interface SkillInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface SkillExecutionContext {
  inputs: Record<string, unknown>;
  projectRoot: string;
  memory: import('../../memory/types.js').ProjectMemory;
}

export interface SkillExecutionResult {
  success: boolean;
  output: string;
  artifacts?: Artifact[];
}

export interface CodingTaskInput {
  taskId: string;
  instruction: string;
  targetPaths?: string[];
  feedback?: string;
  dryRun?: boolean;
}

export interface CommandResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface FileReadResult {
  path: string;
  content: string;
  exists: boolean;
}

export interface FileWriteResult {
  path: string;
  success: boolean;
  error?: string;
}

export interface OrchestratorRequest {
  request: string;
  priority?: TaskPriority;
  autoExecute?: boolean;
  metadata?: Record<string, unknown>;
}

export interface OrchestratorResponse {
  task: AgentTask;
  plan: ExecutionPlan;
  message: string;
}

export type SlackChannelType = 'orchestrator' | 'coding' | 'logs' | 'human_review';

export interface SlackMessage {
  channel: SlackChannelType;
  text: string;
  blocks?: unknown[];
}

export interface InspectionReport {
  generatedAt: string;
  projectHealth: 'healthy' | 'degraded' | 'critical';
  findings: InspectionFinding[];
  summary: string;
}

export interface InspectionFinding {
  severity: 'info' | 'warning' | 'error';
  category: string;
  message: string;
  path?: string;
}

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LlmProvider {
  complete(messages: LlmMessage[], options?: LlmCompletionOptions): Promise<string>;
  isConfigured(): boolean;
}
