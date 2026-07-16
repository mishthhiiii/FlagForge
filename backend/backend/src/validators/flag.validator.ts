import { z } from 'zod';
import { FlagType } from '@prisma/client';

export const createFlagSchema = z.object({
  name: z.string().min(1, 'Flag name is required'),
  key: z.string().min(1, 'Flag key is required').regex(/^[a-zA-Z0-9-_]+$/, 'Key can only contain alphanumeric characters, hyphens, and underscores'),
  description: z.string().optional(),
  type: z.nativeEnum(FlagType),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateFlagStateSchema = z.object({
  enabled: z.boolean(),
  defaultValue: z.string().min(1, 'Default value is required'),
  rules: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      conditions: z.array(
        z.object({
          attribute: z.string(),
          operator: z.enum([
            'EQUALS',
            'NOT_EQUALS',
            'CONTAINS',
            'NOT_CONTAINS',
            'STARTS_WITH',
            'ENDS_WITH',
            'IN',
            'NOT_IN'
          ]),
          value: z.string()
        })
      ).optional(),
      rollout: z.object({
        bucketBy: z.string(),
        percentage: z.number().min(0).max(100)
      }).optional(),
      serveValue: z.string()
    })
  ).default([])
});

export type CreateFlagInput = z.infer<typeof createFlagSchema>;
export type UpdateFlagStateInput = z.infer<typeof updateFlagStateSchema>;
