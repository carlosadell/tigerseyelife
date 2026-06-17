import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useMemo } from 'react';

import { useAuth } from './useAuth';
import { useWorkoutSessions } from './useWorkoutSessions';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

const LOOKBACK_DAYS = 90;

/**
 * Returns the set of yyyy-MM-dd dates on which the user had ANY engagement
 * (logged daily entry, completed workout, toggled a POWER action, logged a
 * meal, or wrote a hydration/sleep/walk event). Used by streak math AND the
 * WeekStrip dot indicators.
 */
export function useEngagementDates() {
  const { session, isDevSession } = useAuth();
  const userId = session?.user.id;
  const { sessions: workoutSessions } = useWorkoutSessions();

  const fromStorageQuery = useQuery({
    enabled: Boolean(userId),
    queryKey: ['engagement-dates', userId, isDevSession],
    queryFn: () => fetchEngagementDates(userId!, isDevSession),
  });

  const dates = useMemo(() => {
    const set = new Set<string>(fromStorageQuery.data ?? []);
    for (const ws of workoutSessions) {
      if (!ws.completed_at) continue;
      set.add(format(new Date(ws.completed_at), 'yyyy-MM-dd'));
    }
    return set;
  }, [fromStorageQuery.data, workoutSessions]);

  return { dates, loading: fromStorageQuery.isLoading };
}

async function fetchEngagementDates(userId: string, isDevSession: boolean): Promise<string[]> {
  const dates = new Set<string>();
  const useLocal = !hasSupabaseConfig || !supabase || isDevSession;

  if (useLocal) {
    const dailyKeyPrefix = `tel:daily-entry:${userId}:`;
    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      if (key.startsWith(dailyKeyPrefix)) {
        dates.add(key.slice(dailyKeyPrefix.length));
      }
    }

    const actionsKey = `tel:daily-actions:${userId}`;
    const raw = await AsyncStorage.getItem(actionsKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { completedDate?: string }[];
        for (const r of parsed) {
          if (r.completedDate) dates.add(r.completedDate);
        }
      } catch {
        // ignore malformed payload
      }
    }
  } else if (supabase) {
    const since = format(subDays(new Date(), LOOKBACK_DAYS), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('daily_entries')
      .select('entry_date')
      .eq('user_id', userId)
      .gte('entry_date', since);
    for (const row of data ?? []) {
      if (row.entry_date) dates.add(row.entry_date);
    }

    const { data: actionData } = await supabase
      .from('user_daily_actions')
      .select('completed_date')
      .eq('user_id', userId)
      .gte('completed_date', since);
    for (const row of actionData ?? []) {
      if (row.completed_date) dates.add(row.completed_date);
    }
  }

  const powerPrefix = `tel:power-progress:${userId}:`;
  const engagementPrefix = `tel:engagement:${userId}:`;
  const mealsPrefix = `tel:meals-logged:${userId}:`;
  const allKeys = await AsyncStorage.getAllKeys();

  const powerKeys = allKeys.filter((k) => k.startsWith(powerPrefix));
  if (powerKeys.length > 0) {
    const entries = await AsyncStorage.multiGet(powerKeys);
    for (const [, value] of entries) {
      if (!value) continue;
      const parsed = safeParseProgress(value);
      if (!parsed) continue;
      for (const perDay of Object.values(parsed)) {
        for (const [day, checked] of Object.entries(perDay)) {
          if (checked) dates.add(day);
        }
      }
    }
  }

  for (const key of allKeys) {
    if (key.startsWith(engagementPrefix)) {
      dates.add(key.slice(engagementPrefix.length));
    } else if (key.startsWith(mealsPrefix)) {
      dates.add(key.slice(mealsPrefix.length));
    }
  }

  return Array.from(dates);
}

function safeParseProgress(value: string): Record<string, Record<string, boolean>> | null {
  try {
    return JSON.parse(value) as Record<string, Record<string, boolean>>;
  } catch {
    return null;
  }
}
