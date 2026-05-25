import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export type Mood = 'strong' | 'steady' | 'drained';

type DailyEntry = {
  intention: string | null;
  mood: Mood | null;
  movementTags: string[];
  reflection: string | null;
};

export function useDailyEntry() {
  const { session, isDevSession } = useAuth();
  const queryClient = useQueryClient();
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const [entry, setEntry] = useState<DailyEntry>({
    intention: null,
    mood: null,
    movementTags: [],
    reflection: null,
  });
  const [loading, setLoading] = useState(true);

  const storageKey = useMemo(() => {
    const userId = session?.user.id ?? 'anonymous';
    return `tel:daily-entry:${userId}:${today}`;
  }, [session?.user.id, today]);

  const persistEntry = useCallback(
    async (patch: Partial<DailyEntry>) => {
      if (!session) return;

      const nextEntry = {
        ...entry,
        ...patch,
      };

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
    [entry, isDevSession, queryClient, session, storageKey, today],
  );

  useEffect(() => {
    let mounted = true;

    const loadEntry = async () => {
      setLoading(true);

      if (!session) {
        if (mounted) {
          setEntry({
            intention: null,
            mood: null,
            movementTags: [],
            reflection: null,
          });
          setLoading(false);
        }
        return;
      }

      if (isDevSession || !supabase) {
        const storedEntry = await AsyncStorage.getItem(storageKey);

        if (mounted) {
          setEntry(
            storedEntry
              ? (JSON.parse(storedEntry) as DailyEntry)
              : {
                  intention: null,
                  mood: null,
                  movementTags: [],
                  reflection: null,
                },
          );
        }

        if (mounted) {
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('daily_entries')
        .select('intention,mood,movement_tags,reflection')
        .eq('user_id', session.user.id)
        .eq('entry_date', today)
        .maybeSingle();

      if (mounted && !error && data) {
        setEntry({
          intention: data.intention,
          mood: data.mood as Mood | null,
          movementTags: data.movement_tags ?? [],
          reflection: data.reflection,
        });
      }

      if (mounted && !error && !data) {
        setEntry({
          intention: null,
          mood: null,
          movementTags: [],
          reflection: null,
        });
      }

      if (mounted) {
        setLoading(false);
      }
    };

    loadEntry();

    return () => {
      mounted = false;
    };
  }, [isDevSession, session, storageKey, today]);

  const saveIntention = useCallback(
    async (intention: string) => {
      const nextIntention = intention.trim();
      setEntry((current) => ({ ...current, intention: nextIntention }));
      await persistEntry({ intention: nextIntention });
    },
    [persistEntry],
  );

  const saveMood = useCallback(
    async (mood: Mood) => {
      setEntry((current) => ({ ...current, mood }));
      await persistEntry({ mood });
    },
    [persistEntry],
  );

  const toggleMovementTag = useCallback(
    async (tag: string) => {
      const hasTag = entry.movementTags.includes(tag);
      const movementTags = hasTag
        ? entry.movementTags.filter((item) => item !== tag)
        : [...entry.movementTags, tag];

      setEntry((current) => ({ ...current, movementTags }));
      await persistEntry({ movementTags });
    },
    [entry.movementTags, persistEntry],
  );

  return {
    entry,
    loading,
    saveIntention,
    saveMood,
    toggleMovementTag,
  };
}
