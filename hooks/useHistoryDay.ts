import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';

import { useAuth } from './useAuth';
import { useWorkoutSessions } from './useWorkoutSessions';
import { LoggedMeal } from '../lib/meals';
import { getPowerBlock, PowerLetter } from '../lib/powerBlocks';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

type HistoryEngagement = {
  walk: boolean;
  water: number;
  sleep: boolean;
};

export type HistoryMood = 'strong' | 'steady' | 'drained';

export type HistoryEntry = {
  intention: string | null;
  mood: HistoryMood | null;
  reflection: string | null;
  movementTags: string[];
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
  entry: HistoryEntry;
  workoutNames: string[];
  hasAnyEngagement: boolean;
};

const EMPTY_ENTRY: HistoryEntry = {
  intention: null,
  mood: null,
  reflection: null,
  movementTags: [],
};

export function useHistoryDay(dateKey: string) {
  const { session, isDevSession } = useAuth();
  const userId = session?.user.id ?? 'anonymous';
  const { sessions: workoutSessions } = useWorkoutSessions();

  const query = useQuery({
    enabled: Boolean(dateKey),
    queryKey: ['history-day', userId, dateKey, isDevSession],
    queryFn: () => fetchHistoryDay(userId, dateKey, isDevSession),
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
    const hasEntry =
      Boolean(local.entry.intention) ||
      Boolean(local.entry.mood) ||
      Boolean(local.entry.reflection) ||
      local.entry.movementTags.length > 0;
    const hasAnyEngagement =
      local.meals.length > 0 ||
      local.engagement.walk ||
      local.engagement.water > 0 ||
      local.engagement.sleep ||
      local.powerActions.length > 0 ||
      hasEntry ||
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
  isDevSession: boolean,
): Promise<Omit<HistoryDay, 'workoutNames' | 'hasAnyEngagement'>> {
  const meals = await loadMeals(userId, dateKey);
  const engagement = await loadEngagement(userId, dateKey);
  const powerActions = await loadPowerActions(userId, dateKey);
  const entry = await loadEntry(userId, dateKey, isDevSession);
  return { meals, engagement, powerActions, entry };
}

async function loadEntry(
  userId: string,
  dateKey: string,
  isDevSession: boolean,
): Promise<HistoryEntry> {
  const useLocal = !hasSupabaseConfig || !supabase || isDevSession;
  if (useLocal) {
    try {
      const raw = await AsyncStorage.getItem(`tel:daily-entry:${userId}:${dateKey}`);
      if (!raw) return EMPTY_ENTRY;
      const parsed = JSON.parse(raw) as Partial<HistoryEntry>;
      return {
        intention: parsed.intention ?? null,
        mood: (parsed.mood as HistoryMood | null) ?? null,
        reflection: parsed.reflection ?? null,
        movementTags: parsed.movementTags ?? [],
      };
    } catch {
      return EMPTY_ENTRY;
    }
  }

  const { data } = await supabase!
    .from('daily_entries')
    .select('intention,mood,movement_tags,reflection')
    .eq('user_id', userId)
    .eq('entry_date', dateKey)
    .maybeSingle();
  if (!data) return EMPTY_ENTRY;
  return {
    intention: data.intention ?? null,
    mood: (data.mood as HistoryMood | null) ?? null,
    reflection: data.reflection ?? null,
    movementTags: data.movement_tags ?? [],
  };
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
