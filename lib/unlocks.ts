// lib/unlocks.ts
//
// Progressive feature unlock schedule. See memory
// create-power-progressive-unlock-schedule. Locked features are HIDDEN
// from navigation entirely, not shown with a "coming soon" badge.

import type { WeekNumber } from './program';

export type FeatureKey =
  | 'meal-logging'
  | 'pause-practice'
  | 'kitchen-reset'
  | 'teb-loop'
  | 'identity-statements'
  | 'meal-prep'
  | 'box-breathing'
  | 'bare-minimum-protocol'
  | 'three-energy-accounts'
  | 'pattern-maintenance';

export const UNLOCK_AT: Record<FeatureKey, WeekNumber> = {
  'kitchen-reset': 3,
  'meal-logging': 3,
  'pause-practice': 4,
  'teb-loop': 5,
  'identity-statements': 5,
  'meal-prep': 5,
  'box-breathing': 7,
  'bare-minimum-protocol': 8,
  'three-energy-accounts': 10,
  'pattern-maintenance': 11,
};

export function isFeatureUnlocked(feature: FeatureKey, currentWeek: WeekNumber): boolean {
  return currentWeek >= UNLOCK_AT[feature];
}

export function unlockedFeaturesAt(currentWeek: WeekNumber): FeatureKey[] {
  return (Object.keys(UNLOCK_AT) as FeatureKey[]).filter((f) =>
    isFeatureUnlocked(f, currentWeek),
  );
}
