import { WorkoutProgram, ProgramWorkout } from './programs';

export type CoachKnowledge = {
  firstName: string | null;
  program: WorkoutProgram | null;
  todayWorkout: ProgramWorkout | null;
  intention: string | null;
  intakeAnswers: Record<string, unknown>;
  streakDays: number;
};

export type CoachReply = {
  text: string;
  followups?: string[];
};

export type QuickPrompt = {
  id: string;
  label: string;
};

export function getPersonalGreeting(knowledge: CoachKnowledge, date = new Date()): string {
  const hour = date.getHours();
  const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const name = knowledge.firstName?.trim() || 'Friend';
  const context = knowledge.program
    ? ` I've got your ${knowledge.program.name} context — today's workout, your program key, your intention.`
    : '';
  return `Good ${period}, ${name}.${context} Tap a prompt below or ask me anything.`;
}

export function getQuickPrompts(knowledge: CoachKnowledge): QuickPrompt[] {
  const prompts: QuickPrompt[] = [];

  if (knowledge.todayWorkout) {
    prompts.push({ id: 'todays_workout', label: `What is today's workout?` });
  }

  prompts.push({ id: 'where_to_start', label: "I'm not sure where to start" });
  prompts.push({ id: 'low_energy', label: 'I have no energy today' });
  prompts.push({ id: 'too_much', label: 'This feels like a lot' });
  prompts.push({ id: 'power_block', label: 'What is a POWER block?' });

  if (knowledge.intention) {
    prompts.push({ id: 'intention_check', label: 'Help me with my intention' });
  }

  prompts.push({ id: 'program_overview', label: 'What is my program?' });

  return prompts;
}

export function routePrompt(promptId: string, knowledge: CoachKnowledge): CoachReply {
  switch (promptId) {
    case 'todays_workout':
      return replyTodaysWorkout(knowledge);
    case 'where_to_start':
      return replyWhereToStart(knowledge);
    case 'low_energy':
      return replyLowEnergy(knowledge);
    case 'too_much':
      return replyTooMuch(knowledge);
    case 'power_block':
      return replyPowerBlock();
    case 'intention_check':
      return replyIntentionCheck(knowledge);
    case 'program_overview':
      return replyProgramOverview(knowledge);
    default:
      return replyFallback(knowledge);
  }
}

export function routeFreeform(input: string, knowledge: CoachKnowledge): CoachReply {
  const normalized = input.toLowerCase().trim();

  if (/\bworkout\b|\btoday\b|\blower\b|\bupper\b|\bsquat\b/.test(normalized) && knowledge.todayWorkout) {
    return replyTodaysWorkout(knowledge);
  }
  if (/\b(lost|where do i start|start|don't know|dunno|stuck)\b/.test(normalized)) {
    return replyWhereToStart(knowledge);
  }
  if (/\b(no energy|tired|exhaust|drained|low energy|bad sleep)\b/.test(normalized)) {
    return replyLowEnergy(knowledge);
  }
  if (/\b(too much|overwhelm|a lot|too many|hard|sounds like a lot)\b/.test(normalized)) {
    return replyTooMuch(knowledge);
  }
  if (/\bpower\b|\bblock\b|\bcommit\b|\brefine\b|\bevolve\b|\badapt\b|\bthrive\b/.test(normalized)) {
    return replyPowerBlock();
  }
  if (/\bintention\b|\bfocus\b|\btoday's intention\b/.test(normalized) && knowledge.intention) {
    return replyIntentionCheck(knowledge);
  }
  if (/\bprogram\b|\bwhat am i doing\b|\bplan\b|\bschedule\b/.test(normalized)) {
    return replyProgramOverview(knowledge);
  }
  if (/\bbreath\b|\bbox breath\b|\bbreathing\b/.test(normalized)) {
    return replyBoxBreathing();
  }
  if (/\bprotein\b|\beat\b|\bfood\b|\bnutrition\b/.test(normalized)) {
    return replyNutrition(knowledge);
  }
  if (/\bsleep\b|\bbed\b|\bwind ?down\b/.test(normalized)) {
    return replySleep();
  }
  return replyFallback(knowledge);
}

function replyTodaysWorkout(k: CoachKnowledge): CoachReply {
  if (!k.todayWorkout) {
    return {
      text: "Ryan hasn't slotted today's workout yet. Until it lands, take a 10-minute walk and notice one energy peak — that's a real win on a no-program day.",
    };
  }
  const w = k.todayWorkout;
  return {
    text: `Today is ${w.name} — ${w.duration_minutes} min, ${w.exercise_count} exercises, ${w.equipment.join(' + ')}. Open Train to start, or tap one tutorial first if you want a warm-up cue.`,
    followups: ['Open tutorials for today', 'Why this workout?'],
  };
}

export const TUTORIALS_DEEPLINK_LABEL = 'Open tutorials for today';

function replyWhereToStart(k: CoachKnowledge): CoachReply {
  if (k.todayWorkout) {
    return {
      text: `Pick one of these — none of them take more than a minute to start:\n\n1. Open today's workout (${k.todayWorkout.name}) and tap Start session.\n2. Set today's intention if it isn't already.\n3. Check off one Commit block action you've already done.\n\nWhich one feels easiest right now?`,
    };
  }
  return {
    text: 'Pick one — under a minute each:\n\n1. Set today\'s intention.\n2. Walk 10 minutes (start a timer, that\'s it).\n3. Check off one Commit block action you\'ve already done.\n\nWhich one?',
  };
}

function replyLowEnergy(k: CoachKnowledge): CoachReply {
  const name = k.firstName?.trim() || 'You';
  return {
    text: `${name}, low energy is real data — not a failure. A bare-minimum protocol for today:\n\n• Hydration: 16 oz water in the next 10 minutes.\n• Movement: 5-minute walk, no agenda.\n• Mindfulness: one round of box breath (in 4, hold 4, out 4, hold 4).\n\nDo one. Tell me which one and I'll check back.`,
    followups: ['What is box breath?', 'Skip the workout today?'],
  };
}

function replyTooMuch(k: CoachKnowledge): CoachReply {
  return {
    text: `Hearing that. Let's cut scope, not push through.\n\nOne thing — just one — for today: ${
      k.intention
        ? `your intention is "${k.intention}". Just that. Nothing else has to happen.`
        : 'pick the smallest action on your Commit block and do that one. Nothing else has to happen.'
    }\n\nWant me to walk through what we can drop this week?`,
  };
}

function replyPowerBlock(): CoachReply {
  return {
    text: 'A POWER block is a 2-week cycle of small daily actions across five threads:\n\n• P — Patterns (spot triggers)\n• O — Ownership (small consistent steps)\n• W — Wisdom (food + movement basics)\n• E — Energy (notice peaks + dips)\n• R — Resilience (sleep + recovery)\n\nYou\'re in CREATE POWER: Commit → Refine → Evolve → Adapt → Thrive. Aim for 40-50% consistency, not 100%. Check the Grow tab to see your live block progress.',
  };
}

function replyIntentionCheck(k: CoachKnowledge): CoachReply {
  if (!k.intention) {
    return {
      text: 'No intention set today. The smallest version: one sentence about the one decision you want to make better today.',
    };
  }
  return {
    text: `Your intention: "${k.intention}"\n\nA practical question: what's the one moment today where this will get tested? Tell me the moment and we can prep for it.`,
  };
}

function replyProgramOverview(k: CoachKnowledge): CoachReply {
  if (!k.program) {
    return {
      text: 'No program assigned yet. Ryan and Karen match your intake to the right path — pre-recorded, live, or written. Check Train for status.',
    };
  }
  const setup = readObject(k.intakeAnswers.workout_setup);
  const equipment = String(setup.equipment ?? k.intakeAnswers.location ?? 'home basics');
  return {
    text: `You're on ${k.program.name}. ${k.program.description ?? ''}\n\nYour key: ${formatDuration(setup.duration ?? k.intakeAnswers.duration)} · ${formatFormat(k.intakeAnswers.format ?? k.program.delivery_type)} · ${equipment}.\n\nFour workouts cycle (W1-W4). Same key always slots you into the same program — that's intentional, not random.`,
  };
}

function replyBoxBreathing(): CoachReply {
  return {
    text: 'Box breath — 60 seconds:\n\nIn through nose 4 · hold 4 · out through mouth 4 · hold 4. Repeat 3-4 cycles.\n\nUse it before workouts, before hard conversations, or any time you need a reset. Variations if 4-count is too short: try 4-7-8 (in 4, hold 7, out 8) or diaphragmatic (slow belly breath, no count).',
  };
}

function replyNutrition(k: CoachKnowledge): CoachReply {
  return {
    text: 'Balance your plate with protein and healthy fats. The simplest version of "good enough":\n\n• 1 palm of protein per meal\n• 1-2 fists of vegetables\n• 1 thumb of healthy fat\n• Stop at 80% full\n\nKaren and Ryan\'s ABC Power Meal framework lives in your Grow tab if you want the full module.',
  };
}

function replySleep(): CoachReply {
  return {
    text: 'Sleep is the most underrated lever you have. The non-negotiables:\n\n• Same bedtime ± 30 minutes, every day (including weekends).\n• Screens off 30 min before bed.\n• Bedroom cooler than the rest of the house.\n\nIf you only do one this week: pick the bedtime and protect it.',
  };
}

function replyFallback(k: CoachKnowledge): CoachReply {
  const todayLine = k.todayWorkout ? `today's workout (${k.todayWorkout.name})` : "today's plan";
  return {
    text: `I can help with: ${todayLine}, your CREATE POWER blocks, your intention, energy reframes, sleep, nutrition, and tactical "smallest next step" protocols.\n\nTell me what you're looking at right now — that's the fastest way for me to be useful.`,
  };
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function formatDuration(value: unknown) {
  const s = String(value ?? '');
  if (!s) return '30 min';
  return s;
}

function formatFormat(value: unknown) {
  const s = String(value ?? '');
  if (s === 'pre_recorded') return 'Pre-recorded';
  if (s === 'live') return 'Live';
  if (s === 'workout_only') return 'Workout only';
  return s || 'Pre-recorded';
}
