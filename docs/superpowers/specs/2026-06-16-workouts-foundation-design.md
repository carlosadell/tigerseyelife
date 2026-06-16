# Workouts Foundation Slice — Design

**Date:** 2026-06-16
**Owner:** John (vuzzdotio@gmail.com)
**Parent spec:** [docs/create-power-program-spec.md](../../create-power-program-spec.md) — CREATE POWER program §3.5 (Movement/exercise daily check-in) + §6 (program structure)
**Companion guidance:** `CLAUDE.md` (engineering) + memories on workout-naming-convention, video-hosting-youtube, exercise-library-design-pending, automation-pattern-supabase-edge, no em dashes, no countdowns, light-locked surfaces.

---

## 1. Purpose

Re-foundation the workout system around a typed exercise library and a workout schedule that consumes it. Old onboarding's `PowerTrainingSteps` (retired in the onboarding-deepening slice) used to feed `useAssignedProgram` — that chain is broken for new users. This slice replaces the workout *definition* source (was `lib/programs.ts` + `lib/workoutSeed.ts` + `useAssignedProgram`; now `lib/exerciseLibrary.ts` + `lib/workoutSchedule.ts`) without touching the *execution* layer (the existing active logger, set persistence to `workout_sessions`, rest timer all stay intact).

Outcomes:
- All 18 exercises Ryan named (DB SQUAT through WALL 1.5 BICEP CURLS) live as typed library entries
- Each block has 4 workout slots (Workout 1/2/3/4) per the workout-naming memory
- Commit Workout 1 is authored end-to-end (real exercises, real sets/reps); other 23 are stubs
- Train tab refreshes to render the 4-card grid for the current block
- Tapping a real workout flows into the existing active logger; tapping a stub shows a coming-soon state

## 2. Locked decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Aggressiveness of refresh | **Foundational only.** Don't rewrite the active logger. Swap workout definition source; keep execution layer untouched. |
| 2 | Workouts per block | **4 (Workout 1/2/3/4)** per the workout-naming memory. |
| 3 | Authoring scope | **1 of 4 in Commit Block** authored end-to-end; the remaining 23 ship as stubs. |
| 4 | Curriculum W_WORKOUTS relationship | **Separate concerns.** Curriculum lesson stays educational ("Hinge Pattern"); Train tab is execution. Both consume the same exercise library but render differently. |
| 5 | Data home | **TypeScript constants** in `lib/exerciseLibrary.ts` + `lib/workoutSchedule.ts`. Migrates to SQL when admin panel lands. |
| 6 | Video hosting | **Unlisted YouTube** per memory `video-hosting-youtube`. Library entries hold a YouTube video ID. |

## 3. Architecture

### 3.1 Exercise library — `lib/exerciseLibrary.ts`

```ts
export type MuscleGroupName =
  | 'Quads' | 'Glutes' | 'Hamstrings' | 'Core'
  | 'Chest' | 'Shoulders' | 'Back' | 'Biceps' | 'Triceps'
  | 'Posterior chain' | 'Forearms';

export type ExerciseId =
  | 'db-squat'
  | 'push-ups'
  | 'db-overhead-press'
  | 'db-split-squat'
  | 'chair-squat'
  | 'db-deadlift'
  | 'db-bor-reverse-grip'
  | 'db-stagger-stance-dl'
  | '1-arm-bor'
  | 'biceps-curls'
  | 'db-sumo-squat'
  | 'seated-db-press'
  | '3-phase-sissy-squat'
  | 'push-up-from-deficit'
  | 'sumo-db-rdl'
  | 'db-bent-over-row'
  | 'feet-close-together-dl'
  | 'wall-15-bicep-curls';

export type Exercise = {
  id: ExerciseId;
  name: string;                    // "DB Squat"
  youtubeVideoId: string | null;   // null when Ryan hasn't provided yet; renderer shows poster
  muscleGroups: { name: MuscleGroupName; primary: boolean }[];
  instructions: string[];          // 1 to 4 short cues
  defaultSets?: number;
  defaultReps?: string;            // "8 to 12" or "AMRAP"
};

export const EXERCISE_LIBRARY: Record<ExerciseId, Exercise>;
export const EXERCISE_IDS: readonly ExerciseId[];
export function exerciseById(id: ExerciseId): Exercise;
```

YouTube video IDs left as `null` until Ryan provides them per exercise. The workout detail screen renders a placeholder card with the exercise name when `youtubeVideoId === null` (so the slice ships without waiting on assets).

### 3.2 Workout schedule — `lib/workoutSchedule.ts`

```ts
import type { ExerciseId } from './exerciseLibrary';
import type { BlockId } from './curriculum';

export type WorkoutSlotIndex = 1 | 2 | 3 | 4;
export type WorkoutSlug = string;  // "commit-workout-1", "refine-workout-3", etc.

export type WorkoutExercise = {
  exerciseId: ExerciseId;
  sets: number;
  reps: string;                    // "8 to 12"
  notes?: string;
  restSeconds?: number;            // default 60
};

export type Workout = {
  slug: WorkoutSlug;
  blockId: BlockId;
  slotIndex: WorkoutSlotIndex;
  title: string;                   // "Workout 1"
  helper?: string;                 // "Lower body emphasis"
  exercises: WorkoutExercise[];    // [] means stub
};

export const WORKOUTS: readonly Workout[];  // 24 entries (6 blocks × 4)
export function workoutBySlug(slug: WorkoutSlug): Workout | undefined;
export function workoutsForBlock(blockId: BlockId): Workout[];
export function isStubWorkout(w: Workout): boolean;
```

### 3.3 Authored content (Commit Workout 1)

Working draft, to be confirmed against Ryan's canonical Workout 1 before implementation:

```ts
{
  slug: 'commit-workout-1',
  blockId: 'COMMIT',
  slotIndex: 1,
  title: 'Workout 1',
  helper: 'Lower body emphasis with dumbbells',
  exercises: [
    { exerciseId: 'db-squat',         sets: 3, reps: '8 to 12', restSeconds: 60 },
    { exerciseId: 'db-deadlift',      sets: 3, reps: '8 to 12', restSeconds: 60 },
    { exerciseId: 'db-split-squat',   sets: 3, reps: '10 per leg', restSeconds: 60 },
    { exerciseId: 'push-ups',         sets: 3, reps: 'AMRAP', restSeconds: 60 },
    { exerciseId: 'db-bent-over-row', sets: 3, reps: '10 to 12', restSeconds: 60 },
    { exerciseId: 'biceps-curls',     sets: 2, reps: '12 to 15', restSeconds: 45 },
  ],
}
```

Other 23 entries (`commit-workout-2`, `refine-workout-1`, etc.): `exercises: []`. Title and helper still present so Train tab displays them as locked cards.

### 3.4 Train tab refresh — `app/(tabs)/train.tsx`

Full replace. New structure:

- Header: "Workouts" + current block kicker ("BLOCK · COMMIT").
- Helper line: "Your block has 4 workouts. Find your rhythm."
- 2×2 grid (or vertical stack on narrow screens) of 4 cards:
  - Each card: `WorkoutCard` if exercises populated, `StubWorkoutCard` otherwise
  - Real card: title, helper, exercise count, "Start" CTA, "Last done" line if applicable
  - Stub card: title, "Coming soon" badge, no CTA
- Tap real workout → `/workout/[slug]`
- Tap stub → no-op (or polite tooltip — out of scope for first cut)
- Below the grid: optional progression preview link to `WorkoutLibraryPanel` (reuse existing component if it survives the refactor; otherwise drop)

Drops:
- `useAssignedProgram` import + consumers
- `useProfile` reads of `intake.assignedProgramId` etc.
- All `programs.ts` references
- `derive4AxisKey` helper (legacy onboarding mapping)

Keeps:
- `useThemeColors`, brand tokens
- Light-locked surface (per CLAUDE.md theme-lock pattern)

### 3.5 Workout detail refactor — `app/workout/[id].tsx`

The `[id]` path param becomes the workout slug. Resolve via `workoutBySlug(id)`.

Page content:
- Header with title + helper + back chevron
- Exercise list — for each `WorkoutExercise`, render a row with:
  - Exercise name + sets × reps
  - Muscle group chips (PRIMARY badge for primary movers, per existing pattern)
  - Tap → opens a sheet/modal with: YouTube embed (or poster placeholder if `videoId === null`) + numbered instructions + previous session's stats (via existing `ProgressionTable` if it accepts new data shape)
- Bottom CTA: "Start workout" → existing `/workout/active/[sessionId]` flow

Stub fallback: render title + helper + "Karen and Ryan are loading this one." card + no Start button.

### 3.6 Active logger compatibility

The active logger (`app/workout/active/[sessionId].tsx`) currently reads from `useAssignedProgram` or similar to know which exercises to render. After this slice, it reads from `workoutBySlug(workoutId)` via the active-workout zustand store. Minimal change: the store hydrates from the new Workout shape on session start; everything downstream (ActiveSetLogger, RestTimerOverlay, set-log persistence to `workout_sessions`) stays intact.

If the active logger's hydration path is too tangled to swap cleanly, the slice expands by 1 task to extract a small adapter that maps `Workout → ActiveSessionShape`. Acceptable scope.

### 3.7 Stub UX

- **Train tab grid:** Stub workout card has a `Lock` icon, "Coming soon" badge in muted gold, no CTA, lower opacity (0.7).
- **Tapping a stub:** Train tab doesn't navigate (Pressable disabled or onPress is a no-op). Alternative: open a toast/sheet saying "Karen and Ryan are loading this one" — defer to YAGNI; just disable the tap for slice 1.
- **Workout detail loaded with a stub slug:** Renders title + helper + centered "Karen and Ryan are loading this one. The session shape is being finalized." Single back CTA.
- Stub state never reaches active logger.

## 4. Files

### Create
- `lib/exerciseLibrary.ts` — 18 entries
- `lib/workoutSchedule.ts` — 24 workouts
- `components/workout/WorkoutCard.tsx` — Train-tab card for real workouts
- `components/workout/StubWorkoutCard.tsx` — Train-tab card for stubs

### Refactor (full replace where shape is incompatible)
- `app/(tabs)/train.tsx` — drop assigned-program dependency; render block's 4 cards
- `app/workout/[id].tsx` — read from `workoutBySlug`; existing exercise rendering may need adaptation but reuses primitives

### Touch lightly (data-source swap, no UI rewrite)
- Active logger hydration — adapter that maps `Workout → ActiveSessionShape`. If existing shape happens to match, no adapter needed.

### Leave alone
- `app/workout/active/[sessionId].tsx`, `app/workout/complete/[sessionId].tsx`
- `components/workout/ActiveSetLogger.tsx`, `ProgressionTable.tsx`, `RestTimerOverlay.tsx`, `EmptyTrainState.tsx`
- `stores/activeWorkout.ts`, `hooks/useWorkoutSessions.ts`
- Existing `workout_sessions` table + persistence (no schema changes)

### Becomes orphan (future cleanup slice deletes)
- `lib/programs.ts`
- `lib/workoutSeed.ts`
- `hooks/useAssignedProgram.ts`
- `components/workout/WorkoutLibraryPanel.tsx` — may survive if it can render against new shape; otherwise orphans

## 5. Out of scope

- Authoring Workouts 2/3/4 of Commit or anything beyond Commit
- Active logger UI rewrite
- Rest timer / progression table redesigns
- Replacement of the `workout_sessions` table or schema changes
- Curriculum W_WORKOUTS extension to embed multi-exercise content (it stays "Hinge Pattern" educational)
- Admin UI for editing the exercise library or workout schedule
- Daily exercise check-in (program §3.5 movement field) — that's part of the Nutrition / Daily check-in slice
- Date-based workout scheduling (no "today is Tuesday so Workout 2"); user picks from the grid freely
- Per-user assignment override (the legacy "Ryan slotted you a program" model — out for this slice; future scope)
- Deleting orphan files

## 6. Definition of done

- [ ] `EXERCISE_LIBRARY` exports 18 entries; `typeof EXERCISE_IDS.length === 18`
- [ ] `WORKOUTS` exports 24 entries (6 blocks × 4 slots)
- [ ] `workoutsForBlock('COMMIT')` returns 4 workouts with `commit-workout-1` populated
- [ ] Train tab renders 4 cards for current_block; Workout 1 is "Start"-able, the other 3 are locked-state stubs
- [ ] Tapping Commit Workout 1 → workout detail with all 6 exercises rendered + Start CTA
- [ ] Tapping a stub workout on Train tab is a no-op (or shows polite "coming soon" state)
- [ ] Workout detail for a stub renders the "Karen and Ryan are loading this one" state + no Start button
- [ ] Start → existing active logger lifecycle works (set logs save to `workout_sessions`, completion screen still renders)
- [ ] `npm run typecheck` clean
- [ ] No em dashes / countdowns / shaming language in any new copy
- [ ] No new migrations (slice is pure code)

## 7. Open product items (defaults noted)

| Item | Default | Owner |
|------|---------|-------|
| Ryan's canonical Commit Workout 1 composition | The 6-exercise lower-body draft in §3.3 | Ryan to confirm or override |
| YouTube video IDs per exercise | `null` for now (placeholder renderer in workout detail) | Ryan to deliver IDs from the playlist |
| Stub-tap UX | Disabled tap (no toast) | Acceptable default; revisit if user testing pushes back |
| Workout names per block (e.g., "Lower body" / "Upper body" / "Push" / "Pull") | Generic "Workout N" + helper line per slot | Karen/Ryan to name themes if desired |
| Rep targets for stub workouts | Empty array; no defaults | Defaults emerge with authoring |
| Active logger adapter | Skip until impl proves it's needed | Discovered during impl |
| `WorkoutLibraryPanel` (existing component) | Drop unless it renders cleanly against new shape | Decided during impl |
| Per-user workout assignment | Out of scope; not modeled | Future slice (admin) |
| Date-based scheduling | Out of scope; user picks freely | Future slice |
