"use server";

import { supabaseServerClient } from "@/features/auth/supabase/ServerClient";
import { Database } from "@/types_db";
import { PostgrestError } from "@supabase/supabase-js";

export type UserSettingRow =
  Database["public"]["Tables"]["user-settings"]["Row"];
export type UserSettingRowInsert =
  Database["public"]["Tables"]["user-settings"]["Insert"];
export type UserSettingRowUpdate =
  Database["public"]["Tables"]["user-settings"]["Update"];

function handleDatabaseError(error: PostgrestError | null) {
  console.error(error);
  throw new Error(error?.message);
}

export async function getUserDefaultBarbelWeight(): Promise<UserSettingRow | null> {
  const supabase = await supabaseServerClient();

  const { data, error } = await supabase.from("user-settings").select("*");

  if (error) handleDatabaseError(error);

  return data?.[0] ?? null;
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
    },
  );

  if (error) handleDatabaseError(error);
}
