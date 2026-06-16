import type { Tool } from '../tools';

export const boxBreathingGuide: Tool = {
  slug: 'box-breathing-guide',
  title: '4-4-4-4 Breathing Guide',
  introducedInWeek: 7,
  isStar: true,
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
