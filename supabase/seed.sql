-- Seed data for local development.
-- Run automatically by `npx supabase db reset`.

INSERT INTO public.exercises (name, updated_at) VALUES
    ('Snatch', now()),
    ('Clean', now()),
    ('Jerk', now()),
    ('Clean and Jerk', now()),
    ('Front Squat', now()),
    ('Back Squat', now()),
    ('Deadlift', now()),
    ('Push Press', now()),
    ('Power Snatch', now()),
    ('Power Clean', now()),
    ('Split Jerk', now()),
    ('Push Jerk', now()),
    ('Snatch Pull', now()),
    ('Clean Pull', now()),
    ('Snatch Balance', now()),
    ('Overhead Squat', now())
ON CONFLICT DO NOTHING;
