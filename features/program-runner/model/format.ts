import type {
  Movement,
  RepScheme,
} from "@/features/notation/model/types";

/** `3+1` / `5` — concise rep-scheme text for set rows. */
export function formatReps(reps: RepScheme): string {
  if (reps.type === "simple") return String(reps.reps);
  return reps.reps.join("+");
}

/** `3+1 × 3` — scheme with set count for section subheaders. */
export function formatSetsBySchemeLabel(
  reps: RepScheme,
  sets: number,
): string {
  return `${formatReps(reps)} × ${sets}`;
}

/**
 * 모디파이어를 위치에 따라 붙여 표시 이름을 만든다.
 * before → 이름 앞, after → 이름 뒤 괄호.
 */
export function formatMovementName(movement: Movement): {
  name: string;
  before: string[];
  after: string[];
} {
  const before: string[] = [];
  const after: string[] = [];
  for (const m of movement.modifiers) {
    if (m.position === "before") before.push(m.name);
    else after.push(m.name);
  }
  return { name: movement.name, before, after };
}
