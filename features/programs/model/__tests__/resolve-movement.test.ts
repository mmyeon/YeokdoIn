import { resolveRefMovement } from "../resolve-movement";
import type { Block, Movement } from "@/features/notation/model/types";

const mv = (name: string): Movement => ({ name, modifiers: [] });

const blockOf = (movements: Movement[]): Block => ({
  movements,
  percentage: 60,
  reps: { type: "simple", reps: 3 },
  sets: 3,
});

describe("resolveRefMovement", () => {
  it("단일 동작 블록에서는 그 동작을 반환한다", () => {
    const block = blockOf([mv("back squat")]);
    expect(resolveRefMovement(block).name).toBe("back squat");
  });

  it("복합(2개) 동작 블록에서는 두 번째 동작을 반환한다", () => {
    const block = blockOf([mv("snatch pull"), mv("power snatch")]);
    expect(resolveRefMovement(block).name).toBe("power snatch");
  });

  it("3개 이상의 복합 블록에서도 두 번째 동작을 반환한다", () => {
    const block = blockOf([mv("a"), mv("b"), mv("c")]);
    expect(resolveRefMovement(block).name).toBe("b");
  });

  it("동작이 비어 있으면 에러를 던진다", () => {
    const block = blockOf([]);
    expect(() => resolveRefMovement(block)).toThrow();
  });
});
