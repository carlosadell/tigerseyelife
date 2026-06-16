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
