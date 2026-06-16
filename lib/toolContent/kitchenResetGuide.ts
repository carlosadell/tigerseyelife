import type { Tool } from '../tools';

export const kitchenResetGuide: Tool = {
  slug: 'kitchen-reset-guide',
  title: 'Kitchen Reset Guide',
  introducedInWeek: 3,
  isStar: true,
  body: {
    kind: 'checklist',
    intro: 'Thirty to forty five minutes. Once. Future you will thank present you every day this week.',
    items: [
      { id: 'fridge-front', label: 'Move proteins and vegetables to fridge eye level' },
      { id: 'fridge-back', label: 'Move sodas, condiments, and treats to the back or bottom drawer' },
      { id: 'cut-veg', label: 'Wash and pre cut at least two vegetables, store in clear containers' },
      { id: 'pantry-trigger', label: 'Identify three trigger foods in the pantry' },
      { id: 'pantry-trigger-out', label: 'Remove them or put them in opaque containers out of sight' },
      { id: 'snack-bowl', label: 'Set a grab and go protein snack on the counter (boiled eggs, jerky, nuts)' },
      { id: 'water', label: 'Fill a large water bottle and put it where you cannot miss it' },
      { id: 'workout-spot', label: 'Set out workout clothes for tomorrow morning where you will see them' },
    ],
  },
};
