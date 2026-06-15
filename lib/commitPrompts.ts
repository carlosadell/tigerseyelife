// lib/commitPrompts.ts
//
// Daily prompt for the AwarenessCard slot. Discriminated union: an
// awareness prompt (one thing to notice) or a coach nudge (identity-
// oriented). Rotates by epoch day so it changes once per calendar day
// without server state.

export type DailyPrompt =
  | { kind: 'awareness'; body: string }
  | { kind: 'nudge'; body: string; attribution?: string };

const PROMPTS: DailyPrompt[] = [
  { kind: 'awareness', body: 'Pick one food today and read its label before you eat it.' },
  { kind: 'awareness', body: 'Find a moment to add vegetables to your next plate.' },
  { kind: 'awareness', body: "Notice one place added sugar shows up that you didn't expect." },
  { kind: 'awareness', body: 'Choose a protein for your next meal before anything else.' },
  { kind: 'nudge',     body: "You're someone who reads labels. That's the identity.", attribution: 'Karen' },
  { kind: 'awareness', body: 'Swap one sweetened drink for water today.' },
  { kind: 'awareness', body: 'Plate it: half veg, a palm of protein, the rest is the rest.' },
  { kind: 'nudge',     body: 'Awareness first. Measurement later. That order matters.', attribution: 'Ryan' },
];

export function dailyPrompt(): DailyPrompt {
  const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return PROMPTS[epochDay % PROMPTS.length];
}
