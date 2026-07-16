import fs from 'node:fs/promises';
import path from 'node:path';
import type { AgentConfig } from '../../configs/index.js';
import type { SkillDefinition, SkillExecutionContext, SkillExecutionResult } from '../types/index.js';

const SKILL_FILENAME = 'SKILL.md';

export class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();

  constructor(private readonly config: AgentConfig) {}

  async loadSkills(): Promise<void> {
    const skillsDir = path.resolve(this.config.projectRoot, this.config.skillsDir);
    let entries: string[];

    try {
      entries = await fs.readdir(skillsDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      const skillPath = path.join(skillsDir, entry, SKILL_FILENAME);
      try {
        const content = await fs.readFile(skillPath, 'utf-8');
        const skill = this.parseSkillMarkdown(entry, skillPath, content);
        this.skills.set(skill.id, skill);
      } catch {
        // Skip directories without valid SKILL.md
      }
    }
  }

  getSkill(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  listSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  findMatchingSkill(request: string): SkillDefinition | undefined {
    const lower = request.toLowerCase();
    for (const skill of this.skills.values()) {
      if (skill.triggers.some((t) => lower.includes(t.toLowerCase()))) {
        return skill;
      }
    }
    return undefined;
  }

  async executeSkill(skillId: string, context: SkillExecutionContext): Promise<SkillExecutionResult> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return { success: false, output: `Skill not found: ${skillId}` };
    }

    if (skillId === 'create-feature-flag') {
      return this.executeCreateFeatureFlag(context);
    }

    return {
      success: true,
      output: [
        `Executed skill: ${skill.name}`,
        `Purpose: ${skill.purpose}`,
        '',
        'Steps:',
        ...skill.steps.map((s, i) => `${i + 1}. ${s}`),
        '',
        `Expected output: ${skill.expectedOutput}`,
      ].join('\n'),
    };
  }

  private async executeCreateFeatureFlag(context: SkillExecutionContext): Promise<SkillExecutionResult> {
    const { inputs, projectRoot } = context;
    const flagKey = String(inputs.flagKey ?? 'new-feature-flag');
    const flagName = String(inputs.flagName ?? 'New Feature Flag');
    const flagType = String(inputs.flagType ?? 'BOOLEAN');

    const backendPaths = {
      validator: path.join(projectRoot, 'backend/backend/src/validators/flag.validator.ts'),
      service: path.join(projectRoot, 'backend/backend/src/services/flag.service.ts'),
      routes: path.join(projectRoot, 'backend/backend/src/routes/flag.routes.ts'),
      schema: path.join(projectRoot, 'backend/backend/prisma/schema.prisma'),
    };

    const checklist = [
      `Flag key: ${flagKey} (kebab-case)`,
      `Flag name: ${flagName}`,
      `Flag type: ${flagType}`,
      '',
      'Backend checklist:',
      `1. Verify schema supports type ${flagType} in ${backendPaths.schema}`,
      `2. Use createFlagSchema in ${backendPaths.validator}`,
      `3. Call FlagService.createFlag via POST / in ${backendPaths.routes}`,
      `4. Default environment states created per project environments in ${backendPaths.service}`,
      '',
      'Frontend checklist (if UI entry needed):',
      '1. Add flag to frontend/src/pages/FlagForm.tsx flow',
      '2. Update frontend/src/types/index.ts if new fields required',
      '',
      'Verification:',
      '- POST /api/flags with auth token and projectId',
      '- Confirm flag appears in GET /api/flags/project/:projectId',
    ];

    return {
      success: true,
      output: checklist.join('\n'),
      artifacts: [
        { type: 'plan', content: checklist.join('\n') },
      ],
    };
  }

  private parseSkillMarkdown(id: string, filePath: string, content: string): SkillDefinition {
    const sections = this.extractSections(content);

    return {
      id,
      name: this.extractTitle(content) ?? id,
      purpose: sections.purpose ?? '',
      triggers: this.parseList(sections.trigger ?? sections.triggers ?? ''),
      inputs: this.parseInputs(sections.inputs ?? ''),
      steps: this.parseList(sections['execution steps'] ?? sections.steps ?? ''),
      expectedOutput: sections['expected output'] ?? sections.output ?? '',
      path: filePath,
    };
  }

  private extractTitle(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    return match?.[1]?.trim() ?? null;
  }

  private extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const regex = /^##\s+(.+)$/gm;
    const matches = [...content.matchAll(regex)];

    for (let i = 0; i < matches.length; i++) {
      const heading = matches[i][1].trim().toLowerCase();
      const start = (matches[i].index ?? 0) + matches[i][0].length;
      const end = i + 1 < matches.length ? (matches[i + 1].index ?? content.length) : content.length;
      sections[heading] = content.slice(start, end).trim();
    }

    return sections;
  }

  private parseList(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.replace(/^[-*\d.]+\s*/, '').trim())
      .filter(Boolean);
  }

  private parseInputs(text: string): SkillDefinition['inputs'] {
    return text
      .split('\n')
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/`(\w+)`\s*\((\w+)(?:,\s*(required|optional))?\)\s*[-–—]?\s*(.*)/i);
        if (match) {
          return {
            name: match[1],
            type: match[2],
            required: match[3]?.toLowerCase() !== 'optional',
            description: match[4] || '',
          };
        }
        return { name: line, type: 'string', required: false, description: '' };
      });
  }
}
