import { Database } from "@/types_db";

export type UserSettingRow =
  Database["public"]["Tables"]["user-settings"]["Row"];

export type ExercisesRow = Database["public"]["Tables"]["exercises"]["Row"];

export type PersonalRecordRow =
  Database["public"]["Tables"]["personal-records"]["Row"];

export type PersonalRecordInfo = {
  id: PersonalRecordRow["id"];
  exerciseId: PersonalRecordRow["exercise_id"];
  weight: PersonalRecordRow["weight"];
  exerciseName: ExercisesRow["name"];
};

export type Exercises = {
  id: ExercisesRow["id"];
  name: ExercisesRow["name"];
  createdAt: ExercisesRow["created_at"];
  updatedAt: ExercisesRow["updated_at"];
};
