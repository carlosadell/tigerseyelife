// lib/onboardingSteps.ts
//
// Registry for the §3.2 intake stepper. Each entry describes one screen's
// prompt + helper + field configuration. The dynamic route at
// app/onboarding/intake/[step].tsx resolves the slug to an entry and renders
// the matching field component.
//
// Conditional steps use `skipIf` which receives the current form values and
// returns true to skip. Today only `confidence-barriers` is conditional
// (skip when confidence_level >= 7).

import type { PartialIntake } from './onboardingSchema';

export type StepSlug =
  | 'welcome'
  | 'age'
  | 'training-location'
  | 'training-duration'
  | 'training-format'
  | 'primary-goal'
  | 'success-vision'
  | 'importance-confidence'
  | 'confidence-barriers'
  | 'obstacles'
  | 'top-obstacles'
  | 'obstacle-deep-dive'
  | 'work-situation'
  | 'living-situation'
  | 'past-experience'
  | 'coaching-style'
  | 'final-prompts';

export type IntakeStepDef = {
  slug: StepSlug;
  kicker?: string;
  prompt: string;
  helper?: string;
  skipIf?: (values: PartialIntake) => boolean;
};

export const STEPS: readonly IntakeStepDef[] = [
  {
    slug: 'welcome',
    kicker: 'YOUR PLAN',
    prompt: 'Three minutes. Then we get to work.',
    helper: "We ask just enough to point Karen and Ryan at the right starting line.",
  },
  {
    slug: 'age',
    kicker: 'ABOUT YOU',
    prompt: 'How old are you?',
    helper: 'We use this to scale the workouts safely.',
  },
  {
    slug: 'training-location',
    kicker: 'HOW YOU TRAIN',
    prompt: 'Where will you be working out?',
    helper: 'This points us at the right set of workouts. You can revisit it later.',
  },
  {
    slug: 'training-duration',
    kicker: 'HOW YOU TRAIN',
    prompt: 'How long do you prefer per session?',
    helper: 'Both build real strength. Pick what fits your days.',
  },
  {
    slug: 'training-format',
    kicker: 'HOW YOU TRAIN',
    prompt: 'For your 60-minute sessions, live or on your schedule?',
    helper: 'Live meets on Zoom at set times. Pre-recorded runs whenever you like.',
    skipIf: (v) => v.training_duration !== 60,
  },
  {
    slug: 'primary-goal',
    kicker: 'GOAL',
    prompt: 'What are you trying to do?',
    helper: 'One sentence. Just the shape of it.',
  },
  {
    slug: 'success-vision',
    kicker: 'SUCCESS',
    prompt: 'What does success look like in 12 weeks?',
    helper: 'Be specific. We will check this against where you start.',
  },
  {
    slug: 'importance-confidence',
    kicker: 'WHERE YOU STAND',
    prompt: 'How important is this, and how confident do you feel?',
    helper: '0 means not at all, 10 means absolutely.',
  },
  {
    slug: 'confidence-barriers',
    kicker: 'CONFIDENCE',
    prompt: 'What makes confidence hard?',
    helper: 'No wrong answers. The real ones help us help you.',
    skipIf: (v) => (v.confidence_level ?? 10) >= 7,
  },
  {
    slug: 'obstacles',
    kicker: 'ROADBLOCKS',
    prompt: 'What gets in the way?',
    helper: 'Pick all that apply.',
  },
  {
    slug: 'top-obstacles',
    kicker: 'TOP TWO',
    prompt: 'Which two bite you the most?',
    helper: 'Tap to rank. First tap is 1st, next is 2nd.',
  },
  {
    slug: 'obstacle-deep-dive',
    kicker: 'DEEP DIVE',
    prompt: 'What makes the top one feel so hard?',
    helper: 'A sentence or two. Whatever is true.',
  },
  {
    slug: 'work-situation',
    kicker: 'CONTEXT',
    prompt: 'How does work usually look?',
  },
  {
    slug: 'living-situation',
    kicker: 'CONTEXT',
    prompt: 'Who are you living with?',
    helper: 'Pick all that apply.',
  },
  {
    slug: 'past-experience',
    kicker: 'WHAT YOU HAVE TRIED',
    prompt: 'What has worked or not worked before?',
    helper: 'Optional. Skip if it does not feel relevant.',
  },
  {
    slug: 'coaching-style',
    kicker: 'YOUR COACH',
    prompt: 'How do you want us to coach you?',
    helper: 'You can change this any time later.',
  },
  {
    slug: 'final-prompts',
    kicker: 'LAST FEW',
    prompt: 'Three small things to land it.',
    helper: 'Then we send you in.',
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
 * Returns the next slug forward, skipping any whose `skipIf` predicate returns
 * true. Returns 'review' if we run off the end.
 */
export function nextSlug(currentSlug: StepSlug, values: PartialIntake): StepSlug | 'review' {
  const idx = stepIndexFromSlug(currentSlug);
  for (let i = idx + 1; i < STEPS.length; i++) {
    const candidate = STEPS[i];
    if (candidate.skipIf?.(values)) continue;
    return candidate.slug;
  }
  return 'review';
}

/**
 * Returns the previous slug backward, skipping any whose `skipIf` predicate
 * returns true. Returns null if we hit the start.
 */
export function prevSlug(currentSlug: StepSlug, values: PartialIntake): StepSlug | null {
  const idx = stepIndexFromSlug(currentSlug);
  for (let i = idx - 1; i >= 0; i--) {
    const candidate = STEPS[i];
    if (candidate.skipIf?.(values)) continue;
    return candidate.slug;
  }
  return null;
}
