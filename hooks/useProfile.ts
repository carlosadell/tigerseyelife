import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

type Profile = {
  assignedProgramId: string | null;
  assignedWorkoutId: string | null;
  bigWhy: string | null;
  firstName: string | null;
  intakeAnswers: Record<string, unknown>;
};

export function useProfile() {
  const { isDevSession, session } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    assignedProgramId: null,
    assignedWorkoutId: null,
    bigWhy: null,
    firstName: null,
    intakeAnswers: {},
  });
  const [loading, setLoading] = useState(Boolean(session && !isDevSession && supabase));

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!session || isDevSession || !supabase) {
        if (session && isDevSession) {
          const storedPayload = await AsyncStorage.getItem(`tel:onboarding:${session.user.id}:payload`);

          if (mounted && storedPayload) {
            const parsed = JSON.parse(storedPayload) as {
              assignedProgramId?: string | null;
              assignedWorkoutId?: string | null;
              bigWhy?: string;
              firstName?: string;
              intakeAnswers?: Record<string, unknown>;
            };
            setProfile({
              assignedProgramId: parsed.assignedProgramId ?? null,
              assignedWorkoutId: parsed.assignedWorkoutId ?? null,
              bigWhy: parsed.bigWhy ?? null,
              firstName: parsed.firstName ?? null,
              intakeAnswers: parsed.intakeAnswers ?? {},
            });
            setLoading(false);
            return;
          }
        }

        if (mounted) {
          setProfile({
            assignedProgramId: null,
            assignedWorkoutId: null,
            bigWhy: null,
            firstName: null,
            intakeAnswers: {},
          });
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('assigned_program_id,assigned_workout_id,big_why,first_name,intake_answers')
        .eq('id', session.user.id)
        .maybeSingle();

      if (mounted && !error) {
        setProfile({
          assignedProgramId: data?.assigned_program_id ?? null,
          assignedWorkoutId: data?.assigned_workout_id ?? null,
          bigWhy: data?.big_why ?? null,
          firstName: data?.first_name ?? null,
          intakeAnswers: (data?.intake_answers as Record<string, unknown> | null) ?? {},
        });
      }

      if (mounted) {
        setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [isDevSession, session]);

  return {
    loading,
    profile,
  };
}
