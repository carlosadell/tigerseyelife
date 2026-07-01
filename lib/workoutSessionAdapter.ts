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

export function adaptWorkout(workout: Workout, helper?: string): WorkoutLibraryItem {
  const exercises = workout.exercises.map((e, index) =>
    adaptExercise(e, index),
  );
  const equipment = uniqueEquipment(workout.exercises);
  return {
    id: workout.slug,
    name: workout.title,
    description: helper ?? '',
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
