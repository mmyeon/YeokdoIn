import { z } from 'zod';
import { setEntrySchema } from '@/features/notation/model/schemas';
import type { SetEntry } from '@/features/notation/model/types';

export const MAX_MOVEMENTS_PER_BLOCK = 4;

export const programInputSchema = z.object({
  title: z.string().nullable().optional(),
  blocks: z
    .array(
      z.object({
        exerciseIds: z
          .array(z.number().int().positive())
          .min(1)
          .max(MAX_MOVEMENTS_PER_BLOCK),
        setEntries: z.array(setEntrySchema).min(1),
      }),
    )
    .min(1),
});

/** 클라이언트는 종목 이름을 보내지 않는다. 이름은 서버가 DB 에서 찍는다. */
export interface ProgramInput {
  title?: string | null;
  blocks: { exerciseIds: number[]; setEntries: SetEntry[] }[];
}
