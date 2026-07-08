import type { ExerciseId } from './exerciseLibrary';
import { WorkoutSession, WorkoutSetLog } from './workouts';

// Dev-mode seed history for the Train tab and the exercise detail
// "Your history" view. Under Karen's single-movement model, each
// workout is one exercise, so a session logs sets against just that
// movement. This seed produces 3 sessions per workout spaced one
// week apart, showing Karen's worked story: weight steps up across
// weeks; push-ups (bodyweight) grow in reps instead.
//
// Weights are stored in kg (schema is SI). Values are chosen so the
// lbs display formatter (lib/units.ts) renders clean numbers
// (15lb, 17.5lb, 20lb, etc.).

type SetRow = { reps: number; weight_kg: number; rpe: number };

type WorkoutSeed = {
  slug: 'workout-1' | 'workout-2' | 'workout-3' | 'workout-4';
  exerciseId: ExerciseId;
  displayName: string;
  // Sessions keyed by days-ago (21, 14, 7). Each session has a
  // sets array — the primary lift, N working sets that week.
  sessionsByDaysAgo: Record<number, SetRow[]>;
};

const WORKOUT_SEEDS: readonly WorkoutSeed[] = [
  {
    slug: 'workout-1',
    exerciseId: 'db-squat',
    displayName: 'Workout 1',
    sessionsByDaysAgo: {
      21: row(3, 10, 6.80, 7),
      14: row(3, 10, 7.94, 8),
      7: row(3, 9, 9.07, 8),
    },
  },
  {
    slug: 'workout-2',
    exerciseId: 'db-deadlift',
    displayName: 'Workout 2',
    sessionsByDaysAgo: {
      21: row(3, 10, 9.07, 7),
      14: row(3, 10, 10.21, 8),
      7: row(3, 9, 11.34, 8),
    },
  },
  {
    slug: 'workout-3',
    exerciseId: 'push-ups',
    displayName: 'Workout 3',
    sessionsByDaysAgo: {
      21: row(3, 8, 0, 7),
      14: row(3, 10, 0, 7),
      7: row(3, 12, 0, 8),
    },
  },
  {
    slug: 'workout-4',
    exerciseId: 'db-bent-over-row',
    displayName: 'Workout 4',
    sessionsByDaysAgo: {
      21: row(3, 12, 6.80, 7),
      14: row(3, 12, 7.94, 8),
      7: row(3, 11, 7.94, 8),
    },
  },
];

function row(count: number, reps: number, weight_kg: number, rpe: number): SetRow[] {
  return Array.from({ length: count }, () => ({ reps, weight_kg, rpe }));
}

export function buildWorkoutHistorySeed(userId: string): WorkoutSession[] {
  const sessions: WorkoutSession[] = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (const workout of WORKOUT_SEEDS) {
    for (const [daysAgoKey, sets] of Object.entries(workout.sessionsByDaysAgo)) {
      const daysAgo = Number(daysAgoKey);
      const startedAt = new Date(now - daysAgo * day);
      const completedAt = new Date(startedAt.getTime() + 18 * 60 * 1000);
      const setLogs: WorkoutSetLog[] = sets.map((set, index) => ({
        exercise_id: workout.exerciseId,
        is_warmup: false,
        logged_at: startedAt.toISOString(),
        reps: set.reps,
        rpe: set.rpe,
        set_number: index + 1,
        weight_kg: set.weight_kg,
      }));

      sessions.push({
        completed_at: completedAt.toISOString(),
        id: `seed-history-${workout.slug}-${daysAgo}`,
        name: workout.displayName,
        notes: null,
        perceived_effort: 7,
        set_logs: setLogs,
        source_id: workout.slug,
        source_type: 'library',
        started_at: startedAt.toISOString(),
        total_duration_seconds: 18 * 60,
        total_volume_kg: setLogs.reduce((acc, log) => acc + log.weight_kg * log.reps, 0),
        user_id: userId,
      });
    }
  }

  return sessions;
}
