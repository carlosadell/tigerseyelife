-- Preserve the Apex program migration already applied to production.

alter table workout_programs
  add column if not exists slug text unique;

alter table workout_programs
  add column if not exists content_available boolean not null default true;

update workout_programs
  set slug = 'apex30-home'
  where id = '33333333-3333-4333-8333-333333333333'
    and slug is null;

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

insert into program_workouts
  (program_id, day_label, name, duration_minutes, exercise_count, equipment, slotting_tags, tutorial_urls, sort_order)
select
  p.id, v.day_label, v.name, v.duration_minutes, v.exercise_count, v.equipment,
  v.slotting_tags, v.tutorial_urls, v.sort_order
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
