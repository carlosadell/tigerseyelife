// lib/blockContext.ts
//
// Block-scoped helper copy for the 4 canonical workouts. Kept
// separate from lib/workoutSchedule.ts because a Workout's identity
// is one of four numbered entities, not a per-block variant — the
// block-specific framing gets overlaid at render time.

import type { BlockId } from './program';
import { BLOCK_HELPER_BY_SLOT } from './workoutTemplates';
import type { WorkoutSlotIndex } from './workoutSchedule';

export function getBlockHelper(blockId: BlockId, slotIndex: WorkoutSlotIndex): string {
  return BLOCK_HELPER_BY_SLOT[blockId][slotIndex];
}
