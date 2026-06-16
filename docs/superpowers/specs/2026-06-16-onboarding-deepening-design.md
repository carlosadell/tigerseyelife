# Onboarding Deepening + Edge-Fn Fan-Out — Design

**Date:** 2026-06-16
**Owner:** John (vuzzdotio@gmail.com)
**Parent spec:** [docs/create-power-program-spec.md](../../create-power-program-spec.md) — CREATE POWER program §3.2 Mandatory Onboarding
**Companion guidance:** `CLAUDE.md` (engineering) + memories on tone, em-dashes, light-locked surfaces, Supabase-edge-fn automation pattern, progressive disclosure

---

## 1. Purpose

Replace TEL's existing minimal onboarding (`app/onboarding.tsx` + welcome-why-fuel-training step files) with a §3.2-shaped 4-section mandatory intake. Captures the ~20 fields (4 of them conditional) the AI coach + Profile screen + outbound integrations all depend on. Includes a Supabase edge function skeleton for the post-onboarding fan-out (replaces the Make.com webhook the source brief specified — see memory `automation-pattern-supabase-edge`).

Coach personalization, profile screen depth, and Make.com replacement all gate behind this slice. Lands the entire §3.2 + edge fn shape in one slice. Resend / Slack / GHL real wiring follows as separate slices.

## 2. Locked decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Relationship to existing onboarding | **Replace entirely**. Existing welcome-why-fuel-training step files become orphan; future slice deletes. |
| 2 | Slice scope | **Whole §3.2 + edge fn skeleton** in one slice (~14 screens + edge fn). |
| 3 | UX shape | **One major question per screen**, Cal AI / Reflectly pattern, with progress dots. |
| 4 | Form architecture | **react-hook-form + Zod** per parent spec §2. New deps. |
| 5 | Automation | **Supabase edge function** (not Make.com). Skeleton receives + logs + returns 200. Resend / Slack / GHL deferred. |

## 3. Architecture

### 3.1 Routes

```
/(auth)/sign-in                                      existing
/membership                                          existing (fork)
/verify-membership                                   existing
/non-member-intake, /non-member                      existing
/onboarding/intake/[step]                            NEW dynamic stepper
/onboarding/intake/review                            NEW review screen
/(tabs)/today                                        existing
```

The existing `/onboarding` route is retired. The gate in `app/index.tsx` and `(tabs)/_layout.tsx` updates to:
- session, not member → existing flow
- session, member, `onboarding_completed = false` → `/onboarding/intake/welcome`
- session, member, `onboarding_completed = true` → `/(tabs)/today`

### 3.2 Step order (14 screens + review)

| # | Step slug | Field(s) | Component shape |
|---|-----------|----------|------------------|
| 1 | `welcome` | none | Intro: "Three minutes. Then we get to work." Continue CTA |
| 2 | `age` | `age` | Number input (13–120) |
| 3 | `primary-goal` | `primary_goal` | Text area |
| 4 | `success-vision` | `success_vision` | Text area |
| 5 | `importance-confidence` | `importance_level`, `confidence_level` | Two sliders (0–10) on one screen — paired by spec intent |
| 6 | `confidence-barriers` | `confidence_barriers` | Text area. **Conditional**: only shown if `confidence_level < 7` |
| 7 | `obstacles` | `obstacles`, `other_obstacle` | Multi-select chips (Time / Motivation / Knowledge / Injury / Cost / Other). Conditional `other_obstacle` text input. |
| 8 | `top-obstacles` | `top_obstacles` | Tap-to-rank: 1st / 2nd over the obstacles selected in step 7. **NOT drag-rank** (RN new-arch flakiness). |
| 9 | `obstacle-deep-dive` | `obstacle_deep_dive` | Text area |
| 10 | `work-situation` | `work_situation` | Single-select (Office / Remote / Shift / Unemployed / Retired / Student) |
| 11 | `living-situation` | `living_situation` | Multi-select (Alone / Partner / Children / Roommates / Family) |
| 12 | `past-experience` | `past_experience` | Optional text area (Skip button visible) |
| 13 | `coaching-style` | `coaching_style` | 4 AnchorRow choice cards (Direct / Warm / Balanced / Challenging) |
| 14 | `final` | `needle_mover`, `specific_habits`, `success_factor`, `other_success_factor`, `emotion_response`, `concerns` | One screen, 4 stacked text areas (last is optional "anything else?") |
| R | `review` | all | All answers laid out as edit-able cards. Tap any field → routes back to that step with the value pre-filled. Big tangerine "Looks right, let's go" CTA → submits. |

Step 6 conditional uses `useFormContext().watch('confidence_level')` from react-hook-form to decide whether to skip.

### 3.3 Form architecture

`react-hook-form` + `@hookform/resolvers` + `zod`. New deps.

Single `<FormProvider>` wrapping the entire intake. State persists in-memory across steps. Each step is `useFormContext()`-aware. On unmount of the last step (or on review submit), the typed form values get persisted via `useOnboardingIntake.submit()`.

Zod schemas live at `lib/onboardingSchema.ts`. Each section has its own schema; final submit type is the intersection.

### 3.4 Persistence — `hooks/useOnboardingIntake.ts`

Dual-path per CLAUDE.md:

- **Supabase mode**: writes all 17 columns to `profiles` in one update, sets `onboarding_completed = true`, then calls the `onboarding-completed` edge fn (fire-and-forget; failure does not block routing to Today).
- **Dev mode**: writes the same shape to AsyncStorage under `tel:onboarding:<userId>` and flips a dev `onboarding_completed` flag on the local membership record.

Returns: `{ submit(values): Promise<void>, loading: boolean }`.

### 3.5 Edge function — `supabase/functions/onboarding-completed/index.ts`

Skeleton shape:

```ts
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // 1. Validate user JWT.
  // 2. Re-read profile (don't trust client payload).
  // 3. Build a structured event payload (firstName, lastName, fullName,
  //    userEmail, signupDate, ALL §3.2 fields).
  // 4. Log the payload for now. Future slices fan out to Resend / Slack / GHL.
  // 5. Return { dispatched: true }.
});
```

Future-slice TODOs commented out for Resend / Slack / GHL.

### 3.6 Migration 0008

```sql
alter table profiles
  add column if not exists age integer check (age is null or (age >= 13 and age <= 120)),
  add column if not exists primary_goal text,
  add column if not exists success_vision text,
  add column if not exists importance_level integer check (importance_level is null or (importance_level >= 0 and importance_level <= 10)),
  add column if not exists confidence_level integer check (confidence_level is null or (confidence_level >= 0 and confidence_level <= 10)),
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
  add column if not exists coaching_style text,
  add column if not exists onboarding_completed boolean not null default false;
```

All columns are user-writable (no entitlement guard extension). RLS via existing profiles policies covers them — users can update their own row.

(Note: `non_member_diagnostic.coachingStyle` was already an `enum` in `useMembership`; the new `profiles.coaching_style` text column is the canonical persisted value. The two should agree post-conversion if a non-member upgrades.)

### 3.7 Routing & gating

`app/index.tsx` adds the onboarding-completion check after the membership check:

```
no session                      → /(auth)/sign-in
no fork answered                → /membership
fork = not member               → /non-member
member, !onboarding_completed   → /onboarding/intake/welcome    ← NEW
member, onboarding_completed    → /(tabs)/today
```

`(tabs)/_layout.tsx` re-checks the same gate.

The existing `app/onboarding.tsx` is deleted in this slice. Sub-component files in `components/onboarding/` (`FirstFiveMinutes`, `WelcomeWhySteps`, `FuelRecommendationSteps`, `PowerTrainingSteps`, etc.) stay on disk but become orphan; future cleanup slice deletes.

### 3.8 Existing `useOnboardingStatus` hook

Already exists. Currently checks an existing TEL field. Refactor to check `profile.onboarding_completed` from the new column. Dual-path: dev mode reads `tel:onboarding:<userId>` from AsyncStorage.

## 4. Components

### Existing (reused)

- `OnboardingPrimitives` (`OnboardingButton`, `ChoiceCard`) — keep using these where they map cleanly
- `AnchorRow`, `SectionHeader`, `PhotoHeroCard` — for the choice card patterns
- `THEME_COLORS.light` direct (light-locked, per CLAUDE.md and memory)

### New

- `components/onboarding/IntakeProgressDots.tsx` — 14 dots, active filled tigerGold, completed checkmark, future muted
- `components/onboarding/IntakeStep.tsx` — wrapper that handles header (kicker + question + helper) + body slot + footer CTA. All step screens compose this.
- `components/onboarding/SliderField.tsx` — wraps `@react-native-community/slider` with brand styling + value badge
- `components/onboarding/TextAreaField.tsx` — multi-line input with character count + skip option
- `components/onboarding/ChipMultiSelect.tsx` — multi-select chip group with "Other → text input" reveal
- `components/onboarding/TapToRank.tsx` — list of items, each shows 1st / 2nd badge or "tap to rank" hint. Tapping cycles 1 → 2 → unset.
- `components/onboarding/ReviewCard.tsx` — single field's saved value + edit chevron

## 5. New dependencies

```
react-hook-form
@hookform/resolvers
zod
@react-native-community/slider
```

All have stable RN 0.81 / Expo 54 compatibility. No drag-rank lib needed (tap-to-rank).

## 6. Out of scope (explicit)

- Resend welcome email integration (skeleton edge fn only)
- Slack-ping Ryan
- GHL contact sync from the edge fn
- Past-onboarding-history view on Profile screen
- Animations beyond simple cross-fade between steps
- Multi-language support
- Deleting orphan onboarding components (future cleanup)
- Migrating non-member diagnostic intake to share components with the new §3.2 intake (separate concern)
- Replacing the existing `app/non-member-intake.tsx` 3-question flow (independent)

## 7. Definition of done

- [ ] Migration 0008 applies cleanly
- [ ] All 17 §3.2 columns persist correctly to profiles
- [ ] `onboarding_completed` defaults false; flips to true on review submit
- [ ] Gate routes new users from auth → fork → verify → `/onboarding/intake/welcome` → 14 steps → review → `/(tabs)/today`
- [ ] Conditional `confidence-barriers` step appears only when `confidence_level < 7`
- [ ] Conditional `other_obstacle` input appears only when `obstacles` includes `other`
- [ ] Conditional `specific_habits` field appears only when `needle_mover` is non-empty
- [ ] Conditional `other_success_factor` appears only when `success_factor === 'other'`
- [ ] Review screen lets the user tap any field to edit it before final submit
- [ ] Edge function `onboarding-completed` receives the dispatch, logs, returns 200
- [ ] Edge function failure does not block routing to Today
- [ ] Dual-path: dev mode persists to AsyncStorage and gates correctly
- [ ] `npm run typecheck` clean
- [ ] No em dashes, no countdowns, no shaming language in any new copy

## 8. Open product items (defaults noted)

| Item | Default for slice | Owner |
|------|-------------------|-------|
| Welcome step copy | "Three minutes. Then we get to work." | Karen voice review |
| Per-question microcopy | First draft inline | Karen voice review |
| Resend email template / sender / API key | Out of scope for this slice (edge fn skeleton only) | Ryan / John for keys |
| Slack channel + webhook for Ryan ping | Out of scope | Ryan |
| GHL contact field mapping | Out of scope; existing `verify-membership` GHL lookup is the only GHL touchpoint | Ryan |
| What happens if a member completes §3.2 and `program_member` is later revoked | Stays in `/non-member` gate route; their §3.2 answers persist in profiles for future re-upgrade | Acceptable default |
| Existing FuelRecommendationSteps / PowerTrainingSteps | Orphan after this slice. Reuse later for an opt-in "Tailor your program" flow post-onboarding | Future scope |
