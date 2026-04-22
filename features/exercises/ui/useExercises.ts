"use client";

import { useQuery } from "@tanstack/react-query";
import { listExercises, type ExerciseRow } from "../api/exercises";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useExercises() {
  return useQuery<ExerciseRow[]>({
    queryKey: [QUERY_KEYS.EXERCISES],
    queryFn: async () => {
      const rows = await listExercises();
      return rows ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}
