import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  key: z.string().min(1, 'Project key is required').regex(/^[a-z0-9-_]+$/, 'Key must be lowercase and only contain alphanumeric characters, hyphens, and underscores'),
  description: z.string().optional(),
});

export const createEnvironmentSchema = z.object({
  name: z.string().min(1, 'Environment name is required'),
  key: z.string().min(1, 'Environment key is required').regex(/^[a-z]+$/, 'Key must be lowercase letters only (e.g. dev, staging, prod)'),
  projectId: z.string().uuid('Invalid project ID'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
