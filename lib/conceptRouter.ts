// lib/conceptRouter.ts
//
// Self-serve routing. Given a winning limiter, pick the concept the user
// lands on first. Per the brief: "Entry point varies by limiter — we slot
// them where their actual need lives." This module is the entry-point
// resolver; sequencing past the first concept is a later concern.
//
// The prerequisite gate is honored here: a concept is only eligible as
// an entry point if entryPointEligible === true AND it has no
// prerequisites listed. That way we cannot accidentally serve a concept
// that depends on earlier content the self-serve user has not seen.

import type { LimiterId } from './limiters';
import type { Tool } from './tools';
import { TOOLS } from './tools';

// The brief calls out that "Competence gradient" has no purpose-built
// concept yet and borrows from identity work. This fallback map encodes
// that explicitly so the router behavior is auditable rather than buried
// in a sort.
const FALLBACK_LIMITER: Partial<Record<LimiterId, LimiterId>> = {
  competence: 'identity',
};

export function entryConceptsFor(limiter: LimiterId): Tool[] {
  const direct = entryEligibleToolsTargeting(limiter);
  if (direct.length > 0) return direct;

  const fallback = FALLBACK_LIMITER[limiter];
  return fallback ? entryEligibleToolsTargeting(fallback) : [];
}

export function entryConceptFor(limiter: LimiterId): Tool | undefined {
  return entryConceptsFor(limiter)[0];
}

function entryEligibleToolsTargeting(limiter: LimiterId): Tool[] {
  return Object.values(TOOLS)
    .filter(
      (tool) =>
        tool.metadata.entryPointEligible &&
        tool.metadata.prerequisites.length === 0 &&
        (tool.metadata.primaryNeed === limiter ||
          tool.metadata.secondaryNeeds.includes(limiter)),
    )
    .sort(byNeedAffinity(limiter));
}

// ============================================================
// Sequence engine — what comes after the entry concept.
// ============================================================
//
// Self-serve isn't unguided. After the entry concept, we still feed the
// member the next-best content from the same library — drawing on
// prerequisite metadata so the order makes sense. The brief: "Sequence
// is built from need, drawing on the same library of content in CREATE
// POWER. The app does the routing."
//
// `nextConceptAfter` returns the next eligible tool for a member, given:
//   - the limiter we routed them on
//   - the concept they just finished
//   - the slugs they have already completed
//
// Returns `undefined` when the limiter's tools are exhausted (the caller
// should fall back to a coach prompt or progression suggestion).

export type SequenceArgs = {
  limiter: LimiterId;
  completedSlugs: ReadonlyArray<string>;
};

export function sequenceFor({ limiter, completedSlugs }: SequenceArgs): Tool[] {
  const done = new Set(completedSlugs);

  return Object.values(TOOLS)
    .filter((tool) => !done.has(tool.slug))
    .filter((tool) => prereqsMet(tool, done))
    .filter(
      (tool) =>
        tool.metadata.primaryNeed === limiter ||
        tool.metadata.secondaryNeeds.includes(limiter),
    )
    .sort(byNeedAffinity(limiter));
}

export function nextConceptAfter(args: SequenceArgs): Tool | undefined {
  return sequenceFor(args)[0];
}

function prereqsMet(tool: Tool, done: Set<string>): boolean {
  return tool.metadata.prerequisites.every((p) => done.has(p));
}

function byNeedAffinity(limiter: LimiterId) {
  return (a: Tool, b: Tool): number => {
    // Primary-need matches outrank secondary-need matches.
    const aPrimary = a.metadata.primaryNeed === limiter ? 0 : 1;
    const bPrimary = b.metadata.primaryNeed === limiter ? 0 : 1;
    if (aPrimary !== bPrimary) return aPrimary - bPrimary;
    // High-impact (isStar) concepts surface earlier inside each tier.
    const aStar = a.isStar ? 0 : 1;
    const bStar = b.isStar ? 0 : 1;
    if (aStar !== bStar) return aStar - bStar;
    // Earlier in the program wins. Library-level concepts
    // (introducedInWeek === 0) sort first.
    return a.introducedInWeek - b.introducedInWeek;
  };
}
