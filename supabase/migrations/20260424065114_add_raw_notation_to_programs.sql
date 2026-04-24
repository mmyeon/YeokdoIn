-- Fix: 20260420011521_phase1_workout_hub_tables.sql used CREATE TABLE IF NOT EXISTS,
-- so environments where `programs` already existed did not receive the `raw_notation` column.
-- Make the column add idempotent so any environment converges to the expected schema.

ALTER TABLE "public"."programs"
    ADD COLUMN IF NOT EXISTS "raw_notation" text NOT NULL DEFAULT '';

ALTER TABLE "public"."programs"
    ALTER COLUMN "raw_notation" DROP DEFAULT;
