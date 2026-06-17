// lib/heroPhotos.ts
//
// Tab-specific hero photos. Each tab needs its own contextually
// appropriate imagery so the four full-width hero cards don't read as
// the same screen. Photos are keyed by block so when Karen/Ryan deliver
// per-block art these maps swap in cleanly.
//
// Today stays with coachStillForWeek (that's the "coach context"
// concept — see lib/coachStills.ts). The Train/Fuel/Grow tabs use this
// file instead.

import type { BlockId, WeekNumber } from './program';
import { currentBlockFor } from './program';

// Train — workout / movement / training imagery.
const TRAIN_SEED = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800';
const TRAIN_BY_BLOCK: Record<BlockId, string> = {
  COMMIT: TRAIN_SEED,
  REFINE: TRAIN_SEED,
  EVOLVE: TRAIN_SEED,
  ADAPT:  TRAIN_SEED,
  THRIVE: TRAIN_SEED,
  EXCEL:  TRAIN_SEED,
};

// Fuel — food, plates, fresh produce.
const FUEL_SEED = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800';
const FUEL_BY_BLOCK: Record<BlockId, string> = {
  COMMIT: FUEL_SEED,
  REFINE: FUEL_SEED,
  EVOLVE: FUEL_SEED,
  ADAPT:  FUEL_SEED,
  THRIVE: FUEL_SEED,
  EXCEL:  FUEL_SEED,
};

// Grow — journals, reading, study, reflection.
const GROW_SEED = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800';
const GROW_BY_BLOCK: Record<BlockId, string> = {
  COMMIT: GROW_SEED,
  REFINE: GROW_SEED,
  EVOLVE: GROW_SEED,
  ADAPT:  GROW_SEED,
  THRIVE: GROW_SEED,
  EXCEL:  GROW_SEED,
};

function clampWeek(week: number): WeekNumber {
  return Math.max(1, Math.min(12, week)) as WeekNumber;
}

export function trainHeroPhotoForWeek(week: number): string {
  return TRAIN_BY_BLOCK[currentBlockFor(clampWeek(week))];
}

export function fuelHeroPhotoForWeek(week: number): string {
  return FUEL_BY_BLOCK[currentBlockFor(clampWeek(week))];
}

export function growHeroPhotoForWeek(week: number): string {
  return GROW_BY_BLOCK[currentBlockFor(clampWeek(week))];
}
