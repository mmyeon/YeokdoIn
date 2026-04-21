-- Seed data for local development.
-- Run automatically by `npx supabase db reset`.

INSERT INTO public.exercises (name, updated_at) VALUES
    ('스내치', now()),
    ('클린', now()),
    ('저크', now()),
    ('클린앤저크', now()),
    ('프론트 스쿼트', now()),
    ('백 스쿼트', now()),
    ('데드리프트', now()),
    ('푸시 프레스', now())
ON CONFLICT DO NOTHING;
