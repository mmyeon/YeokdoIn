"use server";

import { supabaseServerClient } from "@/features/auth/supabase/ServerClient";
import {
  UserSettingRow,
  ExercisesRow,
  PersonalRecordInfo,
  PRHistoryEntry,
  PRHistoryRow,
} from "@/types/personalRecords";
import { maxAcceptablePRDate } from "@/features/personal-records/model/pr-date-bounds";
import { validatePRInput } from "@/features/personal-records/model/validate-pr-input";
import { handleDatabaseError } from "@/utils/database";

/**
 * 위반이 있으면 첫 메시지로 throw한다. 서버 경계에서 막는 것이 목적이므로
 * Supabase 클라이언트를 만들기 전에 호출한다.
 *
 * 날짜 상한은 UTC 오늘이 아니라 `maxAcceptablePRDate` 다. 서버는 요청자의
 * 타임존을 모르므로 "지구 어디서도 미래일 수 없는 날짜"만 거부한다.
 */
function assertValidPRInput(weight: number | null, prDate: string): void {
  const [firstError] = validatePRInput(
    { weight, prDate },
    maxAcceptablePRDate(Date.now())
  );
  if (firstError) throw new Error(firstError.message);
}

/**
 * patch 방식의 부분 수정용. 제공된 필드의 위반만 골라낸다 — 무게만 수정하는
 * 요청을 "날짜를 안 줬다"는 이유로 거부하면 안 된다.
 */
function assertValidPRPatch(patch: {
  newWeight?: number;
  prDate?: string;
}): void {
  const provided: Array<"weight" | "prDate"> = [];
  if (patch.newWeight !== undefined) provided.push("weight");
  if (patch.prDate !== undefined) provided.push("prDate");
  if (provided.length === 0) return;

  // 주지 않은 필드는 검증을 통과하는 더미 값으로 채운 뒤 결과에서 걸러낸다.
  const errors = validatePRInput(
    {
      weight: patch.newWeight ?? 1,
      prDate: patch.prDate ?? "1970-01-01",
    },
    maxAcceptablePRDate(Date.now())
  ).filter((error) => provided.includes(error.field));

  if (errors[0]) throw new Error(errors[0].message);
}

export async function getUserDefaultBarbelWeight(): Promise<
  UserSettingRow["default_barbell_weight"] | null
> {
  const supabase = await supabaseServerClient();

  const { data, error } = await supabase.from("user-settings").select("*");

  if (error) handleDatabaseError(error);

  return data?.[0]?.default_barbell_weight ?? null;
}

export async function saveBarbellWeight(barbellWeight: number) {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("사용자가 인증되지 않았습니다.");
  }

  const { error } = await supabase.from("user-settings").upsert(
    {
      user_id: userId,
      default_barbell_weight: barbellWeight,
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) handleDatabaseError(error);
}

export async function getUserPersonalRecords(): Promise<PersonalRecordInfo[]> {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("사용자가 인증되지 않았습니다.");
  }

  const { data, error } = await supabase
    .from("personal-records")
    .select(
      `   id,
          exercise_id,
          weight,
          pr_date,
          updated_at,
          created_at,
          exercises (
            name
          )
        `
    )
    .eq("user_id", userId)
    .order("pr_date", { ascending: false })
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (error) handleDatabaseError(error);

  const processedData =
    data?.map(({ id, weight, pr_date, updated_at, exercises, exercise_id }) => ({
      id,
      exerciseId: exercise_id,
      weight,
      prDate: pr_date,
      updatedAt: updated_at,
      exerciseName: exercises.name,
    })) ?? [];

  return processedData ?? [];
}

async function requireUserId(): Promise<string> {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("사용자가 인증되지 않았습니다.");
  return userId;
}

function toEntry(row: PRHistoryRow): PRHistoryEntry {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    previousWeight: row.previous_weight,
    newWeight: row.new_weight,
    prDate: row.pr_date,
    note: row.note,
    source:
      row.source === "auto_detected_from_workout"
        ? "auto_detected_from_workout"
        : "manual",
    createdAt: row.created_at,
  };
}

export async function getPRHistory(
  exerciseId: number
): Promise<PRHistoryEntry[]> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("pr_history")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .order("pr_date", { ascending: false });

  if (error) handleDatabaseError(error);

  return (data ?? []).map(toEntry);
}

type AddPRHistoryInput = {
  exerciseId: number;
  newWeight: number;
  prDate: string;
  note: string | null;
};

/**
 * Dual-write: append a pr_history row (previous_weight = current cache) and
 * upsert the personal-records cache. Reason: personal-records still fronts
 * legacy readers; pr_history is the timeline source of truth.
 */
export async function addPRHistoryEntry(input: AddPRHistoryInput): Promise<void> {
  assertValidPRInput(input.newWeight, input.prDate);

  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { data: existing, error: existingError } = await supabase
    .from("personal-records")
    .select("id, weight")
    .eq("user_id", userId)
    .eq("exercise_id", input.exerciseId)
    .maybeSingle();

  if (existingError) handleDatabaseError(existingError);

  const previousWeight = existing?.weight ?? null;

  const { error: historyError } = await supabase.from("pr_history").insert({
    user_id: userId,
    exercise_id: input.exerciseId,
    previous_weight: previousWeight,
    new_weight: input.newWeight,
    pr_date: input.prDate,
    note: input.note,
    source: "manual",
  });
  if (historyError) handleDatabaseError(historyError);

  await recomputeCache(input.exerciseId, userId);
}

type UpdatePRHistoryInput = {
  newWeight?: number;
  prDate?: string;
  note?: string | null;
};

export async function updatePRHistoryEntry(
  id: number,
  patch: UpdatePRHistoryInput
): Promise<void> {
  assertValidPRPatch(patch);

  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { data: before, error: beforeError } = await supabase
    .from("pr_history")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (beforeError) handleDatabaseError(beforeError);
  if (!before) throw new Error("수정할 기록을 찾을 수 없습니다.");

  const updatePayload: Record<string, unknown> = {};
  if (patch.newWeight !== undefined) updatePayload.new_weight = patch.newWeight;
  if (patch.prDate !== undefined) updatePayload.pr_date = patch.prDate;
  if (patch.note !== undefined) updatePayload.note = patch.note;

  if (Object.keys(updatePayload).length === 0) return;

  const { error: updateError } = await supabase
    .from("pr_history")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId);
  if (updateError) handleDatabaseError(updateError);

  await recomputeCache(before.exercise_id as number, userId);
}

export async function deletePRHistoryEntry(id: number): Promise<void> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { data: before, error: beforeError } = await supabase
    .from("pr_history")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (beforeError) handleDatabaseError(beforeError);
  if (!before) return;

  const { error: deleteError } = await supabase
    .from("pr_history")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (deleteError) handleDatabaseError(deleteError);

  await recomputeCache(before.exercise_id as number, userId);
}

/**
 * Rewrite personal-records cache for (user, exercise) from current pr_history
 * state: take MAX(new_weight); if no history remains, drop the cache row.
 */
async function recomputeCache(
  exerciseId: number,
  userId: string
): Promise<void> {
  const supabase = await supabaseServerClient();

  const { data: remaining, error: remainingError } = await supabase
    .from("pr_history")
    .select("new_weight, pr_date")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId);
  if (remainingError) handleDatabaseError(remainingError);

  const rows = (remaining ?? []) as Array<{
    new_weight: number;
    pr_date: string;
  }>;

  if (rows.length === 0) {
    const { error: delErr } = await supabase
      .from("personal-records")
      .delete()
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId);
    if (delErr) handleDatabaseError(delErr);
    return;
  }

  const top = rows.reduce((acc, r) =>
    r.new_weight > acc.new_weight ? r : acc
  );

  const { error: upsertErr } = await supabase.from("personal-records").upsert(
    {
      user_id: userId,
      exercise_id: exerciseId,
      weight: top.new_weight,
      pr_date: top.pr_date,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id, exercise_id" }
  );
  if (upsertErr) handleDatabaseError(upsertErr);
}

export async function deleteRecord(
  id: PersonalRecordInfo["id"]
): Promise<void> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { data: record, error: recordError } = await supabase
    .from("personal-records")
    .select("exercise_id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (recordError) handleDatabaseError(recordError);

  if (record) {
    const { error: histErr } = await supabase
      .from("pr_history")
      .delete()
      .eq("user_id", userId)
      .eq("exercise_id", record.exercise_id);
    if (histErr) handleDatabaseError(histErr);
  }

  const { error } = await supabase
    .from("personal-records")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) handleDatabaseError(error);
}

export async function addRecord(
  newRecord: Pick<PersonalRecordInfo, "exerciseId" | "weight"> & {
    prDate?: string;
    note?: string | null;
  }
) {
  const prDate = newRecord.prDate ?? new Date().toISOString().slice(0, 10);
  await addPRHistoryEntry({
    exerciseId: newRecord.exerciseId,
    newWeight: newRecord.weight,
    prDate,
    note: newRecord.note ?? null,
  });
}

export async function getExercises(): Promise<ExercisesRow[]> {
  const supabase = await supabaseServerClient();

  const { data, error } = await supabase.from("exercises").select("*");

  if (error) handleDatabaseError(error);

  return data ?? [];
}
