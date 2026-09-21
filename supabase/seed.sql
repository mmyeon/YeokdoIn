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
    ('Overhead Squat', now()),
    ('Back Press', now()),
    ('Press', now())
ON CONFLICT DO NOTHING;

-- PR 설정 화면 노출 종목. 마이그레이션 20260921120000 과 같은 목록을 유지할 것.
UPDATE public.exercises
SET is_pr_tracked = true
WHERE name IN (
    'Snatch',
    'Clean',
    'Jerk',
    'Back Squat',
    'Front Squat',
    'Snatch Balance',
    'Press',
    'Back Press',
    'Snatch Pull',
    'Clean Pull',
    'Push Jerk',
    'Deadlift'
);
