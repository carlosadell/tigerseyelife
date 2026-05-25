import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useMemo } from 'react';

import { useAuth } from './useAuth';
import { useWorkoutSessions } from './useWorkoutSessions';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

const LOOKBACK_DAYS = 90;

export function useStreak() {
  const { session, isDevSession } = useAuth();
  const userId = session?.user.id;
  const { sessions: workoutSessions } = useWorkoutSessions();

  const engagementQuery = useQuery({
    enabled: Boolean(userId),
    queryKey: ['engagement-dates', userId, isDevSession],
    queryFn: () => fetchEngagementDates(userId!, isDevSession),
  });

  const days = useMemo(() => {
    const dates = new Set<string>(engagementQuery.data ?? []);
    for (const ws of workoutSessions) {
      if (!ws.completed_at) continue;
      dates.add(format(new Date(ws.completed_at), 'yyyy-MM-dd'));
    }
    return computeConsecutiveDays(dates);
  }, [engagementQuery.data, workoutSessions]);

  return { days, loading: engagementQuery.isLoading };
}

function computeConsecutiveDays(dates: Set<string>): number {
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  let cursor = dates.has(todayKey) ? today : subDays(today, 1);
  let count = 0;
  while (count <= LOOKBACK_DAYS && dates.has(format(cursor, 'yyyy-MM-dd'))) {
    count += 1;
    cursor = subDays(cursor, 1);
  }
  return count;
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
  }

  const powerPrefix = `tel:power-progress:${userId}:`;
  const engagementPrefix = `tel:engagement:${userId}:`;
  const mealsPrefix = `tel:meals-logged:${userId}:`;
  const allKeys = await AsyncStorage.getAllKeys();

  const powerKeys = allKeys.filter((key) => key.startsWith(powerPrefix));
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
