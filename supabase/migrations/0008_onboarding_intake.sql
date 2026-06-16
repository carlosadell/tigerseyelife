-- supabase/migrations/0008_onboarding_intake.sql
--
-- Onboarding deepening — 20 §3.2 columns plus an onboarding_completed flag.
--
-- All columns are user-writable; the existing profiles_entitlement_guard
-- trigger from migration 0006 only locks the 4 entitlement columns
-- (program_member / join_email / verified_at / current_block), so user-side
-- self-updates through these new columns are allowed.

alter table profiles
  add column if not exists age integer
    check (age is null or (age >= 13 and age <= 120)),
  add column if not exists primary_goal text,
  add column if not exists success_vision text,
  add column if not exists importance_level integer
    check (importance_level is null or (importance_level >= 0 and importance_level <= 10)),
  add column if not exists confidence_level integer
    check (confidence_level is null or (confidence_level >= 0 and confidence_level <= 10)),
  add column if not exists confidence_barriers text,
  add column if not exists obstacles text[],
  add column if not exists other_obstacle text,
  add column if not exists top_obstacles text[],
  add column if not exists obstacle_deep_dive text,
  add column if not exists work_situation text,
  add column if not exists living_situation text[],
  add column if not exists past_experience text,
  add column if not exists concerns text,
  add column if not exists needle_mover text,
  add column if not exists specific_habits text,
  add column if not exists success_factor text,
  add column if not exists other_success_factor text,
  add column if not exists emotion_response text,
  add column if not exists coaching_style text
    check (coaching_style is null or coaching_style in ('direct','warm','balanced','challenging')),
  add column if not exists onboarding_completed boolean not null default false;

create index if not exists profiles_onboarding_completed_idx
  on profiles (onboarding_completed);
