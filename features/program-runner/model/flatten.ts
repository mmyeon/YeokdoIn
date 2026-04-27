import type { Program } from "@/features/notation/model/types";
import { resolveWeight } from "@/features/programs/model/resolve-weight";
import type { ExercisePosition, SetPlan } from "./types";

export interface FlattenProgramInput {
  program: Program;
  aliasMap: Readonly<Record<string, number>>;
  prMap: Readonly<Record<number, number>>;
}

/**
 * Program 을 러너가 순회하는 운동 위치 목록으로 평탄화한다.
 * 한 블록의 각 movement 가 독립된 ExercisePosition 이 된다.
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
    const totalSets = block.setEntries.reduce((acc, e) => acc + e.sets, 0);
    const setsForBlock: SetPlan[] = [];
    let runningSet = 0;
    for (const entry of block.setEntries) {
      const resolved = resolveWeight({
        movements: block.movements,
        percentage: entry.percentage,
        aliasMap,
        prMap,
      });
      const prescribedKg = resolved.kind === "computed" ? resolved.kg : null;
      for (let i = 0; i < entry.sets; i += 1) {
        runningSet += 1;
        setsForBlock.push({
          setNumber: runningSet,
          totalSets,
          percentage: entry.percentage,
          reps: entry.reps,
          prescribedKg,
        });
      }
    }

    block.movements.forEach((movement, exerciseIdx) => {
      positions.push({
        blockIdx,
        exerciseIdx,
        totalBlocks,
        totalExercises: block.movements.length,
        blockMovements: block.movements,
        movement,
        sets: setsForBlock,
      });
    });
  });

  return positions;
}
