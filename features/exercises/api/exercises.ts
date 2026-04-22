"use server";

import { supabaseServerClient } from "@/features/auth/supabase/ServerClient";
import { handleDatabaseError } from "@/utils/database";
import type { Tables } from "@/types_db";

export type ExerciseRow = Tables<"exercises">;

/**
 * 큐레이트된 exercises 세트를 반환한다 (seed 기반, 공개 SELECT RLS).
 * resolver 의 aliasMap 과 프로그램 UI 의 exercise 선택 옵션 공급원이 된다.
 */
export async function listExercises(): Promise<ExerciseRow[]> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("id", { ascending: true });

  if (error) handleDatabaseError(error);
  return (data ?? []) as ExerciseRow[];
}
