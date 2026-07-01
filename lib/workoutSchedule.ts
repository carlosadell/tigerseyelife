// lib/workoutSchedule.ts
//
// Four canonical workouts, fixed for 12 weeks. Progression comes from
// weights going up, not from block-specific workout variation.
// Block context (helper copy, kicker) is overlaid at render time via
// getBlockHelper — a Workout entity has no blockId of its own.

import type { BlockId } from './program';
import type { ExerciseId } from './exerciseLibrary';
import { BLOCK_HELPER_BY_SLOT, FULL_BODY, LOWER_BODY, UPPER_PULL, UPPER_PUSH } from './workoutTemplates';

export type WorkoutSlug = 'workout-1' | 'workout-2' | 'workout-3' | 'workout-4';
export const WORKOUT_SLUGS: readonly WorkoutSlug[] = [
  'workout-1',
  'workout-2',
  'workout-3',
  'workout-4',
] as const;

export type WorkoutSlotIndex = 1 | 2 | 3 | 4;
export const WORKOUT_SLOT_INDICES: readonly WorkoutSlotIndex[] = [1, 2, 3, 4];

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
  { slug: 'workout-1', slotIndex: 1, title: 'Workout 1', exercises: [...LOWER_BODY] },
  { slug: 'workout-2', slotIndex: 2, title: 'Workout 2', exercises: [...UPPER_PUSH] },
  { slug: 'workout-3', slotIndex: 3, title: 'Workout 3', exercises: [...UPPER_PULL] },
  { slug: 'workout-4', slotIndex: 4, title: 'Workout 4', exercises: [...FULL_BODY] },
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
