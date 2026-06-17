import type { Tool } from '../tools';

export const bareMinimumProtocolBuilder: Tool = {
  slug: 'bare-minimum-protocol-builder',
  title: 'Bare Minimum Protocol Builder',
  introducedInWeek: 8,
  isStar: true,
  metadata: {
    block: 'ADAPT',
    primaryNeed: 'resilience',
    secondaryNeeds: ['systems'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 40,
      body: 'Design your floor before the hard day arrives. Five areas, one non-negotiable each: morning, movement, food, mind, sleep. Filling this in now means that when things fall apart, you already know what still happens. The floor is what keeps the streak alive.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'fill-in-template',
        intro: 'Your floor. Not your ceiling. When the day falls apart, this is what still happens. Fill it in now while the day is calm.',
        fields: [
          { id: 'morning', label: 'Morning bare minimum', placeholder: 'One thing. Hydrate. Brush teeth. One small win.' },
          { id: 'movement', label: 'Movement bare minimum', placeholder: 'Five minute walk. Ten body weight squats. Anything counts.' },
          { id: 'food', label: 'Food bare minimum', placeholder: 'One anchor meal. Maybe two. Skip the rest if needed.' },
          { id: 'mind', label: 'Mind bare minimum', placeholder: 'One round of box breathing. One line of gratitude. One text to a friend.' },
          { id: 'sleep', label: 'Sleep bare minimum', placeholder: 'Bedtime within an hour of plan. Phone out of the bedroom.' },
          { id: 'reminder', label: 'The reminder', placeholder: 'On a hard day, this still counts. This is not giving up. This is staying in the game.' },
        ],
      },
    },
  },
  body: {
    kind: 'fill-in-template',
    intro: 'Your floor. Not your ceiling. When the day falls apart, this is what still happens. Fill it in now while the day is calm.',
    fields: [
      { id: 'morning', label: 'Morning bare minimum', placeholder: 'One thing. Hydrate. Brush teeth. One small win.' },
      { id: 'movement', label: 'Movement bare minimum', placeholder: 'Five minute walk. Ten body weight squats. Anything counts.' },
      { id: 'food', label: 'Food bare minimum', placeholder: 'One anchor meal. Maybe two. Skip the rest if needed.' },
      { id: 'mind', label: 'Mind bare minimum', placeholder: 'One round of box breathing. One line of gratitude. One text to a friend.' },
      { id: 'sleep', label: 'Sleep bare minimum', placeholder: 'Bedtime within an hour of plan. Phone out of the bedroom.' },
      { id: 'reminder', label: 'The reminder', placeholder: 'On a hard day, this still counts. This is not giving up. This is staying in the game.' },
    ],
  },
};
