import { Database } from "@/types_db";

export type AliasRow =
  Database["public"]["Tables"]["movement_aliases"]["Row"];

export type AliasWithExercise = Readonly<{
  id: AliasRow["id"];
  alias: AliasRow["alias"];
  exerciseId: AliasRow["exercise_id"];
  exerciseName: string;
  createdAt: AliasRow["created_at"];
}>;
