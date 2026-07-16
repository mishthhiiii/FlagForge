import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AgentConfig } from '../../configs/index.js';
import type {
  CodingTaskInput,
  TaskResult,
  CommandResult,
  FileReadResult,
  FileWriteResult,
} from '../types/index.js';
import type { MemoryStore } from '../../memory/MemoryStore.js';

const execFileAsync = promisify(execFile);

export class RepositoryReader {
  constructor(
    private readonly projectRoot: string,
    private readonly maxFileSizeKb: number,
  ) {}

  async readFile(relativePath: string): Promise<FileReadResult> {
    const fullPath = path.resolve(this.projectRoot, relativePath);

    if (!fullPath.startsWith(path.resolve(this.projectRoot))) {
      return { path: relativePath, content: '', exists: false };
    }

    try {
      const stat = await fs.stat(fullPath);
      if (stat.size > this.maxFileSizeKb * 1024) {
        return { path: relativePath, content: `[File exceeds ${this.maxFileSizeKb}KB limit]`, exists: true };
      }
      const content = await fs.readFile(fullPath, 'utf-8');
      return { path: relativePath, content, exists: true };
    } catch {
      return { path: relativePath, content: '', exists: false };
    }
  }

  async listDirectory(relativePath: string, depth = 2): Promise<string[]> {
    const results: string[] = [];
    await this.walk(relativePath, depth, results);
    return results.sort();
  }

  async fileExists(relativePath: string): Promise<boolean> {
    const fullPath = path.resolve(this.projectRoot, relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  private async walk(relativePath: string, depth: number, results: string[]): Promise<void> {
    if (depth < 0) return;

    const fullPath = path.resolve(this.projectRoot, relativePath);
    let entries;

    try {
      entries = await fs.readdir(fullPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;

      const rel = path.join(relativePath, entry.name).replace(/\\/g, '/');
      results.push(rel);

      if (entry.isDirectory() && depth > 0) {
        await this.walk(rel, depth - 1, results);
      }
    }
  }
}

export class CommandRunner {
  constructor(
    private readonly projectRoot: string,
    private readonly allowedCommands: string[],
  ) {}

  async run(command: string, args: string[] = []): Promise<CommandResult> {
    const bin = command.split(/[/\\]/).pop()?.toLowerCase() ?? command.toLowerCase();

    if (!this.allowedCommands.some((c) => c.toLowerCase() === bin)) {
      return {
        command: `${command} ${args.join(' ')}`.trim(),
        exitCode: 1,
        stdout: '',
        stderr: `Command not allowed: ${command}. Allowed: ${this.allowedCommands.join(', ')}`,
        durationMs: 0,
      };
    }

    const start = Date.now();
    const execCommand = process.platform === 'win32' && !command.endsWith('.cmd') ? `${command}.cmd` : command;

    try {
      const { stdout, stderr } = await execFileAsync(execCommand, args, {
        cwd: this.projectRoot,
        timeout: 120_000,
        maxBuffer: 10 * 1024 * 1024,
      });

      return {
        command: `${command} ${args.join(' ')}`.trim(),
        exitCode: 0,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        durationMs: Date.now() - start,
      };
    } catch (error: unknown) {
      const execError = error as { code?: number; stdout?: string; stderr?: string };
      return {
        command: `${command} ${args.join(' ')}`.trim(),
        exitCode: typeof execError.code === 'number' ? execError.code : 1,
        stdout: execError.stdout?.toString() ?? '',
        stderr: execError.stderr?.toString() ?? (error instanceof Error ? error.message : String(error)),
        durationMs: Date.now() - start,
      };
    }
  }
}

export class CodeExecutor {
  constructor(
    private readonly projectRoot: string,
    private readonly reader: RepositoryReader,
    private readonly dryRun: boolean,
  ) {}

  async writeFile(relativePath: string, content: string): Promise<FileWriteResult> {
    if (this.dryRun) {
      return { path: relativePath, success: true };
    }

    const fullPath = path.resolve(this.projectRoot, relativePath);

    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
      return { path: relativePath, success: true };
    } catch (error) {
      return {
        path: relativePath,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async applyPatch(relativePath: string, search: string, replace: string): Promise<FileWriteResult> {
    const file = await this.reader.readFile(relativePath);
    if (!file.exists) {
      return { path: relativePath, success: false, error: 'File not found' };
    }
    if (!file.content.includes(search)) {
      return { path: relativePath, success: false, error: 'Search string not found in file' };
    }
    return this.writeFile(relativePath, file.content.replace(search, replace));
  }
}

export class CodingAgent {
  private readonly reader: RepositoryReader;
  private readonly runner: CommandRunner;
  private readonly executor: CodeExecutor;

  constructor(
    private readonly config: AgentConfig,
    private readonly memory: MemoryStore,
  ) {
    this.reader = new RepositoryReader(config.projectRoot, config.codingAgent.maxFileSizeKb);
    this.runner = new CommandRunner(config.projectRoot, config.codingAgent.allowedCommands);
    this.executor = new CodeExecutor(config.projectRoot, this.reader, config.codingAgent.dryRun);
  }

  async execute(input: CodingTaskInput): Promise<TaskResult> {
    const memoryContext = await this.memory.getContextSummary();
    const targetPaths = input.targetPaths ?? this.inferTargetPaths(input.instruction);

    const fileContents: string[] = [];
    for (const p of targetPaths.slice(0, 10)) {
      const file = await this.reader.readFile(p);
      if (file.exists) {
        fileContents.push(`--- ${p} ---\n${file.content.slice(0, 2000)}`);
      }
    }

    let commandOutput = '';
    if (input.instruction.toLowerCase().includes('test') || input.instruction.toLowerCase().includes('typecheck')) {
      const frontendCheck = await this.runner.run('npm', ['run', 'typecheck', '--prefix', 'frontend']);
      const backendCheck = await this.runner.run('npm', ['run', 'build', '--prefix', 'backend/backend']);
      commandOutput = [
        `Frontend typecheck (exit ${frontendCheck.exitCode}):`,
        frontendCheck.stdout || frontendCheck.stderr,
        '',
        `Backend build (exit ${backendCheck.exitCode}):`,
        backendCheck.stdout || backendCheck.stderr,
      ].join('\n');
    }

    const output = [
      `Coding task: ${input.instruction}`,
      '',
      'Memory context loaded.',
      memoryContext.split('\n').slice(0, 8).join('\n'),
      '',
      `Files inspected (${targetPaths.length}):`,
      ...targetPaths.map((p) => `- ${p}`),
      '',
      ...(fileContents.length > 0 ? ['File previews:', ...fileContents] : []),
      ...(commandOutput ? ['', 'Command output:', commandOutput] : []),
      '',
      input.dryRun ? '[DRY RUN — no files modified]' : 'Ready for code modifications via revise() with feedback.',
    ].join('\n');

    const success = !commandOutput || !commandOutput.includes('exit 1');

    return {
      success,
      output,
      artifacts: fileContents.map((c) => ({ type: 'file' as const, content: c })),
    };
  }

  async revise(input: CodingTaskInput): Promise<TaskResult> {
    const output = [
      `Revising task ${input.taskId} based on feedback:`,
      input.feedback ?? '(no feedback provided)',
      '',
      'The coding agent will re-inspect affected files and re-run validation.',
    ].join('\n');

    const result = await this.execute({
      ...input,
      instruction: `${input.instruction}\n\nUser feedback: ${input.feedback}`,
    });

    return { ...result, output: `${output}\n\n${result.output}`, revised: true };
  }

  async analyzeRepository(): Promise<string> {
    const frontendFiles = await this.reader.listDirectory('frontend/src', 2);
    const backendFiles = await this.reader.listDirectory('backend/backend/src', 2);

    const keyFiles = [
      'backend/backend/prisma/schema.prisma',
      'backend/backend/src/server.ts',
      'backend/backend/src/routes/index.ts',
      'frontend/src/App.tsx',
      'frontend/src/services/flagsService.ts',
    ];

    const checks = await Promise.all(keyFiles.map((f) => this.reader.fileExists(f)));

    return [
      'Repository Analysis',
      '',
      `Frontend files (sample): ${frontendFiles.length}`,
      `Backend files (sample): ${backendFiles.length}`,
      '',
      'Key files:',
      ...keyFiles.map((f, i) => `- ${f}: ${checks[i] ? 'present' : 'missing'}`),
    ].join('\n');
  }

  getReader(): RepositoryReader {
    return this.reader;
  }

  getRunner(): CommandRunner {
    return this.runner;
  }

  getExecutor(): CodeExecutor {
    return this.executor;
  }

  private inferTargetPaths(instruction: string): string[] {
    const lower = instruction.toLowerCase();
    const paths: string[] = [];

    if (lower.includes('backend') || lower.includes('api') || lower.includes('prisma')) {
      paths.push(
        'backend/backend/src/routes/flag.routes.ts',
        'backend/backend/src/services/flag.service.ts',
        'backend/backend/prisma/schema.prisma',
      );
    }

    if (lower.includes('frontend') || lower.includes('ui') || lower.includes('react')) {
      paths.push(
        'frontend/src/App.tsx',
        'frontend/src/pages/FeatureFlags.tsx',
        'frontend/src/services/flagsService.ts',
      );
    }

    if (paths.length === 0) {
      paths.push('frontend/src/App.tsx', 'backend/backend/src/server.ts');
    }

    return paths;
  }
}
