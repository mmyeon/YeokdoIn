import type { SetPlan, SetRecord } from "./types";

/**
 * When a user manually enters kg for a set with no PR (prescribedKg === null),
 * derive the implied 1RM and recalculate all other percentage-based sets.
 * Returns a new records array for the position; does not mutate input.
 */
export function propagateManualWeight(
  posRecords: readonly SetRecord[],
  plans: readonly SetPlan[],
  targetSetIdx: number,
  kg: number,
): SetRecord[] {
  const targetPlan = plans[targetSetIdx];
  const shouldPropagate =
    targetPlan.prescribedKg === null &&
    targetPlan.percentage != null &&
    kg > 0;

  if (!shouldPropagate) {
    return posRecords.map((r, i) => (i === targetSetIdx ? { ...r, kg } : r));
  }

  const implied1RM = kg / (targetPlan.percentage! / 100);

  return posRecords.map((r, i) => {
    if (i === targetSetIdx) return { ...r, kg };
    const plan = plans[i];
    if (plan.percentage != null) {
      return { ...r, kg: Math.round(implied1RM * plan.percentage / 100) };
    }
    return r;
  });
}
