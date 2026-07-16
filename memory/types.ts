export interface ProjectInfo {
  name: string;
  description: string;
  stack: {
    frontend: string;
    backend: string;
    database: string;
  };
  paths: {
    frontend: string;
    backend: string;
    prisma: string;
  };
  apiBaseUrl: string;
}

export interface CodingConvention {
  id: string;
  category: string;
  rule: string;
  examples?: string[];
}

export interface TaskHistoryEntry {
  id: string;
  request: string;
  status: string;
  completedAt?: string;
  summary?: string;
  tags?: string[];
}

export interface UserPreference {
  key: string;
  value: string;
  updatedAt: string;
}

export interface ProjectMemory {
  projectInfo: ProjectInfo;
  conventions: CodingConvention[];
  taskHistory: TaskHistoryEntry[];
  userPreferences: UserPreference[];
  lastUpdated: string;
}

export const DEFAULT_PROJECT_INFO: ProjectInfo = {
  name: 'FlagForge',
  description: 'Feature flag management platform with React frontend and Express/Prisma backend.',
  stack: {
    frontend: 'React + TypeScript + Vite + TailwindCSS',
    backend: 'Node.js + Express + Prisma + PostgreSQL',
    database: 'PostgreSQL',
  },
  paths: {
    frontend: 'frontend',
    backend: 'backend/backend',
    prisma: 'backend/backend/prisma',
  },
  apiBaseUrl: 'http://localhost:5000',
};

export const DEFAULT_CONVENTIONS: CodingConvention[] = [
  {
    id: 'conv-1',
    category: 'naming',
    rule: 'Feature flag keys use kebab-case (e.g., new-billing-flow)',
    examples: ['ai-code-generation-v2', 'billing-engine-v3-migration'],
  },
  {
    id: 'conv-2',
    category: 'backend',
    rule: 'Use Zod validators in backend/backend/src/validators/ for request validation',
  },
  {
    id: 'conv-3',
    category: 'backend',
    rule: 'Business logic lives in services; controllers handle HTTP only',
  },
  {
    id: 'conv-4',
    category: 'frontend',
    rule: 'Pages in frontend/src/pages/, shared components in frontend/src/components/',
  },
  {
    id: 'conv-5',
    category: 'database',
    rule: 'Prisma schema at backend/backend/prisma/schema.prisma; run migrations via npm run prisma:migrate',
  },
  {
    id: 'conv-6',
    category: 'flags',
    rule: 'Flag types: BOOLEAN, MULTIVARIATE, JSON (Prisma enum FlagType)',
  },
];

export const DEFAULT_USER_PREFERENCES: UserPreference[] = [
  { key: 'plan_before_execute', value: 'true', updatedAt: new Date().toISOString() },
  { key: 'notify_human_review', value: 'true', updatedAt: new Date().toISOString() },
  { key: 'preferred_test_command', value: 'npm run typecheck', updatedAt: new Date().toISOString() },
];

export function createEmptyMemory(): ProjectMemory {
  return {
    projectInfo: DEFAULT_PROJECT_INFO,
    conventions: [...DEFAULT_CONVENTIONS],
    taskHistory: [],
    userPreferences: [...DEFAULT_USER_PREFERENCES],
    lastUpdated: new Date().toISOString(),
  };
}
