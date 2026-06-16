// hooks/useCurrentWeek.ts
//
// Resolves current week from the user's profile or membership state.
// Falls back to 1 (start of COMMIT) for new users.

import { useMembership } from './useMembership';
import type { BlockId, WeekNumber } from '../lib/program';
import { currentBlockFor } from '../lib/program';

const BLOCK_FIRST_WEEK: Record<BlockId, WeekNumber> = {
  COMMIT: 1,
  REFINE: 3,
  EVOLVE: 5,
  ADAPT: 7,
  THRIVE: 9,
  EXCEL: 11,
};

export function useCurrentWeek(): {
  weekNumber: WeekNumber;
  blockId: BlockId;
  loading: boolean;
} {
  const { membership, loading } = useMembership();

  const block = (membership.currentBlock ?? 'COMMIT') as BlockId;
  const weekNumber = BLOCK_FIRST_WEEK[block];

  return {
    weekNumber,
    blockId: currentBlockFor(weekNumber),
    loading,
  };
}
