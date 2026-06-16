// hooks/useCurrentWeek.ts
import { useMembership } from './useMembership';
import type { BlockId, WeekNumber } from '../lib/program';
import { currentBlockFor, WEEK_NUMBERS } from '../lib/program';

const BLOCK_FIRST_WEEK: Record<BlockId, WeekNumber> = {
  COMMIT: 1,
  REFINE: 3,
  EVOLVE: 5,
  ADAPT: 7,
  THRIVE: 9,
  EXCEL: 11,
};

function asWeekNumber(n: number | null | undefined): WeekNumber | null {
  if (n == null) return null;
  return (WEEK_NUMBERS as readonly number[]).includes(n) ? (n as WeekNumber) : null;
}

export function useCurrentWeek(): {
  weekNumber: WeekNumber;
  blockId: BlockId;
  loading: boolean;
} {
  const { membership, loading } = useMembership();
  const stored = asWeekNumber((membership as unknown as { currentWeek?: number }).currentWeek);
  const block = (membership.currentBlock ?? 'COMMIT') as BlockId;
  const weekNumber = stored ?? BLOCK_FIRST_WEEK[block];
  return {
    weekNumber,
    blockId: currentBlockFor(weekNumber),
    loading,
  };
}
