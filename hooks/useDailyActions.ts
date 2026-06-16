// hooks/useDailyActions.ts
//
// Dual-path persistence for daily action completions. Supabase mode
// writes to user_daily_actions. Dev mode writes to AsyncStorage under
// tel:daily-actions:<userId>. Same hook shape both ways.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import type { WeekNumber } from '../lib/program';

export type DailyActionRecord = {
  actionId: string;
  completedDate: string;
  completedAt: string;
  weekNumber: number;
};

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday-start week
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function storageKey(userId: string): string {
  return `tel:daily-actions:${userId}`;
}

export function useDailyActions(currentWeek: WeekNumber): {
  todayCompletions: Set<string>;
  weekCompletions: Map<string, number>;
  weekProgress: { completed: number; total: number; percentage: number };
  toggleAction: (actionId: string, weeklyTarget: number) => Promise<void>;
  loading: boolean;
} {
  const { session, isDevSession } = useAuth();
  const userId = session?.user.id;
  const [records, setRecords] = useState<DailyActionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (isDevSession || !supabase) {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        const parsed = raw ? (JSON.parse(raw) as DailyActionRecord[]) : [];
        setRecords(parsed);
      } else {
        const weekStart = startOfWeekISO();
        const { data, error } = await supabase
          .from('user_daily_actions')
          .select('action_id, completed_date, completed_at, week_number')
          .eq('user_id', userId)
          .gte('completed_date', weekStart);
        if (error) throw error;
        setRecords(
          (data ?? []).map((r) => ({
            actionId: r.action_id as string,
            completedDate: r.completed_date as string,
            completedAt: r.completed_at as string,
            weekNumber: r.week_number as number,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [isDevSession, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayISO();

  const todayCompletions = useMemo(() => {
    return new Set(
      records.filter((r) => r.completedDate === today).map((r) => r.actionId),
    );
  }, [records, today]);

  const weekCompletions = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of records) {
      if (r.weekNumber !== currentWeek) continue;
      m.set(r.actionId, (m.get(r.actionId) ?? 0) + 1);
    }
    return m;
  }, [records, currentWeek]);

  const toggleAction = useCallback(
    async (actionId: string, _weeklyTarget: number) => {
      if (!userId) return;
      const alreadyDone = todayCompletions.has(actionId);

      if (isDevSession || !supabase) {
        const next = alreadyDone
          ? records.filter((r) => !(r.actionId === actionId && r.completedDate === today))
          : [
              ...records,
              {
                actionId,
                completedDate: today,
                completedAt: new Date().toISOString(),
                weekNumber: currentWeek,
              },
            ];
        await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
        setRecords(next);
        return;
      }

      if (alreadyDone) {
        const { error } = await supabase
          .from('user_daily_actions')
          .delete()
          .eq('user_id', userId)
          .eq('action_id', actionId)
          .eq('completed_date', today);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_daily_actions').insert({
          user_id: userId,
          action_id: actionId,
          completed_date: today,
          week_number: currentWeek,
        });
        if (error) throw error;
      }
      await load();
    },
    [currentWeek, isDevSession, load, records, today, todayCompletions, userId],
  );

  const weekProgress = useMemo(() => {
    const completed = todayCompletions.size;
    return { completed, total: 0, percentage: 0 };
  }, [todayCompletions]);

  return { todayCompletions, weekCompletions, weekProgress, toggleAction, loading };
}
