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
  it("퍼센트가 있으면 '종목 · Set n/m · p% × r' 형식을 반환한다", () => {
    const result = formatOverlayLabel(movement("Back Squat"), setPlan(3, 5, 2, 85));
    expect(result).toBe("Back Squat · Set 3/5 · 85% × 2");
  });

  it("퍼센트가 없으면 '종목 · Set n/m · × r' 형식을 반환한다", () => {
    const result = formatOverlayLabel(movement("Snatch"), setPlan(1, 3, 5));
    expect(result).toBe("Snatch · Set 1/3 · × 5");
  });

  it("before 모디파이어를 종목명 앞에 붙인다", () => {
    const mv: Movement = {
      name: "Clean",
      modifiers: [{ name: "Hang", position: "before" }],
    };
    const result = formatOverlayLabel(mv, setPlan(2, 4, 3, 70));
    expect(result).toBe("Hang Clean · Set 2/4 · 70% × 3");
  });

  it("after 모디파이어를 종목명 뒤 괄호로 붙인다", () => {
    const mv: Movement = {
      name: "Squat",
      modifiers: [{ name: "Pause", position: "after" }],
    };
    const result = formatOverlayLabel(mv, setPlan(1, 2, 4, 80));
    expect(result).toBe("Squat (Pause) · Set 1/2 · 80% × 4");
  });

  it("complex rep scheme을 '+' 형식으로 표시한다", () => {
    const set: SetPlan = {
      setNumber: 1,
      totalSets: 3,
      percentage: 75,
      reps: { type: "complex", reps: [3, 2, 1] },
      prescribedKg: null,
    };
    const result = formatOverlayLabel(movement("Power Clean"), set);
    expect(result).toBe("Power Clean · Set 1/3 · 75% × 3+2+1");
  });
});
