// lib/conceptMetadata.ts
//
// Shared metadata schema for every teaching concept (Tools and Week
// lessons). The same library serves the guided 12-week spine and the
// (future) self-serve limiter router — these tags are what make one
// engine sufficient.

import type { BlockId } from './program';
import type { LimiterId } from './limiters';

export type ConceptScope = BlockId | 'library';

export type ConceptMetadata = {
  // Which block this concept lives in, or 'library' if it is a
  // non-block-bound asset accessible across blocks.
  block: ConceptScope;

  // Which of the six limiters this concept most directly serves.
  primaryNeed: LimiterId;

  // Other limiters it partly addresses. May be empty.
  secondaryNeeds: LimiterId[];

  // Concept slugs (tool slugs, week slugs, lesson slugs) that must come
  // before this one to make sense. Honored by both pathways.
  prerequisites: string[];

  // Can a self-serve member land on this concept as their first
  // exposure, or does it require setup from earlier concepts?
  entryPointEligible: boolean;
};

export type LayerSet = {
  // Layer 1 (30-second text) is ALWAYS present. Drives the engagement
  // tracker. Required reading.
  layer1: true;
  // Layer 2 (core teaching, read-or-listen) is usually present but may
  // be absent for very small concepts.
  layer2: boolean;
  // Layer 3 (deep-dive audio) is optional, invisible to those who do
  // not want it.
  layer3: boolean;
};
