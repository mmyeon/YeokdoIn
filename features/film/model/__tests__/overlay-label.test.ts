import type { Movement } from "@/features/notation/model/types";
import type { SetPlan } from "@/features/program-runner/model/types";
import { formatOverlayLabel } from "../overlay-label";

function movement(name: string): Movement {
  return { name, modifiers: [] };
}

function setPlan(
  setNumber: number,
  totalSets: number,
  reps: number,
  percentage: number | null = null,
): SetPlan {
  return {
    setNumber,
    totalSets,
    percentage,
    reps: { type: "simple", reps },
    prescribedKg: null,
  };
}

describe("formatOverlayLabel", () => {
  it("동작·무게·퍼센트·세트를 '종목 · kg · p% · Set n/m' 형식으로 반환한다", () => {
    const result = formatOverlayLabel(movement("Back Squat"), setPlan(3, 5, 2, 85), 100);
    expect(result).toBe("Back Squat · 100kg · 85% · Set 3/5");
  });

  it("무게(kg)가 null이면 무게 부분을 생략한다", () => {
    const result = formatOverlayLabel(movement("Snatch"), setPlan(1, 3, 5, 80), null);
    expect(result).toBe("Snatch · 80% · Set 1/3");
  });

  it("퍼센트가 null이면 퍼센트 부분을 생략한다", () => {
    const result = formatOverlayLabel(movement("Snatch"), setPlan(1, 3, 5), 60);
    expect(result).toBe("Snatch · 60kg · Set 1/3");
  });

  it("무게와 퍼센트가 모두 없으면 '종목 · Set n/m'만 반환한다", () => {
    const result = formatOverlayLabel(movement("Snatch"), setPlan(2, 4, 1), null);
    expect(result).toBe("Snatch · Set 2/4");
  });

  it("before 모디파이어를 종목명 앞에 붙인다", () => {
    const mv: Movement = {
      name: "Clean",
      modifiers: [{ name: "Hang", position: "before" }],
    };
    const result = formatOverlayLabel(mv, setPlan(2, 4, 3, 70), 90);
    expect(result).toBe("Hang Clean · 90kg · 70% · Set 2/4");
  });

  it("after 모디파이어를 종목명 뒤 괄호로 붙인다", () => {
    const mv: Movement = {
      name: "Squat",
      modifiers: [{ name: "Pause", position: "after" }],
    };
    const result = formatOverlayLabel(mv, setPlan(1, 2, 4, 80), 120);
    expect(result).toBe("Squat (Pause) · 120kg · 80% · Set 1/2");
  });
});
