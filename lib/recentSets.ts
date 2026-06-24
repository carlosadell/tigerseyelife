// lib/recentSets.ts
//
// "Last session" summary for an exercise. Powers the pre-start
// recent-sets strip on the workout detail screen so members can see
// what they lifted last time and plan today's progression before
// pressing Start.
//
// Returns null when the user has no prior completed session that
// included this exercise — caller renders nothing.

import { formatDistanceToNowStrict } from 'date-fns';

import { formatWeight } from './units';
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
