# Onboarding Deepening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace TEL's existing minimal onboarding with the CREATE POWER §3.2 four-section mandatory intake (age, goals, obstacles, work/living, coaching style, etc), persist all 20 fields to `profiles`, and dispatch a structured event to a Supabase edge function for future Resend / Slack / GHL fan-out.

**Architecture:** New `user_section_progress`-style data model on `profiles` (20 new columns + `onboarding_completed` flag). One dynamic stepper route at `app/onboarding/intake/[step].tsx` driven by a typed step registry. `react-hook-form` + Zod for form state + validation. Dual-path `useOnboardingIntake` hook (Supabase / AsyncStorage). Edge function skeleton receives the dispatch and logs it.

**Tech Stack:** Expo SDK 54 · React Native 0.81 · expo-router · Supabase (Postgres + edge functions) · `react-hook-form` + `@hookform/resolvers` + `zod` (NEW deps) · `@react-native-community/slider` (NEW dep) · TEL light theme tokens.

**Verification gate:** `npm run typecheck`. Manual smoke via `npm start` after Phase 10.

---

## Pre-flight

Read once before starting:

- `docs/superpowers/specs/2026-06-16-onboarding-deepening-design.md` (the spec — source of truth)
- `docs/create-power-program-spec.md` (parent program brief — §3.2 + §10 constraints)
- `CLAUDE.md` (engineering conventions — dual-path, light-lock, no NativeWind migration, Metro/zustand alias)
- `hooks/useMembership.ts` (you'll touch `Block`, `CoachingStyle`, `NonMemberDiagnostic` types)
- `hooks/useAuth.tsx` (for `isDevSession` / `session`)
- `hooks/useProfile.ts` (read how it shapes the profile object — extends it later)
- `hooks/useOnboardingStatus.ts` (you'll refactor this in Phase 9)
- `app/index.tsx` and `app/(tabs)/_layout.tsx` (existing gate chain you'll extend)
- `lib/brand.ts:53-74` (THEME_COLORS.light tokens)

Memories that apply (do not violate):
- **No em dashes** in user-facing copy
- **No countdowns / deadlines / shaming** in any copy
- **ABC Power Meals verbatim** if referenced (this slice does not surface it directly, but coaching_style choice copy mentions it indirectly)
- **Light-locked** intake surface (use `THEME_COLORS.light` direct, not `useThemeColors()`)
- **Pressable + flex gotcha**: layout in inner View, Pressable only carries opacity
- **Supabase edge functions** (not Make.com) for outbound integrations

The slice is on `main`, on top of commit `82b4c55` (the spec). No worktree.

---

## File map

### Create

- `supabase/migrations/0008_onboarding_intake.sql` — 20 new columns + `onboarding_completed` flag
- `supabase/functions/onboarding-completed/index.ts` — edge function skeleton
- `lib/onboardingSchema.ts` — Zod schemas (per section + final intersection) + `Intake` type
- `lib/onboardingSteps.ts` — typed registry of all 14 steps (slug, prompt, helper, field kind, options, conditional rules)
- `hooks/useOnboardingIntake.ts` — dual-path persistence + submit + dispatch
- `components/onboarding/IntakeProgressDots.tsx` — top-of-screen progress indicator
- `components/onboarding/IntakeStep.tsx` — common shell (kicker + prompt + helper + body slot + CTA + back)
- `components/onboarding/SliderField.tsx` — `@react-native-community/slider` wrapper with brand styling
- `components/onboarding/TextAreaField.tsx` — multi-line input with character count
- `components/onboarding/ChipMultiSelect.tsx` — chip multi-select with optional "Other" reveal
- `components/onboarding/TapToRank.tsx` — tap-to-rank (1st / 2nd) over a passed-in list
- `components/onboarding/SingleSelectStack.tsx` — vertical single-select cards
- `components/onboarding/ReviewCard.tsx` — one row in the review screen
- `app/onboarding/_layout.tsx` — wraps intake routes in `<FormProvider>` + a screen shell
- `app/onboarding/intake/[step].tsx` — dynamic stepper route
- `app/onboarding/intake/review.tsx` — review + submit

### Modify

- `app/_layout.tsx` — register `onboarding/intake/[step]` + `onboarding/intake/review` screens
- `app/index.tsx` — gate adds `onboarding_completed` redirect
- `app/(tabs)/_layout.tsx` — gate re-check
- `hooks/useOnboardingStatus.ts` — point at new `profile.onboarding_completed` column
- `package.json` + `package-lock.json` — new deps

### Delete

- `app/onboarding.tsx` — retired. Its sub-components (`components/onboarding/FirstFiveMinutes.tsx`, etc.) stay on disk as orphan code — future cleanup slice deletes.

---

## Phase 1 — Dependencies + migration 0008

### Task 1.1: Install new dependencies

**Files modified:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install via expo (handles RN compatibility)**

Run:
```bash
rtk proxy npx expo install react-hook-form @hookform/resolvers zod @react-native-community/slider
```

Expected: package.json shows new entries for the 4 packages. The `rtk proxy` prefix is required because rtk rewrites `npx` calls otherwise (confirmed in earlier YouTube patch session).

- [ ] **Step 2: Verify versions and typecheck**

Run: `grep -E '"react-hook-form"|"@hookform/resolvers"|"zod"|"@react-native-community/slider"' package.json`
Expected: 4 matching lines.

Run: `npm run typecheck`
Expected: Exit 0 (the deps don't add any type errors yet since nothing consumes them).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add deps: react-hook-form + zod + @react-native-community/slider"
```

### Task 1.2: Migration 0008

**Files created:** `supabase/migrations/0008_onboarding_intake.sql`

- [ ] **Step 1: Write the migration**

```sql
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
```

- [ ] **Step 2: Apply locally if Supabase running**

If `npx supabase status` shows the stack: run `npx supabase db reset`.
Expected: all migrations apply, no errors.

If no local stack: skip — migration ships untested locally and applies hosted via `npx supabase db push`.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0008_onboarding_intake.sql
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add migration 0008: §3.2 onboarding columns + onboarding_completed flag"
```

---

## Phase 2 — Zod schemas

### Task 2.1: Write `lib/onboardingSchema.ts`

**Files created:** `lib/onboardingSchema.ts`

- [ ] **Step 1: Write the file**

```typescript
// lib/onboardingSchema.ts
//
// Typed Zod schemas for the CREATE POWER §3.2 onboarding intake. Each section
// has its own schema; final submit type is the intersection. Conditional
// fields use `.optional()` so partial form state validates while the user
// is mid-flow; the review screen runs the final composed schema before submit.

import { z } from 'zod';

export const obstacleEnum = z.enum([
  'time',
  'motivation',
  'knowledge',
  'injury',
  'cost',
  'other',
]);
export type Obstacle = z.infer<typeof obstacleEnum>;

export const workSituationEnum = z.enum([
  'office',
  'remote',
  'shift',
  'unemployed',
  'retired',
  'student',
]);
export type WorkSituation = z.infer<typeof workSituationEnum>;

export const livingSituationEnum = z.enum([
  'alone',
  'partner',
  'children',
  'roommates',
  'family',
]);
export type LivingSituation = z.infer<typeof livingSituationEnum>;

export const coachingStyleEnum = z.enum([
  'direct',
  'warm',
  'balanced',
  'challenging',
]);
export type CoachingStyle = z.infer<typeof coachingStyleEnum>;

// Per-section schemas. The conditional fields (confidence_barriers,
// other_obstacle, specific_habits, other_success_factor) are .optional()
// here so the partial form state can validate at any point. The route guards
// (Phase 7) enforce conditional presence using the registry's predicate.

export const goalsMotivationSchema = z.object({
  age: z.number().min(13).max(120),
  primary_goal: z.string().min(3),
  success_vision: z.string().min(3),
  importance_level: z.number().int().min(0).max(10),
  confidence_level: z.number().int().min(0).max(10),
  confidence_barriers: z.string().optional(),
});

export const roadblocksSchema = z.object({
  obstacles: z.array(obstacleEnum).min(1),
  other_obstacle: z.string().optional(),
  top_obstacles: z.array(z.string()).max(2),
  obstacle_deep_dive: z.string().min(3),
});

export const contextSchema = z.object({
  work_situation: workSituationEnum,
  living_situation: z.array(livingSituationEnum).min(1),
  past_experience: z.string().optional(),
});

export const habitsSchema = z.object({
  concerns: z.string().optional(),
  needle_mover: z.string().min(1),
  specific_habits: z.string().optional(),
  success_factor: z.string().min(1),
  other_success_factor: z.string().optional(),
  emotion_response: z.string().min(1),
  coaching_style: coachingStyleEnum,
});

// Final composed type — the union of all 4 sections.
export const intakeSchema = goalsMotivationSchema
  .merge(roadblocksSchema)
  .merge(contextSchema)
  .merge(habitsSchema);

export type Intake = z.infer<typeof intakeSchema>;

// Partial used for mid-flow form state.
export type PartialIntake = Partial<Intake>;

// Default (all-empty) form values used to initialize useForm.
export const intakeDefaults: PartialIntake = {
  age: undefined,
  primary_goal: '',
  success_vision: '',
  importance_level: undefined,
  confidence_level: undefined,
  confidence_barriers: '',
  obstacles: [],
  other_obstacle: '',
  top_obstacles: [],
  obstacle_deep_dive: '',
  work_situation: undefined,
  living_situation: [],
  past_experience: '',
  concerns: '',
  needle_mover: '',
  specific_habits: '',
  success_factor: '',
  other_success_factor: '',
  emotion_response: '',
  coaching_style: undefined,
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add lib/onboardingSchema.ts
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add Zod schemas + Intake type for §3.2 onboarding"
```

---

## Phase 3 — Edge function `onboarding-completed`

### Task 3.1: Write the edge function skeleton

**Files created:** `supabase/functions/onboarding-completed/index.ts`

- [ ] **Step 1: Write the function**

```typescript
// supabase/functions/onboarding-completed/index.ts
//
// Onboarding completion dispatch — skeleton.
//
// Replaces what the parent program brief specified as a Make.com webhook (see
// memory automation-pattern-supabase-edge). Client calls this after writing
// the §3.2 fields to profiles and flipping onboarding_completed = true.
//
// Skeleton scope: validate JWT, re-read profile from DB (don't trust client),
// build a structured event payload, log it, return 200. Future slices wire in:
//   - Resend welcome email
//   - Slack-ping Ryan via webhook
//   - GHL contact sync via the existing GHL_API_KEY pattern

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, content-type",
    },
    status,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
      },
    });
  }
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json(401, { error: "missing_user_token" });
  }
  const userJwt = authHeader.slice("bearer ".length).trim();

  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: `Bearer ${userJwt}` } },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return json(401, { error: "invalid_user_token" });

  // Re-read the profile so we trust DB state, not the client payload.
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return json(404, { error: "profile_not_found" });
  }

  // Structured event payload — future slices will dispatch this to Resend,
  // Slack, GHL. For now, log it server-side.
  const event = {
    type: "onboarding.completed",
    user_id: user.id,
    email: user.email,
    completed_at: new Date().toISOString(),
    profile_snapshot: {
      full_name: profile.full_name,
      age: profile.age,
      primary_goal: profile.primary_goal,
      success_vision: profile.success_vision,
      importance_level: profile.importance_level,
      confidence_level: profile.confidence_level,
      confidence_barriers: profile.confidence_barriers,
      obstacles: profile.obstacles,
      other_obstacle: profile.other_obstacle,
      top_obstacles: profile.top_obstacles,
      obstacle_deep_dive: profile.obstacle_deep_dive,
      work_situation: profile.work_situation,
      living_situation: profile.living_situation,
      past_experience: profile.past_experience,
      concerns: profile.concerns,
      needle_mover: profile.needle_mover,
      specific_habits: profile.specific_habits,
      success_factor: profile.success_factor,
      other_success_factor: profile.other_success_factor,
      emotion_response: profile.emotion_response,
      coaching_style: profile.coaching_style,
    },
  };

  // Skeleton dispatch — log the structured event server-side. Future slices
  // replace this block with parallel fan-out:
  //
  //   await Promise.allSettled([
  //     sendWelcomeEmail(event),     // Resend
  //     pingRyanSlack(event),         // Slack webhook
  //     syncToGhl(event),             // GHL contacts API
  //   ]);
  //
  // For now we log so Phase 10 smoke confirms the function is reachable.
  console.log("[onboarding-completed]", JSON.stringify(event));

  return json(200, { dispatched: true });
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0. (`supabase/` is excluded from tsconfig per the repo pattern, so Deno globals don't get checked.)

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/onboarding-completed/index.ts
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add onboarding-completed edge function skeleton (dispatch + log)"
```

---

## Phase 4 — `useOnboardingIntake` hook

### Task 4.1: Write the dual-path hook

**Files created:** `hooks/useOnboardingIntake.ts`

- [ ] **Step 1: Write the hook**

```typescript
// hooks/useOnboardingIntake.ts
//
// Submits the §3.2 intake to profiles + dispatches a non-blocking call to
// the onboarding-completed edge function. Dual-path per CLAUDE.md.
//
// Supabase mode:
//   1. supabase.from('profiles').update(values + onboarding_completed=true)
//   2. supabase.functions.invoke('onboarding-completed') — fire and forget
//
// Dev mode:
//   1. AsyncStorage.setItem('tel:onboarding:<userId>', JSON.stringify(values))
//   2. AsyncStorage.setItem('tel:onboarding:<userId>:completed', '1')

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import type { Intake } from '../lib/onboardingSchema';

const devKey = (userId: string) => `tel:onboarding:${userId}`;
const devCompletedKey = (userId: string) => `tel:onboarding:${userId}:completed`;

export function useOnboardingIntake() {
  const { isDevSession, session } = useAuth();
  const userId = session?.user.id ?? null;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (values: Intake): Promise<{ ok: true } | { ok: false; reason: string }> => {
      if (!userId) return { ok: false, reason: 'no_user' };
      setError(null);
      setSubmitting(true);

      try {
        if (isDevSession || !supabase) {
          await AsyncStorage.setItem(devKey(userId), JSON.stringify(values));
          await AsyncStorage.setItem(devCompletedKey(userId), '1');
          return { ok: true };
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...values,
            onboarding_completed: true,
          })
          .eq('id', userId);

        if (updateError) {
          const reason = updateError.message || 'profile_update_failed';
          setError(reason);
          return { ok: false, reason };
        }

        // Fire-and-forget edge function. Failure here does not block routing.
        supabase.functions
          .invoke('onboarding-completed', { body: {} })
          .catch(() => {
            // Swallow — logged server-side, retried by future slice.
          });

        return { ok: true };
      } catch (e) {
        const reason = e instanceof Error ? e.message : 'unknown_error';
        setError(reason);
        return { ok: false, reason };
      } finally {
        setSubmitting(false);
      }
    },
    [isDevSession, userId],
  );

  return { submit, submitting, error };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add hooks/useOnboardingIntake.ts
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add useOnboardingIntake hook (dual-path submit + edge fn dispatch)"
```

---

## Phase 5 — Field components

Four leaf components that each render one type of input. Pure UI; integrate with `react-hook-form` via the `value` / `onChange` props pattern (so they're trivially driven by `<Controller>` in the dynamic route).

### Task 5.1: `SliderField`

**Files created:** `components/onboarding/SliderField.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/onboarding/SliderField.tsx
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helperLow?: string;
  helperHigh?: string;
};

/**
 * 0–10 slider with a big value badge above the track. The 0..10 default
 * matches the §3.2 importance_level + confidence_level fields.
 */
export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  helperLow,
  helperHigh,
}: Props) {
  const displayValue = value ?? Math.floor((min + max) / 2);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{value === undefined ? '—' : String(value)}</Text>
        </View>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={displayValue}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={COLORS.tangerine}
        maximumTrackTintColor={light.border}
        thumbTintColor={light.accent}
      />
      {(helperLow || helperHigh) ? (
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>{helperLow ?? ''}</Text>
          <Text style={styles.helperText}>{helperHigh ?? ''}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  helperText: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
  },
  label: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  wrap: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
});
```

### Task 5.2: `TextAreaField`

**Files created:** `components/onboarding/TextAreaField.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/onboarding/TextAreaField.tsx
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  showCount?: boolean;
  numberOfLines?: number;
};

export function TextAreaField({
  value,
  onChange,
  placeholder,
  minHeight = 120,
  maxLength,
  showCount = true,
  numberOfLines = 6,
}: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityLabel={placeholder ?? 'Answer'}
        autoCorrect
        multiline
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={light.mutedText}
        style={[styles.input, { minHeight }]}
        value={value}
      />
      {showCount && maxLength ? (
        <Text style={styles.count}>
          {value.length} / {maxLength}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  input: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  wrap: {},
});
```

### Task 5.3: `ChipMultiSelect`

**Files created:** `components/onboarding/ChipMultiSelect.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/onboarding/ChipMultiSelect.tsx
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T[];
  onChange: (next: T[]) => void;
  otherValue: T | null;             // e.g., 'other' — when selected, reveal the text input
  otherText?: string;
  onOtherTextChange?: (v: string) => void;
};

export function ChipMultiSelect<T extends string>({
  options,
  value,
  onChange,
  otherValue,
  otherText,
  onOtherTextChange,
}: Props<T>) {
  const toggle = (v: T) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  const otherSelected = otherValue !== null && value.includes(otherValue);

  return (
    <View style={styles.stack}>
      <View style={styles.row}>
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={opt.value}
              onPress={() => toggle(opt.value)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {otherSelected && onOtherTextChange ? (
        <TextInput
          accessibilityLabel="Other obstacle, please describe"
          autoCorrect
          onChangeText={onOtherTextChange}
          placeholder="What else?"
          placeholderTextColor={light.mutedText}
          style={styles.otherInput}
          value={otherText ?? ''}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  chipText: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  chipTextActive: {
    color: light.accent,
  },
  otherInput: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stack: {
    gap: 14,
  },
});
```

### Task 5.4: `TapToRank`

**Files created:** `components/onboarding/TapToRank.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/onboarding/TapToRank.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Item = {
  value: string;
  label: string;
};

type Props = {
  items: Item[];
  ranking: string[]; // ordered, length <= maxRanks
  onChange: (next: string[]) => void;
  maxRanks?: number; // default 2
};

/**
 * Tap a row to cycle through ranks: 1st → 2nd → unset. Reliable on RN
 * new arch; avoids drag-rank library flakiness.
 */
export function TapToRank({ items, ranking, onChange, maxRanks = 2 }: Props) {
  const handlePress = (value: string) => {
    const idx = ranking.indexOf(value);
    if (idx === -1) {
      // Add to end if under cap
      if (ranking.length >= maxRanks) return;
      onChange([...ranking, value]);
    } else if (idx === ranking.length - 1) {
      // Last rank → unset
      onChange(ranking.filter((v) => v !== value));
    } else {
      // Promote toward last (swap with next)
      const next = [...ranking];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      onChange(next);
    }
  };

  return (
    <View style={styles.stack}>
      {items.map((item) => {
        const rank = ranking.indexOf(item.value);
        const rankLabel = rank === -1 ? null : rank === 0 ? '1st' : '2nd';
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.label}, ${rankLabel ?? 'unranked'}`}
            key={item.value}
            onPress={() => handlePress(item.value)}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={[styles.row, rank !== -1 && styles.rowActive]}>
              <Text style={[styles.label, rank !== -1 && styles.labelActive]}>{item.label}</Text>
              {rankLabel ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{rankLabel}</Text>
                </View>
              ) : (
                <Text style={styles.hint}>tap to rank</Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.tangerine,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  hint: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
  },
  label: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
  },
  labelActive: {
    color: light.accent,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 14,
  },
  rowActive: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  stack: {},
});
```

### Task 5.5: `SingleSelectStack`

**Files created:** `components/onboarding/SingleSelectStack.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/onboarding/SingleSelectStack.tsx
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T | undefined;
  onChange: (v: T) => void;
  otherValue?: T;
  otherText?: string;
  onOtherTextChange?: (v: string) => void;
};

export function SingleSelectStack<T extends string>({
  options,
  value,
  onChange,
  otherValue,
  otherText,
  onOtherTextChange,
}: Props<T>) {
  const otherSelected = otherValue !== undefined && value === otherValue;

  return (
    <View style={styles.stack}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={[styles.row, active && styles.rowActive]}>
              <View style={styles.body}>
                <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
                {opt.description ? (
                  <Text style={styles.description}>{opt.description}</Text>
                ) : null}
              </View>
              {active ? (
                <Check color={COLORS.tangerine} size={20} strokeWidth={2.4} />
              ) : null}
            </View>
          </Pressable>
        );
      })}

      {otherSelected && onOtherTextChange ? (
        <TextInput
          accessibilityLabel="Please describe"
          autoCorrect
          onChangeText={onOtherTextChange}
          placeholder="Tell us more"
          placeholderTextColor={light.mutedText}
          style={styles.otherInput}
          value={otherText ?? ''}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: 4 },
  description: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  labelActive: {
    color: light.accent,
  },
  otherInput: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 14,
  },
  rowActive: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  stack: {},
});
```

### Task 5.6: Typecheck + commit Phase 5

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 2: Commit**

```bash
git add components/onboarding/SliderField.tsx components/onboarding/TextAreaField.tsx components/onboarding/ChipMultiSelect.tsx components/onboarding/TapToRank.tsx components/onboarding/SingleSelectStack.tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add field components (Slider, TextArea, ChipMultiSelect, TapToRank, SingleSelectStack)"
```

---

## Phase 6 — Wrapper components

### Task 6.1: `IntakeProgressDots`

**Files created:** `components/onboarding/IntakeProgressDots.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/onboarding/IntakeProgressDots.tsx
import { StyleSheet, View } from 'react-native';

import { COLORS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  total: number;
  current: number; // 0-indexed
};

export function IntakeProgressDots({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'future';
        return (
          <View
            key={i}
            style={[
              styles.dot,
              state === 'active' && styles.dotActive,
              state === 'done' && styles.dotDone,
              state === 'future' && styles.dotFuture,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: COLORS.tangerine,
    width: 18,
  },
  dotDone: {
    backgroundColor: light.accent,
  },
  dotFuture: {
    backgroundColor: light.border,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
});
```

### Task 6.2: `IntakeStep`

**Files created:** `components/onboarding/IntakeStep.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/onboarding/IntakeStep.tsx
import { ChevronLeft } from 'lucide-react-native';
import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IntakeProgressDots } from './IntakeProgressDots';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  totalSteps: number;
  stepIndex: number; // 0-indexed
  kicker?: string;
  prompt: string;
  helper?: string;
  children: ReactNode;
  canContinue: boolean;
  ctaLabel?: string;
  onContinue: () => void | Promise<void>;
  onBack?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
  submitting?: boolean;
};

/**
 * Common shell for every intake step. Composes: top bar with back arrow +
 * progress dots; header (kicker + prompt + helper); body slot; footer with
 * primary CTA + optional skip.
 */
export function IntakeStep({
  totalSteps,
  stepIndex,
  kicker,
  prompt,
  helper,
  children,
  canContinue,
  ctaLabel = 'Continue',
  onContinue,
  onBack,
  showSkip,
  onSkip,
  submitting,
}: Props) {
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.frame}>
          <View style={styles.topBar}>
            {onBack ? (
              <Pressable accessibilityLabel="Back" hitSlop={10} onPress={onBack} style={styles.backBtn}>
                <ChevronLeft color={light.text} size={24} />
              </Pressable>
            ) : (
              <View style={styles.backBtn} />
            )}
            <View style={styles.progressWrap}>
              <IntakeProgressDots total={totalSteps} current={stepIndex} />
            </View>
            <View style={styles.backBtn} />
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
              <Text style={styles.prompt}>{prompt}</Text>
              {helper ? <Text style={styles.helper}>{helper}</Text> : null}
            </View>
            <View style={styles.body}>{children}</View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
              disabled={!canContinue || submitting}
              onPress={onContinue}
              style={({ pressed }) => ({
                opacity: pressed
                  ? 0.85
                  : !canContinue || submitting
                    ? 0.4
                    : 1,
              })}
            >
              <View style={styles.cta}>
                <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                  {submitting ? 'Saving...' : ctaLabel}
                </Text>
              </View>
            </Pressable>
            {showSkip ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Skip"
                disabled={submitting}
                onPress={onSkip}
                style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    height: 32,
    width: 32,
  },
  body: {
    gap: 12,
    marginTop: 24,
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 18,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaText: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: -0.1,
  },
  footer: {
    gap: 4,
    paddingBottom: 12,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  header: {
    gap: 6,
  },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  progressWrap: {
    flex: 1,
  },
  prompt: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 30,
    marginTop: 6,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  skip: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: SPACING.screenX,
  },
});
```

### Task 6.3: `ReviewCard`

**Files created:** `components/onboarding/ReviewCard.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/onboarding/ReviewCard.tsx
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  label: string;
  value: string;
  onEdit: () => void;
};

export function ReviewCard({ label, value, onEdit }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
      onPress={onEdit}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View style={styles.card}>
        <View style={styles.left}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value} numberOfLines={3}>
            {value || '—'}
          </Text>
        </View>
        <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 14,
  },
  label: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  left: {
    flex: 1,
    gap: 4,
    marginRight: 10,
  },
  value: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    lineHeight: 21,
  },
});
```

### Task 6.4: Typecheck + commit Phase 6

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 2: Commit**

```bash
git add components/onboarding/IntakeProgressDots.tsx components/onboarding/IntakeStep.tsx components/onboarding/ReviewCard.tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add intake shell components (ProgressDots, IntakeStep wrapper, ReviewCard)"
```

---

## Phase 7 — Step registry + intake routes

### Task 7.1: `lib/onboardingSteps.ts` — typed step registry

**Files created:** `lib/onboardingSteps.ts`

- [ ] **Step 1: Write the registry**

```typescript
// lib/onboardingSteps.ts
//
// Registry for the §3.2 intake stepper. Each entry describes one screen's
// prompt + helper + field configuration. The dynamic route at
// app/onboarding/intake/[step].tsx resolves the slug to an entry and renders
// the matching field component.
//
// Conditional steps use `skipIf` which receives the current form values and
// returns true to skip. Today only `confidence-barriers` is conditional
// (skip when confidence_level >= 7).

import type { PartialIntake } from './onboardingSchema';

export type StepSlug =
  | 'welcome'
  | 'age'
  | 'primary-goal'
  | 'success-vision'
  | 'importance-confidence'
  | 'confidence-barriers'
  | 'obstacles'
  | 'top-obstacles'
  | 'obstacle-deep-dive'
  | 'work-situation'
  | 'living-situation'
  | 'past-experience'
  | 'coaching-style'
  | 'final-prompts';

export type IntakeStepDef = {
  slug: StepSlug;
  kicker?: string;
  prompt: string;
  helper?: string;
  skipIf?: (values: PartialIntake) => boolean;
};

export const STEPS: readonly IntakeStepDef[] = [
  {
    slug: 'welcome',
    kicker: 'YOUR PLAN',
    prompt: 'Three minutes. Then we get to work.',
    helper: "We ask just enough to point Karen and Ryan at the right starting line.",
  },
  {
    slug: 'age',
    kicker: 'ABOUT YOU',
    prompt: 'How old are you?',
    helper: 'We use this to scale the workouts safely.',
  },
  {
    slug: 'primary-goal',
    kicker: 'GOAL',
    prompt: 'What are you trying to do?',
    helper: 'One sentence. Just the shape of it.',
  },
  {
    slug: 'success-vision',
    kicker: 'SUCCESS',
    prompt: 'What does success look like in 12 weeks?',
    helper: 'Be specific. We will check this against where you start.',
  },
  {
    slug: 'importance-confidence',
    kicker: 'WHERE YOU STAND',
    prompt: 'How important is this, and how confident do you feel?',
    helper: '0 means not at all, 10 means absolutely.',
  },
  {
    slug: 'confidence-barriers',
    kicker: 'CONFIDENCE',
    prompt: 'What makes confidence hard?',
    helper: 'No wrong answers. The real ones help us help you.',
    skipIf: (v) => (v.confidence_level ?? 10) >= 7,
  },
  {
    slug: 'obstacles',
    kicker: 'ROADBLOCKS',
    prompt: 'What gets in the way?',
    helper: 'Pick all that apply.',
  },
  {
    slug: 'top-obstacles',
    kicker: 'TOP TWO',
    prompt: 'Which two bite you the most?',
    helper: 'Tap to rank. First tap is 1st, next is 2nd.',
  },
  {
    slug: 'obstacle-deep-dive',
    kicker: 'DEEP DIVE',
    prompt: 'What makes the top one feel so hard?',
    helper: 'A sentence or two. Whatever is true.',
  },
  {
    slug: 'work-situation',
    kicker: 'CONTEXT',
    prompt: 'How does work usually look?',
  },
  {
    slug: 'living-situation',
    kicker: 'CONTEXT',
    prompt: 'Who are you living with?',
    helper: 'Pick all that apply.',
  },
  {
    slug: 'past-experience',
    kicker: 'WHAT YOU HAVE TRIED',
    prompt: 'What has worked or not worked before?',
    helper: 'Optional. Skip if it does not feel relevant.',
  },
  {
    slug: 'coaching-style',
    kicker: 'YOUR COACH',
    prompt: 'How do you want us to coach you?',
    helper: 'You can change this any time later.',
  },
  {
    slug: 'final-prompts',
    kicker: 'LAST FEW',
    prompt: 'Three small things to land it.',
    helper: 'Then we send you in.',
  },
];

// Total visible steps (used by IntakeProgressDots / navigation math).
// Conditional steps that get skipped still count toward `totalSteps` so the
// progress dots don't jump around mid-flow.
export const TOTAL_STEPS = STEPS.length;

export function stepBySlug(slug: string): IntakeStepDef | undefined {
  return STEPS.find((s) => s.slug === slug);
}

export function stepIndexFromSlug(slug: string): number {
  return STEPS.findIndex((s) => s.slug === slug);
}

/**
 * Returns the next slug forward, skipping any whose `skipIf` predicate returns
 * true. Returns 'review' if we run off the end.
 */
export function nextSlug(currentSlug: StepSlug, values: PartialIntake): StepSlug | 'review' {
  const idx = stepIndexFromSlug(currentSlug);
  for (let i = idx + 1; i < STEPS.length; i++) {
    const candidate = STEPS[i];
    if (candidate.skipIf?.(values)) continue;
    return candidate.slug;
  }
  return 'review';
}

/**
 * Returns the previous slug backward, skipping any whose `skipIf` predicate
 * returns true. Returns null if we hit the start.
 */
export function prevSlug(currentSlug: StepSlug, values: PartialIntake): StepSlug | null {
  const idx = stepIndexFromSlug(currentSlug);
  for (let i = idx - 1; i >= 0; i--) {
    const candidate = STEPS[i];
    if (candidate.skipIf?.(values)) continue;
    return candidate.slug;
  }
  return null;
}
```

### Task 7.2: `app/onboarding/_layout.tsx` — FormProvider wrap

**Files created:** `app/onboarding/_layout.tsx`

- [ ] **Step 1: Create the directory and file**

Run: `mkdir -p 'app/onboarding/intake'`

Write `app/onboarding/_layout.tsx`:

```typescript
// app/onboarding/_layout.tsx
//
// Wraps all /onboarding/intake/* routes in a single <FormProvider> so step
// changes don't reset form state. The Stack here owns its own header so we
// can keep IntakeStep clean.

import { Stack } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';

import { intakeDefaults, type PartialIntake } from '../../lib/onboardingSchema';

export default function OnboardingLayout() {
  const methods = useForm<PartialIntake>({
    defaultValues: intakeDefaults,
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="intake/[step]" />
        <Stack.Screen name="intake/review" />
      </Stack>
    </FormProvider>
  );
}
```

### Task 7.3: `app/onboarding/intake/[step].tsx` — dynamic stepper

**Files created:** `app/onboarding/intake/[step].tsx`

- [ ] **Step 1: Write the file**

```typescript
// app/onboarding/intake/[step].tsx
//
// Dynamic stepper. Resolves the slug param against the registry, picks the
// matching field component, validates the values for that step before
// continuing.

import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Controller, useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChipMultiSelect } from '../../../components/onboarding/ChipMultiSelect';
import { IntakeStep } from '../../../components/onboarding/IntakeStep';
import { SingleSelectStack } from '../../../components/onboarding/SingleSelectStack';
import { SliderField } from '../../../components/onboarding/SliderField';
import { TapToRank } from '../../../components/onboarding/TapToRank';
import { TextAreaField } from '../../../components/onboarding/TextAreaField';
import {
  COLORS,
  FONTS,
  THEME_COLORS,
} from '../../../lib/brand';
import {
  STEPS,
  TOTAL_STEPS,
  nextSlug,
  prevSlug,
  stepBySlug,
  stepIndexFromSlug,
  type StepSlug,
} from '../../../lib/onboardingSteps';
import type { Obstacle, PartialIntake } from '../../../lib/onboardingSchema';

const light = THEME_COLORS.light;

const OBSTACLE_OPTIONS: readonly { value: Obstacle; label: string }[] = [
  { value: 'time', label: 'Time' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'injury', label: 'Injury' },
  { value: 'cost', label: 'Cost' },
  { value: 'other', label: 'Other' },
];

const WORK_OPTIONS = [
  { value: 'office', label: 'Office' },
  { value: 'remote', label: 'Remote' },
  { value: 'shift', label: 'Shift work' },
  { value: 'unemployed', label: 'Between jobs' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
] as const;

const LIVING_OPTIONS = [
  { value: 'alone', label: 'Alone' },
  { value: 'partner', label: 'Partner' },
  { value: 'children', label: 'Children' },
  { value: 'roommates', label: 'Roommates' },
  { value: 'family', label: 'Other family' },
] as const;

const COACHING_OPTIONS = [
  { value: 'direct', label: 'Direct, data-driven', description: 'Tell me what works. Show the numbers.' },
  { value: 'warm', label: 'Warm and encouraging', description: 'Meet me where I am.' },
  { value: 'balanced', label: 'Balanced', description: 'A mix of both, depending on the day.' },
  { value: 'challenging', label: 'Challenge me', description: 'Push me. Hold me to it.' },
] as const;

export default function IntakeStepScreen() {
  const params = useLocalSearchParams<{ step?: string }>();
  const slug = String(params.step ?? '');
  const def = stepBySlug(slug);
  const { control, watch, setValue } = useFormContext<PartialIntake>();
  const values = watch();

  if (!def) {
    return <Redirect href={`/onboarding/intake/${STEPS[0].slug}` as never} />;
  }

  // Skip if this step's predicate says so (e.g., entered via back button after
  // confidence_level rose above 7).
  if (def.skipIf?.(values)) {
    const next = nextSlug(def.slug, values);
    const target = next === 'review' ? '/onboarding/intake/review' : `/onboarding/intake/${next}`;
    return <Redirect href={target as never} />;
  }

  const stepIndex = stepIndexFromSlug(def.slug);
  const back = prevSlug(def.slug, values);
  const onBack = back ? () => router.replace(`/onboarding/intake/${back}` as never) : undefined;

  const goNext = () => {
    const next = nextSlug(def.slug, values);
    if (next === 'review') {
      router.replace('/onboarding/intake/review' as never);
    } else {
      router.replace(`/onboarding/intake/${next}` as never);
    }
  };

  // Per-step canContinue logic.
  const canContinue = computeCanContinue(slug as StepSlug, values);

  return (
    <IntakeStep
      totalSteps={TOTAL_STEPS}
      stepIndex={stepIndex}
      kicker={def.kicker}
      prompt={def.prompt}
      helper={def.helper}
      canContinue={canContinue}
      onContinue={goNext}
      onBack={onBack}
      showSkip={slug === 'past-experience'}
      onSkip={slug === 'past-experience' ? goNext : undefined}
    >
      <StepBody slug={slug as StepSlug} control={control} values={values} setValue={setValue} />
    </IntakeStep>
  );
}

function computeCanContinue(slug: StepSlug, v: PartialIntake): boolean {
  switch (slug) {
    case 'welcome':                return true;
    case 'age':                    return typeof v.age === 'number' && v.age >= 13 && v.age <= 120;
    case 'primary-goal':           return (v.primary_goal ?? '').trim().length > 2;
    case 'success-vision':         return (v.success_vision ?? '').trim().length > 2;
    case 'importance-confidence':  return typeof v.importance_level === 'number' && typeof v.confidence_level === 'number';
    case 'confidence-barriers':    return (v.confidence_barriers ?? '').trim().length > 1;
    case 'obstacles':              return (v.obstacles ?? []).length > 0;
    case 'top-obstacles':          return (v.top_obstacles ?? []).length === Math.min(2, (v.obstacles ?? []).length);
    case 'obstacle-deep-dive':     return (v.obstacle_deep_dive ?? '').trim().length > 2;
    case 'work-situation':         return typeof v.work_situation === 'string';
    case 'living-situation':       return (v.living_situation ?? []).length > 0;
    case 'past-experience':        return true; // optional + skip-able
    case 'coaching-style':         return typeof v.coaching_style === 'string';
    case 'final-prompts':          return (v.needle_mover ?? '').trim().length > 1 && (v.success_factor ?? '').trim().length > 1 && (v.emotion_response ?? '').trim().length > 1;
  }
}

type BodyProps = {
  slug: StepSlug;
  control: ReturnType<typeof useFormContext<PartialIntake>>['control'];
  values: PartialIntake;
  setValue: ReturnType<typeof useFormContext<PartialIntake>>['setValue'];
};

function StepBody({ slug, control, values, setValue }: BodyProps) {
  switch (slug) {
    case 'welcome':
      return (
        <View>
          <Text style={styles.welcomeBody}>
            We will ask about your goal, what gets in the way, and how you want us to coach you.
            Nothing is locked in. You can edit any answer on the review screen before we begin.
          </Text>
        </View>
      );

    case 'age':
      return (
        <Controller
          control={control}
          name="age"
          render={({ field }) => (
            <SliderField
              label="Age"
              value={field.value}
              onChange={field.onChange}
              min={13}
              max={120}
              step={1}
            />
          )}
        />
      );

    case 'primary-goal':
      return (
        <Controller
          control={control}
          name="primary_goal"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="e.g. lose 20 lbs and keep it off"
              maxLength={240}
            />
          )}
        />
      );

    case 'success-vision':
      return (
        <Controller
          control={control}
          name="success_vision"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Paint the picture."
              maxLength={400}
            />
          )}
        />
      );

    case 'importance-confidence':
      return (
        <View style={styles.stack}>
          <Controller
            control={control}
            name="importance_level"
            render={({ field }) => (
              <SliderField
                label="How important is this?"
                value={field.value}
                onChange={field.onChange}
                helperLow="Not at all"
                helperHigh="Absolutely"
              />
            )}
          />
          <Controller
            control={control}
            name="confidence_level"
            render={({ field }) => (
              <SliderField
                label="How confident do you feel?"
                value={field.value}
                onChange={field.onChange}
                helperLow="Not at all"
                helperHigh="Very"
              />
            )}
          />
        </View>
      );

    case 'confidence-barriers':
      return (
        <Controller
          control={control}
          name="confidence_barriers"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="What gets in the way of feeling sure?"
              maxLength={300}
            />
          )}
        />
      );

    case 'obstacles':
      return (
        <Controller
          control={control}
          name="obstacles"
          render={({ field }) => (
            <ChipMultiSelect
              options={OBSTACLE_OPTIONS}
              value={(field.value ?? []) as Obstacle[]}
              onChange={(next) => {
                field.onChange(next);
                // Also prune top_obstacles to those still selected.
                const prunedRanking = (values.top_obstacles ?? []).filter((v) => next.includes(v as Obstacle));
                setValue('top_obstacles', prunedRanking);
                if (!next.includes('other')) setValue('other_obstacle', '');
              }}
              otherValue={'other'}
              otherText={values.other_obstacle ?? ''}
              onOtherTextChange={(v) => setValue('other_obstacle', v)}
            />
          )}
        />
      );

    case 'top-obstacles':
      return (
        <Controller
          control={control}
          name="top_obstacles"
          render={({ field }) => (
            <TapToRank
              items={(values.obstacles ?? []).map((v) => {
                const found = OBSTACLE_OPTIONS.find((o) => o.value === v);
                return { value: v, label: found?.label ?? v };
              })}
              ranking={(field.value ?? []) as string[]}
              onChange={field.onChange}
              maxRanks={2}
            />
          )}
        />
      );

    case 'obstacle-deep-dive':
      return (
        <Controller
          control={control}
          name="obstacle_deep_dive"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="What makes it stick around?"
              maxLength={400}
            />
          )}
        />
      );

    case 'work-situation':
      return (
        <Controller
          control={control}
          name="work_situation"
          render={({ field }) => (
            <SingleSelectStack
              options={WORK_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      );

    case 'living-situation':
      return (
        <Controller
          control={control}
          name="living_situation"
          render={({ field }) => (
            <ChipMultiSelect
              options={LIVING_OPTIONS}
              value={(field.value ?? []) as string[]}
              onChange={field.onChange}
              otherValue={null}
            />
          )}
        />
      );

    case 'past-experience':
      return (
        <Controller
          control={control}
          name="past_experience"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="What helped or hurt?"
              maxLength={400}
            />
          )}
        />
      );

    case 'coaching-style':
      return (
        <Controller
          control={control}
          name="coaching_style"
          render={({ field }) => (
            <SingleSelectStack
              options={COACHING_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      );

    case 'final-prompts':
      return (
        <View style={styles.stack}>
          <View>
            <Text style={styles.subPrompt}>What single change would help most?</Text>
            <Controller
              control={control}
              name="needle_mover"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="One change."
                  numberOfLines={3}
                  minHeight={80}
                  maxLength={200}
                />
              )}
            />
          </View>
          <View>
            <Text style={styles.subPrompt}>What must change for you to succeed?</Text>
            <Controller
              control={control}
              name="success_factor"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="One factor."
                  numberOfLines={3}
                  minHeight={80}
                  maxLength={200}
                />
              )}
            />
          </View>
          <View>
            <Text style={styles.subPrompt}>How do you typically respond to setbacks?</Text>
            <Controller
              control={control}
              name="emotion_response"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Be honest."
                  numberOfLines={3}
                  minHeight={80}
                  maxLength={200}
                />
              )}
            />
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  subPrompt: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    marginBottom: 8,
  },
  welcomeBody: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
  },
});
```

### Task 7.4: Typecheck + commit Phase 7

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 2: Commit**

```bash
git add lib/onboardingSteps.ts app/onboarding/_layout.tsx 'app/onboarding/intake/[step].tsx'
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add step registry + onboarding layout + dynamic stepper route"
```

---

## Phase 8 — Review screen + submit

### Task 8.1: Write the review screen

**Files created:** `app/onboarding/intake/review.tsx`

- [ ] **Step 1: Write the file**

```typescript
// app/onboarding/intake/review.tsx
//
// All §3.2 answers laid out as ReviewCards. Tap any card → routes back to
// that step with the value preserved (form state lives in the FormProvider
// upstream). The submit CTA validates via the composed Zod schema and
// dispatches via useOnboardingIntake.

import { router } from 'expo-router';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewCard } from '../../../components/onboarding/ReviewCard';
import { useOnboardingIntake } from '../../../hooks/useOnboardingIntake';
import {
  COLORS,
  FONTS,
  SPACING,
  THEME_COLORS,
  ctaTextOnTangerine,
} from '../../../lib/brand';
import {
  intakeSchema,
  type Intake,
  type PartialIntake,
} from '../../../lib/onboardingSchema';

const light = THEME_COLORS.light;

const LABELS: Record<keyof Intake, string> = {
  age: 'AGE',
  primary_goal: 'YOUR GOAL',
  success_vision: 'SUCCESS IN 12 WEEKS',
  importance_level: 'HOW IMPORTANT',
  confidence_level: 'HOW CONFIDENT',
  confidence_barriers: 'WHAT MAKES CONFIDENCE HARD',
  obstacles: 'ROADBLOCKS',
  other_obstacle: 'OTHER ROADBLOCK',
  top_obstacles: 'TOP TWO',
  obstacle_deep_dive: 'WHY IT IS HARD',
  work_situation: 'WORK',
  living_situation: 'LIVING WITH',
  past_experience: 'WHAT YOU HAVE TRIED',
  concerns: 'CONCERNS',
  needle_mover: 'NEEDLE MOVER',
  specific_habits: 'SPECIFIC HABITS',
  success_factor: 'SUCCESS FACTOR',
  other_success_factor: 'OTHER SUCCESS FACTOR',
  emotion_response: 'WHEN THINGS SLIP',
  coaching_style: 'COACHING STYLE',
};

const FIELD_TO_STEP: Partial<Record<keyof Intake, string>> = {
  age: 'age',
  primary_goal: 'primary-goal',
  success_vision: 'success-vision',
  importance_level: 'importance-confidence',
  confidence_level: 'importance-confidence',
  confidence_barriers: 'confidence-barriers',
  obstacles: 'obstacles',
  other_obstacle: 'obstacles',
  top_obstacles: 'top-obstacles',
  obstacle_deep_dive: 'obstacle-deep-dive',
  work_situation: 'work-situation',
  living_situation: 'living-situation',
  past_experience: 'past-experience',
  coaching_style: 'coaching-style',
  needle_mover: 'final-prompts',
  success_factor: 'final-prompts',
  emotion_response: 'final-prompts',
};

function display(value: PartialIntake[keyof PartialIntake]): string {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  return String(value);
}

export default function ReviewScreen() {
  const { getValues } = useFormContext<PartialIntake>();
  const { submit, submitting, error } = useOnboardingIntake();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const values = getValues();

  const onEdit = (field: keyof Intake) => {
    const stepSlug = FIELD_TO_STEP[field];
    if (stepSlug) router.replace(`/onboarding/intake/${stepSlug}` as never);
  };

  const onSubmit = async () => {
    setSubmitError(null);

    const parsed = intakeSchema.safeParse(values);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setSubmitError(`Please complete: ${firstIssue.path.join('.')}`);
      return;
    }

    const result = await submit(parsed.data);
    if (!result.ok) {
      setSubmitError(`Could not save. ${result.reason}`);
      return;
    }

    router.replace('/(tabs)/today' as never);
  };

  // Order matches the spec's logical group.
  const fieldsToReview: (keyof Intake)[] = [
    'age',
    'primary_goal',
    'success_vision',
    'importance_level',
    'confidence_level',
    'confidence_barriers',
    'obstacles',
    'top_obstacles',
    'obstacle_deep_dive',
    'work_situation',
    'living_situation',
    'past_experience',
    'coaching_style',
    'needle_mover',
    'success_factor',
    'emotion_response',
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>REVIEW</Text>
            <Text style={styles.title}>Make sure this is true.</Text>
            <Text style={styles.helper}>Tap any answer to change it before we send you in.</Text>
          </View>

          <View style={styles.list}>
            {fieldsToReview.map((field) => {
              const v = values[field];
              if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) {
                // Skip fields the user hasn't filled (e.g., optional past_experience,
                // skipped confidence_barriers).
                return null;
              }
              return (
                <ReviewCard
                  key={field}
                  label={LABELS[field]}
                  value={display(v)}
                  onEdit={() => onEdit(field)}
                />
              );
            })}
          </View>

          {submitError ?? error ? (
            <Text style={styles.error}>{submitError ?? error}</Text>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit"
            disabled={submitting}
            onPress={onSubmit}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : submitting ? 0.5 : 1 })}
          >
            <View style={styles.cta}>
              <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                {submitting ? 'Saving...' : 'Looks right, let us go'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 18,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaText: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: -0.1,
  },
  error: {
    color: COLORS.deepRed,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
    marginTop: 16,
  },
  footer: {
    paddingBottom: 12,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  header: {
    gap: 6,
    marginBottom: 22,
  },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  list: {},
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/onboarding/intake/review.tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add review screen + submit flow"
```

---

## Phase 9 — Routing + gates + cleanup

### Task 9.1: Register intake routes in root layout

**Files modified:** `app/_layout.tsx`

- [ ] **Step 1: Add Stack.Screen registrations**

Open `app/_layout.tsx`. Find the line `<Stack.Screen name="onboarding" />` and replace it (plus the prior `<Stack.Screen name="non-member" />` order should remain unchanged) with:

```typescript
        <Stack.Screen name="non-member" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="onboarding/intake/[step]" />
        <Stack.Screen name="onboarding/intake/review" />
        <Stack.Screen name="(tabs)" />
```

(`onboarding` stays registered while `app/onboarding.tsx` still exists — Task 9.4 deletes it last. The two new entries handle the new routes regardless.)

### Task 9.2: Refactor `hooks/useOnboardingStatus.ts`

**Files modified:** `hooks/useOnboardingStatus.ts`

- [ ] **Step 1: Read current shape**

Run: `cat hooks/useOnboardingStatus.ts`
Note the current return shape (likely `{ completed: boolean, loading: boolean }`) and what source it currently checks.

- [ ] **Step 2: Replace with the new shape**

Replace the entire file with:

```typescript
// hooks/useOnboardingStatus.ts
//
// Reads onboarding completion from profiles.onboarding_completed (Supabase)
// or from the dev AsyncStorage flag (dev mode). Dual-path per CLAUDE.md.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

const devCompletedKey = (userId: string) => `tel:onboarding:${userId}:completed`;

export function useOnboardingStatus() {
  const { isDevSession, session } = useAuth();
  const userId = session?.user.id ?? null;

  const [completed, setCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(Boolean(session));

  const load = useCallback(async () => {
    if (!session || !userId) {
      setCompleted(false);
      setLoading(false);
      return;
    }
    setLoading(true);

    if (isDevSession || !supabase) {
      const flag = await AsyncStorage.getItem(devCompletedKey(userId));
      setCompleted(flag === '1');
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();
    setCompleted(Boolean(data?.onboarding_completed));
    setLoading(false);
  }, [isDevSession, session, userId]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { completed, loading, refresh: load };
}
```

- [ ] **Step 2.5: Audit consumers**

Run: `grep -rn "useOnboardingStatus" --include="*.ts" --include="*.tsx" | head`
Confirm that the existing consumers (`app/index.tsx`, `app/(tabs)/_layout.tsx`) destructure `{ completed, loading }`. If a consumer uses a different field, adjust the consumer in its own task. Expected today: both consumers already use `{ completed, loading }`.

### Task 9.3: Update gates in `app/index.tsx`

**Files modified:** `app/index.tsx`

- [ ] **Step 1: Verify the gate already routes to `/onboarding` when intake is incomplete**

The current gate (from the rebuild slice) routes `!intakeCompleted` → `/onboarding`. Update it to route to `/onboarding/intake/welcome` instead:

```typescript
  if (!intakeCompleted) return <Redirect href="/onboarding/intake/welcome" />;
```

Locate the existing `<Redirect href="/onboarding" />` line and swap the URL.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

### Task 9.4: Update gates in `app/(tabs)/_layout.tsx` and delete `app/onboarding.tsx`

**Files modified:** `app/(tabs)/_layout.tsx`
**Files deleted:** `app/onboarding.tsx`

- [ ] **Step 1: Same swap in tabs layout**

Open `app/(tabs)/_layout.tsx`. Find the redirect line `<Redirect href="/onboarding" />` and replace with:

```typescript
    return <Redirect href="/onboarding/intake/welcome" />;
```

- [ ] **Step 2: Delete the old onboarding screen**

Run: `rm app/onboarding.tsx`

Expected: file gone. The orphan components under `components/onboarding/` (FirstFiveMinutes, WelcomeWhySteps, etc.) stay on disk — future cleanup slice deletes them.

- [ ] **Step 3: Drop the now-orphan Stack.Screen entry**

Open `app/_layout.tsx`. Find and delete the line:

```typescript
        <Stack.Screen name="onboarding" />
```

Keep the two new `onboarding/intake/...` lines from Task 9.1.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 5: Commit Phase 9 as a coherent unit**

```bash
git add hooks/useOnboardingStatus.ts app/index.tsx 'app/(tabs)/_layout.tsx' app/_layout.tsx
git rm app/onboarding.tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Wire onboarding gates to /onboarding/intake/welcome + retire old onboarding screen"
```

---

## Phase 10 — Final verification

### Task 10.1: Full typecheck + em-dash sweep + smoke walk

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 2: Em-dash sweep on new files**

Run:
```bash
git diff 82b4c55..HEAD -- 'app/onboarding/' 'components/onboarding/SliderField.tsx' 'components/onboarding/TextAreaField.tsx' 'components/onboarding/ChipMultiSelect.tsx' 'components/onboarding/TapToRank.tsx' 'components/onboarding/SingleSelectStack.tsx' 'components/onboarding/IntakeProgressDots.tsx' 'components/onboarding/IntakeStep.tsx' 'components/onboarding/ReviewCard.tsx' 'lib/onboardingSchema.ts' 'lib/onboardingSteps.ts' 'hooks/useOnboardingIntake.ts' 'hooks/useOnboardingStatus.ts' 'supabase/migrations/0008_onboarding_intake.sql' 'supabase/functions/onboarding-completed/index.ts' | grep '^+' | grep -v '^+++' | grep '—' | head -10
```

Expected: no matches in user-facing strings (JSDoc comments are tolerated).

- [ ] **Step 3: Start Expo and walk the full intake flow**

Run: `npm start -- --clear`. Press `i` (or `a`) to launch.

Sign in fresh (or use dev "Start over" from the existing dev hatches). Walk:

**Welcome → Age:**
- `/onboarding/intake/welcome` renders with the kicker, prompt, helper, and a Continue CTA.
- Continue → `/onboarding/intake/age`. Slider visible, defaulted near 60.
- Pick 47. Continue → primary-goal.

**Goal + Vision:**
- primary-goal: type "lose 20 lbs", continue.
- success-vision: type "feel light, sleep well", continue.

**Importance + Confidence:**
- Two sliders on one screen. Set importance to 9, confidence to 8. Continue.
- Confidence ≥ 7 so confidence-barriers should be SKIPPED. Next screen is obstacles.
- Back. Lower confidence to 5. Continue. confidence-barriers screen appears. Type something. Continue.

**Obstacles:**
- Multi-select. Pick Time + Motivation + Other. The "Other" text input appears below the chips. Type "kids' schedule". Continue.

**Top-2:**
- Three options shown (Time, Motivation, Other). Tap Time (1st). Tap Motivation (2nd). Tap Motivation again to unset, then Other (2nd). Continue.

**Deep dive:**
- Type something, continue.

**Work + Living:**
- Single-select work_situation, continue. Multi-select living_situation, continue.

**Past experience:**
- Either skip or fill, both should advance.

**Coaching style:**
- Pick one of four cards. Continue.

**Final prompts:**
- 3 textareas. Fill all 3. Continue.

**Review:**
- All filled fields render as cards.
- Tap any card to confirm it routes back to the right step with the value preserved.
- Submit. Lands on `/(tabs)/today`.
- Profile in Supabase (or AsyncStorage `tel:onboarding:<userId>`) holds the 17 fields.

**Edge function:**
- If running against hosted Supabase, the function logs the event in the Supabase dashboard's Function logs.

**Gate guard:**
- Reload the app. Today renders directly; `/onboarding/intake/welcome` no longer triggers.

- [ ] **Step 4: Fix anything that came up and commit**

```bash
git add -A
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Fix final smoke issues from onboarding deepening"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Plan task(s) |
|--------------|--------------|
| §2 Locked decisions (replace existing, whole §3.2, one-Q-per-screen, RHF+Zod, edge fn) | All phases respect these |
| §3.1 Routes | Tasks 7.2 (layout), 7.3 ([step] route), 8.1 (review), 9.1 (registration), 9.3–9.4 (gates) |
| §3.2 Step order | Task 7.1 (STEPS array) + Task 7.3 (StepBody dispatch) |
| §3.3 Form architecture (FormProvider, conditional via watch) | Tasks 7.2, 7.3 |
| §3.4 Persistence hook (dual-path) | Task 4.1 |
| §3.5 Edge function skeleton | Task 3.1 |
| §3.6 Migration 0008 | Task 1.2 |
| §3.7 Gate updates | Tasks 9.3, 9.4 |
| §3.8 useOnboardingStatus refactor | Task 9.2 |
| §4 Components (existing reused + 7 new) | Tasks 5.1–5.5, 6.1–6.3 |
| §5 New deps install | Task 1.1 |
| §6 Out of scope | Not built (Resend, Slack, GHL, profile screen, etc.) — respected |
| §7 DOD | Task 10.1 smoke checklist matches each DOD item |

**Placeholder scan:** no TBD / TODO / "similar to Task N". Every step has full code.

**Type consistency:**
- `Intake`, `PartialIntake`, `Obstacle`, `WorkSituation`, `LivingSituation`, `CoachingStyle` defined in Task 2.1 and used identically in 4.1, 7.1, 7.3, 8.1.
- `StepSlug` defined in 7.1 used in 7.3.
- `nextSlug` / `prevSlug` / `stepBySlug` / `stepIndexFromSlug` / `TOTAL_STEPS` defined in 7.1 used in 7.3.
- `useOnboardingIntake` returns `{ submit, submitting, error }` and 8.1 consumes those names exactly.
- `useOnboardingStatus` returns `{ completed, loading, refresh }`. Consumers (9.3, 9.4) confirmed via Task 9.2 Step 2.5 audit.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-16-onboarding-deepening.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
