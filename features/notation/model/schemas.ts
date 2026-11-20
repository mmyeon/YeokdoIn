import { z } from 'zod';

export const MAX_PERCENTAGE = 200;
export const MAX_REPS = 99;
export const MAX_SETS = 99;

const repsCountSchema = z.number().int().min(1).max(MAX_REPS);

export const repSchemeSchema = z.union([
  z.object({
    type: z.literal('simple'),
    reps: repsCountSchema,
  }),
  z.object({
    type: z.literal('complex'),
    reps: z.array(repsCountSchema).min(1),
  }),
]);

export const movementSchema = z.object({
  exerciseId: z.number().int().positive(),
  name: z.string().min(1),
});

export const setEntrySchema = z.object({
  percentage: z.number().positive().max(MAX_PERCENTAGE).nullable(),
  reps: repSchemeSchema,
  sets: z.number().int().min(1).max(MAX_SETS),
});

export const blockSchema = z.object({
  movements: z.array(movementSchema).min(1),
  setEntries: z.array(setEntrySchema).min(1),
});

export const programSchema = z.object({
  blocks: z.array(blockSchema).min(1),
});
