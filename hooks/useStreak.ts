import { format, subDays } from 'date-fns';
import { useMemo } from 'react';

import { useEngagementDates } from './useEngagementDates';

const LOOKBACK_DAYS = 90;

export function useStreak() {
  const { dates, loading } = useEngagementDates();

  const days = useMemo(() => computeConsecutiveDays(dates), [dates]);

  return { days, loading };
}

function computeConsecutiveDays(dates: Set<string>): number {
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  let cursor = dates.has(todayKey) ? today : subDays(today, 1);
  let count = 0;
  while (count <= LOOKBACK_DAYS && dates.has(format(cursor, 'yyyy-MM-dd'))) {
    count += 1;
    cursor = subDays(cursor, 1);
  }
  return count;
}
