import { angleDeg, midpoint } from "../angleUtils";

describe("angleDeg", () => {
  it("일직선인 세 점의 각도는 180도이다", () => {
    expect(angleDeg({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(180, 1);
  });

  it("직각인 세 점의 각도는 90도이다", () => {
    expect(angleDeg({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })).toBeCloseTo(90, 1);
  });

  it("벡터 크기가 0이면 0을 반환한다", () => {
    const p = { x: 0, y: 0 };
    expect(angleDeg(p, p, { x: 1, y: 0 })).toBe(0);
  });
});

describe("midpoint", () => {
  it("두 점의 중간값을 반환한다", () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 2, y: 4 })).toEqual({ x: 1, y: 2 });
  });
});
