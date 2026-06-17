-- 0011_pathway_and_concept_events.sql
--
-- Adds the pathway routing key to profiles and the concept_events
-- telemetry table that backs hooks/useConceptTelemetry. RLS is on; a
-- user can only see and write their own rows.

alter table public.profiles
  add column if not exists pathway text not null default 'guided'
  check (pathway in ('guided', 'self-serve'));

create table if not exists public.concept_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  concept_slug text not null,
  pathway text not null check (pathway in ('guided', 'self-serve')),
  block text not null,
  kind text not null check (
    kind in (
      'layer1_viewed',
      'layer2_read_started',
      'layer2_read_completed',
      'layer2_listen_started',
      'layer2_listen_completed',
      'layer3_started',
      'layer3_completed',
      'block_entered',
      'block_exited',
      'time_eligibility_optout'
    )
  ),
  duration_ms integer,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists concept_events_user_created_idx
  on public.concept_events (user_id, created_at desc);
create index if not exists concept_events_concept_kind_idx
  on public.concept_events (concept_slug, kind);

alter table public.concept_events enable row level security;

create policy "concept_events_select_own"
  on public.concept_events
  for select
  using (auth.uid() = user_id);

create policy "concept_events_insert_own"
  on public.concept_events
  for insert
  with check (auth.uid() = user_id);
