import type { Tool } from '../tools';

export const initialQuestionnaire: Tool = {
  slug: 'initial-questionnaire',
  title: 'Initial Questionnaire',
  introducedInWeek: 0,
  isStar: false,
  body: {
    kind: 'fill-in-template',
    intro: 'Your baseline. Capture where you are today so you can see how far you go.',
    fields: [
      { id: 'sleep-baseline', label: 'How are you sleeping right now?', placeholder: 'Hours, quality, when you fall asleep' },
      { id: 'nutrition-baseline', label: 'What does a typical day of eating look like?', placeholder: 'Honest, not aspirational' },
      { id: 'movement-baseline', label: 'How much are you moving in a typical week?', placeholder: 'Walks, workouts, stairs, anything' },
      { id: 'patterns', label: 'What patterns do you already notice in yourself?', placeholder: 'Triggers, time of day, situations' },
      { id: 'big-why', label: 'Why now?', placeholder: 'What is the bigger picture behind this twelve weeks?' },
    ],
  },
};
