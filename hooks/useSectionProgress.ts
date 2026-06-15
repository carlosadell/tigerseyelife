// hooks/useSectionProgress.ts
//
// Dual-path progress tracker for curriculum sections. Per CLAUDE.md, every
// data hook must work in both Supabase mode (real DB) and dev mode
// (AsyncStorage only) — the rebuild's gating is broken otherwise.
//
// Supabase mode: selects from user_section_progress, calls
// complete_section_user RPC on completion. RPC server-side will trigger
// maybe_advance_block.
//
// Dev mode: AsyncStorage under tel:sections:<userId> holding
// Record<sectionSlug, completedAtISO>. When a section completion would
// finish a block (6 of 6), updates the dev membership record's currentBlock
// directly (no trigger to bypass in dev).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { useMembership, type Block } from './useMembership';
import {
  BLOCK_IDS,
  sectionsForBlock,
  type BlockId,
} from '../lib/curriculum';
import { supabase } from '../lib/supabase';

type ProgressMap = Record<string, string>; // slug → completedAt ISO

const devProgressKey = (userId: string) => `tel:sections:${userId}`;
const devMembershipKey = (userId: string) => `tel:membership:${userId}`;

function nextBlock(current: Block | null): Block | null {
  if (!current) return null;
  const idx = BLOCK_IDS.indexOf(current as BlockId);
  if (idx < 0) return null;
  const next = BLOCK_IDS[idx + 1];
  return (next ?? null) as Block | null;
}

export function useSectionProgress() {
  const { isDevSession, session } = useAuth();
  const { membership, refresh: refreshMembership } = useMembership();
  const userId = session?.user.id ?? null;

  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(Boolean(session));

  const load = useCallback(async () => {
    if (!session || !userId) {
      setProgress({});
      setLoading(false);
      return;
    }
    setLoading(true);

    if (isDevSession || !supabase) {
      const raw = await AsyncStorage.getItem(devProgressKey(userId));
      setProgress(raw ? (JSON.parse(raw) as ProgressMap) : {});
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_section_progress')
      .select('section_slug,completed_at,completed')
      .eq('user_id', userId)
      .eq('completed', true);

    const map: ProgressMap = {};
    (data ?? []).forEach((row) => {
      if (row.section_slug && row.completed_at) {
        map[row.section_slug] = row.completed_at;
      }
    });
    setProgress(map);
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

  const isCompleted = useCallback(
    (slug: string) => Boolean(progress[slug]),
    [progress],
  );

  const completedInBlock = useCallback(
    (blockId: BlockId) =>
      sectionsForBlock(blockId).reduce(
        (n, s) => (progress[s.slug] ? n + 1 : n),
        0,
      ),
    [progress],
  );

  const completeSection = useCallback(
    async (blockId: BlockId, slug: string) => {
      if (!userId) return;
      const now = new Date().toISOString();
      const nextProgress = { ...progress, [slug]: now };

      if (isDevSession || !supabase) {
        // Write progress first
        await AsyncStorage.setItem(devProgressKey(userId), JSON.stringify(nextProgress));

        // If this completes the block (6 of 6), advance dev membership currentBlock
        const blockCompletedCount = sectionsForBlock(blockId).reduce(
          (n, s) => (nextProgress[s.slug] ? n + 1 : n),
          0,
        );

        if (blockCompletedCount === 6 && membership.currentBlock === blockId) {
          const advance = nextBlock(membership.currentBlock);
          if (advance) {
            const raw = await AsyncStorage.getItem(devMembershipKey(userId));
            if (raw) {
              const parsed = JSON.parse(raw);
              parsed.currentBlock = advance;
              await AsyncStorage.setItem(devMembershipKey(userId), JSON.stringify(parsed));
              await refreshMembership();
            }
          }
        }

        setProgress(nextProgress);
        return;
      }

      // Supabase mode — call the RPC, then refresh both progress + membership
      await supabase.rpc('complete_section_user', {
        p_block_name: blockId,
        p_section_slug: slug,
      });

      await load();
      await refreshMembership();
    },
    [isDevSession, load, membership.currentBlock, progress, refreshMembership, userId],
  );

  return {
    loading,
    progress,
    isCompleted,
    completedInBlock,
    completeSection,
    refresh: load,
  };
}
