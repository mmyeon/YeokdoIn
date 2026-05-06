import { buildPrRefMap } from "../build-pr-ref-map";

describe("buildPrRefMap", () => {
  it("자기 자신을 참조하는 운동은 그대로 반환한다", () => {
    const exercises = [{ id: 58, pr_reference_id: 58 }];
    expect(buildPrRefMap(exercises)).toEqual({ 58: 58 });
  });

  it("다른 운동을 참조하는 경우 해당 id를 반환한다", () => {
    const exercises = [
      { id: 58, pr_reference_id: 58 },
      { id: 66, pr_reference_id: 58 },
    ];
    expect(buildPrRefMap(exercises)).toEqual({ 58: 58, 66: 58 });
  });

  it("pr_reference_id가 null인 운동은 포함하지 않는다", () => {
    const exercises = [
      { id: 604, pr_reference_id: 604 },
      { id: 999, pr_reference_id: null },
    ];
    expect(buildPrRefMap(exercises)).toEqual({ 604: 604 });
  });

  it("빈 배열은 빈 객체를 반환한다", () => {
    expect(buildPrRefMap([])).toEqual({});
  });
});
