import type { Tool } from '../tools';

export const boxBreathingGuide: Tool = {
  slug: 'box-breathing-guide',
  title: '4-4-4-4 Breathing Guide',
  introducedInWeek: 7,
  isStar: true,
  metadata: {
    block: 'ADAPT',
    primaryNeed: 'resilience',
    secondaryNeeds: ['energy'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 30,
      body: 'Inhale four counts. Hold four. Exhale four. Hold four. Sixteen seconds total. The held exhale resets your nervous system. Do two rounds now and notice what shifts.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'static-page',
        intro: 'Sixteen seconds. Anywhere. Resets your nervous system from the inside.',
        sections: [
          {
            heading: 'The four counts',
            body: 'Inhale through the nose for four. Hold for four. Exhale through the mouth for four. Hold empty for four. Repeat.',
          },
          {
            heading: 'Why it works',
            body: "The held exhale activates the vagus nerve, which is your body's built in calm down switch. This is not woo. This is physiology.",
          },
          {
            heading: 'When to use it',
            body: 'Before a hard conversation. After a hard conversation. In traffic. Before bed. When you reach for something you do not want to reach for.',
          },
          {
            heading: 'The practice',
            body: 'Two rounds in the morning. Two rounds in the evening. Add a round any time the urge hits. Sixteen seconds is the smallest possible intervention.',
          },
        ],
      },
    },
  },
  body: {
    kind: 'static-page',
    intro: 'Sixteen seconds. Anywhere. Resets your nervous system from the inside.',
    sections: [
      {
        heading: 'The four counts',
        body: 'Inhale through the nose for four. Hold for four. Exhale through the mouth for four. Hold empty for four. Repeat.',
      },
      {
        heading: 'Why it works',
        body: "The held exhale activates the vagus nerve, which is your body's built in calm down switch. This is not woo. This is physiology.",
      },
      {
        heading: 'When to use it',
        body: 'Before a hard conversation. After a hard conversation. In traffic. Before bed. When you reach for something you do not want to reach for.',
      },
      {
        heading: 'The practice',
        body: 'Two rounds in the morning. Two rounds in the evening. Add a round any time the urge hits. Sixteen seconds is the smallest possible intervention.',
      },
    ],
  },
};
