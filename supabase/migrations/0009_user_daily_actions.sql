-- 0009_user_daily_actions.sql

CREATE TABLE public.user_daily_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_id text NOT NULL,
  completed_date date NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  week_number smallint NOT NULL,
  UNIQUE (user_id, action_id, completed_date)
);

GRANT SELECT, INSERT, DELETE ON public.user_daily_actions TO authenticated;
GRANT ALL ON public.user_daily_actions TO service_role;

ALTER TABLE public.user_daily_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own actions" ON public.user_daily_actions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users insert own actions" ON public.user_daily_actions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users delete own actions" ON public.user_daily_actions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_user_daily_actions_user_date
  ON public.user_daily_actions (user_id, completed_date);

CREATE INDEX idx_user_daily_actions_user_week
  ON public.user_daily_actions (user_id, week_number);
