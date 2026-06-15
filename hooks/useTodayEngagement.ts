import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';

import { useAuth } from './useAuth';
import { useWorkoutSessions } from './useWorkoutSessions';

const WATER_TARGET = 8;
const WATER_CAP = 14;

export type EngagementState = {
  walk: boolean;
  water: number;
  sleep: boolean;
};

const empty: EngagementState = { walk: false, water: 0, sleep: false };

export function useTodayEngagement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id ?? 'anonymous';
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const storageKey = `tel:engagement:${userId}:${today}`;
  const queryKey = useMemo(() => ['today-engagement', userId, today], [userId, today]);
  const { sessions: workoutSessions } = useWorkoutSessions();

  const { data: state, isLoading } = useQuery<EngagementState>({
    queryKey,
    queryFn: async () => {
      const raw = await AsyncStorage.getItem(storageKey);
      if (!raw) return empty;
      try {
        const parsed = JSON.parse(raw) as Partial<EngagementState>;
        return { ...empty, ...parsed };
      } catch {
        return empty;
      }
    },
    initialData: empty,
  });

  const workoutDone = useMemo(() => {
    return workoutSessions.some((s) => {
      if (!s.completed_at) return false;
      return format(new Date(s.completed_at), 'yyyy-MM-dd') === today;
    });
  }, [workoutSessions, today]);

  const persist = useCallback(
    async (next: EngagementState) => {
      queryClient.setQueryData(queryKey, next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      queryClient.invalidateQueries({ queryKey: ['engagement-dates', userId] });
    },
    [queryClient, queryKey, storageKey, userId],
  );

  const toggleWalk = useCallback(
    () => persist({ ...state, walk: !state.walk }),
    [persist, state],
  );
  const addWater = useCallback(
    () => persist({ ...state, water: Math.min(WATER_CAP, state.water + 1) }),
    [persist, state],
  );
  const toggleSleep = useCallback(
    () => persist({ ...state, sleep: !state.sleep }),
    [persist, state],
  );

  return {
    engagement: state,
    loaded: !isLoading,
    workoutDone,
    waterTarget: WATER_TARGET,
    toggleWalk,
    addWater,
    toggleSleep,
  };
}
