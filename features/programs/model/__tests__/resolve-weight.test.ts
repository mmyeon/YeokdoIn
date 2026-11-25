import { resolveWeight } from "../resolve-weight";
import type { Movement } from "@/features/notation/model/types";

const mv = (exerciseId: number, name: string): Movement => ({ exerciseId, name });

describe("resolveWeight", () => {
  it("퍼센트와 PR이 모두 있으면 kg을 계산해 반환한다", () => {
    const result = resolveWeight({
      movements: [mv(1, "Back Squat")],
      percentage: 70,
      prRefMap: { 1: 1 },
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
      movements: [mv(2, "Sots Press")],
      percentage: null,
      prRefMap: { 2: 2 },
      prMap: { 2: 50 },
    });
    expect(result).toEqual({ kind: "no-percentage", refName: "Sots Press" });
  });

  it("PR이 없으면 no-pr과 종목 id를 반환한다", () => {
    const result = resolveWeight({
      movements: [mv(3, "Clean & Jerk")],
      percentage: 60,
      prRefMap: {},
      prMap: {},
    });
    expect(result).toEqual({ kind: "no-pr", exerciseId: 3, refName: "Clean & Jerk" });
  });

  it("복합 블록에서는 두 번째 동작의 PR을 사용한다", () => {
    const result = resolveWeight({
      movements: [mv(10, "Snatch Pull"), mv(20, "Power Snatch")],
      percentage: 60,
      prRefMap: { 10: 10, 20: 20 },
      prMap: { 10: 200, 20: 85 },
    });
    expect(result.kind).toBe("computed");
    if (result.kind === "computed") {
      expect(result.exerciseId).toBe(20);
      expect(result.pr).toBe(85);
      expect(result.kg).toBe(51);
    }
  });

  it("결과 kg은 0.5kg 단위로 반올림된다", () => {
    const result = resolveWeight({
      movements: [mv(1, "Back Squat")],
      percentage: 60,
      prRefMap: { 1: 1 },
      prMap: { 1: 87 },
    });
    expect(result.kind).toBe("computed");
    if (result.kind === "computed") expect(result.kg).toBe(52);
  });

  it("pr_reference_id가 다른 운동을 가리키면 참조 운동의 PR로 계산한다", () => {
    const result = resolveWeight({
      movements: [mv(66, "Hang Power Snatch")],
      percentage: 70,
      prRefMap: { 66: 58 }, // 66 → Snatch (58)
      prMap: { 58: 100 },
    });
    expect(result.kind).toBe("computed");
    if (result.kind === "computed") {
      expect(result.pr).toBe(100);
      expect(result.exerciseId).toBe(58);
    }
  });

  it("prRefMap에 없는 운동은 exerciseId를 직접 prMap에서 조회한다", () => {
    const result = resolveWeight({
      movements: [mv(77, "Back Squat")],
      percentage: 90,
      prRefMap: {},
      prMap: { 77: 200 },
    });
    expect(result.kind).toBe("computed");
    if (result.kind === "computed") {
      expect(result.pr).toBe(200);
      expect(result.exerciseId).toBe(77);
    }
  });
});
