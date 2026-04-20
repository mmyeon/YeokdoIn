import { z } from 'zod';

export const repSchemeSchema = z.union([
  z.object({
    type: z.literal('simple'),
    reps: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('complex'),
    reps: z.array(z.number().int().positive()).min(1),
  }),
]);

export const movementSchema = z.object({
  name: z.string().min(1),
  modifiers: z.array(z.string()),
});

export const blockSchema = z.object({
  movements: z.array(movementSchema).min(1),
  percentage: z.number().nullable(),
  reps: repSchemeSchema,
  sets: z.number().int().positive(),
  modifiers: z.array(z.string()),
});

export const programSchema = z.object({
  blocks: z.array(blockSchema).min(1),
});
