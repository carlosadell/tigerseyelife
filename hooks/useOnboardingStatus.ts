import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export type OnboardingPayload = {
  firstName: string;
  bigWhy: string;
  changeNow: string;
  experienceLevel: 'new' | 'returning' | 'advanced';
  intakeAnswers: Record<string, unknown>;
  powerBaseline: Record<string, string | string[] | number | null>;
};

export function useOnboardingStatus() {
  const { isDevSession, session } = useAuth();
  const [loading, setLoading] = useState(Boolean(session));
  const [completed, setCompleted] = useState(false);

  const storageKey = useMemo(
    () => `tel:onboarding:${session?.user.id ?? 'anonymous'}`,
    [session?.user.id],
  );

  useEffect(() => {
    let mounted = true;

    const loadStatus = async () => {
      if (!session) {
        if (mounted) {
          setCompleted(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      if (isDevSession || !supabase) {
        const value = await AsyncStorage.getItem(storageKey);
        if (mounted) {
          setCompleted(value === 'complete');
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('big_why,power_baseline')
        .eq('id', session.user.id)
        .maybeSingle();

      if (mounted) {
        const baseline = data?.power_baseline as { onboarding_completed_at?: string } | null;
        setCompleted(Boolean(data?.big_why && baseline?.onboarding_completed_at));
        setLoading(false);
      }
    };

    loadStatus();

    return () => {
      mounted = false;
    };
  }, [isDevSession, session, storageKey]);

  const completeOnboarding = useCallback(
    async (payload: OnboardingPayload) => {
      if (!session) return;

      const completedAt = new Date().toISOString();
      const powerBaseline = {
        ...payload.powerBaseline,
        change_now: payload.changeNow,
        onboarding_completed_at: completedAt,
      };

      if (isDevSession || !supabase) {
        await AsyncStorage.setItem(storageKey, 'complete');
        await AsyncStorage.setItem(
          `${storageKey}:payload`,
          JSON.stringify({ ...payload, assignedProgramId: null, assignedWorkoutId: null, powerBaseline }),
        );
        setCompleted(true);
        return;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        first_name: payload.firstName.trim() || null,
        big_why: payload.bigWhy.trim() || null,
        experience_level: payload.experienceLevel,
        intake_answers: payload.intakeAnswers,
        power_baseline: powerBaseline,
      });

      if (error) {
        throw error;
      }

      setCompleted(true);
    },
    [isDevSession, session, storageKey],
  );

  return {
    completeOnboarding,
    completed,
    loading,
  };
}
