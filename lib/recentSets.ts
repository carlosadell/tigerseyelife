// lib/recentSets.ts
//
// "Last session" summary for an exercise. Powers the pre-start
// recent-sets strip on the workout detail screen so members can see
// what they lifted last time and plan today's progression before
// pressing Start.
//
// Also exposes a progression summary used on the exercise detail
// screen to make the "weight going up" story legible in one line.
//
// Returns null when the user has no prior completed session that
// included this exercise — caller renders nothing.

import { differenceInDays, formatDistanceToNowStrict } from 'date-fns';

import { formatWeight, kgToLb } from './units';
import type { WorkoutSession } from './workouts';

export type RecentSetsSummary = {
  relativeDate: string;
  summary: string;
};

export function lastSessionFor(
  sessions: ReadonlyArray<WorkoutSession>,
  exerciseId: string,
): RecentSetsSummary | null {
  const completed = sessions
    .filter((s) => Boolean(s.completed_at))
    .filter((s) => s.set_logs.some((log) => log.exercise_id === exerciseId))
    .sort(
      (a, b) =>
        Date.parse(b.completed_at ?? '') - Date.parse(a.completed_at ?? ''),
    );

  const latest = completed[0];
  if (!latest) return null;

  const setLogs = latest.set_logs
    .filter((log) => log.exercise_id === exerciseId)
    .filter((log) => !log.is_warmup)
    .sort((a, b) => a.set_number - b.set_number);

  if (setLogs.length === 0) return null;

  const summary = setLogs
    .map((log) => (log.weight_kg > 0 ? `${formatWeight(log.weight_kg)} × ${log.reps}` : `${log.reps} reps`))
    .join(' · ');

  const relativeDate = formatDistanceToNowStrict(new Date(latest.completed_at ?? latest.started_at), {
    addSuffix: true,
  });

  return { relativeDate, summary };
}

export type ProgressionSummary = {
  // "up" when last top weight > first; "hold" when equal; "down" when less.
  // No "down" copy is rendered by callers to avoid any shaming tone —
  // they treat down as "hold" or skip. Kept here so callers can branch.
  trend: 'up' | 'hold' | 'down';
  // Headline string for the pill, already unit-converted to lbs.
  // "Up 5lb in 14 days" / "Holding 17.5lb · 14 days"
  label: string;
};

export function progressionFor(
  sessions: ReadonlyArray<WorkoutSession>,
  exerciseId: string,
): ProgressionSummary | null {
  const completed = sessions
    .filter((s) => Boolean(s.completed_at))
    .map((s) => ({
      date: new Date(s.completed_at ?? s.started_at),
      topWeightKg: topWorkingWeightKg(s, exerciseId),
    }))
    .filter((s) => s.topWeightKg != null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (completed.length < 2) return null;

  const first = completed[0];
  const last = completed[completed.length - 1];
  const firstKg = first.topWeightKg!;
  const lastKg = last.topWeightKg!;
  const days = Math.max(1, differenceInDays(last.date, first.date));

  // Use the same rounding the formatter does so the delta math
  // matches what the user sees.
  const firstLb = roundLb(kgToLb(firstKg));
  const lastLb = roundLb(kgToLb(lastKg));
  const deltaLb = lastLb - firstLb;

  if (deltaLb > 0) {
    const deltaStr = Number.isInteger(deltaLb) ? String(deltaLb) : deltaLb.toFixed(1);
    return {
      trend: 'up',
      label: `Up ${deltaStr}lb in ${days} day${days === 1 ? '' : 's'}`,
    };
  }

  if (deltaLb === 0) {
    return {
      trend: 'hold',
      label: `Holding ${formatWeight(lastKg)} · ${days} day${days === 1 ? '' : 's'}`,
    };
  }

  return {
    trend: 'down',
    label: `Holding ${formatWeight(lastKg)} · ${days} day${days === 1 ? '' : 's'}`,
  };
}

function topWorkingWeightKg(session: WorkoutSession, exerciseId: string): number | null {
  const working = session.set_logs
    .filter((log) => log.exercise_id === exerciseId)
    .filter((log) => !log.is_warmup)
    .map((log) => log.weight_kg)
    .filter((kg) => kg > 0);
  if (working.length === 0) return null;
  return Math.max(...working);
}

function roundLb(lb: number): number {
  return Math.round(lb * 10) / 10;
}
