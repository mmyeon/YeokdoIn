-- PR 설정 화면에 보일 종목을 명시하는 플래그.
-- Catalyst 카탈로그(600여 종목)가 들어온 뒤 PR 목록이 전부 노출돼 쓸 수 없게 됐다.
-- 행을 지우지 않는 이유: 노테이션 파서(buildAliasMap)가 전체 테이블로 이름을 매칭한다.
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS is_pr_tracked boolean NOT NULL DEFAULT false;

-- 원격에는 Jerk·Back Press 행이 없다. 없는 곳에만 만든다.
INSERT INTO public.exercises (name, updated_at) VALUES
  ('Jerk', now()),
  ('Back Press', now()),
  ('Press', now())
ON CONFLICT (name) DO NOTHING;

-- 'Press' 는 밀리터리 프레스(스탠딩 스트릭트 프레스)의 Catalyst 표기다.
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
