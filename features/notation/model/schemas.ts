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

export const modifierPositionSchema = z.enum(['before', 'after']);

export const movementModifierSchema = z.object({
  name: z.string().min(1),
  position: modifierPositionSchema,
});

export const movementSchema = z.object({
  name: z.string().min(1),
  modifiers: z.array(movementModifierSchema),
});

export const setEntrySchema = z.object({
  percentage: z.number().nullable(),
  reps: repSchemeSchema,
  sets: z.number().int().positive(),
});

export const blockSchema = z.object({
  movements: z.array(movementSchema).min(1),
  setEntries: z.array(setEntrySchema).min(1),
});

export const programSchema = z.object({
  blocks: z.array(blockSchema).min(1),
});
