// lib/limiters.ts
//
// Six-limiter taxonomy from Karen's dev brief (2026-06-16). Used as the
// routing key for the self-serve pathway and as the primaryNeed /
// secondaryNeeds tag on every teaching concept. Beta 2 ships the schema;
// the questionnaire that scores members into a limiter ships in a later
// slice. Order matches the brief.

export type LimiterId =
  | 'identity'
  | 'knowledge'
  | 'systems'
  | 'energy'
  | 'resilience'
  | 'competence';

export const LIMITER_IDS: readonly LimiterId[] = [
  'identity',
  'knowledge',
  'systems',
  'energy',
  'resilience',
  'competence',
] as const;

export type Limiter = {
  id: LimiterId;
  shortLabel: string;
  longLabel: string;
  exampleQuote: string;
  helper: string;
};

export const LIMITERS: Record<LimiterId, Limiter> = {
  identity: {
    id: 'identity',
    shortLabel: 'Identity',
    longLabel: 'Identity / narrative',
    exampleQuote:
      "I do the work for two weeks, then some old story about who I am kicks back in and I'm right where I started.",
    helper:
      "The limiter is not effort. It is a self-concept that has not caught up to the new behavior.",
  },
  knowledge: {
    id: 'knowledge',
    shortLabel: 'Knowledge gap',
    longLabel: 'Localized knowledge gap',
    exampleQuote:
      "I am completely solid on the workouts, but I genuinely do not know what I am doing with food.",
    helper:
      "Capable across most of life, with one specific thread blank. Not a global deficit.",
  },
  systems: {
    id: 'systems',
    shortLabel: 'Systems',
    longLabel: 'Execution / systems',
    exampleQuote:
      "I know exactly what to do. I just do not have anything set up that makes it happen on a normal Tuesday.",
    helper:
      "Over-informed and under-structured. The missing piece is the system, not more information.",
  },
  energy: {
    id: 'energy',
    shortLabel: 'Energy',
    longLabel: 'Energy / capacity',
    exampleQuote:
      "By the time I could do the thing, there is nothing left in the tank.",
    helper:
      "Running too depleted to follow through. Often the energy is spent elsewhere before it reaches their own goals.",
  },
  resilience: {
    id: 'resilience',
    shortLabel: 'Resilience',
    longLabel: 'Resilience / recovery',
    exampleQuote:
      "I am fine until something throws me off, and then one missed day becomes three weeks.",
    helper:
      "The routine works. The recovery does not. The gap is in how they get back.",
  },
  competence: {
    id: 'competence',
    shortLabel: 'Competence gradient',
    longLabel: 'Competence gradient',
    exampleQuote:
      "I am good at what I am good at, and being a beginner at this feels intolerable, so I avoid it.",
    helper:
      "Accomplished people who would rather not start something where they will be visibly clumsy.",
  },
};

export function limiterFor(id: LimiterId): Limiter {
  return LIMITERS[id];
}
