-- Add explicit domain flag to exercise_sections.
-- Replaces the implicit display_order <= 4 filter in application code.
ALTER TABLE public.exercise_sections
  ADD COLUMN IF NOT EXISTS is_weightlifting boolean NOT NULL DEFAULT false;

UPDATE public.exercise_sections
SET is_weightlifting = true
WHERE name IN (
  'Snatch Exercises',
  'Clean Exercises',
  'Jerk Exercises',
  'General Exercises'
);
