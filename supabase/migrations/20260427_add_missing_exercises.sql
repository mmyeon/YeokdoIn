INSERT INTO public.exercises (name, updated_at) VALUES
  ('Power Snatch',   now()),
  ('Power Clean',    now()),
  ('Split Jerk',     now()),
  ('Push Jerk',      now()),
  ('Snatch Pull',    now()),
  ('Clean Pull',     now()),
  ('Snatch Balance', now()),
  ('Overhead Squat', now())
ON CONFLICT DO NOTHING;
