# Chronological Workout History on Exercise Detail

**Date:** 2026-06-18
**Status:** Approved for implementation
**Owner:** Carlos
**Driver:** Karen + Carlos biweekly catch-up, June 17. Karen committed John to "prioritize building the chronological workout tracking view" and "provide an update on the tracking feature by Friday." This spec is what ships against that commitment.

## Background

The Create Power program is built around **progressive overload**: users follow a fixed 4-workout rotation for 12 weeks and need to see their weight/rep history per exercise to know when to increase load. Karen's worked example: a user's squat history might show Week 1 = 5lb × 15 reps → Week 2 = 5lb × 15 reps → Week 3 = 8lb × 12 reps. That delta is the entire point.

The chronological view already exists in code. [components/workout/ProgressionTable.tsx](../../../components/workout/ProgressionTable.tsx) renders exactly Karen's shape: a row per set, a column per session (last 3 by default plus TODAY), with weight × reps in each cell. Historical seed data in [lib/workoutHistorySeed.ts](../../../lib/workoutHistorySeed.ts) backs it.

The gap is **surfacing, not building**. `ProgressionTable` is currently only mounted inside the active session ([app/workout/active/[sessionId].tsx](../../../app/workout/active/[sessionId].tsx)) — invisible unless the user is mid-set. Karen never saw it during the demo because the demo wasn't mid-session.

## What changes

### Surface: "Your history" section on the exercise detail screen

[app/exercise/[id].tsx](../../../app/exercise/[id].tsx) currently shows YouTube player → Muscle Groups → Exercise Instructions. Insert a new **"Your history"** section between the YouTube player and Muscle Groups, rendering `ProgressionTable` for this exercise across all past sessions where the exercise appeared (not filtered by workout).

This is the surface users naturally land on when they tap an exercise from a workout — it's the right place for "what did I last lift on this?"

### `ProgressionTable` becomes reusable outside the active session

Two small additive changes to [components/workout/ProgressionTable.tsx](../../../components/workout/ProgressionTable.tsx):

1. New prop `showTodayColumn?: boolean` (defaults `true`). When `false`, omit the trailing TODAY column. The exercise detail surface passes `false` because there is no in-progress session there.
2. `maxColumns` default stays 3 mid-session but is raised to **6** on the detail surface so members see a longer multi-week chronological view — Karen explicitly framed this as "watch the progression across weeks," and Create Power is 12 weeks long.

### Unit display flips to lbs

The beta cohort is US-based; Karen and Ryan coach in lbs; her worked example was in lbs. The schema (`weight_kg`) stays — only display converts. Add a tiny [lib/units.ts](../../../lib/units.ts) helper:

```ts
export function kgToLb(kg: number): number;
export function formatWeight(kg: number): string; // "5lb", "12.5lb"
```

`ProgressionTable` swaps its inline `formatWeight` for the shared helper. Other surfaces stay on `kg` for now and migrate opportunistically — out of scope is anything beyond `ProgressionTable`. (One audit: confirm no other on-screen cell reads `weight_kg` and renders "kg" hardcoded. If there is one in the active session totals strip, flip it; if it's deeper, defer.)

### Empty state

When the user has no completed sessions for this exercise: replace the table with a one-line bone-toned card: *"No history yet. Your weights and reps will show here after your first session of this exercise."* The card uses the same `colors.card`/`colors.border` tokens the rest of the detail screen uses — no new visual language.

## Out of scope (explicit)

- **Pre-start "recent sets" strip on the workout detail page.** A secondary surface. Defer to next week so Friday's demo focuses on the one obvious user path.
- **Per-user units preference.** YAGNI until someone asks for kg. Schema change can come later without touching display call sites.
- **kg → lb migration of unrelated surfaces** (active session totals, completion summary, history day, total volume widgets). One audit pass is in scope; rolling them all is not.
- **Membership roster wiring.** Not engineering — Carlos pings Karen separately.
- **Chronological "TODAY → 12 weeks back" trendline / chart.** The table already shows the delta; charts are out of scope for the Friday commit.

## Data flow

```dot
digraph dataflow {
    rankdir=LR;
    "useAuth" -> "useWorkoutSessions";
    "useWorkoutSessions" -> "all sessions";
    "all sessions" -> "ProgressionTable (showTodayColumn=false, maxColumns=6)";
    "EXERCISE_LIBRARY[id]" -> "ProgressionTable (showTodayColumn=false, maxColumns=6)";
    "ProgressionTable (showTodayColumn=false, maxColumns=6)" -> "lib/units.ts formatWeight";
}
```

`useWorkoutSessions` already returns the full session array (Supabase or AsyncStorage seed). `ProgressionTable` already filters per-exercise via `exercise.id` and per-workout via the optional `workoutId` prop. Passing `workoutId={undefined}` (the existing default) gives the cross-workout history view the spec needs — zero new query work.

## Files touched

| File | Change |
|---|---|
| [components/workout/ProgressionTable.tsx](../../../components/workout/ProgressionTable.tsx) | Add `showTodayColumn?: boolean` (default `true`). Conditionally append TODAY column. Swap inline weight formatter for the shared helper. |
| [lib/units.ts](../../../lib/units.ts) | New tiny module: `kgToLb`, `formatWeight`. |
| [app/exercise/[id].tsx](../../../app/exercise/[id].tsx) | Import `ProgressionTable`, `useWorkoutSessions`. Render "Your history" section between the YouTube player and Muscle Groups. Empty state when no historical sets exist. |
| [app/workout/active/[sessionId].tsx](../../../app/workout/active/[sessionId].tsx) | None expected — `ProgressionTable` already used here, new prop defaults preserve current behavior. Confirm during implementation. |

No schema changes. No new hooks. No new migrations.

## Verification

- `npm run typecheck` clean.
- Manual: open an exercise from a workout in dev mode (the AsyncStorage seed in `workoutHistorySeed.ts` provides 3 past sessions for `ex_1`–`ex_6`). Confirm:
  - "Your history" section appears between video and Muscle Groups.
  - Up to 6 historical columns render (3 in seed → all 3 show).
  - No TODAY column appears outside the active session.
  - Cells display "5lb × 15", not "5kg × 15".
- Manual: enter active session, confirm the existing ProgressionTable still shows TODAY column with the same data.
- Manual: open an exercise that has no history (e.g. `ex_7` or any exercise not in the lower-body-A seed) → empty-state card renders, no broken table.

## Risk

Very low. Additive prop with a backward-compatible default, one new tiny module, one new section on one screen. No data layer change, no migrations, no auth boundary touched.

## Follow-up (not now)

- Pre-start "recent sets" strip on the workout detail page (next week).
- Audit the rest of the app for hardcoded "kg" cells; migrate to the shared formatter (opportunistic).
- 12-week chart view if Karen asks for it after the demo.
