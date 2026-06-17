// hooks/useCustomGoals.ts
//
// Per-member custom goals. Karen's tracker leaves blank slots for the
// participant's own goals — "lose 10 lbs", "60-sec sit-to-stands
// baseline 15 → goal 23", and the open identity/intention slots she
// hadn't filled in yet. This hook is that surface.
//
// Three goal kinds:
//   - 'metric'    — has baseline + target numbers, e.g. weight, reps
//   - 'identity'  — narrative goal ("become someone who walks daily")
//   - 'intention' — process goal ("be more intentional about evenings")
//
// Dual-path persistence per CLAUDE.md: AsyncStorage when dev/offline,
// Supabase profiles.custom_goals JSONB when authenticated. We write to
// AsyncStorage either way as a local cache so the UI is instant.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

export type CustomGoalKind = 'metric' | 'identity' | 'intention';

export type CustomGoal = {
  id: string;
  kind: CustomGoalKind;
  label: string;
  // Only present for 'metric' goals. Stored as strings so we can
  // accept whatever unit the user typed (kg, lbs, reps, miles, sec).
  baseline?: string;
  target?: string;
  // Optional unit label shown next to baseline/target.
  unit?: string;
  // Free-form note for context. Karen's column was wide enough to fit
  // a sentence; we mirror that.
  note?: string;
  createdAt: string;
};

const storageKey = (userId: string) => `tel:custom-goals:${userId}`;

export function useCustomGoals() {
  const { session, isDevSession } = useAuth();
  const userId = session?.user?.id ?? 'anonymous';
  const [goals, setGoals] = useState<CustomGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // AsyncStorage cache first — instant render.
        const raw = await AsyncStorage.getItem(storageKey(userId));
        if (raw && mounted) {
          const parsed = JSON.parse(raw) as CustomGoal[];
          if (Array.isArray(parsed)) setGoals(parsed);
        }

        // If we're talking to Supabase, refresh from the source of
        // truth and update the cache. Dev mode is local-only.
        if (!isDevSession && hasSupabaseConfig && supabase && session?.user?.id) {
          const { data } = await supabase
            .from('profiles')
            .select('custom_goals')
            .eq('id', session.user.id)
            .single();
          const remote = (data?.custom_goals as CustomGoal[] | null) ?? [];
          if (mounted && Array.isArray(remote)) {
            setGoals(remote);
            await AsyncStorage.setItem(storageKey(userId), JSON.stringify(remote));
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isDevSession, session?.user?.id, userId]);

  const persist = useCallback(
    async (next: CustomGoal[]) => {
      setGoals(next);
      await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
      if (!isDevSession && hasSupabaseConfig && supabase && session?.user?.id) {
        await supabase
          .from('profiles')
          .update({ custom_goals: next })
          .eq('id', session.user.id);
      }
    },
    [isDevSession, session?.user?.id, userId],
  );

  const upsert = useCallback(
    async (goal: Omit<CustomGoal, 'id' | 'createdAt'> & { id?: string }) => {
      const id = goal.id ?? `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const existing = goals.find((g) => g.id === id);
      const merged: CustomGoal = {
        id,
        kind: goal.kind,
        label: goal.label,
        baseline: goal.baseline,
        target: goal.target,
        unit: goal.unit,
        note: goal.note,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      const next = existing
        ? goals.map((g) => (g.id === id ? merged : g))
        : [...goals, merged];
      await persist(next);
      return merged;
    },
    [goals, persist],
  );

  const remove = useCallback(
    async (id: string) => {
      await persist(goals.filter((g) => g.id !== id));
    },
    [goals, persist],
  );

  return { goals, loading, upsert, remove };
}
