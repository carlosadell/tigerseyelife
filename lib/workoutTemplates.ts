// lib/workoutTemplates.ts
//
// Four distinct workout compositions drawn from the 18-exercise library.
// Used as the default for unauthored (block, slot) pairs so every slot
// has populated exercises. When Karen+Ryan author block-specific Workout
// 1/2/3/4 compositions, those entries land in AUTHORED in workoutSchedule
// and override the template for that slot.

import type { WorkoutExercise } from './workoutSchedule';

export const LOWER_BODY: readonly WorkoutExercise[] = [
  { exerciseId: 'db-squat',         sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-deadlift',      sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-split-squat',   sets: 3, reps: '10 per leg', restSeconds: 60 },
  { exerciseId: 'push-ups',         sets: 3, reps: 'AMRAP', restSeconds: 60 },
  { exerciseId: 'db-bent-over-row', sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: 'biceps-curls',     sets: 2, reps: '12 to 15', restSeconds: 45 },
];

export const UPPER_PUSH: readonly WorkoutExercise[] = [
  { exerciseId: 'db-overhead-press',    sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'push-ups',             sets: 3, reps: 'AMRAP', restSeconds: 60 },
  { exerciseId: 'seated-db-press',      sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'push-up-from-deficit', sets: 3, reps: '6 to 10', restSeconds: 60 },
  { exerciseId: 'biceps-curls',         sets: 2, reps: '12 to 15', restSeconds: 45 },
  { exerciseId: 'wall-15-bicep-curls',  sets: 2, reps: '8 to 10', restSeconds: 45 },
];

export const UPPER_PULL: readonly WorkoutExercise[] = [
  { exerciseId: 'db-deadlift',         sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-bent-over-row',    sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: '1-arm-bor',           sets: 3, reps: '8 to 10 per side', restSeconds: 60 },
  { exerciseId: 'db-bor-reverse-grip', sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'biceps-curls',        sets: 2, reps: '12 to 15', restSeconds: 45 },
];

export const FULL_BODY: readonly WorkoutExercise[] = [
  { exerciseId: 'db-sumo-squat',        sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: 'push-ups',             sets: 3, reps: 'AMRAP', restSeconds: 60 },
  { exerciseId: 'sumo-db-rdl',          sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-bent-over-row',     sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: 'db-stagger-stance-dl', sets: 3, reps: '8 per leg', restSeconds: 60 },
  { exerciseId: 'biceps-curls',         sets: 2, reps: '12 to 15', restSeconds: 45 },
];

export const BLOCK_HELPER_BY_SLOT: Record<
  'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL',
  Record<1 | 2 | 3 | 4, string>
> = {
  COMMIT: {
    1: 'Lower body emphasis with dumbbells',
    2: 'Upper push. Focus on form.',
    3: 'Upper pull. Slow on the lower.',
    4: 'Full body mix. Steady pace.',
  },
  REFINE: {
    1: 'Lower body. Same exercises, more attention.',
    2: 'Upper push. Same exercises, more attention.',
    3: 'Upper pull. Notice your set up before the rep.',
    4: 'Full body. Pause practice between sets.',
  },
  EVOLVE: {
    1: 'Lower body. Drive identity through the rep.',
    2: 'Upper push. Drive identity through the rep.',
    3: 'Upper pull. You are someone who pulls hard.',
    4: 'Full body. Your body knows this now.',
  },
  ADAPT: {
    1: 'Lower body. Use TEB when you want to stop early.',
    2: 'Upper push. Use TEB when you want to stop early.',
    3: 'Upper pull. Bare minimum still counts.',
    4: 'Full body. Flexible is not loose.',
  },
  THRIVE: {
    1: 'Lower body. Notice what is automatic now.',
    2: 'Upper push. Notice what is automatic now.',
    3: 'Upper pull. Progressive overload is your default.',
    4: 'Full body. This is what trained looks like.',
  },
  EXCEL: {
    1: 'Lower body. This is your lifestyle now.',
    2: 'Upper push. This is your lifestyle now.',
    3: 'Upper pull. Maintain mastery.',
    4: 'Full body. The systems are running you.',
  },
};
