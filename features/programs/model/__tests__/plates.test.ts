import { calculatePlates, computePrescribedWeight } from "../plates";

describe("calculatePlates", () => {
  it("남은 무게가 0 이하이면 빈 배열을 반환한다", () => {
    expect(calculatePlates(0)).toEqual([]);
    expect(calculatePlates(-5)).toEqual([]);
  });

  it("한쪽 기준 무거운 플레이트부터 그리디하게 채운다", () => {
    // 60kg: 한쪽 30kg = 25 + 5
    expect(calculatePlates(60)).toEqual([25, 5]);
  });

  it("소수 플레이트(0.5kg)까지 활용한다", () => {
    // 1kg: 한쪽 0.5kg
    expect(calculatePlates(1)).toEqual([0.5]);
  });

  it("기존 계산기와 동일한 결과를 낸다 — 52kg", () => {
    // 한쪽 26kg = 25 + 1
    expect(calculatePlates(52)).toEqual([25, 1]);
  });

  it("기존 계산기와 동일한 결과를 낸다 — 100kg", () => {
    // 한쪽 50kg = 25 + 25
    expect(calculatePlates(100)).toEqual([25, 25]);
  });
});

describe("computePrescribedWeight", () => {
  it("PR과 퍼센트를 곱하고 0.5kg 단위로 반올림한다", () => {
    expect(computePrescribedWeight(100, 60)).toBe(60);
    expect(computePrescribedWeight(85, 60)).toBe(51); // 51.0
    expect(computePrescribedWeight(87, 60)).toBe(52); // 52.2 → 52
    expect(computePrescribedWeight(88, 60)).toBe(53); // 52.8 → 53
  });

  it("퍼센트가 0이면 0kg을 반환한다", () => {
    expect(computePrescribedWeight(100, 0)).toBe(0);
  });
});
