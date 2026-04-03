-- supabase/migrations/20260403000000_training_core.sql

-- 운동 종목 (시드 데이터 포함)
create table if not exists exercise_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in ('snatch', 'clean_and_jerk', 'accessory')),
  display_name text not null,
  created_at timestamptz default now()
);

insert into exercise_types (name, category, display_name) values
  ('power_snatch',    'snatch',          'Power Snatch'),
  ('squat_snatch',    'snatch',          'Squat Snatch'),
  ('snatch_pull',     'snatch',          'Snatch Pull'),
  ('hang_snatch',     'snatch',          'Hang Snatch'),
  ('snatch_balance',  'snatch',          'Snatch Balance'),
  ('power_clean',     'clean_and_jerk',  'Power Clean'),
  ('clean',           'clean_and_jerk',  'Clean'),
  ('jerk',            'clean_and_jerk',  'Jerk'),
  ('clean_and_jerk',  'clean_and_jerk',  'Clean & Jerk'),
  ('clean_pull',      'clean_and_jerk',  'Clean Pull'),
  ('hang_clean',      'clean_and_jerk',  'Hang Clean'),
  ('deadlift',        'accessory',       'Deadlift'),
  ('back_squat',      'accessory',       'Back Squat'),
  ('front_squat',     'accessory',       'Front Squat'),
  ('overhead_squat',  'accessory',       'Overhead Squat'),
  ('push_press',      'accessory',       'Push Press'),
  ('good_morning',    'accessory',       'Good Morning')
on conflict (name) do nothing;

-- PR 기록 (현재 PR + 목표 PR 통합, is_goal로 구분)
create table if not exists pr_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lift_type text not null check (lift_type in ('snatch', 'clean_and_jerk')),
  weight numeric not null check (weight > 0),
  is_goal boolean not null default false,
  recorded_at date not null default current_date,
  created_at timestamptz default now()
);

alter table pr_records enable row level security;
create policy "users can manage own pr_records"
  on pr_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index pr_records_user_lift_idx on pr_records (user_id, lift_type, recorded_at desc);

-- 프로그램 (유저별)
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table programs enable row level security;
create policy "users can manage own programs"
  on programs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 프로그램 블록
create table if not exists exercise_blocks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  order_index integer not null,
  percentage integer not null check (percentage > 0 and percentage <= 100),
  sets integer not null check (sets > 0),
  created_at timestamptz default now()
);

alter table exercise_blocks enable row level security;
create policy "users can manage own exercise_blocks"
  on exercise_blocks for all
  using (exists (
    select 1 from programs p
    where p.id = exercise_blocks.program_id and p.user_id = auth.uid()
  ));

-- 블록 내 운동 항목
create table if not exists exercise_items (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references exercise_blocks(id) on delete cascade,
  order_index integer not null,
  exercise_type text not null,
  reps integer not null check (reps > 0),
  created_at timestamptz default now()
);

alter table exercise_items enable row level security;
create policy "users can manage own exercise_items"
  on exercise_items for all
  using (exists (
    select 1 from exercise_blocks eb
    join programs p on p.id = eb.program_id
    where eb.id = exercise_items.block_id and p.user_id = auth.uid()
  ));

-- 훈련 세션
create table if not exists training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  program_id uuid references programs(id) on delete set null,
  notes text[] not null default '{}',
  pr_basis text not null check (pr_basis in ('current', 'goal')) default 'current',
  created_at timestamptz default now()
);

alter table training_sessions enable row level security;
create policy "users can manage own training_sessions"
  on training_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index training_sessions_user_date_idx on training_sessions (user_id, session_date desc);

-- 세션 블록 (실제 수행 스냅샷)
create table if not exists session_blocks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions(id) on delete cascade,
  order_index integer not null,
  percentage integer not null,
  sets integer not null,
  planned_weight numeric not null,
  actual_weight numeric not null,
  weight_status text not null check (weight_status in ('exceeded', 'as_planned', 'reduced')) default 'as_planned',
  created_at timestamptz default now()
);

alter table session_blocks enable row level security;
create policy "users can manage own session_blocks"
  on session_blocks for all
  using (exists (
    select 1 from training_sessions ts
    where ts.id = session_blocks.session_id and ts.user_id = auth.uid()
  ));

-- 세션 블록 항목
create table if not exists session_block_items (
  id uuid primary key default gen_random_uuid(),
  session_block_id uuid not null references session_blocks(id) on delete cascade,
  order_index integer not null,
  exercise_type text not null,
  reps integer not null,
  created_at timestamptz default now()
);

alter table session_block_items enable row level security;
create policy "users can manage own session_block_items"
  on session_block_items for all
  using (exists (
    select 1 from session_blocks sb
    join training_sessions ts on ts.id = sb.session_id
    where sb.id = session_block_items.session_block_id and ts.user_id = auth.uid()
  ));

-- 코치 페르소나
create table if not exists coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  style text not null check (style in ('direct', 'technical', 'encouraging')),
  created_at timestamptz default now(),
  unique(user_id)
);

alter table coach_profiles enable row level security;
create policy "users can manage own coach_profiles"
  on coach_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
