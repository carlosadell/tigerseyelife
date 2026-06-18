import type { ExerciseId } from './exerciseLibrary';
import { WorkoutSession, WorkoutSetLog } from './workouts';

// Dev-mode seed history for the Train tab and the exercise detail
// "Your history" view. Three sessions of COMMIT Workout 1 spaced one
// week apart, with progression that tells Karen's worked story:
// most exercises step up across the three weeks, a couple plateau
// then push, push-ups grow in reps rather than weight.
//
// Weights are stored in kg (schema is SI). The values below were
// chosen so the lbs display formatter (lib/units.ts) renders clean
// numbers — 15lb, 17.5lb, 20lb, etc.

type SetRow = { reps: number; weight_kg: number; rpe: number };
type ExerciseRow = {
  exercise_id: ExerciseId;
  is_warmup: boolean;
  sets: SetRow[];
};

const session21Days: ExerciseRow[] = [
  { exercise_id: 'db-squat',         is_warmup: false, sets: row(3, 10, 6.80, 7) },
  { exercise_id: 'db-deadlift',      is_warmup: false, sets: row(3, 10, 9.07, 7) },
  { exercise_id: 'db-split-squat',   is_warmup: false, sets: row(3, 10, 4.54, 7) },
  { exercise_id: 'push-ups',         is_warmup: false, sets: row(3,  8, 0,    7) },
  { exercise_id: 'db-bent-over-row', is_warmup: false, sets: row(3, 12, 6.80, 7) },
  { exercise_id: 'biceps-curls',     is_warmup: false, sets: row(2, 14, 3.63, 6) },
];

const session14Days: ExerciseRow[] = [
  { exercise_id: 'db-squat',         is_warmup: false, sets: row(3, 10, 7.94, 8) },
  { exercise_id: 'db-deadlift',      is_warmup: false, sets: row(3, 10, 10.21, 8) },
  { exercise_id: 'db-split-squat',   is_warmup: false, sets: row(3, 10, 4.54, 8) },
  { exercise_id: 'push-ups',         is_warmup: false, sets: row(3, 10, 0,    7) },
  { exercise_id: 'db-bent-over-row', is_warmup: false, sets: row(3, 12, 7.94, 8) },
  { exercise_id: 'biceps-curls',     is_warmup: false, sets: row(2, 14, 4.54, 7) },
];

const session7Days: ExerciseRow[] = [
  { exercise_id: 'db-squat',         is_warmup: false, sets: row(3,  9, 9.07, 8) },
  { exercise_id: 'db-deadlift',      is_warmup: false, sets: row(3,  9, 11.34, 8) },
  { exercise_id: 'db-split-squat',   is_warmup: false, sets: row(3, 10, 5.67, 8) },
  { exercise_id: 'push-ups',         is_warmup: false, sets: row(3, 12, 0,    8) },
  { exercise_id: 'db-bent-over-row', is_warmup: false, sets: row(3, 11, 7.94, 8) },
  { exercise_id: 'biceps-curls',     is_warmup: false, sets: row(2, 14, 4.54, 7) },
];

const HISTORY: Record<number, ExerciseRow[]> = {
  21: session21Days,
  14: session14Days,
  7: session7Days,
};

function row(count: number, reps: number, weight_kg: number, rpe: number): SetRow[] {
  return Array.from({ length: count }, () => ({ reps, weight_kg, rpe }));
}

export function buildWorkoutHistorySeed(userId: string): WorkoutSession[] {
  const sessions: WorkoutSession[] = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (const [daysAgoKey, exercises] of Object.entries(HISTORY)) {
    const daysAgo = Number(daysAgoKey);
    const startedAt = new Date(now - daysAgo * day);
    const completedAt = new Date(startedAt.getTime() + 32 * 60 * 1000);
    const setLogs: WorkoutSetLog[] = [];

    for (const row of exercises) {
      row.sets.forEach((set, index) => {
        setLogs.push({
          exercise_id: row.exercise_id,
          is_warmup: row.is_warmup,
          logged_at: startedAt.toISOString(),
          reps: set.reps,
          rpe: set.rpe,
          set_number: index + 1,
          weight_kg: set.weight_kg,
        });
      });
    }

    sessions.push({
      completed_at: completedAt.toISOString(),
      id: `seed-history-${daysAgo}`,
      name: 'Workout 1',
      notes: null,
      perceived_effort: 7,
      set_logs: setLogs,
      source_id: 'commit-workout-1',
      source_type: 'library',
      started_at: startedAt.toISOString(),
      total_duration_seconds: 32 * 60,
      total_volume_kg: setLogs.reduce((acc, log) => acc + log.weight_kg * log.reps, 0),
      user_id: userId,
    });
  }

  return sessions;
}
