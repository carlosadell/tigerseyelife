-- v4 member-app alignment: assignment-first program delivery

alter table program_workouts
  add column if not exists slotting_tags jsonb default '{}'::jsonb,
  add column if not exists tutorial_urls jsonb default '[]'::jsonb;

alter table profiles
  add column if not exists assigned_workout_id uuid references program_workouts(id);

create table if not exists program_slotting_rules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references workout_programs(id) on delete cascade not null,
  workout_id uuid references program_workouts(id) on delete cascade not null,
  criteria jsonb not null default '{}'::jsonb,
  priority int not null default 0,
  published boolean not null default true,
  created_at timestamptz default now()
);

alter table program_slotting_rules enable row level security;

drop policy if exists "authenticated read published slotting rules" on program_slotting_rules;
create policy "authenticated read published slotting rules" on program_slotting_rules
  for select using (auth.role() = 'authenticated' and published = true);

update program_workouts
set slotting_tags = jsonb_build_object(
  'duration', concat(duration_minutes::text, ' min'),
  'equipment', equipment,
  'status', 'placeholder_until_ryan_table_lands'
)
where slotting_tags = '{}'::jsonb;
