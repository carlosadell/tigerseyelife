// hooks/useUserPathway.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_PATHWAY, PATHWAY_IDS, type PathwayId } from '../lib/pathway';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const storageKey = (userId: string) => `tel:pathway:${userId}`;

export function useUserPathway() {
  const { session, isDevSession } = useAuth();
  const userId = session?.user?.id ?? 'anon';
  const [pathway, setPathwayState] = useState<PathwayId>(DEFAULT_PATHWAY);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Dev / offline branch: AsyncStorage only.
      if (isDevSession || !supabase) {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        if (!cancelled) {
          setPathwayState(isPathway(raw) ? raw : DEFAULT_PATHWAY);
          setIsLoaded(true);
        }
        return;
      }
      // Supabase branch: read profiles.pathway, fall back to default.
      const { data, error } = await supabase
        .from('profiles')
        .select('pathway')
        .eq('id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data?.pathway) {
        setPathwayState(DEFAULT_PATHWAY);
      } else {
        setPathwayState(isPathway(data.pathway) ? data.pathway : DEFAULT_PATHWAY);
      }
      setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isDevSession, userId]);

  const setPathway = useCallback(
    async (next: PathwayId) => {
      const prev = pathway;
      setPathwayState(next);
      if (isDevSession || !supabase) {
        try {
          await AsyncStorage.setItem(storageKey(userId), next);
        } catch (err) {
          setPathwayState(prev);
          console.warn('useUserPathway: AsyncStorage write failed, reverting', err);
        }
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ pathway: next })
        .eq('id', userId);
      if (error) {
        setPathwayState(prev);
        console.warn('useUserPathway: Supabase update failed, reverting', error);
      }
    },
    [isDevSession, userId, pathway],
  );

  return { pathway, isLoaded, setPathway };
}

function isPathway(v: unknown): v is PathwayId {
  return typeof v === 'string' && (PATHWAY_IDS as readonly string[]).includes(v);
}
