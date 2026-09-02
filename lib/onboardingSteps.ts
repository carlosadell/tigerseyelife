// lib/onboardingSteps.ts
//
// Registry for the §3.2 intake stepper. Each entry describes one screen's
// prompt + helper + field configuration. The dynamic route at
// app/onboarding/intake/[step].tsx resolves the slug to an entry and renders
// the matching field component.
//
// Conditional steps use `skipIf` which receives the current form values and
// The flow is intentionally linear so progress and back navigation stay clear.

import type { PartialIntake } from "./onboardingSchema";

export type StepSlug =
  | "age"
  | "goals"
  | "readiness"
  | "obstacles"
  | "context"
  | "coaching-style";

export type IntakeStepDef = {
  slug: StepSlug;
  kicker?: string;
  prompt: string;
  helper?: string;
};

export const STEPS: readonly IntakeStepDef[] = [
  {
    slug: "age",
    kicker: "ABOUT YOU",
    prompt: "How old are you?",
    helper: "We use this to scale the workouts safely.",
  },
  {
    slug: "goals",
    kicker: "GOAL",
    prompt: "What are you working toward?",
    helper: "Name the goal and what success would look like after 12 weeks.",
  },
  {
    slug: "readiness",
    kicker: "READINESS",
    prompt: "How ready do you feel?",
    helper: "Two quick ratings help us set the right pace.",
  },
  {
    slug: "obstacles",
    kicker: "ROADBLOCKS",
    prompt: "What gets in the way most?",
    helper: "Choose up to two. Add a short note only if it helps.",
  },
  {
    slug: "context",
    kicker: "CONTEXT",
    prompt: "What does daily life look like?",
    helper: "Work and home context help us make the plan realistic.",
  },
  {
    slug: "coaching-style",
    kicker: "YOUR COACH",
    prompt: "How do you want us to coach you?",
    helper: "You can change this later.",
  },
];

// Total visible steps (used by IntakeProgressDots / navigation math).
// Conditional steps that get skipped still count toward `totalSteps` so the
// progress dots don't jump around mid-flow.
export const TOTAL_STEPS = STEPS.length;

export function stepBySlug(slug: string): IntakeStepDef | undefined {
  return STEPS.find((s) => s.slug === slug);
}

export function stepIndexFromSlug(slug: string): number {
  return STEPS.findIndex((s) => s.slug === slug);
}

/**
 * Returns the next slug forward, or 'review' after the final step.
 */
export function nextSlug(
  currentSlug: StepSlug,
  _values: PartialIntake,
): StepSlug | "review" {
  const idx = stepIndexFromSlug(currentSlug);
  for (let i = idx + 1; i < STEPS.length; i++) {
    return STEPS[i].slug;
  }
  return "review";
}

/**
 * Returns the previous slug backward, or null at the start.
 */
export function prevSlug(
  currentSlug: StepSlug,
  _values: PartialIntake,
): StepSlug | null {
  const idx = stepIndexFromSlug(currentSlug);
  for (let i = idx - 1; i >= 0; i--) {
    return STEPS[i].slug;
  }
  return null;
}
