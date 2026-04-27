import type { Program } from "@/features/notation/model/types";
import { flattenProgram } from "../flatten";

describe("flattenProgram", () => {
  const snatchProgram: Program = {
    blocks: [
      {
        movements: [{ name: "Power Snatch", modifiers: [] }],
        setEntries: [
          { percentage: 60, reps: { type: "complex", reps: [3, 1] }, sets: 3 },
        ],
      },
      {
        movements: [
          { name: "Snatch Pull", modifiers: [] },
          { name: "Power Snatch", modifiers: [] },
        ],
        setEntries: [
          { percentage: 70, reps: { type: "simple", reps: 2 }, sets: 2 },
        ],
      },
    ],
  };

  const aliasMap: Record<string, number> = {
    "power snatch": 1,
    "snatch pull": 2,
  };
  const prMap: Record<number, number> = { 1: 100, 2: 120 };

  it("블록별 movement 하나당 ExercisePosition 하나를 만든다", () => {
    const positions = flattenProgram({
      program: snatchProgram,
      aliasMap,
      prMap,
    });
    expect(positions).toHaveLength(3);
    expect(positions[0].blockIdx).toBe(0);
    expect(positions[1].blockIdx).toBe(1);
    expect(positions[1].exerciseIdx).toBe(0);
    expect(positions[2].exerciseIdx).toBe(1);
  });

  it("setEntries 를 개별 세트로 펼치고 setNumber 를 1부터 매긴다", () => {
    const [first] = flattenProgram({
      program: snatchProgram,
      aliasMap,
      prMap,
    });
    expect(first.sets).toHaveLength(3);
    expect(first.sets.map((s) => s.setNumber)).toEqual([1, 2, 3]);
    expect(first.sets[0].totalSets).toBe(3);
  });

  it("퍼센트와 PR 로부터 prescribedKg 를 계산한다", () => {
    const [first] = flattenProgram({
      program: snatchProgram,
      aliasMap,
      prMap,
    });
    // Power Snatch PR 100 × 60% = 60
    expect(first.sets[0].prescribedKg).toBe(60);
  });

  it("복합 블록은 참조 동작(두 번째 movement) 기준으로 계산한다", () => {
    const [, blockBEx0] = flattenProgram({
      program: snatchProgram,
      aliasMap,
      prMap,
    });
    // Power Snatch PR 100 × 70% = 70 (Snatch Pull PR 120 이 아님)
    expect(blockBEx0.sets[0].prescribedKg).toBe(70);
  });

});
