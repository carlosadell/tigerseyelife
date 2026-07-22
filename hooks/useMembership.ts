// hooks/useMembership.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { currentBlockFor, type WeekNumber } from '../lib/program';

export type Block = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';

export type CoachingStyle = 'direct' | 'warm' | 'balanced' | 'challenging';
export type TopObstacle = 'time' | 'motivation' | 'knowledge' | 'injury' | 'cost' | 'other';

/**
 * Non-member intake state — captured optionally via /non-member-intake
 * when the user chooses "Tailor a plan" over Join/Request. An empty
 * `{}` diagnostic still marks the fork as answered so the gate stops
 * sending them back to /membership.
 *
 * (Earlier flow had a 2-question diagnostic for friction + stoppingPoint
 * before the choice surface — retired 2026-06-16 once the Tailor intake
 * landed. The fields remain optional in case we want to bring those
 * questions back via the choice surface.)
 */
export type NonMemberDiagnostic = {
  friction?: string;
  stoppingPoint?: string;
  goal?: string;
  topObstacle?: TopObstacle;
  coachingStyle?: CoachingStyle;
};

export type Membership = {
  forkAnswered: boolean;
  programMember: boolean;
  joinEmail: string | null;
  verifiedAt: string | null;
  currentBlock: Block | null;
  currentWeek: number;
  nonMemberDiagnostic: NonMemberDiagnostic | null;
};

const EMPTY: Membership = {
  forkAnswered: false,
  programMember: false,
  joinEmail: null,
  verifiedAt: null,
  currentBlock: null,
  currentWeek: 1,
  nonMemberDiagnostic: null,
};

const devKey = (userId: string) => `tel:membership:${userId}`;

export function isIntakeComplete(d: NonMemberDiagnostic | null): boolean {
  return Boolean(d && d.goal && d.topObstacle && d.coachingStyle);
}

export function useMembership() {
  const { isDevSession, session } = useAuth();
  const userId = session?.user.id ?? null;

  const [membership, setMembership] = useState<Membership>(EMPTY);
  const [loading, setLoading] = useState(Boolean(session));

  const load = useCallback(async () => {
    if (!session || !userId) {
      setMembership(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);

    if (isDevSession || !supabase) {
      const raw = await AsyncStorage.getItem(devKey(userId));
      const diagnosticRaw = await AsyncStorage.getItem(`${devKey(userId)}:diagnostic`);
      const base = raw ? (JSON.parse(raw) as Membership) : EMPTY;
      const diagnostic = diagnosticRaw ? (JSON.parse(diagnosticRaw) as NonMemberDiagnostic) : null;
      setMembership({ ...base, currentWeek: base.currentWeek ?? 1, nonMemberDiagnostic: diagnostic });
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('program_member,join_email,verified_at,current_block,current_week,non_member_diagnostic')
      .eq('id', userId)
      .maybeSingle();

    setMembership({
      forkAnswered: Boolean(
        data?.verified_at || data?.non_member_diagnostic || data?.program_member,
      ),
      programMember: Boolean(data?.program_member),
      joinEmail: data?.join_email ?? null,
      verifiedAt: data?.verified_at ?? null,
      currentBlock: (data?.current_block as Block | null) ?? null,
      currentWeek: (data?.current_week as number | null) ?? 1,
      nonMemberDiagnostic: (data?.non_member_diagnostic as NonMemberDiagnostic | null) ?? null,
    });
    setLoading(false);
  }, [isDevSession, session, userId]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const devMarkVerified = useCallback(
    async (joinEmail: string) => {
      if (!userId) return;
      const next: Membership = {
        forkAnswered: true,
        programMember: true,
        joinEmail,
        verifiedAt: new Date().toISOString(),
        currentBlock: 'COMMIT',
        currentWeek: 1,
        nonMemberDiagnostic: null,
      };
      await AsyncStorage.setItem(devKey(userId), JSON.stringify(next));
      setMembership(next);
    },
    [userId],
  );

  /**
   * Records or merges non-member intake data. Accepts the initial diagnostic
   * (friction + stoppingPoint) or follow-up intake fields (goal, topObstacle,
   * coachingStyle) — anything passed gets merged on top of existing data.
   */
  const recordNonMember = useCallback(
    async (updates: Partial<NonMemberDiagnostic>) => {
      if (!userId) return;

      const existing: NonMemberDiagnostic = membership.nonMemberDiagnostic ?? {};
      const merged: NonMemberDiagnostic = { ...existing, ...updates };

      if (isDevSession || !supabase) {
        const next: Membership = {
          forkAnswered: true,
          programMember: false,
          joinEmail: null,
          verifiedAt: null,
          currentBlock: null,
          currentWeek: 1,
          nonMemberDiagnostic: merged,
        };
        await AsyncStorage.setItem(devKey(userId), JSON.stringify(next));
        await AsyncStorage.setItem(`${devKey(userId)}:diagnostic`, JSON.stringify(merged));
        setMembership(next);
        return;
      }

      await supabase
        .from('profiles')
        .update({ non_member_diagnostic: merged })
        .eq('id', userId);

      await load();
    },
    [isDevSession, load, membership.nonMemberDiagnostic, userId],
  );

  /**
   * Dev-only: wipe the AsyncStorage membership key so the fork re-opens.
   * No effect against Supabase rows — for production resets, the server has
   * to clear the entitlement columns.
   */
  const devReset = useCallback(async () => {
    if (!userId) return;
    await AsyncStorage.removeItem(devKey(userId));
    await AsyncStorage.removeItem(`${devKey(userId)}:diagnostic`);
    setMembership(EMPTY);
  }, [userId]);

  /**
   * Dev-only: jump the current week (and matching block) so gated content
   * can be verified without waiting twelve real weeks. Marks the user as a
   * program member if not already. Persisted to AsyncStorage; no Supabase
   * write — this is for the local dev client only.
   */
  const devSetWeek = useCallback(
    async (weekNumber: WeekNumber) => {
      if (!userId) return;
      const next: Membership = {
        forkAnswered: true,
        programMember: true,
        joinEmail: membership.joinEmail ?? 'dev@tigerseyelife',
        verifiedAt: membership.verifiedAt ?? new Date().toISOString(),
        currentBlock: currentBlockFor(weekNumber) as Block,
        currentWeek: weekNumber,
        nonMemberDiagnostic: null,
      };
      await AsyncStorage.setItem(devKey(userId), JSON.stringify(next));
      setMembership(next);
    },
    [userId, membership.joinEmail, membership.verifiedAt],
  );

  return { loading, membership, refresh: load, devMarkVerified, recordNonMember, devReset, devSetWeek };
}
