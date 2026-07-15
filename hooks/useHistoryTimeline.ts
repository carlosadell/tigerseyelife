import { differenceInCalendarDays, format, isValid, parseISO, startOfDay } from 'date-fns';
import { useMemo } from 'react';

import { useEngagementDates } from './useEngagementDates';
import { useMembership } from './useMembership';
import { currentBlockFor, WeekNumber } from '../lib/program';

export type TimelineDay = {
  /** yyyy-MM-dd */
  dateKey: string;
  /** 1-based program day number (Day 1 = program start). */
  dayNumber: number;
  /** Program week, capped at 12. Days past week 12 read as continuation. */
  weekNumber: number;
  /** "COMMIT" … "EXCEL", or "CONTINUATION" past week 12. */
  blockLabel: string;
  /** True if the user logged anything that day. */
  engaged: boolean;
  isToday: boolean;
};

const MAX_WEEK = 12;

/**
 * Ordered list of every program day from Day 1 through today (ascending, so a
 * member reads their program as a narrative from the start — "Day 1 … Day 8").
 *
 * Day 1 is anchored to `membership.verifiedAt` (set when a member is verified
 * into COMMIT / week 1). If that is missing (dev sessions), it falls back to the
 * earliest engaged date, then to today, so the screen is never empty or wrong.
 *
 * Rows are intentionally cheap — engagement is a set-membership check; no
 * per-day content is loaded until the user taps into `/history/[date]`.
 */
export function useHistoryTimeline(): { days: TimelineDay[]; loading: boolean } {
  const { membership, loading: membershipLoading } = useMembership();
  const { dates, loading: datesLoading } = useEngagementDates();

  const days = useMemo(() => {
    const today = startOfDay(new Date());

    const start = resolveStart(membership.verifiedAt, dates, today);
    const totalDays = differenceInCalendarDays(today, start) + 1;
    if (totalDays < 1) return [];

    const todayKey = format(today, 'yyyy-MM-dd');
    const out: TimelineDay[] = [];
    for (let i = 0; i < totalDays; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayNumber = i + 1;
      const rawWeek = Math.ceil(dayNumber / 7);
      const weekNumber = Math.min(rawWeek, MAX_WEEK);
      const blockLabel =
        rawWeek > MAX_WEEK ? 'CONTINUATION' : currentBlockFor(weekNumber as WeekNumber);
      out.push({
        dateKey,
        dayNumber,
        weekNumber: rawWeek > MAX_WEEK ? rawWeek : weekNumber,
        blockLabel,
        engaged: dates.has(dateKey),
        isToday: dateKey === todayKey,
      });
    }
    return out;
  }, [membership.verifiedAt, dates]);

  return { days, loading: membershipLoading || datesLoading };
}

function resolveStart(
  verifiedAt: string | null,
  dates: Set<string>,
  today: Date,
): Date {
  if (verifiedAt) {
    const parsed = parseISO(verifiedAt);
    if (isValid(parsed)) return startOfDay(parsed);
  }
  if (dates.size > 0) {
    const earliest = [...dates].sort()[0];
    const parsed = parseISO(earliest);
    if (isValid(parsed)) return startOfDay(parsed);
  }
  return today;
}
