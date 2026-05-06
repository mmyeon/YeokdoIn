-- Add pr_reference_id column (self-referencing FK, nullable)
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS pr_reference_id integer REFERENCES public.exercises(id);

-- 16 core PR exercises self-reference
UPDATE public.exercises
SET pr_reference_id = id
WHERE name IN (
  'Snatch', 'Clean', 'Split Jerk',
  'Power Snatch', 'Power Clean', 'Power Jerk', 'Push Jerk',
  'Back Squat', 'Front Squat', 'Overhead Squat', 'Push Press',
  'Snatch Pull', 'Clean Pull',
  'Snatch Deadlift', 'Clean Deadlift', 'Deadlift'
);

-- Snatch Exercises section → Snatch (for non-core exercises)
UPDATE public.exercises e
SET pr_reference_id = (SELECT id FROM public.exercises WHERE name = 'Snatch')
FROM public.exercise_sections s
WHERE e.section_id = s.id
  AND s.name = 'Snatch Exercises'
  AND e.pr_reference_id IS NULL;

-- Clean Exercises section → Clean
UPDATE public.exercises e
SET pr_reference_id = (SELECT id FROM public.exercises WHERE name = 'Clean')
FROM public.exercise_sections s
WHERE e.section_id = s.id
  AND s.name = 'Clean Exercises'
  AND e.pr_reference_id IS NULL;

-- Jerk Exercises section → Split Jerk
UPDATE public.exercises e
SET pr_reference_id = (SELECT id FROM public.exercises WHERE name = 'Split Jerk')
FROM public.exercise_sections s
WHERE e.section_id = s.id
  AND s.name = 'Jerk Exercises'
  AND e.pr_reference_id IS NULL;
