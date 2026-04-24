import { resolveRefMovement } from "../resolve-movement";
import type { Movement } from "@/features/notation/model/types";

const mv = (name: string): Movement => ({ name, modifiers: [] });

describe("resolveRefMovement", () => {
  it("단일 동작 블록에서는 그 동작을 반환한다", () => {
    expect(resolveRefMovement({ movements: [mv("back squat")] }).name).toBe(
      "back squat",
    );
  });

  it("복합(2개) 동작 블록에서는 두 번째 동작을 반환한다", () => {
    expect(
      resolveRefMovement({
        movements: [mv("snatch pull"), mv("power snatch")],
      }).name,
    ).toBe("power snatch");
  });

  it("3개 이상의 복합 블록에서도 두 번째 동작을 반환한다", () => {
    expect(
      resolveRefMovement({ movements: [mv("a"), mv("b"), mv("c")] }).name,
    ).toBe("b");
  });

  it("동작이 비어 있으면 에러를 던진다", () => {
    expect(() => resolveRefMovement({ movements: [] })).toThrow();
  });
});
