export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutFocus = 'upper' | 'lower' | 'full' | 'mobility' | 'cardio' | 'core';
export type WorkoutSourceType = 'library' | 'program' | 'custom';

export type WorkoutExercise = {
  id: string;
  name: string;
  equipment: string;
  target_sets: number;
  target_reps: string;
  rest_seconds: number;
  demo_video_url?: string | null;
  notes?: string;
  is_warmup: boolean;
};

export type WorkoutLibraryItem = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  equipment: string[];
  difficulty: WorkoutDifficulty;
  focus_area: WorkoutFocus;
  cover_color: string;
  exercises: WorkoutExercise[];
  order_index: number;
};

export type WorkoutSetLog = {
  exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  rpe: number;
  is_warmup: boolean;
  logged_at: string;
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  source_type: WorkoutSourceType;
  source_id?: string | null;
  name: string;
  started_at: string;
  completed_at?: string | null;
  total_volume_kg: number;
  total_duration_seconds: number;
  perceived_effort?: number | null;
  notes?: string | null;
  set_logs: WorkoutSetLog[];
};

export type WorkoutFilters = {
  duration: 'any' | '15' | '30' | '45' | '60';
  equipment: 'any' | 'bodyweight' | 'dumbbells' | 'bands' | 'barbell';
  focus: 'any' | WorkoutFocus;
};

export function filterWorkouts(items: WorkoutLibraryItem[], filters: WorkoutFilters) {
  return items.filter((item) => {
    const durationMatch =
      filters.duration === 'any' ||
      (filters.duration === '15' && item.duration_minutes <= 20) ||
      (filters.duration === '30' && item.duration_minutes === 30) ||
      (filters.duration === '45' && item.duration_minutes === 45) ||
      (filters.duration === '60' && item.duration_minutes >= 60);
    const equipmentMatch =
      filters.equipment === 'any' || item.equipment.includes(filters.equipment);
    const focusMatch = filters.focus === 'any' || item.focus_area === filters.focus;
    return durationMatch && equipmentMatch && focusMatch;
  });
}

export function calculateVolume(setLogs: WorkoutSetLog[]) {
  return setLogs.reduce((total, set) => total + set.reps * set.weight_kg, 0);
}
