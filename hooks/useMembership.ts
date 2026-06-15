// hooks/useMembership.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export type Block = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';

export type Membership = {
  forkAnswered: boolean;
  programMember: boolean;
  joinEmail: string | null;
  verifiedAt: string | null;
  currentBlock: Block | null;
};

const EMPTY: Membership = {
  forkAnswered: false,
  programMember: false,
  joinEmail: null,
  verifiedAt: null,
  currentBlock: null,
};

const devKey = (userId: string) => `tel:membership:${userId}`;

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
      setMembership(raw ? (JSON.parse(raw) as Membership) : EMPTY);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('program_member,join_email,verified_at,current_block,non_member_diagnostic')
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
      };
      await AsyncStorage.setItem(devKey(userId), JSON.stringify(next));
      setMembership(next);
    },
    [userId],
  );

  const recordNonMember = useCallback(
    async (diagnostic: { friction: string; stoppingPoint: string }) => {
      if (!userId) return;

      if (isDevSession || !supabase) {
        const next: Membership = {
          forkAnswered: true,
          programMember: false,
          joinEmail: null,
          verifiedAt: null,
          currentBlock: null,
        };
        await AsyncStorage.setItem(devKey(userId), JSON.stringify(next));
        await AsyncStorage.setItem(`${devKey(userId)}:diagnostic`, JSON.stringify(diagnostic));
        setMembership(next);
        return;
      }

      await supabase
        .from('profiles')
        .update({ non_member_diagnostic: diagnostic })
        .eq('id', userId);

      await load();
    },
    [isDevSession, load, userId],
  );

  return { loading, membership, refresh: load, devMarkVerified, recordNonMember };
}
