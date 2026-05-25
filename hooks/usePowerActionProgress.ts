import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, format, startOfWeek, subWeeks } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import { getPowerBlock, PowerAction } from '../lib/powerBlocks';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

type BlockProgress = Record<string, Record<string, boolean>>;

const storageKey = (userId: string, blockId: string) => `tel:power-progress:${userId}:${blockId}`;

function buildWindow(): { week1: Date[]; week2: Date[]; days: Date[] } {
  const week2Start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const week1Start = subWeeks(week2Start, 1);
  const week1 = Array.from({ length: 7 }, (_, i) => addDays(week1Start, i));
  const week2 = Array.from({ length: 7 }, (_, i) => addDays(week2Start, i));
  return { week1, week2, days: [...week1, ...week2] };
}

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildSeedProgress(blockId: string, actions: PowerAction[], days: Date[]): BlockProgress {
  if (blockId !== 'commit') return {};
  const seed: BlockProgress = {};
  const today = format(new Date(), 'yyyy-MM-dd');

  for (const action of actions) {
    const perDay: Record<string, boolean> = {};
    days.forEach((day, index) => {
      const key = format(day, 'yyyy-MM-dd');
      if (key > today) return;
      const density = action.weekly_target / 7;
      const slot = (hashCode(action.id) + index * 13) % 100;
      perDay[key] = slot < Math.round(density * 88);
    });
    seed[action.id] = perDay;
  }
  return seed;
}

export function usePowerActionProgress(blockId: string) {
  const { session, isDevSession } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id ?? 'anonymous';
  const block = getPowerBlock(blockId);

  const window = useMemo(() => buildWindow(), []);
  const [progress, setProgress] = useState<BlockProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!block) {
        setLoading(false);
        return;
      }
      try {
        const stored = await AsyncStorage.getItem(storageKey(userId, blockId));
        if (stored) {
          if (mounted) setProgress(JSON.parse(stored));
        } else {
          const seed = buildSeedProgress(blockId, block.actions, window.days);
          if (mounted) setProgress(seed);
          if (Object.keys(seed).length > 0) {
            await AsyncStorage.setItem(storageKey(userId, blockId), JSON.stringify(seed));
          }
        }
      } catch (err) {
        if (mounted) setProgress({});
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [block, blockId, userId, window.days]);

  const isChecked = useCallback(
    (actionId: string, dateKey: string) => {
      return Boolean(progress[actionId]?.[dateKey]);
    },
    [progress],
  );

  const toggle = useCallback(
    async (actionId: string, dateKey: string) => {
      const next: BlockProgress = {
        ...progress,
        [actionId]: { ...(progress[actionId] ?? {}), [dateKey]: !progress[actionId]?.[dateKey] },
      };
      setProgress(next);
      try {
        if (!hasSupabaseConfig || !supabase || isDevSession) {
          await AsyncStorage.setItem(storageKey(userId, blockId), JSON.stringify(next));
        } else {
          await AsyncStorage.setItem(storageKey(userId, blockId), JSON.stringify(next));
        }
        queryClient.invalidateQueries({ queryKey: ['engagement-dates', userId] });
      } catch (err) {
        // best effort — keep optimistic UI
      }
    },
    [blockId, isDevSession, progress, queryClient, userId],
  );

  const summary = useMemo(() => {
    if (!block) {
      return {
        actionsCompleted: 0,
        actionsIncomplete: 0,
        blockTarget: 0,
        blockTotal: 0,
        perAction: {} as Record<string, { completed: number; target: number; percentage: number }>,
        perDay: {} as Record<string, { completed: number; incomplete: number }>,
      };
    }

    const perAction: Record<string, { completed: number; target: number; percentage: number }> = {};
    const perDay: Record<string, { completed: number; incomplete: number }> = {};
    let blockTarget = 0;
    let blockTotal = 0;

    for (const action of block.actions) {
      const target = action.weekly_target * 2;
      const completedDays = window.days.filter((day) =>
        isChecked(action.id, format(day, 'yyyy-MM-dd')),
      ).length;
      perAction[action.id] = {
        completed: completedDays,
        target,
        percentage: target > 0 ? Math.min(100, Math.round((completedDays / target) * 100)) : 0,
      };
      blockTarget += target;
      blockTotal += completedDays;
    }

    for (const day of window.days) {
      const key = format(day, 'yyyy-MM-dd');
      const completed = block.actions.filter((action) => isChecked(action.id, key)).length;
      perDay[key] = { completed, incomplete: block.actions.length - completed };
    }

    return {
      actionsCompleted: blockTotal,
      actionsIncomplete: blockTarget - blockTotal,
      blockTarget,
      blockTotal,
      perAction,
      perDay,
    };
  }, [block, isChecked, window.days]);

  return {
    block,
    days: window.days,
    week1: window.week1,
    week2: window.week2,
    isChecked,
    toggle,
    loading,
    summary,
  };
}
