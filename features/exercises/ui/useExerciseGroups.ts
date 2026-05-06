"use client";

import { useQuery } from "@tanstack/react-query";
import { listExercisesGrouped, type ExerciseGroup } from "../api/exercises";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useExerciseGroups() {
  return useQuery<ExerciseGroup[]>({
    queryKey: [QUERY_KEYS.EXERCISES, "grouped"],
    queryFn: () => listExercisesGrouped(),
    staleTime: 1000 * 60 * 60,
  });
}
