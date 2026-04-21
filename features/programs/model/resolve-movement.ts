import type { Block, Movement } from "@/features/notation/model/types";

/**
 * 블록의 퍼센트가 참조하는 동작을 반환한다.
 *
 * 복합(complex) 블록에서는 두 번째 동작의 PR이 기준이 된다는 스펙 규칙을 따른다.
 * 예) `snatch pull & power snatch 60%` → power snatch의 PR × 60%.
 * 단일 동작 블록에서는 그 동작 자체가 기준이다.
 */
export function resolveRefMovement(block: Block): Movement {
  if (block.movements.length === 0) {
    throw new Error("블록에 동작이 없습니다.");
  }
  return block.movements.length >= 2 ? block.movements[1] : block.movements[0];
}
