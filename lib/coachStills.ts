// lib/coachStills.ts
//
// Coach photo asset resolution. Six block-keyed entries; all currently
// point to the seed image until Karen+Ryan deliver real per-block photos.

import type { BlockId, WeekNumber } from './program';
import { currentBlockFor } from './program';

// The existing seed image used across all surfaces. Replace this and the
// individual block entries below when real per-block photos land.
const SEED_STILL = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800';

const STILLS_BY_BLOCK: Record<BlockId, string> = {
  COMMIT: SEED_STILL,
  REFINE: SEED_STILL,
  EVOLVE: SEED_STILL,
  ADAPT: SEED_STILL,
  THRIVE: SEED_STILL,
  EXCEL: SEED_STILL,
};

export function coachStillForBlock(blockId: BlockId): string {
  return STILLS_BY_BLOCK[blockId];
}

export function coachStillForWeek(week: number): string {
  return coachStillForBlock(currentBlockFor(Math.max(1, Math.min(12, week)) as WeekNumber));
}

export function coachStillForToday(): string {
  return SEED_STILL;
}
