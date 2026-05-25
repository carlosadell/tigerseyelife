import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import { useWorkoutSessions } from './useWorkoutSessions';

const WATER_TARGET = 8;
const WATER_CAP = 14;

export type EngagementState = {
  walk: boolean;
  water: number;
  sleep: boolean;
  otherMovement: string[];
};

const empty: EngagementState = { walk: false, water: 0, sleep: false, otherMovement: [] };

export function useTodayEngagement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id ?? 'anonymous';
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const storageKey = `tel:engagement:${userId}:${today}`;
  const { sessions: workoutSessions } = useWorkoutSessions();

  const [state, setState] = useState<EngagementState>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<EngagementState>;
          setState({ ...empty, ...parsed });
        } catch {
          setState(empty);
        }
      } else {
        setState(empty);
      }
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const workoutDone = useMemo(() => {
    return workoutSessions.some((s) => {
      if (!s.completed_at) return false;
      return format(new Date(s.completed_at), 'yyyy-MM-dd') === today;
    });
  }, [workoutSessions, today]);

  const persist = useCallback(
    async (next: EngagementState) => {
      setState(next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      queryClient.invalidateQueries({ queryKey: ['engagement-dates', userId] });
    },
    [queryClient, storageKey, userId],
  );

  const toggleWalk = useCallback(() => persist({ ...state, walk: !state.walk }), [persist, state]);
  const addWater = useCallback(
    () => persist({ ...state, water: Math.min(WATER_CAP, state.water + 1) }),
    [persist, state],
  );
  const resetWater = useCallback(() => persist({ ...state, water: 0 }), [persist, state]);
  const toggleSleep = useCallback(
    () => persist({ ...state, sleep: !state.sleep }),
    [persist, state],
  );
  const addOtherMovement = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return Promise.resolve();
      if (state.otherMovement.includes(trimmed)) return Promise.resolve();
      return persist({ ...state, otherMovement: [...state.otherMovement, trimmed] });
    },
    [persist, state],
  );

  return {
    engagement: state,
    loaded,
    workoutDone,
    waterTarget: WATER_TARGET,
    waterCap: WATER_CAP,
    toggleWalk,
    addWater,
    resetWater,
    toggleSleep,
    addOtherMovement,
  };
}
