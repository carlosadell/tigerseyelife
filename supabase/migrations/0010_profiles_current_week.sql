-- 0010_profiles_current_week.sql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_week smallint NOT NULL DEFAULT 1;

UPDATE public.profiles SET current_week = CASE
  WHEN current_block = 'COMMIT' THEN 1
  WHEN current_block = 'REFINE' THEN 3
  WHEN current_block = 'EVOLVE' THEN 5
  WHEN current_block = 'ADAPT' THEN 7
  WHEN current_block = 'THRIVE' THEN 9
  WHEN current_block = 'EXCEL' THEN 11
  ELSE 1
END
WHERE current_week = 1;
