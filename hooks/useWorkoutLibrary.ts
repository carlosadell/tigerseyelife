import { useQuery } from '@tanstack/react-query';

import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { workoutLibrarySeed } from '../lib/workoutSeed';
import {
  filterWorkouts,
  WorkoutFilters,
  WorkoutLibraryItem,
} from '../lib/workouts';

export function useWorkoutLibrary(filters: WorkoutFilters) {
  return useQuery({
    queryKey: ['workout-library', filters],
    queryFn: async () => {
      const items = await fetchWorkoutLibrary();
      return filterWorkouts(items, filters);
    },
  });
}

export async function fetchWorkoutLibrary(): Promise<WorkoutLibraryItem[]> {
  if (!hasSupabaseConfig || !supabase) return workoutLibrarySeed;

  const { data, error } = await supabase
    .from('workout_library')
    .select('*')
    .eq('published', true)
    .order('order_index', { ascending: true });

  if (error) return workoutLibrarySeed;
  return (data ?? []) as WorkoutLibraryItem[];
}
