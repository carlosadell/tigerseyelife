-- profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  first_name text,
  big_why text,
  power_baseline jsonb,
  experience_level text check (experience_level in ('new','returning','advanced')),
  program_id uuid,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "users read own profile" on profiles for select using (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);

-- daily_entries
create table daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  entry_date date not null,
  intention text,
  mood text check (mood in ('strong','steady','drained')),
  movement_tags text[],
  reflection text,
  created_at timestamptz default now(),
  unique (user_id, entry_date)
);

alter table daily_entries enable row level security;
create policy "users crud own entries" on daily_entries for all using (auth.uid() = user_id);

-- workouts
create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  duration_seconds int,
  total_volume_kg numeric,
  performed_at timestamptz default now()
);

alter table workouts enable row level security;
create policy "users crud own workouts" on workouts for all using (auth.uid() = user_id);

-- coach_messages
create table coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  role text check (role in ('user','coach')) not null,
  content text not null,
  created_at timestamptz default now()
);

alter table coach_messages enable row level security;
create policy "users crud own messages" on coach_messages for all using (auth.uid() = user_id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
