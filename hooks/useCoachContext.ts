// hooks/useCoachContext.ts
//
// Context the AI coach receives. In this slice no LLM is wired; this
// hook provides the structure the LLM slice will consume.

import { useCurrentWeek } from './useCurrentWeek';
import { useProfile } from './useProfile';
import { weekFor, blockFor } from '../lib/program';
import { unlockedFeaturesAt } from '../lib/unlocks';

export type CoachContext = {
  weekNumber: number;
  blockId: string;
  primaryFocus: string;
  consistencyTarget: string;
  unlockedFeatures: string[];
  userName: string | null;
  goal: string | null;
};

export function useCoachContext(): CoachContext {
  const { weekNumber, blockId } = useCurrentWeek();
  const { profile } = useProfile();
  const week = weekFor(weekNumber);
  const block = blockFor(blockId);
  return {
    weekNumber,
    blockId,
    primaryFocus: week.primaryFocus,
    consistencyTarget: block.consistencyTarget,
    unlockedFeatures: unlockedFeaturesAt(weekNumber),
    userName: profile.firstName ?? null,
    goal: (profile.intakeAnswers?.primary_goal as string | undefined) ?? null,
  };
}
