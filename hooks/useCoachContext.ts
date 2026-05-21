import { useMemo } from 'react';

import { useAssignedProgram } from './useAssignedProgram';
import { useDailyEntry } from './useDailyEntry';
import { useProfile } from './useProfile';
import { CoachKnowledge } from '../lib/coachKnowledge';

const SEED_STREAK = 23;

export function useCoachContext(): CoachKnowledge {
  const { profile } = useProfile();
  const { assignedProgram, todayWorkout } = useAssignedProgram();
  const { entry } = useDailyEntry();

  return useMemo(
    () => ({
      firstName: profile.firstName,
      program: assignedProgram,
      todayWorkout,
      intention: entry.intention ?? null,
      intakeAnswers: profile.intakeAnswers,
      streakDays: SEED_STREAK,
    }),
    [
      profile.firstName,
      profile.intakeAnswers,
      assignedProgram,
      todayWorkout,
      entry.intention,
    ],
  );
}
