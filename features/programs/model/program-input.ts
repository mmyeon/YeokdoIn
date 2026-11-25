import { z } from 'zod';
import { setEntrySchema } from '@/features/notation/model/schemas';
import type { SetEntry } from '@/features/notation/model/types';

export const MAX_MOVEMENTS_PER_BLOCK = 4;
const MAX_BLOCKS = 30;
const MAX_ENTRIES_PER_BLOCK = 20;
const MAX_TITLE_LENGTH = 100;

export const programInputSchema = z.object({
  title: z.string().max(MAX_TITLE_LENGTH).nullable().optional(),
  blocks: z
    .array(
      z.object({
        exerciseIds: z
          .array(z.number().int().positive())
          .min(1)
          .max(MAX_MOVEMENTS_PER_BLOCK),
        setEntries: z.array(setEntrySchema).min(1).max(MAX_ENTRIES_PER_BLOCK),
      }),
    )
    .min(1)
    .max(MAX_BLOCKS),
});

/** 클라이언트는 종목 이름을 보내지 않는다. 이름은 서버가 DB 에서 찍는다. */
export interface ProgramInput {
  title?: string | null;
  blocks: { exerciseIds: number[]; setEntries: SetEntry[] }[];
}
