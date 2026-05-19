import { useQuery } from '@tanstack/react-query';

import { fetchWorkoutLibrary } from './useWorkoutLibrary';

export function useWorkout(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ['workout', id],
    queryFn: async () => {
      const items = await fetchWorkoutLibrary();
      return items.find((item) => item.id === id) ?? null;
    },
  });
}
