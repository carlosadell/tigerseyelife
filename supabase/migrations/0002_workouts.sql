-- Curated workout library (admin-published)
create table workout_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null,
  equipment text[] not null default '{}',
  difficulty text check (difficulty in ('beginner','intermediate','advanced')) not null,
  focus_area text check (focus_area in ('upper','lower','full','mobility','cardio','core')) not null,
  cover_color text,
  exercises jsonb not null,
  created_by text default 'ryan',
  published boolean default true,
  order_index int default 0,
  created_at timestamptz default now()
);

alter table workout_library enable row level security;
create policy "authenticated read library" on workout_library
  for select using (auth.role() = 'authenticated' and published = true);

-- User's workout sessions (completed or in-progress)
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  source_type text check (source_type in ('library','program','custom')) not null,
  source_id uuid,
  name text not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  total_volume_kg numeric default 0,
  total_duration_seconds int default 0,
  perceived_effort int check (perceived_effort between 1 and 10),
  notes text,
  set_logs jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table workout_sessions enable row level security;
create policy "users crud own sessions" on workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index workout_sessions_user_completed_idx
  on workout_sessions(user_id, completed_at desc);

insert into workout_library
  (name, description, duration_minutes, equipment, difficulty, focus_area, cover_color, order_index, exercises)
values
('Upper Body Pump 30', 'Quick upper body builder. Push, pull, repeat.', 30, ARRAY['dumbbells'], 'intermediate', 'upper', '#1E5B45', 1, '[{"id":"ex_1","name":"Push-Up","equipment":"bodyweight","target_sets":3,"target_reps":"8-12","rest_seconds":60,"is_warmup":true},{"id":"ex_2","name":"DB Bench Press","equipment":"dumbbells","target_sets":4,"target_reps":"8-10","rest_seconds":90,"is_warmup":false},{"id":"ex_3","name":"DB Row","equipment":"dumbbells","target_sets":4,"target_reps":"10-12","rest_seconds":90,"is_warmup":false},{"id":"ex_4","name":"DB Shoulder Press","equipment":"dumbbells","target_sets":3,"target_reps":"10-12","rest_seconds":75,"is_warmup":false},{"id":"ex_5","name":"DB Bicep Curl","equipment":"dumbbells","target_sets":3,"target_reps":"12-15","rest_seconds":60,"is_warmup":false}]'::jsonb),
('Lower Body Foundations 45', 'Build lower body strength with the basics done well.', 45, ARRAY['dumbbells','bands'], 'beginner', 'lower', '#D4A02A', 2, '[{"id":"ex_1","name":"Bodyweight Squat","equipment":"bodyweight","target_sets":2,"target_reps":"10","rest_seconds":45,"is_warmup":true},{"id":"ex_2","name":"Goblet Squat","equipment":"dumbbells","target_sets":4,"target_reps":"8-10","rest_seconds":90,"is_warmup":false},{"id":"ex_3","name":"DB Romanian Deadlift","equipment":"dumbbells","target_sets":4,"target_reps":"10-12","rest_seconds":90,"is_warmup":false},{"id":"ex_4","name":"Reverse Lunge","equipment":"dumbbells","target_sets":3,"target_reps":"10 each leg","rest_seconds":75,"is_warmup":false},{"id":"ex_5","name":"Glute Bridge","equipment":"bodyweight","target_sets":3,"target_reps":"15","rest_seconds":60,"is_warmup":false}]'::jsonb),
('Full Body 30 Express', 'Time-crunched but still want everything? This is it.', 30, ARRAY['dumbbells'], 'intermediate', 'full', '#B78219', 3, '[{"id":"ex_1","name":"DB Goblet Squat","equipment":"dumbbells","target_sets":3,"target_reps":"10","rest_seconds":60,"is_warmup":false},{"id":"ex_2","name":"DB Push Press","equipment":"dumbbells","target_sets":3,"target_reps":"8","rest_seconds":75,"is_warmup":false},{"id":"ex_3","name":"DB Row","equipment":"dumbbells","target_sets":3,"target_reps":"10","rest_seconds":60,"is_warmup":false},{"id":"ex_4","name":"DB Reverse Lunge","equipment":"dumbbells","target_sets":3,"target_reps":"8 each leg","rest_seconds":60,"is_warmup":false},{"id":"ex_5","name":"Plank","equipment":"bodyweight","target_sets":3,"target_reps":"30s hold","rest_seconds":45,"is_warmup":false}]'::jsonb),
('Mobility Reset 20', 'For sore mornings, recovery days, or pre-workout flow.', 20, ARRAY['bodyweight','bands'], 'beginner', 'mobility', '#1E5B45', 4, '[{"id":"ex_1","name":"World Greatest Stretch","equipment":"bodyweight","target_sets":2,"target_reps":"5 each side","rest_seconds":30,"is_warmup":false},{"id":"ex_2","name":"Cat-Cow","equipment":"bodyweight","target_sets":2,"target_reps":"10","rest_seconds":30,"is_warmup":false},{"id":"ex_3","name":"Banded Pull-Apart","equipment":"bands","target_sets":3,"target_reps":"15","rest_seconds":30,"is_warmup":false},{"id":"ex_4","name":"90/90 Hip Switch","equipment":"bodyweight","target_sets":2,"target_reps":"10 each side","rest_seconds":30,"is_warmup":false},{"id":"ex_5","name":"Down Dog to Cobra Flow","equipment":"bodyweight","target_sets":2,"target_reps":"8 reps","rest_seconds":30,"is_warmup":false}]'::jsonb),
('Core Foundation 15', 'Short core circuit. Quality over quantity.', 15, ARRAY['bodyweight'], 'beginner', 'core', '#D4A02A', 5, '[{"id":"ex_1","name":"Dead Bug","equipment":"bodyweight","target_sets":3,"target_reps":"8 each side","rest_seconds":30,"is_warmup":false},{"id":"ex_2","name":"Bird Dog","equipment":"bodyweight","target_sets":3,"target_reps":"10 each side","rest_seconds":30,"is_warmup":false},{"id":"ex_3","name":"Side Plank","equipment":"bodyweight","target_sets":2,"target_reps":"20s each side","rest_seconds":30,"is_warmup":false},{"id":"ex_4","name":"Hollow Hold","equipment":"bodyweight","target_sets":3,"target_reps":"20s","rest_seconds":30,"is_warmup":false}]'::jsonb),
('Strength Builder 60', 'Long session, heavy focus, pure strength work.', 60, ARRAY['dumbbells','barbell'], 'advanced', 'full', '#B78219', 6, '[{"id":"ex_1","name":"Barbell Back Squat","equipment":"barbell","target_sets":5,"target_reps":"5","rest_seconds":150,"is_warmup":false},{"id":"ex_2","name":"Barbell Bench Press","equipment":"barbell","target_sets":5,"target_reps":"5","rest_seconds":150,"is_warmup":false},{"id":"ex_3","name":"Bent-Over Row","equipment":"barbell","target_sets":4,"target_reps":"6-8","rest_seconds":120,"is_warmup":false},{"id":"ex_4","name":"DB Romanian Deadlift","equipment":"dumbbells","target_sets":4,"target_reps":"8-10","rest_seconds":90,"is_warmup":false},{"id":"ex_5","name":"Weighted Plank","equipment":"bodyweight","target_sets":3,"target_reps":"45s","rest_seconds":60,"is_warmup":false}]'::jsonb);
