// hooks/useOnboardingStatus.ts
//
// Reads onboarding completion from profiles.onboarding_completed (Supabase)
// or from the dev AsyncStorage flag (dev mode). Dual-path per CLAUDE.md.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

const devCompletedKey = (userId: string) => `tel:onboarding:${userId}:completed`;

export function useOnboardingStatus() {
  const { isDevSession, session } = useAuth();
  const userId = session?.user.id ?? null;

  const [completed, setCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(Boolean(session));

  const load = useCallback(async () => {
    if (!session || !userId) {
      setCompleted(false);
      setLoading(false);
      return;
    }
    setLoading(true);

    if (isDevSession || !supabase) {
      const flag = await AsyncStorage.getItem(devCompletedKey(userId));
      setCompleted(flag === '1');
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();
    setCompleted(Boolean(data?.onboarding_completed));
    setLoading(false);
  }, [isDevSession, session, userId]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { completed, loading, refresh: load };
}
