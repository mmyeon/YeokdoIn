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
 * 한 블록이 하나의 ExercisePosition 이 된다.
 * 복합 블록(movements 2개 이상)은 이름을 " + " 로 합쳐 하나의 운동으로 표시한다.
 * 각 위치의 세트는 블록 setEntries 를 펼쳐 1~N 으로 나열한다.
 */
export function flattenProgram({
  program,
  aliasMap,
  prMap,
}: FlattenProgramInput): ExercisePosition[] {
  const totalBlocks = program.blocks.length;
  const positions: ExercisePosition[] = [];

  program.blocks.forEach((block, blockIdx) => {
    const setsForBlock: SetPlan[] = [];
    for (const entry of block.setEntries) {
      const resolved = resolveWeight({
        movements: block.movements,
        percentage: entry.percentage,
        aliasMap,
        prMap,
      });
      const prescribedKg = resolved.kind === "computed" ? resolved.kg : null;
      for (let i = 0; i < entry.sets; i += 1) {
        setsForBlock.push({
          setNumber: i + 1,
          totalSets: entry.sets,
          percentage: entry.percentage,
          reps: entry.reps,
          prescribedKg,
        });
      }
    }

    const movement: Movement =
      block.movements.length === 1
        ? block.movements[0]
        : { name: block.movements.map((m) => m.name).join(" + "), modifiers: [] };

    positions.push({
      blockIdx,
      exerciseIdx: 0,
      totalBlocks,
      totalExercises: 1,
      blockMovements: block.movements,
      movement,
      sets: setsForBlock,
    });
  });

  return positions;
}
