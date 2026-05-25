import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';

import { useAuth } from './useAuth';
import { useWorkoutSessions } from './useWorkoutSessions';
import { LoggedMeal } from '../lib/meals';
import { getPowerBlock, PowerLetter } from '../lib/powerBlocks';

type HistoryEngagement = {
  walk: boolean;
  water: number;
  sleep: boolean;
};

type HistoryPowerEntry = {
  blockId: string;
  blockName: string;
  actionId: string;
  letter: PowerLetter;
  description: string;
};

export type HistoryDay = {
  meals: LoggedMeal[];
  engagement: HistoryEngagement;
  powerActions: HistoryPowerEntry[];
  workoutNames: string[];
  hasAnyEngagement: boolean;
};

export function useHistoryDay(dateKey: string) {
  const { session } = useAuth();
  const userId = session?.user.id ?? 'anonymous';
  const { sessions: workoutSessions } = useWorkoutSessions();

  const query = useQuery({
    enabled: Boolean(dateKey),
    queryKey: ['history-day', userId, dateKey],
    queryFn: () => fetchHistoryDay(userId, dateKey),
  });

  return useMemo(() => {
    const local = query.data;
    const workoutNames = workoutSessions
      .filter((s) => s.completed_at && format(new Date(s.completed_at), 'yyyy-MM-dd') === dateKey)
      .map((s) => s.name);
    if (!local) {
      return {
        loading: query.isLoading,
        day: null as HistoryDay | null,
      };
    }
    const hasAnyEngagement =
      local.meals.length > 0 ||
      local.engagement.walk ||
      local.engagement.water > 0 ||
      local.engagement.sleep ||
      local.powerActions.length > 0 ||
      workoutNames.length > 0;
    return {
      loading: false,
      day: { ...local, workoutNames, hasAnyEngagement } as HistoryDay,
    };
  }, [query.data, query.isLoading, workoutSessions, dateKey]);
}

async function fetchHistoryDay(
  userId: string,
  dateKey: string,
): Promise<Omit<HistoryDay, 'workoutNames' | 'hasAnyEngagement'>> {
  const meals = await loadMeals(userId, dateKey);
  const engagement = await loadEngagement(userId, dateKey);
  const powerActions = await loadPowerActions(userId, dateKey);
  return { meals, engagement, powerActions };
}

async function loadMeals(userId: string, dateKey: string): Promise<LoggedMeal[]> {
  try {
    const raw = await AsyncStorage.getItem(`tel:meals-logged:${userId}:${dateKey}`);
    if (!raw) return [];
    return JSON.parse(raw) as LoggedMeal[];
  } catch {
    return [];
  }
}

async function loadEngagement(userId: string, dateKey: string): Promise<HistoryEngagement> {
  try {
    const raw = await AsyncStorage.getItem(`tel:engagement:${userId}:${dateKey}`);
    if (!raw) return { walk: false, water: 0, sleep: false };
    const parsed = JSON.parse(raw) as Partial<HistoryEngagement>;
    return {
      walk: Boolean(parsed.walk),
      water: typeof parsed.water === 'number' ? parsed.water : 0,
      sleep: Boolean(parsed.sleep),
    };
  } catch {
    return { walk: false, water: 0, sleep: false };
  }
}

async function loadPowerActions(userId: string, dateKey: string): Promise<HistoryPowerEntry[]> {
  const prefix = `tel:power-progress:${userId}:`;
  const allKeys = await AsyncStorage.getAllKeys();
  const blockKeys = allKeys.filter((k) => k.startsWith(prefix));
  if (blockKeys.length === 0) return [];

  const entries = await AsyncStorage.multiGet(blockKeys);
  const out: HistoryPowerEntry[] = [];
  for (const [key, value] of entries) {
    if (!value) continue;
    const blockId = key.slice(prefix.length);
    const block = getPowerBlock(blockId);
    if (!block) continue;
    let parsed: Record<string, Record<string, boolean>> = {};
    try {
      parsed = JSON.parse(value);
    } catch {
      continue;
    }
    for (const action of block.actions) {
      if (parsed[action.id]?.[dateKey]) {
        out.push({
          blockId,
          blockName: block.name,
          actionId: action.id,
          letter: action.letter,
          description: action.description,
        });
      }
    }
  }
  return out;
}
