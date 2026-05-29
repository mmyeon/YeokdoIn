import type { Movement } from "@/features/notation/model/types";
import type { SetPlan } from "@/features/program-runner/model/types";
import { formatMovementName, formatReps } from "@/features/program-runner/model/format";

/** `Back Squat · Set 3/5 · 85% × 2` 형식의 오버레이 라벨을 반환한다. */
export function formatOverlayLabel(movement: Movement, set: SetPlan): string {
  const { name, before, after } = formatMovementName(movement);

  const displayName = [
    before.join(" "),
    name,
    after.length > 0 ? `(${after.join(", ")})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const setLabel = `Set ${set.setNumber}/${set.totalSets}`;
  const repsLabel = `× ${formatReps(set.reps)}`;
  const weightLabel =
    set.percentage != null ? `${set.percentage}% ${repsLabel}` : repsLabel;

  return `${displayName} · ${setLabel} · ${weightLabel}`;
}
