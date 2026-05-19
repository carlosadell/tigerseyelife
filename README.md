# Tigers Eye Life

Expo + React Native app for Tigers Eye Life.

## Current Build

- Round 1: Auth shell, Today dashboard, floating navigation, local coach sheet, and Supabase-ready daily entries.
- Round 2: Branded onboarding, POWER baseline capture, training/fuel setup, recommendation step, and First Five Minutes placeholder practice.
- Train build: Pick a Workout library, workout detail, active logger, rest timer, completion screen, persisted in-progress sessions, and Today training signals.
- Deferred: Program progression/admin workout publishing in Round 4, Fuel logger in Round 4, Grow/AI coach wiring in Round 5.

Use `Skip for dev` on the sign-in screen while `.env` is empty. The dev path stores onboarding and daily-entry data locally with AsyncStorage.

## Supabase CLI

The project is initialized for the Supabase CLI in `supabase/config.toml`.

Useful commands:

```bash
npx supabase start
npx supabase status
npx supabase db reset
```

For a hosted Supabase project:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Then copy your hosted API URL and anon key into `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Round 1 schema lives in `supabase/migrations/0001_initial.sql`.
Workout library/session schema and seed workouts live in `supabase/migrations/0002_workouts.sql`.
