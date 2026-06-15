import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export type Mood = 'strong' | 'steady' | 'drained';

type DailyEntry = {
  intention: string | null;
  mood: Mood | null;
  movementTags: string[];
  reflection: string | null;
};

const EMPTY_ENTRY: DailyEntry = {
  intention: null,
  mood: null,
  movementTags: [],
  reflection: null,
};

export function useDailyEntry() {
  const { session, isDevSession } = useAuth();
  const queryClient = useQueryClient();
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const userId = session?.user.id ?? 'anonymous';
  const storageKey = useMemo(() => `tel:daily-entry:${userId}:${today}`, [userId, today]);
  const queryKey = useMemo(() => ['daily-entry', userId, today], [userId, today]);

  const { data: entry = EMPTY_ENTRY, isLoading } = useQuery<DailyEntry>({
    queryKey,
    queryFn: async () => {
      if (!session) return EMPTY_ENTRY;

      if (isDevSession || !supabase) {
        const stored = await AsyncStorage.getItem(storageKey);
        if (!stored) return EMPTY_ENTRY;
        try {
          return JSON.parse(stored) as DailyEntry;
        } catch {
          return EMPTY_ENTRY;
        }
      }

      const { data, error } = await supabase
        .from('daily_entries')
        .select('intention,mood,movement_tags,reflection')
        .eq('user_id', session.user.id)
        .eq('entry_date', today)
        .maybeSingle();

      if (error || !data) return EMPTY_ENTRY;
      return {
        intention: data.intention,
        mood: data.mood as Mood | null,
        movementTags: data.movement_tags ?? [],
        reflection: data.reflection,
      };
    },
    initialData: EMPTY_ENTRY,
  });

  const persistEntry = useCallback(
    async (patch: Partial<DailyEntry>) => {
      if (!session) return;

      const current = queryClient.getQueryData<DailyEntry>(queryKey) ?? EMPTY_ENTRY;
      const nextEntry: DailyEntry = { ...current, ...patch };

      // Optimistic update — all subscribers re-render with the new value before
      // the storage round-trip completes.
      queryClient.setQueryData(queryKey, nextEntry);

      if (isDevSession || !supabase) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(nextEntry));
        queryClient.invalidateQueries({ queryKey: ['engagement-dates', session.user.id] });
        return;
      }

      const { error } = await supabase.from('daily_entries').upsert(
        {
          user_id: session.user.id,
          entry_date: today,
          intention: nextEntry.intention,
          mood: nextEntry.mood,
          movement_tags: nextEntry.movementTags,
          reflection: nextEntry.reflection,
        },
        {
          onConflict: 'user_id,entry_date',
        },
      );

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['engagement-dates', session.user.id] });
    },
    [isDevSession, queryClient, queryKey, session, storageKey, today],
  );

  const saveIntention = useCallback(
    async (intention: string) => {
      await persistEntry({ intention: intention.trim() });
    },
    [persistEntry],
  );

  const saveMood = useCallback(
    async (mood: Mood) => {
      await persistEntry({ mood });
    },
    [persistEntry],
  );

  const toggleMovementTag = useCallback(
    async (tag: string) => {
      const current = queryClient.getQueryData<DailyEntry>(queryKey) ?? EMPTY_ENTRY;
      const hasTag = current.movementTags.includes(tag);
      const movementTags = hasTag
        ? current.movementTags.filter((item) => item !== tag)
        : [...current.movementTags, tag];
      await persistEntry({ movementTags });
    },
    [persistEntry, queryClient, queryKey],
  );

  return {
    entry,
    loading: isLoading,
    saveIntention,
    saveMood,
    toggleMovementTag,
  };
}
