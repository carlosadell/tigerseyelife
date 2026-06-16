// lib/program.ts
//
// The CREATE POWER 12-week program data model. Replaces the old 6-thread
// x 6-block curriculum. Authored content lives in lib/programContent.ts.

export type WeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export const WEEK_NUMBERS: readonly WeekNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export type BlockId = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';
export const BLOCK_IDS: readonly BlockId[] = ['COMMIT', 'REFINE', 'EVOLVE', 'ADAPT', 'THRIVE', 'EXCEL'];

export type ThreadLetter = 'P' | 'O' | 'W' | 'E' | 'R';
export const THREAD_NAMES: Record<ThreadLetter, string> = {
  P: 'Patterns',
  O: 'Ownership',
  W: 'Wisdom',
  E: 'Energy',
  R: 'Resilience',
};

export type CompassRole = 'PRIMARY' | 'SECONDARY' | 'MAINTAIN';

export type ActionItem = {
  id: string;
  label: string;
  thread: ThreadLetter;
  weeklyTarget: number;
};

export type Week = {
  weekNumber: WeekNumber;
  blockId: BlockId;
  title: string;
  primaryFocus: string;
  slideNotes: string[];
  weekAtAGlance: ActionItem[];
  toolSlugs: string[];
  discussionPrompt: string;
};

export type Block = {
  blockId: BlockId;
  weekRange: [WeekNumber, WeekNumber];
  mindset: string;
  consistencyTarget: string;
  powerCompass: Record<ThreadLetter, { role: CompassRole; note: string }>;
};

import { BLOCKS, WEEKS } from './programContent';

export { BLOCKS, WEEKS };

export function weekFor(n: WeekNumber): Week {
  const w = WEEKS.find((w) => w.weekNumber === n);
  if (!w) throw new Error(`Week ${n} not found`);
  return w;
}

export function blockFor(id: BlockId): Block {
  const b = BLOCKS.find((b) => b.blockId === id);
  if (!b) throw new Error(`Block ${id} not found`);
  return b;
}

export function currentBlockFor(week: WeekNumber): BlockId {
  const map: Record<WeekNumber, BlockId> = {
    1: 'COMMIT', 2: 'COMMIT',
    3: 'REFINE', 4: 'REFINE',
    5: 'EVOLVE', 6: 'EVOLVE',
    7: 'ADAPT',  8: 'ADAPT',
    9: 'THRIVE', 10: 'THRIVE',
    11: 'EXCEL', 12: 'EXCEL',
  };
  return map[week];
}

export function weeksInBlock(blockId: BlockId): Week[] {
  return WEEKS.filter((w) => w.blockId === blockId);
}
