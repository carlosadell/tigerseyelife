# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # expo start
npm run ios            # expo start --ios
npm run android        # expo start --android
npm run web            # expo start --web
npm run typecheck      # tsc --noEmit — the only static check; run before declaring work done
```

There is no test runner, no ESLint config, and no formatter script. `npm run typecheck` is the sole verification gate.

### Supabase

```bash
npx supabase start         # local stack
npx supabase db reset      # re-apply migrations to local
npx supabase link --project-ref <ref>   # connect to hosted
npx supabase db push       # push migrations to hosted
```

Migrations live in [supabase/migrations/](supabase/migrations/), numbered `0001_`…`0005_`. Append a new numbered file rather than editing existing ones.

To point the app at a real Supabase project, set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`. With those empty, the app runs in dev-skip mode (see below).

## Architecture

### Dual-path data layer (critical)

Every data hook is written to work in BOTH modes:

- **Supabase mode** — `.env` has Supabase keys; `hasSupabaseConfig` is true; `supabase` client is non-null.
- **Dev mode** — keys missing OR the user tapped "Skip for dev" on the sign-in screen. `useAuth` returns a synthetic `DevSession` with `isDevSession: true`. All reads/writes go to AsyncStorage instead of Postgres.

When adding a hook that touches data, replicate the pattern from [hooks/useDailyEntry.ts](hooks/useDailyEntry.ts) / [hooks/useWorkoutSessions.ts](hooks/useWorkoutSessions.ts):

1. Get `{ session, isDevSession }` from `useAuth()`.
2. If `isDevSession || !supabase`, read/write `AsyncStorage` under a `tel:<scope>:<userId>:<key>` key.
3. Otherwise call Supabase. RLS is enabled on every table and policies check `auth.uid()`.
4. Library-style queries (e.g. workouts) fall back to a hardcoded seed in [lib/workoutSeed.ts](lib/workoutSeed.ts) or [lib/programs.ts](lib/programs.ts) so the app is usable offline / pre-migration.

Do not introduce a hook that only works against Supabase — dev mode must keep functioning.

### Routing and gates

Routing is [expo-router](https://expo.github.io/router/) file-based, rooted at [app/](app/). The root `Stack` is declared in [app/_layout.tsx](app/_layout.tsx); providers wrap in this order: `GestureHandlerRootView → SafeAreaProvider → ThemeProvider → QueryClientProvider → AuthProvider`.

The entry redirect chain in [app/index.tsx](app/index.tsx):

- no `session` → `/(auth)/sign-in`
- session, no onboarding → `/onboarding`
- session, onboarded → `/(tabs)/today`

`[app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx)` re-checks the same gates, so onboarding can't be bypassed by deep-linking. Active and completed workout screens are declared as modal presentations in the root stack — keep that when adding similar full-screen flows.

The tab bar is a custom component, not the default expo-router bar — see [components/navigation/FloatingTabBar.tsx](components/navigation/FloatingTabBar.tsx). The coach is a floating button + modal sheet ([components/navigation/CoachFloatingButton.tsx](components/navigation/CoachFloatingButton.tsx), [components/navigation/CoachBottomSheet.tsx](components/navigation/CoachBottomSheet.tsx)).

### State

- **Server / async** state: `@tanstack/react-query` (single `QueryClient` in the root layout). Invalidate with `queryClient.invalidateQueries({ queryKey: [...] })`.
- **Active workout** (the only piece of cross-screen mutable client state): zustand store [stores/activeWorkout.ts](stores/activeWorkout.ts), persisted to AsyncStorage via `zustand/middleware`. This is what lets a workout-in-progress survive app restarts.
- **Auth, theme**: React Context (`AuthProvider`, `ThemeProvider`).

### Styling

NativeWind v4 is configured (see [tailwind.config.js](tailwind.config.js), [babel.config.js](babel.config.js), [global.css](global.css)) and Tailwind classes work via `className=`. **However, most components use `StyleSheet.create` plus theme tokens from [lib/brand.ts](lib/brand.ts)** — match the surrounding file's style. Don't migrate StyleSheet code to NativeWind unless asked.

Theming:

- Brand tokens: `COLORS` (raw palette), `THEME_COLORS.dark` / `THEME_COLORS.light` (semantic), `FONTS`, `SPACING` — all from [lib/brand.ts](lib/brand.ts).
- Read the current theme via `useTheme()` / `useThemeColors()` from [hooks/useTheme.tsx](hooks/useTheme.tsx). Never hardcode hex values in components — pull from `COLORS` or the active theme.
- Fonts loaded in `RootLayout`: Inter (regular/medium/bold) and VT323 (the "diagnostic" display font used for stat numbers).

### Metro / build quirks

[metro.config.js](metro.config.js) explicitly aliases `zustand` and `zustand/middleware` to their CJS entry points — without this, Metro picks the ESM build and breaks. Don't remove that resolver block.

`newArchEnabled: true` in [app.json](app.json) — the app runs on React Native's new architecture.

## Product context

The "rounds" referenced throughout the code and [README.md](README.md):

- Round 1: auth shell, Today, daily entries
- Round 2: onboarding + First Five Minutes
- Round 3 (current "Train build"): workout library, workout detail, active logger, rest timer, completion
- Round 4 (deferred): Fuel logger, program progression admin
- Round 5 (deferred): Grow surfaces, real AI coach wiring

Tabs that aren't a current focus (Fuel, Grow) are intentionally lightweight placeholders — they're not abandoned code. [docs/product-reference-checklist.md](docs/product-reference-checklist.md) is the source-of-truth functional spec for what each surface should eventually contain — read it before making product decisions, not as a one-time reference.

### Program assignment is a deterministic key, not a recommendation

The onboarding picker is a **4-axis key** (duration / format / equipment-location / skill-level-multi-select) that maps to **one fixed 4-workout program** via [supabase/migrations/0005_v4_member_app_alignment.sql](supabase/migrations/0005_v4_member_app_alignment.sql)'s `program_slotting_rules`. Same key → same program, every time, per cohort. Do not introduce randomness, model-driven recommendations, or generative selection here. The current code is mid-migration: the picker UI in [components/onboarding/PowerTrainingSteps.tsx](components/onboarding/PowerTrainingSteps.tsx) still has the old "pick up to 2" skill-level shape and an extra 45-min duration option — those mismatches are tracked in the spec doc. Assignment today is manual (Ryan slots a program); the table is empty pending Ryan's rule set.

### Workout video assets are scoped, never library-wide

Each `program_workout` will eventually carry three assets: a warm-up tutorial, an exercise-tutorial playlist **scoped to that workout's own four exercises**, and the full-session Zoom recording in two view variants (group view + speaker-only). The current `tutorial_urls` JSONB column on `program_workouts` is the placeholder. When extending this, preserve the scoping — surfacing the unscoped exercise library to users is a known anti-pattern Karen has called out.

### Project-specific subagents

Three project-scoped agents in [.claude/agents/](.claude/agents/) encode the conventions above. Prefer them over the generic `general-purpose` agent when their description matches:

- **`supabase-migration-author`** — for any DB schema change. Knows numbering, RLS defaults, the dual-path hook implication, and which JSONB shapes are in flux.
- **`expo-router-screen-builder`** — for new screens/routes. Knows the gate chain, brand tokens, StyleSheet conventions, and the "ask before telling / never use guilt" UX rules.
- **`karen-feedback-router`** — for intake of Karen/Ryan transcripts and notes. Triages each item to spec doc vs CLAUDE.md vs memory vs code TODO. Does not modify code itself; hands off to the two agents above.

### AI coach is a placeholder; check the spec before wiring it

[app/coach.tsx](app/coach.tsx) and [components/navigation/CoachBottomSheet.tsx](components/navigation/CoachBottomSheet.tsx) render a chat UI, but there is **no LLM wiring**: no API client, no system prompt, no `coach_messages` reads or writes. When wiring lands, two hard guardrails from beta testing live in `docs/product-reference-checklist.md` (AI Coach section) and must be honored: **no recursive deferral** (never tell a user to look something up themselves after they accepted help) and **no sentiment-blind affirmation** (parse "this sounds like a lot" as overwhelm, not enthusiasm). Read that section before drafting any system prompt.
