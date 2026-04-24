"use server";

import { supabaseServerClient } from "@/features/auth/supabase/ServerClient";
import {
  UserSettingRow,
  ExercisesRow,
  PersonalRecordInfo,
  PRHistoryEntry,
  PRHistoryRow,
} from "@/types/personalRecords";
import { handleDatabaseError } from "@/utils/database";

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

export async function updateRecordWeight(
  recordId: PersonalRecordInfo["id"],
  newWeight: PersonalRecordInfo["weight"]
): Promise<void> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { data: record, error: recordError } = await supabase
    .from("personal-records")
    .select("exercise_id, weight")
    .eq("id", recordId)
    .eq("user_id", userId)
    .maybeSingle();
  if (recordError) handleDatabaseError(recordError);
  if (!record) throw new Error("수정할 기록을 찾을 수 없습니다.");

  const { error: historyError } = await supabase.from("pr_history").insert({
    user_id: userId,
    exercise_id: record.exercise_id,
    previous_weight: record.weight,
    new_weight: newWeight,
    pr_date: new Date().toISOString().slice(0, 10),
    note: null,
    source: "manual",
  });
  if (historyError) handleDatabaseError(historyError);

  await recomputeCache(record.exercise_id, userId);
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
