import { z } from 'zod';

const llmProviderSchema = z.enum(['openai', 'anthropic', 'gemini', 'none']);

export const agentConfigSchema = z.object({
  projectRoot: z.string().default('.'),
  memoryDir: z.string().default('memory/data'),
  skillsDir: z.string().default('skills'),

  llm: z.object({
    provider: llmProviderSchema.default('none'),
    model: z.string().default('gpt-4o'),
    openaiApiKey: z.string().optional(),
    anthropicApiKey: z.string().optional(),
    geminiApiKey: z.string().optional(),
  }),

  orchestrator: z.object({
    maxSubtasks: z.coerce.number().int().positive().default(10),
    planningEnabled: z.coerce.boolean().default(true),
    autoExecute: z.coerce.boolean().default(false),
  }),

  codingAgent: z.object({
    allowedCommands: z.array(z.string()).default(['npm', 'node', 'npx', 'tsc', 'tsx', 'git', 'prisma']),
    maxFileSizeKb: z.coerce.number().int().positive().default(512),
    dryRun: z.coerce.boolean().default(false),
  }),

  slack: z.object({
    enabled: z.coerce.boolean().default(false),
    botToken: z.string().optional(),
    signingSecret: z.string().optional(),
    channels: z.object({
      orchestrator: z.string().default('#agent-orchestrator'),
      coding: z.string().default('#agent-coding'),
      logs: z.string().default('#agent-logs'),
      humanReview: z.string().default('#agent-human-review'),
    }),
  }),

  autonomous: z.object({
    enabled: z.coerce.boolean().default(false),
    dailyInspectionCron: z.string().default('0 9 * * *'),
    timezone: z.string().default('UTC'),
  }),

  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

function parseList(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AgentConfig {
  return agentConfigSchema.parse({
    projectRoot: env.AGENT_PROJECT_ROOT ?? '.',
    memoryDir: env.AGENT_MEMORY_DIR ?? 'memory/data',
    skillsDir: env.AGENT_SKILLS_DIR ?? 'skills',
    llm: {
      provider: env.AGENT_LLM_PROVIDER ?? 'none',
      model: env.AGENT_LLM_MODEL ?? 'gpt-4o',
      openaiApiKey: env.OPENAI_API_KEY,
      anthropicApiKey: env.ANTHROPIC_API_KEY,
      geminiApiKey: env.GEMINI_API_KEY,
    },
    orchestrator: {
      maxSubtasks: env.ORCHESTRATOR_MAX_SUBTASKS ?? '10',
      planningEnabled: parseBoolean(env.ORCHESTRATOR_PLANNING_ENABLED, true),
      autoExecute: parseBoolean(env.ORCHESTRATOR_AUTO_EXECUTE, false),
    },
    codingAgent: {
      allowedCommands: parseList(env.CODING_AGENT_ALLOWED_COMMANDS, ['npm', 'node', 'npx', 'tsc', 'tsx', 'git', 'prisma']),
      maxFileSizeKb: env.CODING_AGENT_MAX_FILE_SIZE_KB ?? '512',
      dryRun: parseBoolean(env.CODING_AGENT_DRY_RUN, false),
    },
    slack: {
      enabled: parseBoolean(env.SLACK_ENABLED, false),
      botToken: env.SLACK_BOT_TOKEN,
      signingSecret: env.SLACK_SIGNING_SECRET,
      channels: {
        orchestrator: env.SLACK_CHANNEL_ORCHESTRATOR ?? '#agent-orchestrator',
        coding: env.SLACK_CHANNEL_CODING ?? '#agent-coding',
        logs: env.SLACK_CHANNEL_LOGS ?? '#agent-logs',
        humanReview: env.SLACK_CHANNEL_HUMAN_REVIEW ?? '#agent-human-review',
      },
    },
    autonomous: {
      enabled: parseBoolean(env.AUTONOMOUS_ENABLED, false),
      dailyInspectionCron: env.AUTONOMOUS_DAILY_INSPECTION_CRON ?? '0 9 * * *',
      timezone: env.AUTONOMOUS_TIMEZONE ?? 'UTC',
    },
    logLevel: (env.AGENT_LOG_LEVEL as AgentConfig['logLevel']) ?? 'info',
  });
}
