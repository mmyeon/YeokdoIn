import type { Movement, Program } from "@/features/notation/model/types";
import { resolveWeight } from "@/features/programs/model/resolve-weight";
import type { ExercisePosition, SetPlan } from "./types";

export interface FlattenProgramInput {
  program: Program;
  aliasMap: Readonly<Record<string, number>>;
  prMap: Readonly<Record<number, number>>;
}

/**
 * Program 을 러너가 순회하는 운동 위치 목록으로 평탄화한다.
 * 각 setEntry 가 하나의 ExercisePosition 이 된다.
 * 복합 블록(movements 2개 이상)은 이름을 " + " 로 합쳐 하나의 운동으로 표시한다.
 * % 가 다른 setEntry 는 별도 위치로 분리되어 유저가 무게를 따로 설정할 수 있다.
 */
export function flattenProgram({
  program,
  aliasMap,
  prMap,
}: FlattenProgramInput): ExercisePosition[] {
  const totalBlocks = program.blocks.length;
  const positions: ExercisePosition[] = [];

  program.blocks.forEach((block, blockIdx) => {
    const totalExercises = block.setEntries.length;

    const movement: Movement =
      block.movements.length === 1
        ? block.movements[0]
        : { name: block.movements.map((m) => m.name).join(" + "), modifiers: [] };

    block.setEntries.forEach((entry, entryIdx) => {
      const resolved = resolveWeight({
        movements: block.movements,
        percentage: entry.percentage,
        aliasMap,
        prMap,
      });
      const prescribedKg = resolved.kind === "computed" ? resolved.kg : null;

      const sets: SetPlan[] = [];
      for (let i = 0; i < entry.sets; i += 1) {
        sets.push({
          setNumber: i + 1,
          totalSets: entry.sets,
          percentage: entry.percentage,
          reps: entry.reps,
          prescribedKg,
        });
      }

      positions.push({
        blockIdx,
        exerciseIdx: entryIdx,
        totalBlocks,
        totalExercises,
        blockMovements: block.movements,
        movement,
        sets,
      });
    });
  });

  return positions;
}
