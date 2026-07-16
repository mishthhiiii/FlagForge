import fs from 'node:fs/promises';
import path from 'node:path';
import type { AgentConfig } from '../configs/index.js';
import {
  createEmptyMemory,
  type ProjectMemory,
  type TaskHistoryEntry,
  type UserPreference,
  type CodingConvention,
} from './types.js';

const MEMORY_FILES = {
  projectInfo: 'project-info.json',
  conventions: 'conventions.json',
  taskHistory: 'task-history.json',
  userPreferences: 'user-preferences.json',
} as const;

export class MemoryStore {
  private readonly dataDir: string;
  private cache: ProjectMemory | null = null;

  constructor(config: AgentConfig) {
    this.dataDir = path.resolve(config.projectRoot, config.memoryDir);
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    const memory = await this.load();
    if (memory.taskHistory.length === 0 && memory.conventions.length === 0) {
      const defaults = createEmptyMemory();
      await this.save(defaults);
    }
  }

  async load(): Promise<ProjectMemory> {
    if (this.cache) return this.cache;

    const defaults = createEmptyMemory();

    const [projectInfo, conventions, taskHistory, userPreferences] = await Promise.all([
      this.readJson(MEMORY_FILES.projectInfo, defaults.projectInfo),
      this.readJson(MEMORY_FILES.conventions, defaults.conventions),
      this.readJson(MEMORY_FILES.taskHistory, defaults.taskHistory),
      this.readJson(MEMORY_FILES.userPreferences, defaults.userPreferences),
    ]);

    this.cache = {
      projectInfo,
      conventions,
      taskHistory,
      userPreferences,
      lastUpdated: new Date().toISOString(),
    };

    return this.cache;
  }

  async save(memory: ProjectMemory): Promise<void> {
    memory.lastUpdated = new Date().toISOString();
    await Promise.all([
      this.writeJson(MEMORY_FILES.projectInfo, memory.projectInfo),
      this.writeJson(MEMORY_FILES.conventions, memory.conventions),
      this.writeJson(MEMORY_FILES.taskHistory, memory.taskHistory),
      this.writeJson(MEMORY_FILES.userPreferences, memory.userPreferences),
    ]);
    this.cache = memory;
  }

  async addTaskHistory(entry: TaskHistoryEntry): Promise<void> {
    const memory = await this.load();
    memory.taskHistory.unshift(entry);
    memory.taskHistory = memory.taskHistory.slice(0, 100);
    await this.save(memory);
  }

  async setUserPreference(key: string, value: string): Promise<void> {
    const memory = await this.load();
    const existing = memory.userPreferences.find((p) => p.key === key);
    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date().toISOString();
    } else {
      memory.userPreferences.push({ key, value, updatedAt: new Date().toISOString() });
    }
    await this.save(memory);
  }

  async addConvention(convention: CodingConvention): Promise<void> {
    const memory = await this.load();
    memory.conventions.push(convention);
    await this.save(memory);
  }

  async getContextSummary(): Promise<string> {
    const memory = await this.load();
    const recentTasks = memory.taskHistory.slice(0, 5);

    return [
      `Project: ${memory.projectInfo.name}`,
      memory.projectInfo.description,
      `Stack: ${memory.projectInfo.stack.frontend} | ${memory.projectInfo.stack.backend}`,
      '',
      'Conventions:',
      ...memory.conventions.map((c) => `- [${c.category}] ${c.rule}`),
      '',
      'Recent tasks:',
      ...(recentTasks.length > 0
        ? recentTasks.map((t) => `- ${t.request} (${t.status})`)
        : ['- None recorded']),
      '',
      'User preferences:',
      ...memory.userPreferences.map((p) => `- ${p.key}: ${p.value}`),
    ].join('\n');
  }

  private async readJson<T>(filename: string, fallback: T): Promise<T> {
    const filePath = path.join(this.dataDir, filename);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private async writeJson(filename: string, data: unknown): Promise<void> {
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

export type { ProjectMemory, TaskHistoryEntry, UserPreference, CodingConvention };
