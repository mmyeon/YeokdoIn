import { propagateManualWeight } from "../propagate-weight";
import type { SetPlan, SetRecord } from "../types";

function makeRecord(kg: number | null = null, done = false): SetRecord {
  return { kg, done };
}

function makePlan(
  percentage: number | null,
  prescribedKg: number | null = null,
): SetPlan {
  return {
    setNumber: 1,
    totalSets: 3,
    percentage,
    reps: { type: "simple", reps: 3 },
    prescribedKg,
  };
}

describe("propagateManualWeight", () => {
  const plans: SetPlan[] = [
    makePlan(60),
    makePlan(70),
    makePlan(80),
  ];
  const records: SetRecord[] = [
    makeRecord(null),
    makeRecord(null),
    makeRecord(null),
  ];

  it("PR 없는 세트에 입력하면 다른 퍼센트 세트들을 자동 계산한다", () => {
    // 25kg @ 60% → 1RM = 41.67 → 70% = 29kg, 80% = 33kg
    const result = propagateManualWeight(records, plans, 0, 25);
    expect(result[0].kg).toBe(25);
    expect(result[1].kg).toBe(29); // round(41.67 * 0.7)
    expect(result[2].kg).toBe(33); // round(41.67 * 0.8)
  });

  it("PR 있는 세트에 입력하면 해당 세트만 업데이트된다", () => {
    const plansWithPR: SetPlan[] = [
      makePlan(60, 60), // prescribedKg !== null → no propagation
      makePlan(70, 70),
      makePlan(80, 80),
    ];
    const result = propagateManualWeight(records, plansWithPR, 0, 30);
    expect(result[0].kg).toBe(30);
    expect(result[1].kg).toBe(null); // unchanged
    expect(result[2].kg).toBe(null); // unchanged
  });

  it("퍼센트 없는 세트에 입력하면 해당 세트만 업데이트된다", () => {
    const plansNoPercent: SetPlan[] = [
      makePlan(null),
      makePlan(70),
      makePlan(80),
    ];
    const result = propagateManualWeight(records, plansNoPercent, 0, 25);
    expect(result[0].kg).toBe(25);
    expect(result[1].kg).toBe(null); // unchanged
    expect(result[2].kg).toBe(null); // unchanged
  });

  it("형제 세트 중 퍼센트 없는 세트는 변경하지 않는다", () => {
    const mixedPlans: SetPlan[] = [
      makePlan(60),
      makePlan(null), // no percentage → skip
      makePlan(80),
    ];
    const result = propagateManualWeight(records, mixedPlans, 0, 25);
    expect(result[0].kg).toBe(25);
    expect(result[1].kg).toBe(null); // no percentage, untouched
    expect(result[2].kg).toBe(33); // round(41.67 * 0.8)
  });

  it("유저가 다른 무게로 재입력하면 새 값 기반으로 재계산된다", () => {
    const firstEntry = propagateManualWeight(records, plans, 0, 25);
    // 30kg @ 60% → 1RM = 50 → 70% = 35, 80% = 40
    const secondEntry = propagateManualWeight(firstEntry, plans, 0, 30);
    expect(secondEntry[0].kg).toBe(30);
    expect(secondEntry[1].kg).toBe(35);
    expect(secondEntry[2].kg).toBe(40);
  });

  it("kg가 0이면 전파하지 않고 해당 세트만 업데이트한다", () => {
    const result = propagateManualWeight(records, plans, 0, 0);
    expect(result[0].kg).toBe(0);
    expect(result[1].kg).toBe(null);
    expect(result[2].kg).toBe(null);
  });

  it("done 상태는 변경하지 않는다", () => {
    const doneRecords: SetRecord[] = [
      makeRecord(null, false),
      makeRecord(null, true),
      makeRecord(null, false),
    ];
    const result = propagateManualWeight(doneRecords, plans, 0, 25);
    expect(result[1].done).toBe(true);
  });
});
