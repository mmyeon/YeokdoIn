import type { RepScheme } from "@/features/notation/model/types";

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
