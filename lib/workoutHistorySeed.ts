import { WorkoutSession, WorkoutSetLog } from './workouts';

type ExerciseHistoryRow = {
  exercise_id: string;
  is_warmup: boolean;
  sets: Array<{ reps: number; weight_kg: number; rpe: number }>;
};

const lowerBodyAHistory: Record<number, ExerciseHistoryRow[]> = {
  21: [
    { exercise_id: 'ex_1', is_warmup: true, sets: [{ reps: 0, weight_kg: 0, rpe: 0 }] },
    {
      exercise_id: 'ex_2',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 15, rpe: 7 },
        { reps: 10, weight_kg: 15, rpe: 7 },
        { reps: 8, weight_kg: 17.5, rpe: 8 },
        { reps: 8, weight_kg: 17.5, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_3',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 17.5, rpe: 7 },
        { reps: 10, weight_kg: 17.5, rpe: 7 },
        { reps: 10, weight_kg: 20, rpe: 8 },
        { reps: 8, weight_kg: 20, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_4',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 10, rpe: 7 },
        { reps: 10, weight_kg: 10, rpe: 7 },
        { reps: 10, weight_kg: 12.5, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_5',
      is_warmup: false,
      sets: [
        { reps: 15, weight_kg: 0, rpe: 6 },
        { reps: 15, weight_kg: 0, rpe: 6 },
        { reps: 12, weight_kg: 10, rpe: 7 },
      ],
    },
    {
      exercise_id: 'ex_6',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 0, rpe: 6 },
        { reps: 10, weight_kg: 0, rpe: 7 },
        { reps: 10, weight_kg: 0, rpe: 7 },
      ],
    },
  ],
  14: [
    { exercise_id: 'ex_1', is_warmup: true, sets: [{ reps: 0, weight_kg: 0, rpe: 0 }] },
    {
      exercise_id: 'ex_2',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 17.5, rpe: 7 },
        { reps: 10, weight_kg: 17.5, rpe: 8 },
        { reps: 9, weight_kg: 20, rpe: 8 },
        { reps: 8, weight_kg: 20, rpe: 9 },
      ],
    },
    {
      exercise_id: 'ex_3',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 20, rpe: 7 },
        { reps: 10, weight_kg: 20, rpe: 7 },
        { reps: 10, weight_kg: 22.5, rpe: 8 },
        { reps: 8, weight_kg: 22.5, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_4',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 12.5, rpe: 7 },
        { reps: 10, weight_kg: 12.5, rpe: 7 },
        { reps: 10, weight_kg: 12.5, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_5',
      is_warmup: false,
      sets: [
        { reps: 15, weight_kg: 10, rpe: 7 },
        { reps: 15, weight_kg: 10, rpe: 7 },
        { reps: 12, weight_kg: 12.5, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_6',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 0, rpe: 7 },
        { reps: 10, weight_kg: 0, rpe: 7 },
        { reps: 10, weight_kg: 0, rpe: 7 },
      ],
    },
  ],
  7: [
    { exercise_id: 'ex_1', is_warmup: true, sets: [{ reps: 0, weight_kg: 0, rpe: 0 }] },
    {
      exercise_id: 'ex_2',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 20, rpe: 7 },
        { reps: 10, weight_kg: 20, rpe: 8 },
        { reps: 10, weight_kg: 22.5, rpe: 8 },
        { reps: 8, weight_kg: 22.5, rpe: 9 },
      ],
    },
    {
      exercise_id: 'ex_3',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 22.5, rpe: 7 },
        { reps: 10, weight_kg: 22.5, rpe: 7 },
        { reps: 10, weight_kg: 25, rpe: 8 },
        { reps: 8, weight_kg: 25, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_4',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 12.5, rpe: 7 },
        { reps: 10, weight_kg: 12.5, rpe: 8 },
        { reps: 10, weight_kg: 15, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_5',
      is_warmup: false,
      sets: [
        { reps: 15, weight_kg: 12.5, rpe: 7 },
        { reps: 15, weight_kg: 12.5, rpe: 8 },
        { reps: 12, weight_kg: 15, rpe: 8 },
      ],
    },
    {
      exercise_id: 'ex_6',
      is_warmup: false,
      sets: [
        { reps: 10, weight_kg: 0, rpe: 7 },
        { reps: 10, weight_kg: 0, rpe: 7 },
        { reps: 10, weight_kg: 0, rpe: 7 },
      ],
    },
  ],
};

export function buildWorkoutHistorySeed(userId: string): WorkoutSession[] {
  const sessions: WorkoutSession[] = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (const [daysAgoKey, exercises] of Object.entries(lowerBodyAHistory)) {
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
      source_id: 'seed-lower-body-a',
      source_type: 'library',
      started_at: startedAt.toISOString(),
      total_duration_seconds: 32 * 60,
      total_volume_kg: setLogs.reduce((acc, log) => acc + log.weight_kg * log.reps, 0),
      user_id: userId,
    });
  }

  return sessions;
}
