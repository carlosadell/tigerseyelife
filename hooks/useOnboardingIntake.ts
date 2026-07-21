// hooks/useOnboardingIntake.ts
//
// Submits the §3.2 intake to profiles + dispatches a non-blocking call to
// the onboarding-completed edge function. Dual-path per CLAUDE.md.
//
// Supabase mode:
//   1. supabase.from('profiles').update(values + onboarding_completed=true)
//   2. supabase.functions.invoke('onboarding-completed') — fire and forget
//
// Dev mode:
//   1. AsyncStorage.setItem('tel:onboarding:<userId>', JSON.stringify(values))
//   2. AsyncStorage.setItem('tel:onboarding:<userId>:completed', '1')

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';

import { useApexAssignment } from './useApexAssignment';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import type { ApexAnswers } from '../lib/apexPrograms';
import type { Intake } from '../lib/onboardingSchema';

const devKey = (userId: string) => `tel:onboarding:${userId}`;
const devCompletedKey = (userId: string) => `tel:onboarding:${userId}:completed`;

export function useOnboardingIntake() {
  const { isDevSession, session } = useAuth();
  const userId = session?.user.id ?? null;
  const { record: recordApexAssignment } = useApexAssignment();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (values: Intake): Promise<{ ok: true } | { ok: false; reason: string }> => {
      if (!userId) return { ok: false, reason: 'no_user' };
      setError(null);
      setSubmitting(true);

      // Karen's Apex slotting result rides alongside the intake. Only build it
      // when the training answers are present and coherent; recordApexAssignment
      // is best-effort and never throws, so it cannot block completion.
      const apexAnswers: ApexAnswers | null =
        values.training_location && values.training_duration
          ? {
              location: values.training_location,
              duration: values.training_duration,
              format: values.training_format,
            }
          : null;

      try {
        if (isDevSession || !supabase) {
          await AsyncStorage.setItem(devKey(userId), JSON.stringify(values));
          await AsyncStorage.setItem(devCompletedKey(userId), '1');
          if (apexAnswers) await recordApexAssignment(apexAnswers);
          return { ok: true };
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...values,
            onboarding_completed: true,
          })
          .eq('id', userId);

        if (updateError) {
          const reason = updateError.message || 'profile_update_failed';
          setError(reason);
          return { ok: false, reason };
        }

        // Record the Apex assignment additively (fire-and-forget; never throws).
        if (apexAnswers) await recordApexAssignment(apexAnswers);

        // Fire-and-forget edge function. Failure here does not block routing.
        supabase.functions
          .invoke('onboarding-completed', { body: {} })
          .catch(() => {
            // Swallow — logged server-side, retried by future slice.
          });

        return { ok: true };
      } catch (e) {
        const reason = e instanceof Error ? e.message : 'unknown_error';
        setError(reason);
        return { ok: false, reason };
      } finally {
        setSubmitting(false);
      }
    },
    [isDevSession, userId, recordApexAssignment],
  );

  return { submit, submitting, error };
}
