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

export interface ExerciseGroup {
  category: string;
  items: string[];
}

const WEIGHTLIFTING_SECTION_MAX_ORDER = 4;

export async function listExercisesGrouped(): Promise<ExerciseGroup[]> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("name, exercise_sections(name, display_order)")
    .order("id", { ascending: true });

  if (error) handleDatabaseError(error);

  const rows = (data ?? []) as Array<{
    name: string;
    exercise_sections: { name: string; display_order: number } | null;
  }>;

  const sectionMap = new Map<string, { order: number; items: string[] }>();
  for (const row of rows) {
    const section = row.exercise_sections;
    const category = section?.name ?? "Other";
    const order = section?.display_order ?? 999;
    if (!sectionMap.has(category)) {
      sectionMap.set(category, { order, items: [] });
    }
    sectionMap.get(category)!.items.push(row.name);
  }

  return [...sectionMap.entries()]
    .filter(([, { order }]) => order <= WEIGHTLIFTING_SECTION_MAX_ORDER)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([category, { items }]) => ({ category, items }));
}
