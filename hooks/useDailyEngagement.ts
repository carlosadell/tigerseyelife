// hooks/useDailyEngagement.ts
//
// Anchor-tap engagement events. Writes silently to user_daily_actions
// (Supabase) or AsyncStorage tel:daily-actions:<userId> (dev). Returns
// today's engagement set so cards can render an "engaged today" state
// in the future. WeekStrip dots aggregate via useEngagementDates.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { useCurrentWeek } from './useCurrentWeek';
import { supabase } from '../lib/supabase';

type EngagementRecord = {
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

function storageKey(userId: string): string {
  return `tel:daily-actions:${userId}`;
}

export function useDailyEngagement(): {
  todayEngagements: Set<string>;
  recordEngagement: (anchorId: string) => Promise<void>;
  loading: boolean;
} {
  const { session, isDevSession } = useAuth();
  const { weekNumber } = useCurrentWeek();
  const userId = session?.user.id;
  const [todayEngagements, setTodayEngagements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setTodayEngagements(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const today = todayISO();
      if (isDevSession || !supabase) {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        const parsed = raw ? (JSON.parse(raw) as EngagementRecord[]) : [];
        setTodayEngagements(
          new Set(parsed.filter((r) => r.completedDate === today).map((r) => r.actionId)),
        );
      } else {
        const { data, error } = await supabase
          .from('user_daily_actions')
          .select('action_id')
          .eq('user_id', userId)
          .eq('completed_date', today);
        if (error) throw error;
        setTodayEngagements(new Set((data ?? []).map((r) => r.action_id as string)));
      }
    } finally {
      setLoading(false);
    }
  }, [isDevSession, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const recordEngagement = useCallback(
    async (anchorId: string) => {
      if (!userId) return;
      const today = todayISO();
      if (todayEngagements.has(anchorId)) return;

      if (isDevSession || !supabase) {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        const parsed = raw ? (JSON.parse(raw) as EngagementRecord[]) : [];
        const next: EngagementRecord[] = [
          ...parsed,
          {
            actionId: anchorId,
            completedDate: today,
            completedAt: new Date().toISOString(),
            weekNumber,
          },
        ];
        await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
        setTodayEngagements(new Set([...todayEngagements, anchorId]));
        return;
      }

      const { error } = await supabase.from('user_daily_actions').insert({
        user_id: userId,
        action_id: anchorId,
        completed_date: today,
        week_number: weekNumber,
      });
      if (error && error.code !== '23505') throw error; // 23505 = unique violation, idempotent
      setTodayEngagements(new Set([...todayEngagements, anchorId]));
    },
    [isDevSession, todayEngagements, userId, weekNumber],
  );

  return { todayEngagements, recordEngagement, loading };
}
