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

const DEV_DEMO_PROFILE: Profile = {
  assignedProgramId: '33333333-3333-4333-8333-333333333333',
  assignedWorkoutId: 'seed-lower-body-a',
  bigWhy: 'Stay strong enough to keep up with my kids and own my next decade.',
  firstName: 'Karen',
  intakeAnswers: {
    duration: '30 min',
    format: 'pre_recorded',
    location: 'home_basics',
    skill_level: ['intermediate', 'familiar_dumbbell_barbell_plates'],
    workout_setup: {
      days_per_week: '4',
      duration: '30 min',
      equipment: 'Home basics (dumbbells + bands)',
      goals: ['strength', 'bone density', 'energy'],
    },
    nutrition: {
      approach: 'protein-forward',
    },
    program_preference: 'pre_recorded',
    strength_training_experience: ['intermediate', 'familiar_dumbbell_barbell_plates'],
  },
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
            const intake = parsed.intakeAnswers ?? {};
            const isIntakeEmpty = Object.keys(intake).length === 0;

            setProfile({
              assignedProgramId: parsed.assignedProgramId ?? DEV_DEMO_PROFILE.assignedProgramId,
              assignedWorkoutId: parsed.assignedWorkoutId ?? DEV_DEMO_PROFILE.assignedWorkoutId,
              bigWhy: parsed.bigWhy ?? DEV_DEMO_PROFILE.bigWhy,
              firstName: parsed.firstName ?? DEV_DEMO_PROFILE.firstName,
              intakeAnswers: isIntakeEmpty ? DEV_DEMO_PROFILE.intakeAnswers : intake,
            });
            setLoading(false);
            return;
          }

          setProfile(DEV_DEMO_PROFILE);
          setLoading(false);
          return;
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
