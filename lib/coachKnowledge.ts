// CoachKnowledge is the shape useCoachContext returns.
// Functions here accept that shape and produce replies or prompts.

export type CoachKnowledge = {
  weekNumber: number;
  blockId: string;
  primaryFocus: string;
  consistencyTarget: string;
  unlockedFeatures: string[];
  userName: string | null;
  goal: string | null;
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
  const name = knowledge.userName?.trim() || 'Friend';
  return `Good ${period}, ${name}. Week ${knowledge.weekNumber} of CREATE POWER. ${knowledge.primaryFocus} Tap a prompt below or ask me anything.`;
}

export function getQuickPrompts(knowledge: CoachKnowledge): QuickPrompt[] {
  const prompts: QuickPrompt[] = [];

  prompts.push({ id: 'where_to_start', label: "I'm not sure where to start" });
  prompts.push({ id: 'low_energy', label: 'I have no energy today' });
  prompts.push({ id: 'too_much', label: 'This feels like a lot' });
  prompts.push({ id: 'power_block', label: 'What is a POWER block?' });
  prompts.push({ id: 'program_overview', label: 'What is my program?' });

  if (knowledge.goal) {
    prompts.push({ id: 'goal_check', label: 'How does this connect to my goal?' });
  }

  return prompts;
}

export function routePrompt(promptId: string, knowledge: CoachKnowledge): CoachReply {
  switch (promptId) {
    case 'where_to_start':
      return replyWhereToStart(knowledge);
    case 'low_energy':
      return replyLowEnergy(knowledge);
    case 'too_much':
      return replyTooMuch(knowledge);
    case 'power_block':
      return replyPowerBlock(knowledge);
    case 'program_overview':
      return replyProgramOverview(knowledge);
    case 'goal_check':
      return replyGoalCheck(knowledge);
    default:
      return replyFallback(knowledge);
  }
}

export function routeFreeform(input: string, knowledge: CoachKnowledge): CoachReply {
  const normalized = input.toLowerCase().trim();

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
    return replyPowerBlock(knowledge);
  }
  if (/\bprogram\b|\bwhat am i doing\b|\bplan\b|\bschedule\b/.test(normalized)) {
    return replyProgramOverview(knowledge);
  }
  if (/\bbreath\b|\bbox breath\b|\bbreathing\b/.test(normalized)) {
    return replyBoxBreathing();
  }
  if (/\bprotein\b|\beat\b|\bfood\b|\bnutrition\b/.test(normalized)) {
    return replyNutrition();
  }
  if (/\bsleep\b|\bbed\b|\bwind ?down\b/.test(normalized)) {
    return replySleep();
  }
  return replyFallback(knowledge);
}

function replyWhereToStart(k: CoachKnowledge): CoachReply {
  return {
    text: `Week ${k.weekNumber} focus: ${k.primaryFocus}\n\nPick one action from today's checklist and start there. The smallest step counts. Aim for ${k.consistencyTarget} consistency this block.`,
  };
}

function replyLowEnergy(k: CoachKnowledge): CoachReply {
  const name = k.userName?.trim() || 'You';
  return {
    text: `${name}, low energy is real data. A bare-minimum protocol for today:\n\n• Hydration: 16 oz water in the next 10 minutes.\n• Movement: 5-minute walk, no agenda.\n• Mindfulness: one round of box breath (in 4, hold 4, out 4, hold 4).\n\nDo one. That still counts toward ${k.consistencyTarget}.`,
    followups: ['What is box breath?'],
  };
}

function replyTooMuch(k: CoachKnowledge): CoachReply {
  return {
    text: `Hearing that. Let's cut scope, not push through.\n\nOne thing for today: pick the smallest action on your Week ${k.weekNumber} checklist and do that one. Nothing else has to happen.\n\nAim for ${k.consistencyTarget}. The rest is bonus.`,
  };
}

function replyPowerBlock(k: CoachKnowledge): CoachReply {
  return {
    text: `You're in Block ${k.blockId}, Week ${k.weekNumber}. Focus: ${k.primaryFocus}\n\nP.O.W.E.R. threads:\n• P — Patterns (spot triggers)\n• O — Ownership (small consistent steps)\n• W — Wisdom (food + movement basics)\n• E — Energy (notice peaks + dips)\n• R — Resilience (sleep + recovery)\n\nTarget consistency this block: ${k.consistencyTarget}. Showing up at 40 to 50 percent beats optimizing at 0.`,
  };
}

function replyProgramOverview(k: CoachKnowledge): CoachReply {
  return {
    text: `You're on CREATE POWER, Week ${k.weekNumber} of 12, Block ${k.blockId}.\n\nThis week's focus: ${k.primaryFocus}\n\nConsistency target: ${k.consistencyTarget}. Same key every week slots you into the same program. That's intentional, not random.`,
  };
}

function replyGoalCheck(k: CoachKnowledge): CoachReply {
  if (!k.goal) {
    return {
      text: `Week ${k.weekNumber}: ${k.primaryFocus}\n\nEvery action this week serves your goal. The connection becomes clearer as the habits stack.`,
    };
  }
  return {
    text: `Your goal: "${k.goal}"\n\nWeek ${k.weekNumber} focus: ${k.primaryFocus}\n\nThose connect directly. The week's actions are the building blocks toward what you named.`,
  };
}

function replyBoxBreathing(): CoachReply {
  return {
    text: 'Box breath. 60 seconds:\n\nIn through nose 4 · hold 4 · out through mouth 4 · hold 4. Repeat 3 to 4 cycles.\n\nUse it before workouts, before hard conversations, or any time you need a reset.',
  };
}

function replyNutrition(): CoachReply {
  return {
    text: 'ABC Power Meals: Anchor with protein (25 to 35g), Balance the plate (carbs, fats, fiber), Complete with embellishments (herbs, sauces, joy).\n\nSimplest version: one palm of protein per meal, stop at 80 percent full.',
  };
}

function replySleep(): CoachReply {
  return {
    text: 'Sleep is the most underrated lever you have. The non-negotiables:\n\n• Same bedtime within 30 minutes, every day.\n• Screens off 30 min before bed.\n• Bedroom cooler than the rest of the house.\n\nIf you only do one this week: pick the bedtime and protect it.',
  };
}

function replyFallback(k: CoachKnowledge): CoachReply {
  return {
    text: `I can help with your Week ${k.weekNumber} focus, CREATE POWER blocks, energy reframes, sleep, nutrition, and "smallest next step" protocols.\n\nTell me what you're looking at right now. That's the fastest way for me to be useful.`,
  };
}

export const TUTORIALS_DEEPLINK_LABEL = 'Open tutorials for today';
