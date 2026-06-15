-- supabase/migrations/0007_curriculum_section_progress.sql
--
-- Curriculum section progress + completion RPCs.
--
-- Adds the `user_section_progress` table (one row per (user, block, slug)),
-- the `complete_section_user` RPC (upserts progress, triggers block-advance
-- check), and the `maybe_advance_block` RPC (security-definer so it can
-- bypass the entitlement guard from migration 0006 when advancing
-- profiles.current_block).
--
-- RLS: users select/insert/update their own rows. service_role bypasses.

create table public.user_section_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  block_name text not null,
  section_slug text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, block_name, section_slug)
);

grant select, insert, update on public.user_section_progress to authenticated;
grant all on public.user_section_progress to service_role;

alter table public.user_section_progress enable row level security;

create policy "users select own progress" on public.user_section_progress
  for select using (auth.uid() = user_id);

create policy "users insert own progress" on public.user_section_progress
  for insert with check (auth.uid() = user_id);

create policy "users update own progress" on public.user_section_progress
  for update using (auth.uid() = user_id);

create index if not exists user_section_progress_user_block_idx
  on public.user_section_progress (user_id, block_name);

-- ----------------------------------------------------------------------------
-- complete_section_user(block_name, section_slug)
--
-- Upserts a completed progress row for the calling user. After upsert, calls
-- maybe_advance_block to see if all 6 sections of the current block are done.
-- ----------------------------------------------------------------------------

create or replace function public.complete_section_user(
  p_block_name text,
  p_section_slug text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_section_progress (user_id, block_name, section_slug, completed, completed_at)
  values (auth.uid(), upper(p_block_name), p_section_slug, true, now())
  on conflict (user_id, block_name, section_slug) do update
    set completed = true,
        completed_at = excluded.completed_at;

  perform public.maybe_advance_block(auth.uid());
end;
$$;

-- ----------------------------------------------------------------------------
-- maybe_advance_block(user_id)
--
-- If all 6 sections of the user's current_block are completed, advances
-- profiles.current_block to the next block. security-definer so it can
-- bypass profiles_entitlement_guard from migration 0006 (which forbids
-- non-service-role writes to current_block).
-- ----------------------------------------------------------------------------

create or replace function public.maybe_advance_block(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_next text;
  v_completed int;
begin
  select current_block into v_current from profiles where id = p_user_id;
  if v_current is null then return; end if;

  select count(*) into v_completed
    from user_section_progress
    where user_id = p_user_id
      and block_name = v_current
      and completed = true;

  if v_completed < 6 then return; end if;

  v_next := case v_current
    when 'COMMIT'  then 'REFINE'
    when 'REFINE'  then 'EVOLVE'
    when 'EVOLVE'  then 'ADAPT'
    when 'ADAPT'   then 'THRIVE'
    when 'THRIVE'  then 'EXCEL'
    else null end;

  if v_next is null then return; end if;

  update profiles set current_block = v_next where id = p_user_id;
end;
$$;

grant execute on function public.complete_section_user(text, text) to authenticated;
grant execute on function public.maybe_advance_block(uuid) to authenticated;
