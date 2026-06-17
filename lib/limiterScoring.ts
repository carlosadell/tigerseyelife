// lib/limiterScoring.ts
//
// Self-serve intake scoring. Per the dev brief: the routing key for the
// self-serve pathway is which of the six limiters is holding the member
// back. The questionnaire scores answers into a primary limiter; the
// concept router (lib/conceptRouter.ts) then picks where to drop them
// in the library.
//
// This is the *skeleton* the brief asks for — wired but not yet validated
// in Beta 2. The actual question wording is placeholder copy that Karen
// will refine before the self-serve pathway flips on. The scoring
// algorithm and data flow are real and will not need to change when the
// copy lands.

import type { LimiterId } from './limiters';
import { LIMITER_IDS } from './limiters';

export type LimiterQuestion = {
  id: string;
  prompt: string;
  helper?: string;
  options: ReadonlyArray<LimiterOption>;
};

export type LimiterOption = {
  id: string;
  label: string;
  // Each answer awards points to one or more limiters. Most award 1 point
  // to a single limiter; "borderline" answers split points across two
  // (e.g. an answer that could be either systems or energy gets 0.5 to
  // each so we don't pre-decide for the user).
  points: Partial<Record<LimiterId, number>>;
};

export type ScoredAnswer = {
  questionId: string;
  optionId: string;
};

export type LimiterScore = Record<LimiterId, number>;

export type ScoringResult = {
  // The winning limiter, or 'time-optout' if the time-eligibility gate
  // fired. The brief is explicit that "no time" is never its own routing
  // category — it is either an honest opt-out or a disguise for systems
  // or energy.
  outcome: LimiterId | 'time-optout';
  // Full score breakdown so the result screen can show a runner-up
  // ("you're also a bit X") without re-scoring.
  scores: LimiterScore;
};

// Time-eligibility gate. Asked first. Picking "not-eligible" does NOT
// auto-opt-out anymore — per the dev brief's see-through rule, "no time"
// paired with self-soothing behavior is read as systems or energy, never
// as time. The follow-up question below disambiguates.
export const TIME_ELIGIBILITY_QUESTION: LimiterQuestion = {
  id: 'time-eligibility',
  prompt: 'Can you commit ten minutes a day for the next 12 weeks?',
  helper:
    'We are asking honestly — if the answer is no, we will be ready when you are.',
  options: [
    { id: 'eligible',     label: 'Yes — ten minutes works.',           points: {} },
    { id: 'not-eligible', label: 'Not right now. Ask me again later.', points: {} },
  ],
};

// See-through follow-up. Surfaces only when the user picks "not-eligible"
// above. Per the brief: "Time is never its own routing category — it's
// either an honest gate or a disguise for something we do route." Three
// answers separate the disguises (systems / energy) from the honest gate.
export const SEE_THROUGH_FOLLOWUP: LimiterQuestion = {
  id: 'time-followup',
  prompt: 'What does most evenings look like, honestly?',
  helper:
    'No wrong answer — we use this to figure out what kind of "no time" we are dealing with.',
  options: [
    {
      // Self-soothing pattern → systems or energy, never time. Points
      // split because we cannot pre-decide which one without the rest
      // of the questionnaire; the limiter questions will tip it.
      id: 'self-soothing',
      label: 'I am usually scrolling or watching TV.',
      points: { systems: 0.5, energy: 0.5 },
    },
    {
      // Depletion pattern → energy.
      id: 'depleted',
      label: 'I am wiped, even when nothing is officially on me.',
      points: { energy: 1 },
    },
    {
      // Genuinely-out-of-time pattern → honest opt-out. Scoring routes
      // to 'time-optout' when this is selected.
      id: 'full-season',
      label: 'A genuinely full season — caregiving, deadline, illness.',
      points: {},
    },
  ],
};

// Limiter-scoring questions. Six questions, each weighted toward a
// different limiter, with a couple of cross-scoring options so the
// result is not a foregone conclusion of how the user happens to read
// the prompt. Order matches the LIMITER_IDS order from the brief.
export const LIMITER_QUESTIONS: ReadonlyArray<LimiterQuestion> = [
  {
    id: 'pattern-relapse',
    prompt: 'After a few weeks of good work, what tends to pull you back?',
    options: [
      {
        id: 'old-story',
        label: 'An old story about who I am kicks in.',
        points: { identity: 1 },
      },
      {
        id: 'no-structure',
        label: 'Life gets busy and the routine falls apart.',
        points: { systems: 1 },
      },
      {
        id: 'depletion',
        label: 'I run out of energy before I can keep up.',
        points: { energy: 1 },
      },
      {
        id: 'one-bad-day',
        label: 'One missed day turns into a stretch off.',
        points: { resilience: 1 },
      },
    ],
  },
  {
    id: 'what-you-know',
    prompt: 'Which describes you best?',
    options: [
      {
        id: 'solid-mostly',
        label: 'Solid on most things; one specific area is a blank.',
        points: { knowledge: 1 },
      },
      {
        id: 'know-but-stuck',
        label: 'I know what to do; I just do not do it.',
        points: { systems: 0.7, identity: 0.3 },
      },
      {
        id: 'beginner-feels-bad',
        label: 'I am good at what I am good at — beginner stuff stings.',
        points: { competence: 1 },
      },
      {
        id: 'mixed',
        label: 'A mix of all of the above.',
        points: { identity: 0.25, knowledge: 0.25, systems: 0.25, competence: 0.25 },
      },
    ],
  },
  {
    id: 'tuesday-night',
    prompt: 'A normal Tuesday at 9 pm — what is the realest version?',
    options: [
      {
        id: 'wired-no-structure',
        label: 'I am awake and willing; nothing is set up.',
        points: { systems: 1 },
      },
      {
        id: 'depleted',
        label: 'I am wrecked. Nothing left for me.',
        points: { energy: 1 },
      },
      {
        id: 'avoid-novelty',
        label: 'I avoid anything that might make me look new at it.',
        points: { competence: 1 },
      },
      {
        id: 'spiraling',
        label: 'I missed yesterday so today feels pointless.',
        points: { resilience: 1 },
      },
    ],
  },
  {
    id: 'biggest-block',
    prompt: 'What is genuinely the hardest part for you?',
    options: [
      {
        id: 'self-concept',
        label: 'The voice in my head saying "this is not me."',
        points: { identity: 1 },
      },
      {
        id: 'specific-gap',
        label: 'One topic I have never figured out — food, sleep, training.',
        points: { knowledge: 1 },
      },
      {
        id: 'recovering',
        label: 'Getting back on after I have fallen off.',
        points: { resilience: 1 },
      },
      {
        id: 'capacity',
        label: 'Having enough left at the end of the day.',
        points: { energy: 1 },
      },
    ],
  },
  {
    id: 'comeback-style',
    prompt: 'You missed three days. What happens next?',
    options: [
      {
        id: 'restart-easy',
        label: 'I just start again the next day.',
        points: {},
      },
      {
        id: 'restart-hard',
        label: 'It takes me a week or two to get back.',
        points: { resilience: 1 },
      },
      {
        id: 'restart-redesign',
        label: 'I want to redesign the system before I restart.',
        points: { systems: 0.6, competence: 0.4 },
      },
      {
        id: 'restart-quiet',
        label: 'I quietly drop it and pretend I never started.',
        points: { identity: 0.7, competence: 0.3 },
      },
    ],
  },
  {
    id: 'beginner-feel',
    prompt: 'How does being visibly clumsy at a new thing land for you?',
    options: [
      {
        id: 'fine',
        label: 'Fine — it is the cost of learning.',
        points: {},
      },
      {
        id: 'uncomfortable',
        label: 'Uncomfortable but tolerable.',
        points: { competence: 0.5 },
      },
      {
        id: 'intolerable',
        label: 'Intolerable. I avoid it.',
        points: { competence: 1 },
      },
      {
        id: 'depends-area',
        label: 'Fine in some areas, intolerable in others.',
        points: { competence: 0.7, knowledge: 0.3 },
      },
    ],
  },
];

export function scoreLimiterAnswers(
  answers: ReadonlyArray<ScoredAnswer>,
): ScoringResult {
  // See-through gate. Per the brief, only the genuinely-out-of-time
  // signal (time = not-eligible AND followup = full-season) routes to
  // an opt-out. Every other shape of "no time" is a disguise for
  // systems or energy, and the follow-up has already awarded those
  // points — we then score the rest of the questionnaire normally.
  const timeAnswer = answers.find((a) => a.questionId === TIME_ELIGIBILITY_QUESTION.id);
  const followupAnswer = answers.find((a) => a.questionId === SEE_THROUGH_FOLLOWUP.id);
  if (
    timeAnswer?.optionId === 'not-eligible' &&
    followupAnswer?.optionId === 'full-season'
  ) {
    return { outcome: 'time-optout', scores: emptyScore() };
  }

  const scores = emptyScore();

  // Seed from the see-through follow-up if one was given. Same shape
  // as a regular question's points object — just gathered separately
  // from the main loop for clarity.
  if (followupAnswer) {
    const followupOption = SEE_THROUGH_FOLLOWUP.options.find(
      (o) => o.id === followupAnswer.optionId,
    );
    if (followupOption) {
      for (const [limiter, pts] of Object.entries(followupOption.points) as Array<[LimiterId, number]>) {
        scores[limiter] += pts;
      }
    }
  }

  for (const answer of answers) {
    const question = LIMITER_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const option = question.options.find((o) => o.id === answer.optionId);
    if (!option) continue;
    for (const [limiter, pts] of Object.entries(option.points) as Array<[LimiterId, number]>) {
      scores[limiter] += pts;
    }
  }

  // Highest score wins. Ties broken by LIMITER_IDS order (which matches
  // the brief's enumeration order — identity → knowledge → systems →
  // energy → resilience → competence). Identity-first tie-break is
  // intentional: it is the most foundational limiter per the brief.
  let winner: LimiterId = LIMITER_IDS[0];
  let best = -Infinity;
  for (const limiter of LIMITER_IDS) {
    if (scores[limiter] > best) {
      best = scores[limiter];
      winner = limiter;
    }
  }

  return { outcome: winner, scores };
}

function emptyScore(): LimiterScore {
  return {
    identity: 0,
    knowledge: 0,
    systems: 0,
    energy: 0,
    resilience: 0,
    competence: 0,
  };
}
