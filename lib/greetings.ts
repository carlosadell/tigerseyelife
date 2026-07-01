import type { BlockId, WeekNumber } from './program';

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

const coachMessages: Record<DayPeriod, string[]> = {
  morning: ['Set the tone. One small win before noon.'],
  afternoon: ['Focus on what moves you forward, not what holds you back.'],
  evening: ['Discipline today. Freedom tomorrow.'],
};

// Block-and-week-scoped tagline that appears under the greeting.
// COMMIT is deepened first (per the "COMMIT block first" memory).
// Other blocks fall back to null; callers skip rendering when null.
const COMMIT_TAGLINE_BY_WEEK: Partial<Record<WeekNumber, string>> = {
  1: 'Show up. That is the whole ask this week.',
  2: 'Stack today on yesterday. Systems, not motivation.',
};

export function getBlockTagline(
  blockId: BlockId,
  weekNumber: WeekNumber,
): string | null {
  if (blockId === 'COMMIT') return COMMIT_TAGLINE_BY_WEEK[weekNumber] ?? null;
  return null;
}

export function getDayPeriod(date = new Date()): DayPeriod {
  const hour = date.getHours();

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getGreeting(firstName?: string | null, date = new Date()) {
  const period = getDayPeriod(date);
  const first = firstName?.trim().split(/\s+/)[0];
  return `Good ${period}, ${first || 'Friend'}.`;
}

export function getCoachMessage(date = new Date(), sessionIndex = 0) {
  const messages = coachMessages[getDayPeriod(date)];
  return messages[sessionIndex % messages.length];
}
