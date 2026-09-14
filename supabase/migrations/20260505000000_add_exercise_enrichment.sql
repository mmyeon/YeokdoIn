-- Create exercise_sections table
CREATE TABLE IF NOT EXISTS public.exercise_sections (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  display_order integer NOT NULL
);

ALTER TABLE public.exercise_sections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'exercise_sections'
      AND policyname = 'exercise_sections are publicly readable'
  ) THEN
    EXECUTE 'CREATE POLICY "exercise_sections are publicly readable" ON public.exercise_sections FOR SELECT USING (true)';
  END IF;
END $$;

-- Seed the 10 sections
INSERT INTO public.exercise_sections (name, display_order) VALUES
  ('Snatch Exercises',             1),
  ('Clean Exercises',              2),
  ('Jerk Exercises',               3),
  ('General Exercises',            4),
  ('Trunk (Ab & Back)',            5),
  ('Accessory - Lower/Whole Body', 6),
  ('Jumping & Plyometrics',        7),
  ('Accessory - Upper Body',       8),
  ('Accessory - Prep & Prehab',    9),
  ('Carries',                     10)
ON CONFLICT DO NOTHING;

-- Add enrichment columns to exercises
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS section_id  integer REFERENCES public.exercise_sections(id),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS page_url    text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS aka         text[] NOT NULL DEFAULT '{}';

-- Add unique constraint on name if not already present
ALTER TABLE public.exercises
  DROP CONSTRAINT IF EXISTS workouts_name_key;

ALTER TABLE public.exercises
  ADD CONSTRAINT workouts_name_key UNIQUE (name);
