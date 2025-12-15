"use server";

import { supabaseServerClient } from "@/features/auth/supabase/ServerClient";
import {
  UserSettingRow,
  ExercisesRow,
  PersonalRecordInfo,
} from "@/types/personalRecords";
import { handleDatabaseError } from "@/utils/database";

export async function getUserDefaultBarbelWeight(): Promise<
  UserSettingRow["default_barbell_weight"] | null
> {
  const supabase = await supabaseServerClient();

  const { data, error } = await supabase.from("user-settings").select("*");

  if (error) handleDatabaseError(error);

  return data?.[0].default_barbell_weight ?? null;
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
          exercises (
            name
          )
        `
    )
    .eq("user_id", userId);

  if (error) handleDatabaseError(error);

  const processedData =
    data?.map(({ id, weight, exercises, exercise_id }) => ({
      id,
      exerciseId: exercise_id,
      weight,
      exerciseName: exercises.name,
    })) ?? [];

  return processedData ?? [];
}

export async function updateRecordWeight(
  recordId: PersonalRecordInfo["id"],
  newWeight: PersonalRecordInfo["weight"]
): Promise<void> {
  const supabase = await supabaseServerClient();

  const { error } = await supabase
    .from("personal-records")
    .update({ weight: newWeight })
    .eq("id", recordId);

  if (error) handleDatabaseError(error);
}

export async function deleteRecord(
  id: PersonalRecordInfo["id"]
): Promise<void> {
  const supabase = await supabaseServerClient();

  const { error } = await supabase
    .from("personal-records")
    .delete()
    .eq("id", id);

  if (error) handleDatabaseError(error);
}

export async function addRecord(
  newRecord: Pick<PersonalRecordInfo, "exerciseId" | "weight">
) {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("사용자가 인증되지 않았습니다.");
  }

  const { error } = await supabase.from("personal-records").upsert(
    {
      user_id: userId,
      exercise_id: newRecord.exerciseId,
      weight: newRecord.weight,
      pr_date: new Date().toISOString(),
    },
    {
      onConflict: "user_id, exercise_id",
    }
  );

  if (error) handleDatabaseError(error);
}

export async function getExercises(): Promise<ExercisesRow[]> {
  const supabase = await supabaseServerClient();

  const { data, error } = await supabase.from("exercises").select("*");

  if (error) handleDatabaseError(error);

  return data ?? [];
}
