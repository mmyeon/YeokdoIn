import type { Block, Program } from '@/features/notation/model/types';
import { programSchema } from '@/features/notation/model/schemas';
import type { ProgramInput } from '@/features/programs/model/program-input';

export type BuildProgramResult =
  | { ok: true; program: Program }
  | { ok: false; error: string };

interface ExerciseName {
  id: number;
  name: string;
}

/** 입력의 종목 id 에 DB 이름을 찍어 Program 으로 만든다. 순서는 입력 그대로다. */
export function buildProgram(
  input: ProgramInput,
  exercises: readonly ExerciseName[],
): BuildProgramResult {
  const nameById = new Map(exercises.map((e) => [e.id, e.name]));
  const blocks: Block[] = [];

  for (const block of input.blocks) {
    const movements = [];
    for (const exerciseId of block.exerciseIds) {
      const name = nameById.get(exerciseId);
      if (name === undefined) {
        return { ok: false, error: `존재하지 않는 종목입니다. (id ${exerciseId})` };
      }
      movements.push({ exerciseId, name });
    }

    const count = movements.length;
    for (const { reps } of block.setEntries) {
      const matches =
        count === 1
          ? reps.type === 'simple'
          : reps.type === 'complex' && reps.reps.length === count;
      if (!matches) {
        return {
          ok: false,
          error:
            count === 1
              ? '동작이 하나인 블록은 단일 렙이어야 합니다.'
              : `복합 블록은 동작 ${count}개에 맞는 렙이 필요합니다.`,
        };
      }
    }

    blocks.push({ movements, setEntries: block.setEntries });
  }

  const parsed = programSchema.safeParse({ blocks });
  if (!parsed.success) {
    return { ok: false, error: '프로그램 내용이 올바르지 않습니다.' };
  }
  return { ok: true, program: parsed.data };
}
