// lib/workoutSchedule.ts
//
// Four canonical workouts, fixed for 12 weeks. Under Karen's model
// (clarified 2026-07-08) each "workout" is ONE specific movement —
// not a session containing multiple exercises. Members do the same
// 4 movements every training rotation; progression comes from
// weights and reps going up, not from adding movements.
//
// Which 4 movements a member sees is programmed per-user via the
// deterministic onboarding-key → program assignment. Until that
// assignment logic lands, the default cohort below uses the four
// fundamental movement patterns:
//   Workout 1 = DB Squat        (squat pattern)
//   Workout 2 = DB Deadlift     (hinge pattern)
//   Workout 3 = Push Ups        (push pattern)
//   Workout 4 = DB Bent Over Row (pull pattern)
//
// Block context (helper copy shown alongside the workout in Today
// or Train) is overlaid at render time via getBlockHelper — a
// Workout entity has no blockId of its own.

import type { BlockId } from './program';
import type { ExerciseId } from './exerciseLibrary';
import { BLOCK_HELPER_BY_SLOT } from './workoutTemplates';

export type WorkoutSlug = 'workout-1' | 'workout-2' | 'workout-3' | 'workout-4';
export const WORKOUT_SLUGS: readonly WorkoutSlug[] = [
  'workout-1',
  'workout-2',
  'workout-3',
  'workout-4',
] as const;

export type WorkoutSlotIndex = 1 | 2 | 3 | 4;
export const WORKOUT_SLOT_INDICES: readonly WorkoutSlotIndex[] = [1, 2, 3, 4];

// A "WorkoutExercise" is a single primary movement — under the
// one-movement-per-workout model this array will always have length
// 1. Kept as an array for backward compatibility with the active
// session logger, but semantically it is one movement.
export type WorkoutExercise = {
  exerciseId: ExerciseId;
  sets: number;
  reps: string;
  notes?: string;
  restSeconds?: number;
};

export type Workout = {
  slug: WorkoutSlug;
  slotIndex: WorkoutSlotIndex;
  title: string;
  exercises: WorkoutExercise[];
};

// A Workout paired with the current block's helper copy. Returned by
// workoutsForBlock so consumers that render inside a block context
// (Today, Train) get the block-specific framing without reaching into
// BLOCK_HELPER_BY_SLOT themselves.
export type BlockContextualWorkout = Workout & { helper: string };

export const WORKOUTS: readonly Workout[] = [
  {
    slug: 'workout-1',
    slotIndex: 1,
    title: 'Workout 1',
    exercises: [
      { exerciseId: 'db-squat', sets: 3, reps: '8 to 12', restSeconds: 60 },
    ],
  },
  {
    slug: 'workout-2',
    slotIndex: 2,
    title: 'Workout 2',
    exercises: [
      { exerciseId: 'db-deadlift', sets: 3, reps: '8 to 12', restSeconds: 60 },
    ],
  },
  {
    slug: 'workout-3',
    slotIndex: 3,
    title: 'Workout 3',
    exercises: [
      { exerciseId: 'push-ups', sets: 3, reps: 'AMRAP', restSeconds: 60 },
    ],
  },
  {
    slug: 'workout-4',
    slotIndex: 4,
    title: 'Workout 4',
    exercises: [
      { exerciseId: 'db-bent-over-row', sets: 3, reps: '10 to 12', restSeconds: 60 },
    ],
  },
];

export function workoutBySlug(slug: string): Workout | undefined {
  return WORKOUTS.find((w) => w.slug === slug);
}

export function workoutsForBlock(blockId: BlockId): BlockContextualWorkout[] {
  return WORKOUTS.map((w) => ({
    ...w,
    helper: BLOCK_HELPER_BY_SLOT[blockId][w.slotIndex],
  }));
}

// Convenience for the single-movement model: the sole movement entry
// of a workout. Callers can use this to avoid reaching for
// `workout.exercises[0]` at every render site.
export function movementFor(workout: Workout): WorkoutExercise {
  return workout.exercises[0];
}
