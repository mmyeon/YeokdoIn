import type { Movement } from "@/features/notation/model/types";
import { resolveRefMovement } from "./resolve-movement";
import { computePrescribedWeight } from "./plates";

export type WeightResolution =
  | {
      kind: "computed";
      kg: number;
      pr: number;
      percentage: number;
      exerciseId: number;
      refName: string;
    }
  | { kind: "no-percentage"; refName: string }
  | { kind: "no-pr"; exerciseId: number; refName: string };

export interface ResolveWeightInput {
  /** parsed block movements from features/notation */
  movements: Movement[];
  /** percentage for the specific set-entry being resolved */
  percentage: number | null;
  /** exerciseId → prReferenceId (allows redirecting to another exercise's PR) */
  prRefMap: Readonly<Record<number, number>>;
  /** exerciseId → current PR in kg */
  prMap: Readonly<Record<number, number>>;
}

export function resolveWeight({
  movements,
  percentage,
  prRefMap,
  prMap,
}: ResolveWeightInput): WeightResolution {
  const ref = resolveRefMovement({ movements });
  const { name: refName, exerciseId } = ref;

  if (percentage === null) {
    return { kind: "no-percentage", refName };
  }

  const prExerciseId = prRefMap[exerciseId] ?? exerciseId;
  const pr = prMap[prExerciseId];
  if (pr === undefined) {
    return { kind: "no-pr", exerciseId: prExerciseId, refName };
  }

  return {
    kind: "computed",
    kg: computePrescribedWeight(pr, percentage),
    pr,
    percentage,
    exerciseId: prExerciseId,
    refName,
  };
}
