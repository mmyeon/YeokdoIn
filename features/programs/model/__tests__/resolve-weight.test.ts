import { resolveWeight } from "../resolve-weight";
import type { Block, Movement } from "@/features/notation/model/types";

const mv = (name: string): Movement => ({ name, modifiers: [] });

const makeBlock = (
  movements: Movement[],
  percentage: number | null = 60
): Block => ({
  movements,
  percentage,
  reps: { type: "simple", reps: 3 },
  sets: 3,
  modifiers: [],
});

describe("resolveWeight", () => {
  it("퍼센트와 PR이 모두 있으면 kg을 계산해 반환한다", () => {
    const result = resolveWeight({
      block: makeBlock([mv("back squat")], 70),
      aliasMap: { "back squat": 1 },
      prMap: { 1: 100 },
    });
    expect(result.kind).toBe("computed");
    if (result.kind === "computed") {
      expect(result.kg).toBe(70);
      expect(result.pr).toBe(100);
      expect(result.percentage).toBe(70);
      expect(result.exerciseId).toBe(1);
    }
  });

  it("퍼센트가 없으면 no-percentage를 반환한다", () => {
    const result = resolveWeight({
      block: makeBlock([mv("sots press")], null),
      aliasMap: { "sots press": 2 },
      prMap: { 2: 50 },
    });
    expect(result.kind).toBe("no-percentage");
  });

  it("별칭 매핑이 없으면 unresolved-alias와 동작명을 반환한다", () => {
    const result = resolveWeight({
      block: makeBlock([mv("P.Sn")]),
      aliasMap: {},
      prMap: {},
    });
    expect(result).toEqual({ kind: "unresolved-alias", missingName: "P.Sn" });
  });

  it("별칭은 있지만 PR이 없으면 no-pr을 반환한다", () => {
    const result = resolveWeight({
      block: makeBlock([mv("clean & jerk")]),
      aliasMap: { "clean & jerk": 3 },
      prMap: {},
    });
    expect(result.kind).toBe("no-pr");
    if (result.kind === "no-pr") expect(result.exerciseId).toBe(3);
  });

  it("복합 블록에서는 두 번째 동작의 PR을 사용한다", () => {
    const result = resolveWeight({
      block: makeBlock([mv("snatch pull"), mv("power snatch")], 60),
      aliasMap: { "snatch pull": 10, "power snatch": 20 },
      prMap: { 10: 200, 20: 85 },
    });
    expect(result.kind).toBe("computed");
    if (result.kind === "computed") {
      expect(result.exerciseId).toBe(20);
      expect(result.pr).toBe(85);
      expect(result.kg).toBe(51); // 85 * 0.6 = 51
    }
  });

  it("별칭 매핑은 대소문자 구분 없이 동작한다", () => {
    const result = resolveWeight({
      block: makeBlock([mv("BACK SQUAT")], 70),
      aliasMap: { "back squat": 1 },
      prMap: { 1: 100 },
    });
    expect(result.kind).toBe("computed");
  });

  it("결과 kg은 0.5kg 단위로 반올림된다", () => {
    // 87 * 0.6 = 52.2 → 52
    const result = resolveWeight({
      block: makeBlock([mv("back squat")], 60),
      aliasMap: { "back squat": 1 },
      prMap: { 1: 87 },
    });
    expect(result.kind).toBe("computed");
    if (result.kind === "computed") expect(result.kg).toBe(52);
  });
});
