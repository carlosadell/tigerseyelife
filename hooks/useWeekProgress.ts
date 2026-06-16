// hooks/useWeekProgress.ts
//
// A week is "complete" when >= 70% of its actions have been done at
// least once that week. Replaces useSectionProgress, which tracked
// curriculum section completion against the old 6-thread x 6-block
// model.

import { useMemo } from 'react';
import { useDailyActions } from './useDailyActions';
import { weekFor } from '../lib/program';
import type { WeekNumber } from '../lib/program';

export function useWeekProgress(weekNumber: WeekNumber): {
  completed: number;
  total: number;
  percentage: number;
  isWeekComplete: boolean;
  loading: boolean;
} {
  const { weekCompletions, loading } = useDailyActions(weekNumber);
  const week = weekFor(weekNumber);

  return useMemo(() => {
    const total = week.weekAtAGlance.length;
    const completed = week.weekAtAGlance.filter(
      (a) => (weekCompletions.get(a.id) ?? 0) >= 1,
    ).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      completed,
      total,
      percentage,
      isWeekComplete: percentage >= 70,
      loading,
    };
  }, [loading, week.weekAtAGlance, weekCompletions]);
}
