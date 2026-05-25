import { useMemo } from 'react';

import { useAssignedProgram } from './useAssignedProgram';
import { useDailyEntry } from './useDailyEntry';
import { useProfile } from './useProfile';
import { useStreak } from './useStreak';
import { CoachKnowledge } from '../lib/coachKnowledge';

export function useCoachContext(): CoachKnowledge {
  const { profile } = useProfile();
  const { assignedProgram, todayWorkout } = useAssignedProgram();
  const { entry } = useDailyEntry();
  const { days: streakDays } = useStreak();

  return useMemo(
    () => ({
      firstName: profile.firstName,
      program: assignedProgram,
      todayWorkout,
      intention: entry.intention ?? null,
      intakeAnswers: profile.intakeAnswers,
      streakDays,
    }),
    [
      profile.firstName,
      profile.intakeAnswers,
      assignedProgram,
      todayWorkout,
      entry.intention,
      streakDays,
    ],
  );
}
