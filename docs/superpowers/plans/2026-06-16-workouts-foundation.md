# Workouts Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy assigned-program workout source with a typed exercise library plus a workout schedule indexed by curriculum block, surface 4 workouts per block on the Train tab, and ship Commit Workout 1 authored end-to-end without rewriting the active logger.

**Architecture:** Two new pure-data modules (`lib/exerciseLibrary.ts`, `lib/workoutSchedule.ts`) feed two new card components (`WorkoutCard`, `StubWorkoutCard`). The Train tab and workout detail screens are fully refactored to consume them; the active logger stays intact via a small adapter that maps the new `Workout` shape into the existing `WorkoutLibraryItem` shape the zustand store already persists.

**Tech Stack:** TypeScript, React Native, Expo Router (file-based), zustand (active workout store, unchanged), brand tokens from `lib/brand.ts`, light-locked surface per the onboarding/Commit Today pattern.

**Verification gate:** `npm run typecheck` (no test runner per CLAUDE.md). Each phase ends typecheck-clean and gets its own commit.

**Hard constraints across all phases:**
- **No em dashes** (memory `feedback_no_em_dashes`). Use periods, commas, or restructure.
- **No countdowns, deadlines, time-pressure, or shaming copy** (memory `feedback_create_power_tone`).
- **Workout names are "Workout 1/2/3/4"**, never body-part labels (memory `workout_naming_convention`).
- **Light-locked surfaces.** Train tab and workout detail render with `THEME_COLORS.light` references via `useThemeColors()` like the rest of the user-facing program surfaces today — but if the existing `train.tsx` already uses `useThemeColors()`, keep that pattern. Don't hardcode hex outside the brand palette.
- **Pressable + flex layout gotcha** (memory `feedback_pressable_flex_layout`): when a `Pressable` wraps a card layout, the `flexDirection`/`gap`/`alignItems` MUST live on an inner `View`, not on the `Pressable` itself. The `Pressable` only carries `opacity` and `onPress`.

---

## File Structure

### Create
- `lib/exerciseLibrary.ts` — 18 typed exercise entries, ID union, helpers
- `lib/workoutSchedule.ts` — 24 workouts (6 blocks × 4 slots), Commit Workout 1 authored, helpers
- `lib/workoutSessionAdapter.ts` — pure helper that maps `Workout + EXERCISE_LIBRARY` → `WorkoutLibraryItem` for the active workout store
- `components/workout/WorkoutCard.tsx` — Train-tab card for real workouts
- `components/workout/StubWorkoutCard.tsx` — Train-tab card for stubs

### Refactor (full replace)
- `app/(tabs)/train.tsx` — drop `useAssignedProgram`/`useProfile.intakeAnswers`; render 2×2 grid driven by `workoutsForBlock(currentBlock)`
- `app/workout/[id].tsx` — read via `workoutBySlug`; render stub state when `exercises.length === 0`; map through adapter on Start

### Leave alone
- `app/workout/active/[sessionId].tsx`, `app/workout/complete/[sessionId].tsx`
- `components/workout/ActiveSetLogger.tsx`, `ProgressionTable.tsx`, `RestTimerOverlay.tsx`
- `stores/activeWorkout.ts` (the store keeps consuming `WorkoutLibraryItem` — the adapter feeds it)
- `hooks/useWorkoutSessions.ts`
- `lib/workouts.ts` (the `WorkoutLibraryItem`/`WorkoutExercise` types stay; new code adapts to them)

### Becomes orphan (NOT deleted in this slice)
- `lib/programs.ts`, `lib/workoutSeed.ts`, `hooks/useAssignedProgram.ts`, `hooks/useWorkout.ts`, `components/workout/WorkoutLibraryPanel.tsx`. Future cleanup slice deletes. Leaving them in place keeps this slice surgical and the diff reviewable.

---

## Phase 1: Exercise Library

**Goal:** Ship `lib/exerciseLibrary.ts` with 18 typed entries. YouTube IDs are `null` until Ryan delivers; the workout detail renderer will fall back to a poster card.

**Files:**
- Create: `lib/exerciseLibrary.ts`

### Task 1.1: Create the exercise library module

- [ ] **Step 1: Write `lib/exerciseLibrary.ts`**

```ts
// lib/exerciseLibrary.ts
//
// The CREATE POWER exercise library. 18 atomic exercises Ryan shared
// 2026-06-16. Each entry holds a YouTube video id (unlisted), muscle
// groups, and short cues. `youtubeVideoId === null` means Ryan has not
// delivered the asset yet; the renderer shows a poster placeholder.

export type MuscleGroupName =
  | 'Quads'
  | 'Glutes'
  | 'Hamstrings'
  | 'Core'
  | 'Chest'
  | 'Shoulders'
  | 'Back'
  | 'Biceps'
  | 'Triceps'
  | 'Posterior chain'
  | 'Forearms';

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
  name: string;
  youtubeVideoId: string | null;
  muscleGroups: { name: MuscleGroupName; primary: boolean }[];
  instructions: string[];
  defaultSets?: number;
  defaultReps?: string;
};

export const EXERCISE_LIBRARY: Record<ExerciseId, Exercise> = {
  'db-squat': {
    id: 'db-squat',
    name: 'DB Squat',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Quads', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Hold a dumbbell in each hand at your sides, feet shoulder-width.',
      'Sit back into the squat. Chest tall, knees tracking the toes.',
      'Drive through the whole foot to stand.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'push-ups': {
    id: 'push-ups',
    name: 'Push Ups',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Chest', primary: true },
      { name: 'Shoulders', primary: false },
      { name: 'Triceps', primary: false },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Plank position, hands a touch wider than the shoulders.',
      'Lower the chest with elbows at a 45-degree angle.',
      'Press the floor away to lockout.',
    ],
    defaultSets: 3,
    defaultReps: 'AMRAP',
  },
  'db-overhead-press': {
    id: 'db-overhead-press',
    name: 'DB Overhead Press',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Shoulders', primary: true },
      { name: 'Triceps', primary: false },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Stand tall. Dumbbells at shoulder height, palms forward.',
      'Brace the core, press straight overhead.',
      'Lower with control to the start.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'db-split-squat': {
    id: 'db-split-squat',
    name: 'DB Split Squat',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Quads', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Hamstrings', primary: false },
    ],
    instructions: [
      'Split stance. Dumbbells at your sides.',
      'Lower the back knee toward the floor.',
      'Drive through the front foot to stand. Switch sides each set.',
    ],
    defaultSets: 3,
    defaultReps: '10 per leg',
  },
  'chair-squat': {
    id: 'chair-squat',
    name: 'Chair Squat',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Quads', primary: true },
      { name: 'Glutes', primary: true },
    ],
    instructions: [
      'Stand a foot in front of a chair, feet shoulder-width.',
      'Sit back until the chair grazes your hips.',
      'Stand without bouncing off the seat.',
    ],
    defaultSets: 3,
    defaultReps: '10 to 15',
  },
  'db-deadlift': {
    id: 'db-deadlift',
    name: 'DB Deadlift',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Posterior chain', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Hamstrings', primary: false },
      { name: 'Back', primary: false },
    ],
    instructions: [
      'Dumbbells in front of the thighs, feet hip-width.',
      'Hinge at the hips. Soft knees, flat back.',
      'Drive the floor away to lockout.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'db-bor-reverse-grip': {
    id: 'db-bor-reverse-grip',
    name: 'DB Bent Over Row, Reverse Grip',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Back', primary: true },
      { name: 'Biceps', primary: true },
      { name: 'Posterior chain', primary: false },
    ],
    instructions: [
      'Hinge at the hips. Dumbbells under the shoulders, palms forward.',
      'Pull the dumbbells toward the ribs, elbows close to the body.',
      'Lower with control.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'db-stagger-stance-dl': {
    id: 'db-stagger-stance-dl',
    name: 'DB Stagger Stance Deadlift',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Posterior chain', primary: true },
      { name: 'Hamstrings', primary: true },
      { name: 'Glutes', primary: false },
    ],
    instructions: [
      'One foot back on the toes. Most weight in the front leg.',
      'Hinge from the front hip. Dumbbells track the front shin.',
      'Stand by squeezing the front glute. Switch sides each set.',
    ],
    defaultSets: 3,
    defaultReps: '8 per leg',
  },
  '1-arm-bor': {
    id: '1-arm-bor',
    name: '1 Arm Bent Over Row',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Back', primary: true },
      { name: 'Biceps', primary: false },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Hinge at the hips. Free hand on a bench or knee for support.',
      'Pull the dumbbell toward the hip, elbow leading.',
      'Lower with control. Switch sides each set.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 10 per side',
  },
  'biceps-curls': {
    id: 'biceps-curls',
    name: 'Biceps Curls',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Biceps', primary: true },
      { name: 'Forearms', primary: false },
    ],
    instructions: [
      'Stand tall. Dumbbells at your sides, palms forward.',
      'Curl to the shoulder without swinging.',
      'Lower with control.',
    ],
    defaultSets: 2,
    defaultReps: '12 to 15',
  },
  'db-sumo-squat': {
    id: 'db-sumo-squat',
    name: 'DB Sumo Squat',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Glutes', primary: true },
      { name: 'Quads', primary: true },
      { name: 'Hamstrings', primary: false },
    ],
    instructions: [
      'Wide stance, toes turned out. One dumbbell held vertically.',
      'Sit straight down between the heels. Knees track the toes.',
      'Stand by squeezing the glutes.',
    ],
    defaultSets: 3,
    defaultReps: '10 to 12',
  },
  'seated-db-press': {
    id: 'seated-db-press',
    name: 'Seated DB Press',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Shoulders', primary: true },
      { name: 'Triceps', primary: false },
    ],
    instructions: [
      'Seated, back supported. Dumbbells at shoulder height.',
      'Press straight overhead without arching the lower back.',
      'Lower with control.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  '3-phase-sissy-squat': {
    id: '3-phase-sissy-squat',
    name: '3 Phase Sissy Squat',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Quads', primary: true },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Heels elevated. Lean back as the knees track forward.',
      'Pause at three depths on the way down.',
      'Drive back up through the toes.',
    ],
    defaultSets: 3,
    defaultReps: '6 to 8',
  },
  'push-up-from-deficit': {
    id: 'push-up-from-deficit',
    name: 'Push Up From Deficit',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Chest', primary: true },
      { name: 'Shoulders', primary: false },
      { name: 'Triceps', primary: false },
    ],
    instructions: [
      'Hands on raised handles or plates. Plank position.',
      'Lower the chest below the hands.',
      'Press the floor away to lockout.',
    ],
    defaultSets: 3,
    defaultReps: '6 to 10',
  },
  'sumo-db-rdl': {
    id: 'sumo-db-rdl',
    name: 'Sumo DB Romanian Deadlift',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Hamstrings', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Posterior chain', primary: false },
    ],
    instructions: [
      'Wide stance, toes turned out. Dumbbells in front of the thighs.',
      'Hinge at the hips with a soft knee. Dumbbells stay close to the legs.',
      'Stand by squeezing the glutes.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'db-bent-over-row': {
    id: 'db-bent-over-row',
    name: 'Dumbbell Bent Over Row',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Back', primary: true },
      { name: 'Biceps', primary: false },
      { name: 'Posterior chain', primary: false },
    ],
    instructions: [
      'Hinge at the hips. Dumbbells under the shoulders, palms facing each other.',
      'Pull the dumbbells toward the ribs.',
      'Lower with control.',
    ],
    defaultSets: 3,
    defaultReps: '10 to 12',
  },
  'feet-close-together-dl': {
    id: 'feet-close-together-dl',
    name: 'Feet Close Together Deadlift',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Posterior chain', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Hamstrings', primary: false },
    ],
    instructions: [
      'Feet touching. Dumbbells in front of the thighs.',
      'Hinge at the hips with a flat back.',
      'Stand by driving the floor away.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 10',
  },
  'wall-15-bicep-curls': {
    id: 'wall-15-bicep-curls',
    name: 'Wall 1.5 Bicep Curls',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Biceps', primary: true },
      { name: 'Forearms', primary: false },
    ],
    instructions: [
      'Stand with the back against a wall. Dumbbells at your sides.',
      'Curl all the way up, lower to ninety degrees, curl back up, lower fully.',
      'That sequence is one rep.',
    ],
    defaultSets: 2,
    defaultReps: '8 to 10',
  },
};

export const EXERCISE_IDS: readonly ExerciseId[] = Object.keys(
  EXERCISE_LIBRARY,
) as ExerciseId[];

export function exerciseById(id: ExerciseId): Exercise {
  return EXERCISE_LIBRARY[id];
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean (no errors).

- [ ] **Step 3: Sanity-check the count**

Run: `node -e "const lib = require('./lib/exerciseLibrary.ts'); console.log(Object.keys(lib.EXERCISE_LIBRARY).length)"` is NOT available (TS not compiled). Instead, verify by grep:

Run: `grep -c "id: '" lib/exerciseLibrary.ts`
Expected: `18`

- [ ] **Step 4: Commit**

```bash
git add lib/exerciseLibrary.ts
git commit -m "$(cat <<'EOF'
Add exerciseLibrary with 18 typed entries

YouTube ids null until Ryan delivers the unlisted urls.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: Workout Schedule

**Goal:** Ship `lib/workoutSchedule.ts` with 24 workouts (6 blocks × 4 slots) and Commit Workout 1 authored end-to-end. Other 23 are stubs (`exercises: []`).

**Files:**
- Create: `lib/workoutSchedule.ts`

### Task 2.1: Create the schedule module

- [ ] **Step 1: Write `lib/workoutSchedule.ts`**

```ts
// lib/workoutSchedule.ts
//
// The CREATE POWER workout schedule. Each block has 4 numbered workout
// slots (Workout 1 to Workout 4) per the workout-naming memory. Commit
// Workout 1 is authored end-to-end; the other 23 ship as stubs that the
// Train tab renders as locked cards.

import type { BlockId } from './curriculum';
import { BLOCK_IDS } from './curriculum';
import type { ExerciseId } from './exerciseLibrary';

export type WorkoutSlotIndex = 1 | 2 | 3 | 4;
export const WORKOUT_SLOT_INDICES: readonly WorkoutSlotIndex[] = [1, 2, 3, 4];

export type WorkoutSlug = string;

export type WorkoutExercise = {
  exerciseId: ExerciseId;
  sets: number;
  reps: string;
  notes?: string;
  restSeconds?: number;
};

export type Workout = {
  slug: WorkoutSlug;
  blockId: BlockId;
  slotIndex: WorkoutSlotIndex;
  title: string;
  helper?: string;
  exercises: WorkoutExercise[];
};

// ──────────────────────────────────────────────────────────────────────────
// Authored workouts (1 in this slice)
// ──────────────────────────────────────────────────────────────────────────

const AUTHORED: Workout[] = [
  {
    slug: 'commit-workout-1',
    blockId: 'COMMIT',
    slotIndex: 1,
    title: 'Workout 1',
    helper: 'Lower body emphasis with dumbbells',
    exercises: [
      { exerciseId: 'db-squat', sets: 3, reps: '8 to 12', restSeconds: 60 },
      { exerciseId: 'db-deadlift', sets: 3, reps: '8 to 12', restSeconds: 60 },
      { exerciseId: 'db-split-squat', sets: 3, reps: '10 per leg', restSeconds: 60 },
      { exerciseId: 'push-ups', sets: 3, reps: 'AMRAP', restSeconds: 60 },
      { exerciseId: 'db-bent-over-row', sets: 3, reps: '10 to 12', restSeconds: 60 },
      { exerciseId: 'biceps-curls', sets: 2, reps: '12 to 15', restSeconds: 45 },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Stub generation: (BLOCK × SLOT) minus AUTHORED = 23 stubs
// ──────────────────────────────────────────────────────────────────────────

function stubSlug(blockId: BlockId, slot: WorkoutSlotIndex): string {
  return `${blockId.toLowerCase()}-workout-${slot}`;
}

function authoredKey(w: Workout): string {
  return `${w.blockId}:${w.slotIndex}`;
}

function buildSchedule(): Workout[] {
  const authoredKeys = new Set(AUTHORED.map(authoredKey));
  const workouts: Workout[] = [...AUTHORED];

  for (const blockId of BLOCK_IDS) {
    for (const slot of WORKOUT_SLOT_INDICES) {
      const key = `${blockId}:${slot}`;
      if (authoredKeys.has(key)) continue;
      workouts.push({
        slug: stubSlug(blockId, slot),
        blockId,
        slotIndex: slot,
        title: `Workout ${slot}`,
        exercises: [],
      });
    }
  }

  return workouts.sort((a, b) => {
    const blockCmp = BLOCK_IDS.indexOf(a.blockId) - BLOCK_IDS.indexOf(b.blockId);
    if (blockCmp !== 0) return blockCmp;
    return a.slotIndex - b.slotIndex;
  });
}

export const WORKOUTS: readonly Workout[] = buildSchedule();

export function workoutBySlug(slug: WorkoutSlug): Workout | undefined {
  return WORKOUTS.find((w) => w.slug === slug);
}

export function workoutsForBlock(blockId: BlockId): Workout[] {
  return WORKOUTS.filter((w) => w.blockId === blockId);
}

export function isStubWorkout(w: Workout): boolean {
  return w.exercises.length === 0;
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Sanity-check counts inline**

Run these greps:

```bash
grep -c "slug:" lib/workoutSchedule.ts
```
Expected: at least 7 (1 authored + the 6 in helpers/types are unrelated — just ensure module compiles).

Quick TS smoke (optional): add a temporary console.log in a scratch file or just trust the buildSchedule output deterministically. With 6 blocks × 4 slots = 24, and 1 authored, the stub loop emits 23. Total is 24.

- [ ] **Step 4: Commit**

```bash
git add lib/workoutSchedule.ts
git commit -m "$(cat <<'EOF'
Add workoutSchedule with 24 slots and Commit Workout 1 authored

6 blocks x 4 slots. Workout 1 of Commit has 6 exercises drawn from the
new library. The other 23 are stubs (empty exercises array) so the
Train tab renders them as locked cards.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3: Active Workout Adapter

**Goal:** Ship `lib/workoutSessionAdapter.ts` — a pure function that turns the new `Workout` shape into the `WorkoutLibraryItem` shape the existing `useActiveWorkoutStore`, `ActiveSetLogger`, and `ProgressionTable` already expect. This is the entire bridge between the new data model and the untouched active logger.

The store reads `currentWorkout.exercises[i]` for: `id`, `name`, `target_sets`, `target_reps`, `rest_seconds`, `is_warmup`, `notes`. The cover screen (workout/[id].tsx) also reads: `duration_minutes`, `difficulty`, `focus_area`, `equipment`, `description`, `cover_color`. The adapter fills all of them with sane defaults derived from the library entries.

**Files:**
- Create: `lib/workoutSessionAdapter.ts`

### Task 3.1: Create the adapter

- [ ] **Step 1: Write `lib/workoutSessionAdapter.ts`**

```ts
// lib/workoutSessionAdapter.ts
//
// Maps the new Workout shape into the legacy WorkoutLibraryItem shape the
// existing active workout store and downstream components expect. Pure
// function: no React, no async, no side effects. Keeps the active logger
// untouched while the rest of the system migrates.

import { COLORS } from './brand';
import { EXERCISE_LIBRARY, exerciseById } from './exerciseLibrary';
import type { Workout, WorkoutExercise as ScheduleExercise } from './workoutSchedule';
import type { WorkoutDifficulty, WorkoutExercise, WorkoutFocus, WorkoutLibraryItem } from './workouts';

const DEFAULT_REST_SECONDS = 60;
const DEFAULT_DIFFICULTY: WorkoutDifficulty = 'beginner';
const DEFAULT_FOCUS: WorkoutFocus = 'full';

export function adaptWorkout(workout: Workout): WorkoutLibraryItem {
  const exercises = workout.exercises.map((e, index) =>
    adaptExercise(e, index),
  );
  const equipment = uniqueEquipment(workout.exercises);
  return {
    id: workout.slug,
    name: workout.title,
    description: workout.helper ?? '',
    duration_minutes: estimateDurationMinutes(exercises),
    equipment,
    difficulty: DEFAULT_DIFFICULTY,
    focus_area: DEFAULT_FOCUS,
    cover_color: COLORS.onyx,
    exercises,
    order_index: workout.slotIndex,
  };
}

function adaptExercise(
  e: ScheduleExercise,
  index: number,
): WorkoutExercise {
  const lib = exerciseById(e.exerciseId);
  const notes = [e.notes, lib.instructions.join(' ')]
    .filter(Boolean)
    .join(' · ');
  return {
    id: `${e.exerciseId}-${index}`,
    name: lib.name,
    equipment: deriveEquipmentName(lib.id),
    target_sets: e.sets,
    target_reps: e.reps,
    rest_seconds: e.restSeconds ?? DEFAULT_REST_SECONDS,
    demo_video_url: lib.youtubeVideoId
      ? `https://youtu.be/${lib.youtubeVideoId}`
      : null,
    notes: notes.length > 0 ? notes : undefined,
    is_warmup: false,
  };
}

function uniqueEquipment(exercises: ScheduleExercise[]): string[] {
  const set = new Set<string>();
  for (const e of exercises) {
    set.add(deriveEquipmentName(e.exerciseId));
  }
  return Array.from(set);
}

function deriveEquipmentName(id: keyof typeof EXERCISE_LIBRARY): string {
  if (id === 'push-ups' || id === 'chair-squat' || id === '3-phase-sissy-squat' || id === 'wall-15-bicep-curls' || id === 'push-up-from-deficit') {
    return 'bodyweight';
  }
  return 'dumbbells';
}

function estimateDurationMinutes(exercises: WorkoutExercise[]): number {
  if (exercises.length === 0) return 0;
  // Rough budget: 60s working time per set + rest. Capped to a sensible range.
  const seconds = exercises.reduce((acc, e) => {
    const restPerSet = e.rest_seconds ?? DEFAULT_REST_SECONDS;
    return acc + e.target_sets * (60 + restPerSet);
  }, 0);
  return Math.max(15, Math.min(60, Math.round(seconds / 60)));
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/workoutSessionAdapter.ts
git commit -m "$(cat <<'EOF'
Add adapter mapping Workout to WorkoutLibraryItem

Keeps the active logger untouched while the data layer migrates from
useAssignedProgram to lib/workoutSchedule.ts.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: Workout Cards

**Goal:** Ship `WorkoutCard` (real workouts) and `StubWorkoutCard` (coming-soon state). Both are pure, presentational, light-locked, and respect the Pressable+flex layout memory.

**Files:**
- Create: `components/workout/WorkoutCard.tsx`
- Create: `components/workout/StubWorkoutCard.tsx`

### Task 4.1: Write WorkoutCard

- [ ] **Step 1: Write `components/workout/WorkoutCard.tsx`**

```tsx
// components/workout/WorkoutCard.tsx
import { ArrowRight, Dumbbell } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type WorkoutCardProps = {
  title: string;
  helper?: string;
  exerciseCount: number;
  onPress: () => void;
};

export function WorkoutCard({ title, helper, exerciseCount, onPress }: WorkoutCardProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1, flex: 1 })}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.iconRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.cardAlt }]}>
            <Dumbbell color={colors.accent} size={18} strokeWidth={1.8} />
          </View>
          <Text style={[styles.count, { color: colors.mutedText }]}>
            {exerciseCount} {exerciseCount === 1 ? 'EXERCISE' : 'EXERCISES'}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {helper ? (
          <Text style={[styles.helper, { color: colors.mutedText }]} numberOfLines={2}>
            {helper}
          </Text>
        ) : null}
        <View style={styles.ctaRow}>
          <Text style={[styles.cta, { color: COLORS.tangerine }]}>Start</Text>
          <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    minHeight: 148,
    padding: 14,
  },
  count: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
  },
  cta: {
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
  ctaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 'auto',
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  iconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
});
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean.

### Task 4.2: Write StubWorkoutCard

- [ ] **Step 1: Write `components/workout/StubWorkoutCard.tsx`**

```tsx
// components/workout/StubWorkoutCard.tsx
import { Lock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type StubWorkoutCardProps = {
  title: string;
};

export function StubWorkoutCard({ title }: StubWorkoutCardProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.iconRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.cardAlt }]}>
          <Lock color={colors.mutedText} size={16} strokeWidth={1.8} />
        </View>
        <Text style={[styles.badge, { color: colors.mutedText }]}>COMING SOON</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.helper, { color: colors.mutedText }]}>
        Karen and Ryan are loading this one.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    minHeight: 148,
    opacity: 0.78,
    padding: 14,
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  iconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
});
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit both cards**

```bash
git add components/workout/WorkoutCard.tsx components/workout/StubWorkoutCard.tsx
git commit -m "$(cat <<'EOF'
Add WorkoutCard and StubWorkoutCard

Pressable wraps an inner View for layout per the flex memory. Stub card
shows a Lock icon and is non-interactive.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5: Workout Detail Refactor

**Goal:** Replace `app/workout/[id].tsx` to read from `workoutBySlug`. Render the stub state when `exercises.length === 0`. On Start, run the workout through `adaptWorkout` so the existing active workout store + logger continue to work unchanged.

**Files:**
- Modify: `app/workout/[id].tsx` (full replace)

### Task 5.1: Refactor workout detail

- [ ] **Step 1: Overwrite `app/workout/[id].tsx`**

```tsx
// app/workout/[id].tsx
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../hooks/useTheme';
import { useWorkoutSessions } from '../../hooks/useWorkoutSessions';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { exerciseById } from '../../lib/exerciseLibrary';
import { adaptWorkout } from '../../lib/workoutSessionAdapter';
import { isStubWorkout, workoutBySlug } from '../../lib/workoutSchedule';
import type { WorkoutSession } from '../../lib/workouts';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const startSession = useActiveWorkoutStore((state) => state.startSession);
  const { saveSession } = useWorkoutSessions();

  const workout = id ? workoutBySlug(id) : undefined;

  if (!workout) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Workout not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isStubWorkout(workout)) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.kicker, { color: colors.mutedText }]}>BLOCK · {workout.blockId}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{workout.title}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Karen and Ryan are loading this one. The session shape is being finalized.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const startWorkout = async () => {
    if (!session?.user.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const adapted = adaptWorkout(workout);
    const workoutSession: WorkoutSession = {
      id: `local-${Date.now()}`,
      name: adapted.name,
      set_logs: [],
      source_id: adapted.id,
      source_type: 'library',
      started_at: new Date().toISOString(),
      total_duration_seconds: 0,
      total_volume_kg: 0,
      user_id: session.user.id,
    };
    await saveSession(workoutSession);
    startSession(adapted, workoutSession);
    router.push(`/workout/active/${workoutSession.id}`);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>
        <Text style={[styles.kicker, { color: colors.accent }]}>BLOCK · {workout.blockId}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{workout.title}</Text>
        {workout.helper ? (
          <Text style={[styles.body, { color: colors.mutedText }]}>{workout.helper}</Text>
        ) : null}
        <SectionLabel label="EXERCISES" />
        {workout.exercises.map((entry, index) => {
          const lib = exerciseById(entry.exerciseId);
          const primaries = lib.muscleGroups.filter((m) => m.primary);
          return (
            <View
              key={`${entry.exerciseId}-${index}`}
              style={[styles.exercise, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.exerciseTop}>
                <View style={[styles.number, { backgroundColor: colors.cardAlt }]}>
                  <Text style={[styles.numberText, { color: colors.text }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.exerciseName, { color: colors.text }]}>{lib.name}</Text>
              </View>
              <Text style={[styles.target, { color: colors.mutedText }]}>
                {entry.sets} SETS · {entry.reps} REPS · {entry.restSeconds ?? 60}S REST
              </Text>
              <View style={styles.chips}>
                {primaries.map((m) => (
                  <Text
                    key={m.name}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.cardAlt, color: colors.text },
                    ]}
                  >
                    {m.name}
                  </Text>
                ))}
              </View>
              {lib.youtubeVideoId === null ? (
                <Text style={[styles.placeholder, { color: colors.mutedText }]}>
                  Tutorial video coming soon.
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      <View style={[styles.footer, { bottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={startWorkout}
          style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        >
          <View
            style={[
              styles.startButton,
              {
                backgroundColor: COLORS.tangerine,
                shadowColor: COLORS.tangerine,
              },
            ]}
          >
            <Text style={[styles.startText, { color: '#FFFFFF' }]}>Start workout</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  chip: {
    borderRadius: 999,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  content: {
    gap: 14,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  empty: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenX,
  },
  exercise: { borderRadius: 12, borderWidth: 1, gap: 8, padding: 14 },
  exerciseName: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 15 },
  exerciseTop: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  footer: { left: SPACING.screenX, position: 'absolute', right: SPACING.screenX },
  headerRow: { paddingHorizontal: SPACING.screenX, paddingTop: 4 },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  number: { alignItems: 'center', borderRadius: 12, height: 24, justifyContent: 'center', width: 24 },
  numberText: { fontFamily: FONTS.sansBold, fontSize: 12 },
  placeholder: { fontFamily: FONTS.sans, fontSize: 12.5, fontStyle: 'italic' },
  screen: { flex: 1 },
  startButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  startText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: 0.2 },
  target: { fontFamily: FONTS.sansMedium, fontSize: 11, letterSpacing: 1.1 },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
});
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/workout/[id].tsx
git commit -m "$(cat <<'EOF'
Refactor workout detail to read from workoutSchedule

Resolves the id as a Workout slug via workoutBySlug. Renders the stub
state when exercises is empty. Start routes through the adapter so the
active logger continues to work unchanged.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6: Train Tab Refresh

**Goal:** Full replace of `app/(tabs)/train.tsx`. Drop the legacy assigned-program plumbing. Render a 2×2 grid (4 cards) for the current block from `useMembership().membership.currentBlock`.

**Files:**
- Modify: `app/(tabs)/train.tsx` (full replace)

### Task 6.1: Refactor Train tab

- [ ] **Step 1: Overwrite `app/(tabs)/train.tsx`**

```tsx
// app/(tabs)/train.tsx
import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StubWorkoutCard } from '../../components/workout/StubWorkoutCard';
import { WorkoutCard } from '../../components/workout/WorkoutCard';
import { useMembership } from '../../hooks/useMembership';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';
import type { BlockId } from '../../lib/curriculum';
import { isStubWorkout, workoutsForBlock } from '../../lib/workoutSchedule';

export default function TrainScreen() {
  const colors = useThemeColors();
  const { membership } = useMembership();
  const currentBlock: BlockId = (membership.currentBlock ?? 'COMMIT') as BlockId;
  const workouts = workoutsForBlock(currentBlock);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>BLOCK · {currentBlock}</Text>
            <Text style={[styles.title, { color: colors.text }]}>Workouts</Text>
            <Text style={[styles.helper, { color: colors.mutedText }]}>
              Your block has 4 workouts. Find your rhythm.
            </Text>
          </View>

          <View style={styles.grid}>
            {workouts.map((workout) => {
              const stub = isStubWorkout(workout);
              return (
                <View key={workout.slug} style={styles.cell}>
                  {stub ? (
                    <StubWorkoutCard title={workout.title} />
                  ) : (
                    <WorkoutCard
                      title={workout.title}
                      helper={workout.helper}
                      exerciseCount={workout.exercises.length}
                      onPress={() => router.push(`/workout/${workout.slug}`)}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cell: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  content: {
    gap: 18,
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  header: {
    gap: 8,
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  phoneFrame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
});
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean. The old `useAssignedProgram`/`useProfile` imports are gone; if anything else in the app still imports those they continue to work (we left the hooks themselves in place).

- [ ] **Step 3: Verify orphans don't break the build**

Run: `grep -rn "useAssignedProgram\|programs.ts\|workoutSeed" app components hooks lib 2>/dev/null | grep -v "lib/programs.ts\|lib/workoutSeed.ts\|hooks/useAssignedProgram.ts"`

Expected: only consumers OUTSIDE those three files. Anything that still references `useAssignedProgram` and we missed is a typecheck failure. If typecheck is clean, we're good.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/train.tsx
git commit -m "$(cat <<'EOF'
Refresh Train tab to render block-driven workout grid

Drops the legacy useAssignedProgram + intake-keyed program key card.
Reads current_block from useMembership and renders 4 cards from
workoutsForBlock. Commit Workout 1 is start-able; the others are
locked-state stubs.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 7: Final Verification + Smoke Handoff

**Goal:** Whole-app typecheck + manual smoke walkthrough. Update the pending memory.

### Task 7.1: Final typecheck

- [ ] **Step 1: Run typecheck across the whole app**

Run: `npm run typecheck`
Expected: clean.

### Task 7.2: Manual smoke checklist

This is a human-driven walkthrough, not an automated step. Hand the implementer this list:

- [ ] **Step 1: Boot the app in Expo Go or dev-client.**

Run: `npm start`

- [ ] **Step 2: Sign in as dev user.**

- [ ] **Step 3: Navigate to the Train tab.**

Expected: kicker reads "BLOCK · COMMIT". Title is "Workouts". Helper line is "Your block has 4 workouts. Find your rhythm." Grid renders 4 cards.

- [ ] **Step 4: Confirm Workout 1 is start-able.**

Expected: card shows "6 EXERCISES", "Workout 1", helper "Lower body emphasis with dumbbells", and a "Start →" CTA in tangerine.

- [ ] **Step 5: Confirm Workouts 2, 3, 4 are locked.**

Expected: each shows a Lock icon, "COMING SOON" badge, "Karen and Ryan are loading this one." copy. Tapping them is a no-op.

- [ ] **Step 6: Tap Workout 1 → detail page.**

Expected: header "BLOCK · COMMIT" + "Workout 1" + helper. All 6 exercises render with sets/reps/rest and primary muscle group chips. Each exercise shows "Tutorial video coming soon." since YouTube ids are null.

- [ ] **Step 7: Tap "Start workout" → active logger.**

Expected: existing active logger UI mounts. Exercise 1 of 6 visible. Set logger accepts reps/weight/RPE. Progression table is empty (no prior sessions). Rest timer fires on log.

- [ ] **Step 8: Log all 6 exercises through completion.**

Expected: complete screen renders without crashes. `workout_sessions` row written (Supabase mode) or AsyncStorage update (dev mode).

- [ ] **Step 9: Re-open detail for a stub workout.**

Visit `/workout/refine-workout-1` directly via dev menu or by writing a temporary tap target.
Expected: stub state copy renders. No Start button.

### Task 7.3: Update the pending memory

- [ ] **Step 1: Replace `memory/exercise_library_design_pending.md` with a landed memory.**

```bash
mv /Users/johnbryanliwanag/.claude/projects/-Users-johnbryanliwanag-tigerseyelife/memory/exercise_library_design_pending.md /Users/johnbryanliwanag/.claude/projects/-Users-johnbryanliwanag-tigerseyelife/memory/exercise_library_landed.md
```

Then overwrite the file content to a "landed" memory with the same `[[links]]`, noting:
- Library + schedule data lives in `lib/exerciseLibrary.ts` + `lib/workoutSchedule.ts`.
- 18 exercises typed, all with `youtubeVideoId: null` pending Ryan's delivery.
- Commit Workout 1 authored end-to-end; the other 23 are stubs.
- Active logger UI untouched; adapter at `lib/workoutSessionAdapter.ts` is the bridge.

Also update `MEMORY.md` to replace the pending entry with the landed one.

- [ ] **Step 2: Final commit (memory only is outside the repo; nothing to commit here).**

---

## Self-Review

**Spec coverage:**
- §3.1 Exercise library — Phase 1 (18 entries, all required fields)
- §3.2 Workout schedule — Phase 2 (24 entries, helpers exported)
- §3.3 Commit Workout 1 authored — Phase 2 (6 exercises matching the spec draft)
- §3.4 Train tab refresh — Phase 6 (drops `useAssignedProgram`, renders 4 cards)
- §3.5 Workout detail refactor — Phase 5 (reads via `workoutBySlug`, stub state, primary muscle chips, placeholder when video null)
- §3.6 Active logger compatibility — Phase 3 (adapter) keeps the logger untouched
- §3.7 Stub UX — Phase 4 (StubWorkoutCard) + Phase 5 (stub detail state) + Phase 6 (stub cards in grid)
- §6 Definition of done — all 11 checkboxes covered by phases above.

**Placeholders:** None. Every step contains the actual code.

**Type consistency:** `ExerciseId` (Phase 1) is used as a literal union; `Workout` and `WorkoutExercise` from `workoutSchedule.ts` (Phase 2) are imported by the adapter (Phase 3) and the detail screen (Phase 5). `WorkoutLibraryItem` from `lib/workouts.ts` is the adapter's output, consumed by the existing store. `BlockId` is imported from `lib/curriculum.ts` consistently. The Train tab uses `isStubWorkout` and `workoutsForBlock` exported from Phase 2.

**Scope hygiene:** The slice does not delete orphan files (`lib/programs.ts`, `lib/workoutSeed.ts`, `hooks/useAssignedProgram.ts`). They become unreachable from the user-facing surfaces but stay in the repo so this slice's diff is reviewable and a future cleanup slice can do the deletion atomically with any test/spec updates.

---

**Execution handoff:**

Plan complete and saved to `docs/superpowers/plans/2026-06-16-workouts-foundation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per phase, review between phases, fast iteration.

**2. Inline Execution** — Execute phases in this session using executing-plans, batch execution with checkpoints.

Which approach?
