import type { Movement, RepScheme } from "@/features/notation/model/types";

/** One movement within one block, ordered through a workout. */
export interface ExercisePosition {
  /** 0-indexed block position within the program. */
  blockIdx: number;
  /** 0-indexed movement position within its block. */
  exerciseIdx: number;
  totalBlocks: number;
  /** Count of movements in this block — drives the ex progress dots. */
  totalExercises: number;
  /** All movements of the owning block (needed to resolve percentage-ref). */
  blockMovements: Movement[];
  /** The movement to render at this position. */
  movement: Movement;
  /** Expanded, per-set prescriptions for this exercise. */
  sets: SetPlan[];
}

export interface SetPlan {
  /** 1-indexed, human facing. */
  setNumber: number;
  /** Total set count across all set-entries of this exercise. */
  totalSets: number;
  percentage: number | null;
  reps: RepScheme;
  /** Resolved prescription in kg, or null if percentage/PR/alias missing. */
  prescribedKg: number | null;
}

export interface SetRecord {
  /** Recorded kg for this set. null when no prescription and no manual entry yet. */
  kg: number | null;
  done: boolean;
}
