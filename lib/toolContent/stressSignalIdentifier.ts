import type { Tool } from '../tools';

export const stressSignalIdentifier: Tool = {
  slug: 'stress-signal-identifier',
  title: 'Stress Signal Identifier',
  introducedInWeek: 9,
  isStar: false,
  metadata: {
    block: 'THRIVE',
    primaryNeed: 'resilience',
    secondaryNeeds: ['identity'],
    prerequisites: ['pause-practice-guide'],
    entryPointEligible: false,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 39,
      body: 'Your body signals stress before your mind catches it. Jaw tension, sleep changes, appetite shifts. Document your personal signals now so you can catch them earlier next time and move to your first response before the pattern takes over.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'fill-in-template',
        intro: 'Your body tells you stress is coming before your mind does. Document yours so you can catch them earlier next time.',
        fields: [
          { id: 'physical', label: 'Where do you feel stress in your body first?', placeholder: 'Jaw, shoulders, stomach, chest, headache' },
          { id: 'sleep', label: 'How does stress show up in your sleep?', placeholder: 'Trouble falling asleep, three am wake, restless' },
          { id: 'appetite', label: 'How does stress show up in your appetite?', placeholder: 'Crave sugar, skip meals, eat everything, no appetite' },
          { id: 'thoughts', label: 'What thoughts repeat when you are stressed?', placeholder: 'I can never catch up. I am failing. They are upset.' },
          { id: 'behavior', label: 'What do you do that you wish you did not?', placeholder: 'Snack, scroll, snap, withdraw, overdrink' },
          { id: 'first-move', label: 'Your first move when you spot a signal', placeholder: 'Box breathing. Walk outside. Text one person.' },
        ],
      },
    },
  },
  body: {
    kind: 'fill-in-template',
    intro: 'Your body tells you stress is coming before your mind does. Document yours so you can catch them earlier next time.',
    fields: [
      { id: 'physical', label: 'Where do you feel stress in your body first?', placeholder: 'Jaw, shoulders, stomach, chest, headache' },
      { id: 'sleep', label: 'How does stress show up in your sleep?', placeholder: 'Trouble falling asleep, three am wake, restless' },
      { id: 'appetite', label: 'How does stress show up in your appetite?', placeholder: 'Crave sugar, skip meals, eat everything, no appetite' },
      { id: 'thoughts', label: 'What thoughts repeat when you are stressed?', placeholder: 'I can never catch up. I am failing. They are upset.' },
      { id: 'behavior', label: 'What do you do that you wish you did not?', placeholder: 'Snack, scroll, snap, withdraw, overdrink' },
      { id: 'first-move', label: 'Your first move when you spot a signal', placeholder: 'Box breathing. Walk outside. Text one person.' },
    ],
  },
};
