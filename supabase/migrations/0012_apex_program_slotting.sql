-- 0012_apex_program_slotting.sql
--
-- Data layer for Karen's Apex workout-slotting tree (2026-07-21). Canonical
-- taxonomy lives in lib/apexPrograms.ts (APEX_FAMILIES); mirror seed lives in
-- lib/programs.ts. This migration is APPEND-ONLY and non-destructive: additive
-- columns, a backfill of the existing Foundations row, and idempotent inserts.
--
-- Numbered 0012 (next after the highest existing migration, 0011). The original
-- brief referenced "0006" against a "highest is 0005" assumption that is stale;
-- sequential numbering wins.
--
-- No new tables and no new policies: the existing "authenticated read published
-- programs" policy on workout_programs already hides the gym rows (published =
-- false), and "authenticated read program workouts" already covers the seeded
-- apex60-home workouts.

-- Additive columns. slug ties a program row to lib/apexPrograms.ts joinProgramId;
-- content_available gates families whose video content is not authored yet.
alter table workout_programs
  add column if not exists slug text unique;

alter table workout_programs
  add column if not exists content_available boolean not null default true;

-- Backfill only: give the existing Foundations program its Apex slug. This is a
-- column fill, not a rename or type change.
update workout_programs
  set slug = 'apex30-home'
  where id = '33333333-3333-4333-8333-333333333333'
    and slug is null;

-- The four new Apex family program rows. gen_random_uuid() ids; slug matches the
-- ids used in lib/programs.ts programSeed. Gym families are unpublished and
-- content_available = false (commercial-gym tutorials land Q3/Q4 2026); the
-- published RLS policy hides them from members. on conflict makes re-runs safe.
insert into workout_programs
  (id, name, delivery_type, level, description, published, content_available, slug, sort_order)
values
  (
    gen_random_uuid(),
    'Apex60 Home',
    'pre_recorded',
    'Home',
    'Sixty-minute home strength program. Four workouts on a lower / upper split with scoped tutorials for each session.',
    true,
    true,
    'apex60-home-a',
    4
  ),
  (
    gen_random_uuid(),
    'Apex30 Gym',
    'pre_recorded',
    'Commercial gym',
    'Thirty-minute strength program for a commercial gym. Commercial-gym video tutorials arrive later in 2026.',
    false,
    false,
    'apex30-gym-a',
    5
  ),
  (
    gen_random_uuid(),
    'Apex60 Gym',
    'pre_recorded',
    'Commercial gym',
    'Sixty-minute strength program for a commercial gym. Commercial-gym video tutorials arrive later in 2026.',
    false,
    false,
    'apex60-gym-a',
    6
  ),
  (
    gen_random_uuid(),
    'Live Group Strength',
    'live',
    'Live',
    'Sixty-minute live group strength training over Zoom, four sessions a week on a fixed schedule.',
    true,
    true,
    'live-gst',
    7
  )
on conflict (slug) do nothing;

-- The four Apex60 Home workouts (60-minute mirror of the Foundations Lower /
-- Upper A/B split). Only this Apex family gets seeded workouts:
--  - apex30-gym / apex60-gym content lands Q3/Q4 2026.
--  - live-gst is schedule-based Zoom (no on-demand video library).
-- program_id is resolved by slug lookup so this stays decoupled from the
-- gen_random_uuid() ids above. Guarded by a not-exists check for idempotency.
insert into program_workouts
  (program_id, day_label, name, duration_minutes, exercise_count, equipment, slotting_tags, tutorial_urls, sort_order)
select
  p.id, v.day_label, v.name, v.duration_minutes, v.exercise_count, v.equipment, v.slotting_tags, v.tutorial_urls, v.sort_order
from (values
  (
    'Workout 1', 'Workout 1', 60, 6, ARRAY['dumbbells','bands'],
    jsonb_build_object('duration', '60 min', 'equipment', 'Home', 'experience', jsonb_build_array('novice', 'rusty')),
    jsonb_build_array(
      jsonb_build_object('title', 'Warm-up tutorial', 'url', 'https://example.com/apex60-home-a-w1-warmup'),
      jsonb_build_object('title', 'Exercise playlist (6 clips)', 'url', 'https://example.com/apex60-home-a-w1-exercises'),
      jsonb_build_object('title', 'Full session - group view', 'url', 'https://example.com/apex60-home-a-w1-group'),
      jsonb_build_object('title', 'Full session - speaker only', 'url', 'https://example.com/apex60-home-a-w1-speaker')
    ),
    1
  ),
  (
    'Workout 2', 'Workout 2', 60, 6, ARRAY['dumbbells','bands'],
    jsonb_build_object('duration', '60 min', 'equipment', 'Home', 'experience', jsonb_build_array('novice', 'rusty')),
    jsonb_build_array(
      jsonb_build_object('title', 'Warm-up tutorial', 'url', 'https://example.com/apex60-home-a-w2-warmup'),
      jsonb_build_object('title', 'Exercise playlist (6 clips)', 'url', 'https://example.com/apex60-home-a-w2-exercises')
    ),
    2
  ),
  (
    'Workout 3', 'Workout 3', 60, 6, ARRAY['dumbbells','bands'],
    jsonb_build_object('duration', '60 min', 'equipment', 'Home', 'experience', jsonb_build_array('novice', 'rusty')),
    jsonb_build_array(
      jsonb_build_object('title', 'Warm-up tutorial', 'url', 'https://example.com/apex60-home-a-w3-warmup'),
      jsonb_build_object('title', 'Exercise playlist (6 clips)', 'url', 'https://example.com/apex60-home-a-w3-exercises')
    ),
    3
  ),
  (
    'Workout 4', 'Workout 4', 60, 6, ARRAY['dumbbells','bands'],
    jsonb_build_object('duration', '60 min', 'equipment', 'Home', 'experience', jsonb_build_array('novice', 'rusty')),
    jsonb_build_array(
      jsonb_build_object('title', 'Warm-up tutorial', 'url', 'https://example.com/apex60-home-a-w4-warmup'),
      jsonb_build_object('title', 'Exercise playlist (6 clips)', 'url', 'https://example.com/apex60-home-a-w4-exercises')
    ),
    4
  )
) as v(day_label, name, duration_minutes, exercise_count, equipment, slotting_tags, tutorial_urls, sort_order)
cross join (select id from workout_programs where slug = 'apex60-home-a') as p
where not exists (
  select 1 from program_workouts pw
  where pw.program_id = p.id and pw.day_label = v.day_label
);
