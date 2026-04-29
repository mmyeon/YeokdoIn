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
  prDate: PersonalRecordRow["pr_date"];
  updatedAt: PersonalRecordRow["updated_at"];
  exerciseName: ExercisesRow["name"];
};

export type PRHistoryRow = Database["public"]["Tables"]["pr_history"]["Row"];

export type PRHistorySource = "manual" | "auto_detected_from_workout";

export type PRHistoryEntry = {
  id: PRHistoryRow["id"];
  exerciseId: PRHistoryRow["exercise_id"];
  previousWeight: PRHistoryRow["previous_weight"];
  newWeight: PRHistoryRow["new_weight"];
  prDate: PRHistoryRow["pr_date"];
  note: PRHistoryRow["note"];
  source: PRHistorySource;
  createdAt: PRHistoryRow["created_at"];
};

export type Exercises = {
  id: ExercisesRow["id"];
  name: ExercisesRow["name"];
  createdAt: ExercisesRow["created_at"];
  updatedAt: ExercisesRow["updated_at"];
};
