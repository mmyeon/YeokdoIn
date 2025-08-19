"use server";

import { supabaseServerClient } from "@/features/auth/supabase/ServerClient";
import { handleDatabaseError } from "@/utils/database";

export async function getUserGoals() {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) handleDatabaseError(error);
  return data;
}

export async function saveUserGoal(goal: string) {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("사용자가 인증되지 않았습니다.");
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({ content: goal, user_id: userId });
  if (error) handleDatabaseError(error);
  return data;
}

export async function deleteUserGoal(goalId: number) {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId);
  if (error) handleDatabaseError(error);
  return data;
}

export async function updateUserGoal(goalId: number, goal: string) {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from("goals")
    .update({ content: goal })
    .eq("id", goalId);
  if (error) handleDatabaseError(error);
  return data;
}
