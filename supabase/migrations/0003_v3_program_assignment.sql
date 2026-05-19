-- v3 assignment-first member app foundation

create table workout_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  delivery_type text check (delivery_type in ('live','pre_recorded','written','future')) not null,
  level text not null,
  description text,
  published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table workout_programs enable row level security;
create policy "authenticated read published programs" on workout_programs
  for select using (auth.role() = 'authenticated' and published = true);

insert into workout_programs (id, name, delivery_type, level, description, sort_order) values
('11111111-1111-4111-8111-111111111111', 'Live GST Level 1', 'live', 'Level 1', 'Introductory live group strength training.', 1),
('22222222-2222-4222-8222-222222222222', 'Live GST Level 2', 'live', 'Level 2', 'Advanced live group strength training.', 2),
('33333333-3333-4333-8333-333333333333', 'Pre-recorded GST Level 1', 'pre_recorded', 'Level 1', 'Video-based program for newer members.', 3),
('44444444-4444-4444-8444-444444444444', 'Pre-recorded GST Level 1.5', 'pre_recorded', 'Level 1.5', 'Intermediate video-based progression.', 4),
('55555555-5555-4555-8555-555555555555', 'Pre-recorded GST Level 2', 'pre_recorded', 'Level 2', 'Advanced pre-recorded progression.', 5),
('66666666-6666-4666-8666-666666666666', 'Written + Tutorials', 'written', 'Tutorials', 'Written sessions with tutorial video support.', 6),
('77777777-7777-4777-8777-777777777777', 'Future Mobility Focus', 'future', 'Future', 'Placeholder for mobility-focused or complementary programs.', 7);

alter table profiles
  add column if not exists assigned_program_id uuid references workout_programs(id),
  add column if not exists intake_answers jsonb default '{}'::jsonb;

create table program_workouts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references workout_programs on delete cascade not null,
  day_label text not null,
  name text not null,
  duration_minutes int not null,
  exercise_count int not null,
  equipment text[] not null default '{}',
  tutorial_urls jsonb default '[]'::jsonb,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table program_workouts enable row level security;
create policy "authenticated read program workouts" on program_workouts
  for select using (auth.role() = 'authenticated');

insert into program_workouts
  (program_id, day_label, name, duration_minutes, exercise_count, equipment, tutorial_urls, sort_order)
values
('33333333-3333-4333-8333-333333333333', 'Today', 'Lower Body A', 30, 6, ARRAY['dumbbells','bands'], '[]'::jsonb, 1),
('33333333-3333-4333-8333-333333333333', 'Next', 'Upper Body B', 30, 6, ARRAY['dumbbells','bands'], '[]'::jsonb, 2),
('66666666-6666-4666-8666-666666666666', 'Today', 'Lower Body A', 30, 6, ARRAY['dumbbells','bands'], '[]'::jsonb, 1);

create table program_assignment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  program_id uuid references workout_programs(id),
  assigned_by text,
  note text,
  assigned_at timestamptz default now()
);

alter table program_assignment_history enable row level security;
create policy "users read own assignment history" on program_assignment_history
  for select using (auth.uid() = user_id);

create table microlearning_modules (
  id uuid primary key default gen_random_uuid(),
  block text not null,
  title text not null,
  description text,
  tiiny_url text not null,
  published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table microlearning_modules enable row level security;
create policy "authenticated read published modules" on microlearning_modules
  for select using (auth.role() = 'authenticated' and published = true);

insert into microlearning_modules
  (block, title, description, tiiny_url, sort_order)
values
('ADAPT', 'ADAPT Orientation', 'Start here. Learn the frame before the habit gets complicated.', 'https://example.tiiny.site/adapt-orientation', 1),
('ADAPT', 'Notice the Pattern', 'A short practice for spotting automatic responses without judgment.', 'https://example.tiiny.site/notice-the-pattern', 2),
('REFINE', 'Refine the Next Rep', 'A compact lesson on using one clean signal to improve the next decision.', 'https://example.tiiny.site/refine-next-rep', 3);
