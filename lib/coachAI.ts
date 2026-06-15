/**
 * AI coach — sends the conversation history + live member context to
 * Claude Haiku 4.5 and returns a short reply plus 1-3 followup prompts.
 *
 * Mirrors the fetch-based pattern in lib/foodVision.ts (the Anthropic SDK
 * has Node-only credential paths Metro can't bundle for React Native).
 *
 * SECURITY: same caveat as foodVision — the key bundled into the app via
 * EXPO_PUBLIC_ANTHROPIC_API_KEY is extractable. Acceptable for beta, but
 * the production path is a Supabase Edge Function proxy. Track in spec.
 */

export type CoachMessage = { role: 'user' | 'assistant'; content: string };

export type CoachContext = {
  firstName: string | null;
  streakDays: number;
  todayWorkout: { name: string; done: boolean } | null;
  loggedMealsToday: Array<{ slot: string; name: string }>;
  mood: 'strong' | 'steady' | 'drained' | null;
  movementTags: string[];
  waterCups: number;
  intention: string | null;
};

export type CoachReplyAI = {
  reply: string;
  followups: string[];
};

const SYSTEM_PROMPT = `You are the in-app coach for Tigers Eye Life, an app supporting Karen and Ryan's CREATE POWER program members. Speak in their voice — warm, direct, never preachy, never guilt-trippy.

# HARD RULES — these override everything else

1. NO RECURSIVE DEFERRAL. The member already accepted help by asking you. Never tell them to "go check that yourself," "look it up," "ask your doctor first," or "I can't help with that." If a question is outside your scope, name what you do know and offer one concrete next step you CAN help with.

2. NO SENTIMENT-BLIND AFFIRMATION. Read the member's emotional tone. Phrases like "this feels like a lot," "I'm overwhelmed," "I'm tired," "I don't know where to start," "I'm not feeling it" are OVERWHELM signals — never enthusiasm. When you detect overwhelm:
   - Lead with acknowledgment ("That's a real feeling. Let's make today small.")
   - Offer ONE thing — never a list of options, never multiple suggestions
   - Skip frameworks and explanations until they ask

3. DEFAULT REPLY LENGTH: 1-2 sentences. Longer ONLY when the member explicitly asks you to explain a framework, walk them through something, or expand.

4. NEVER moralize about food, weight, body, or willpower. Karen and Ryan don't, and neither do you.

# KAREN + RYAN'S FRAMEWORKS (use these by name when relevant)

**ABC Power Meals** — Karen's meal-building framework:
- A = ANCHOR: protein, picked first (eggs, chicken, yogurt, fish, beef, tofu)
- B = BUILD: fiber, carbs, fat — round it out (veggies, grains, healthy fats)
- C = COMPLETE: herbs, sauce, the joy — never deprivation

If a member asks "what should I eat" — frame the answer through ABC. If they share a meal that lacks an anchor, point it out gently.

**CREATE POWER program** — the 4-workout strength foundation. Workouts are named "Workout 1, 2, 3, 4" — NEVER use body-part labels like "leg day" or "upper body" (the program is full-body and the naming is intentional). The member's program is slotted from their intake answers.

**Streak = any engagement.** A meal log, a workout, a sleep note, a walk — all maintain the streak. Non-training days don't break it. If a member worries about "missing a day," remind them: any small engagement counts.

# RESPONSE FORMAT

Return JSON only, matching the schema:
- "reply": your message to the member. Plain text. No markdown headers. No bullet lists unless explicitly walking through steps.
- "followups": 1-3 short suggested next prompts the member could tap (each ≤ 6 words). Never include recursive deferrals here either. Return [] if no obvious followup. Examples of good followups: "Suggest a snack", "Plan tomorrow's first meal", "What's my next workout?"`;

const REPLY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: {
      type: 'string',
      description: 'The coach reply. 1-2 sentences by default. Plain text.',
    },
    followups: {
      type: 'array',
      description: '1-3 short suggested next prompts (each ≤ 6 words). Empty array if no obvious followup.',
      maxItems: 3,
      items: { type: 'string' },
    },
  },
  required: ['reply', 'followups'],
};

type AnthropicMessagesResponse = {
  content: Array<{ type: 'text'; text: string } | { type: string; [k: string]: unknown }>;
  stop_reason: string;
};

type AnthropicErrorResponse = {
  error?: { type?: string; message?: string };
};

function formatContextBlock(context: CoachContext): string {
  const lines: string[] = ['MEMBER CONTEXT (current state, treat as ground truth):'];
  lines.push(`- Name: ${context.firstName ?? 'unknown'}`);
  lines.push(`- Engagement streak: ${context.streakDays} day${context.streakDays === 1 ? '' : 's'}`);

  if (context.todayWorkout) {
    lines.push(
      `- Today's workout: ${context.todayWorkout.name} (${context.todayWorkout.done ? 'completed' : 'not yet done'})`,
    );
  } else {
    lines.push("- Today's workout: rest day (no workout assigned today)");
  }

  if (context.loggedMealsToday.length > 0) {
    const meals = context.loggedMealsToday
      .map((m) => `slot ${m.slot}: ${m.name}`)
      .join('; ');
    lines.push(`- Meals logged today: ${meals}`);
  } else {
    lines.push('- Meals logged today: none yet');
  }

  lines.push(`- Water: ${context.waterCups} cup${context.waterCups === 1 ? '' : 's'} so far`);

  if (context.mood) lines.push(`- Mood today: ${context.mood}`);
  if (context.movementTags.length > 0) {
    lines.push(`- Movement today: ${context.movementTags.join(', ')}`);
  }
  if (context.intention) lines.push(`- Today's intention: "${context.intention}"`);

  return lines.join('\n');
}

export async function askCoach(args: {
  history: CoachMessage[];
  context: CoachContext;
}): Promise<CoachReplyAI> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Coach AI requires EXPO_PUBLIC_ANTHROPIC_API_KEY in your .env. See .env.example.',
    );
  }

  const contextBlock = formatContextBlock(args.context);

  const messages = [
    {
      role: 'user' as const,
      content: `${contextBlock}\n\nThe member's first message follows.`,
    },
    { role: 'assistant' as const, content: 'Got it. Ready when you are.' },
    ...args.history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
      output_config: {
        format: { type: 'json_schema', schema: REPLY_SCHEMA },
      },
    }),
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const errBody = (await response.json()) as AnthropicErrorResponse;
      if (errBody?.error?.message) detail = errBody.error.message;
    } catch {
      // body wasn't JSON; keep the status line
    }
    throw new Error(`Coach AI error: ${detail}`);
  }

  const data = (await response.json()) as AnthropicMessagesResponse;
  const textBlock = data.content.find(
    (b): b is { type: 'text'; text: string } => b.type === 'text',
  );
  if (!textBlock) {
    throw new Error('Coach AI response missing text content.');
  }
  try {
    const parsed = JSON.parse(textBlock.text) as CoachReplyAI;
    return {
      reply: parsed.reply ?? '',
      followups: Array.isArray(parsed.followups) ? parsed.followups.slice(0, 3) : [],
    };
  } catch {
    throw new Error('Coach AI response was not valid JSON.');
  }
}
