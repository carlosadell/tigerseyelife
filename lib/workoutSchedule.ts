// lib/workoutSchedule.ts
//
// 24 workouts. 6 blocks x 4 slots. AUTHORED entries override the per-slot
// template (LOWER_BODY for slot 1, UPPER_PUSH/UPPER_PULL/FULL_BODY for
// slots 2/3/4). No stubs anywhere.

import type { BlockId } from './curriculum';
import { BLOCK_IDS } from './curriculum';
import type { ExerciseId } from './exerciseLibrary';
import {
  BLOCK_HELPER_BY_SLOT,
  FULL_BODY,
  LOWER_BODY,
  UPPER_PULL,
  UPPER_PUSH,
} from './workoutTemplates';

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

const AUTHORED: Workout[] = [
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
  },
];

function slug(blockId: BlockId, slot: WorkoutSlotIndex): string {
  return `${blockId.toLowerCase()}-workout-${slot}`;
}

function templateFor(slot: WorkoutSlotIndex): readonly WorkoutExercise[] {
  switch (slot) {
    case 1: return LOWER_BODY;
    case 2: return UPPER_PUSH;
    case 3: return UPPER_PULL;
    case 4: return FULL_BODY;
  }
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
        slug: slug(blockId, slot),
        blockId,
        slotIndex: slot,
        title: `Workout ${slot}`,
        helper: BLOCK_HELPER_BY_SLOT[blockId][slot],
        exercises: [...templateFor(slot)],
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

// Kept for backwards compatibility during refactor. Always returns false
// now that every workout has populated exercises. Delete in a follow up.
export function isStubWorkout(_w: Workout): boolean {
  return false;
}
