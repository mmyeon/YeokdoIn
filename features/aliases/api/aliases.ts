"use server";

import { supabaseServerClient } from "@/features/auth/supabase/ServerClient";
import { handleDatabaseError } from "@/utils/database";
import { AliasRow, AliasWithExercise } from "@/features/aliases/types";
import {
  isValidAlias,
  normalizeAlias,
} from "@/features/aliases/model/normalize";

async function requireUserId(): Promise<string> {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("사용자가 인증되지 않았습니다.");
  return userId;
}

/**
 * 현재 사용자의 모든 별명을 조회한다. 운동 종목 이름을 조인하여 반환.
 */
export async function listAliases(): Promise<AliasWithExercise[]> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("movement_aliases")
    .select(
      `id,
       alias,
       exercise_id,
       created_at,
       exercises ( name )`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) handleDatabaseError(error);

  return (data ?? []).map((row) => {
    // Supabase FK 조인은 관계 설정에 따라 객체 또는 배열로 반환될 수 있다.
    const exercisesRel = Array.isArray(row.exercises)
      ? row.exercises[0]
      : row.exercises;
    return {
      id: row.id,
      alias: row.alias,
      exerciseId: row.exercise_id,
      exerciseName: exercisesRel?.name ?? "(알 수 없는 운동)",
      createdAt: row.created_at,
    };
  });
}

/**
 * 별명을 등록/갱신한다. (user_id, lower(alias)) 충돌 시 exercise_id를 덮어쓴다.
 */
export async function upsertAlias(
  alias: string,
  exerciseId: number
): Promise<AliasRow> {
  if (!isValidAlias(alias)) {
    throw new Error("별명은 1자 이상 50자 이하로 입력해 주세요.");
  }

  const supabase = await supabaseServerClient();
  const userId = await requireUserId();
  const trimmed = alias.trim();
  const normalized = normalizeAlias(alias);

  // DB의 UNIQUE INDEX는 (user_id, lower(alias))이므로 동일 사용자의
  // 기존 별명을 먼저 확인해 id 기준으로 update, 없으면 insert 한다.
  const { data: existing, error: findError } = await supabase
    .from("movement_aliases")
    .select("id")
    .eq("user_id", userId)
    .ilike("alias", normalized)
    .maybeSingle();
  if (findError) handleDatabaseError(findError);

  if (existing?.id) {
    return updateAliasById(existing.id, userId, trimmed, exerciseId);
  }

  const { data, error } = await supabase
    .from("movement_aliases")
    .insert({
      user_id: userId,
      alias: trimmed,
      exercise_id: exerciseId,
    })
    .select()
    .single();

  // 동시 삽입으로 UNIQUE INDEX 위반(23505)이 발생하면 기존 행을 조회해 update로 전환한다.
  if (error?.code === "23505") {
    const { data: winner, error: lookupError } = await supabase
      .from("movement_aliases")
      .select("id")
      .eq("user_id", userId)
      .ilike("alias", normalized)
      .maybeSingle();
    if (lookupError) handleDatabaseError(lookupError);
    if (winner?.id) {
      return updateAliasById(winner.id, userId, trimmed, exerciseId);
    }
  }

  if (error) handleDatabaseError(error);
  return data;
}

async function updateAliasById(
  id: number,
  userId: string,
  trimmed: string,
  exerciseId: number
): Promise<AliasRow> {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("movement_aliases")
    .update({ alias: trimmed, exercise_id: exerciseId })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) handleDatabaseError(error);
  return data;
}

/**
 * 별명을 삭제한다.
 */
export async function deleteAlias(id: number): Promise<void> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { error } = await supabase
    .from("movement_aliases")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) handleDatabaseError(error);
}

/**
 * 주어진 이름들을 대소문자 무시로 exercise_id에 매핑한다.
 * 반환 키는 입력된 원본 문자열(정규화 전)을 사용한다.
 */
export async function resolveAliases(
  names: ReadonlyArray<string>
): Promise<Record<string, number>> {
  if (names.length === 0) return {};

  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const normalizedToOriginal = new Map<string, string>();
  for (const n of names) {
    const norm = normalizeAlias(n);
    if (norm && !normalizedToOriginal.has(norm)) {
      normalizedToOriginal.set(norm, n);
    }
  }
  const normalizedKeys = Array.from(normalizedToOriginal.keys());
  if (normalizedKeys.length === 0) return {};

  const { data, error } = await supabase
    .from("movement_aliases")
    .select("alias, exercise_id")
    .eq("user_id", userId);
  if (error) handleDatabaseError(error);

  const result: Record<string, number> = {};
  for (const row of data ?? []) {
    const norm = normalizeAlias(row.alias);
    const original = normalizedToOriginal.get(norm);
    if (original !== undefined) {
      result[original] = row.exercise_id;
    }
  }
  return result;
}
