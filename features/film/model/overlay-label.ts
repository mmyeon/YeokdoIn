import type { Movement } from "@/features/notation/model/types";
import type { SetPlan } from "@/features/program-runner/model/types";
import { formatMovementName } from "@/features/program-runner/model/format";

/**
 * `Snatch · 100kg · 80% · Set 1/3` 형식의 오버레이 라벨을 반환한다.
 * 촬영 영상 라벨용 — 동작/무게가 핵심이며 반복수는 표시하지 않는다.
 * @param kg 해당 세트의 무게(kg). null이면 생략한다.
 */
export function formatOverlayLabel(
  movement: Movement,
  set: SetPlan,
  kg: number | null,
): string {
  const { name, before, after } = formatMovementName(movement);

  const displayName = [
    before.join(" "),
    name,
    after.length > 0 ? `(${after.join(", ")})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    displayName,
    kg != null ? `${kg}kg` : "",
    set.percentage != null ? `${set.percentage}%` : "",
    `Set ${set.setNumber}/${set.totalSets}`,
  ]
    .filter(Boolean)
    .join(" · ");
}
