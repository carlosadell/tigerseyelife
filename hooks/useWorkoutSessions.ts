import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from './useAuth';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { calculateVolume, WorkoutSession, WorkoutSetLog } from '../lib/workouts';
import { buildWorkoutHistorySeed } from '../lib/workoutHistorySeed';

const localKey = (userId: string) => `tel:workout-sessions:${userId}`;

export function useWorkoutSessions() {
  const { isDevSession, session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  const historyQuery = useQuery({
    enabled: Boolean(userId),
    queryKey: ['workout-sessions', userId],
    queryFn: () => fetchSessions(userId!, isDevSession),
  });

  const saveSession = async (sessionValue: WorkoutSession) => {
    if (!userId) return sessionValue;

    if (!hasSupabaseConfig || !supabase || isDevSession) {
      const current = await fetchLocalSessions(userId);
      const next = [sessionValue, ...current.filter((item) => item.id !== sessionValue.id)];
      await AsyncStorage.setItem(localKey(userId), JSON.stringify(next));
    } else {
      await supabase.from('workout_sessions').upsert({
        ...sessionValue,
        set_logs: sessionValue.set_logs,
      });
    }

    await queryClient.invalidateQueries({ queryKey: ['workout-sessions', userId] });
    return sessionValue;
  };

  return {
    ...historyQuery,
    saveSession,
    sessions: historyQuery.data ?? [],
  };
}

export function useWorkoutHistory(limit = 3) {
  const sessionsQuery = useWorkoutSessions();
  return {
    ...sessionsQuery,
    sessions: sessionsQuery.sessions
      .filter((item) => item.completed_at)
      .sort((a, b) => Date.parse(b.completed_at ?? '') - Date.parse(a.completed_at ?? ''))
      .slice(0, limit),
  };
}

export function completeSession(
  session: WorkoutSession,
  setLogs: WorkoutSetLog[],
  perceivedEffort: number,
  notes: string,
) {
  const started = Date.parse(session.started_at);
  const now = Date.now();
  return {
    ...session,
    completed_at: new Date(now).toISOString(),
    notes,
    perceived_effort: perceivedEffort,
    set_logs: setLogs,
    total_duration_seconds: Math.max(1, Math.round((now - started) / 1000)),
    total_volume_kg: calculateVolume(setLogs),
  };
}

async function fetchSessions(userId: string, isDevSession: boolean): Promise<WorkoutSession[]> {
  if (!hasSupabaseConfig || !supabase || isDevSession) return fetchLocalSessions(userId);

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (error) return fetchLocalSessions(userId);
  return (data ?? []) as WorkoutSession[];
}

async function fetchLocalSessions(userId: string): Promise<WorkoutSession[]> {
  const stored = await AsyncStorage.getItem(localKey(userId));
  if (stored) return JSON.parse(stored) as WorkoutSession[];
  return buildWorkoutHistorySeed(userId);
}
