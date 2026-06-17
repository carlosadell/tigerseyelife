// lib/pathway.ts
//
// Two-pathway routing key from the dev brief. Beta 2 launches
// guided-only; the self-serve flag exists so we can flip it on in a
// later release as a switch, not a rebuild. Every routing decision
// that differs between cohorts should consult this value, never a
// hardcoded assumption.

export type PathwayId = 'guided' | 'self-serve';

export const PATHWAY_IDS: readonly PathwayId[] = ['guided', 'self-serve'] as const;

export const DEFAULT_PATHWAY: PathwayId = 'guided';
