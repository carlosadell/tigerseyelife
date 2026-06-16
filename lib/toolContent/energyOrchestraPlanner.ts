import type { Tool } from '../tools';

export const energyOrchestraPlanner: Tool = {
  slug: 'energy-orchestra-planner',
  title: 'Energy Orchestra Planner',
  introducedInWeek: 10,
  isStar: false,
  body: {
    kind: 'fill-in-template',
    intro: 'Three movements: morning, midday, evening. Each one feeds the next. Design yours.',
    fields: [
      { id: 'morning-physical', label: 'Morning physical', placeholder: 'Workout, walk, hydrate, sunlight, anchor breakfast' },
      { id: 'morning-mental', label: 'Morning mental', placeholder: 'No phone first hour, three priorities, identity statement read' },
      { id: 'midday-physical', label: 'Midday physical', placeholder: 'Anchor lunch, movement snack, water refill' },
      { id: 'midday-mental', label: 'Midday mental', placeholder: 'Single biggest task done before the afternoon dip' },
      { id: 'evening-physical', label: 'Evening physical', placeholder: 'Anchor dinner, gentle stretch, dim lights' },
      { id: 'evening-mental', label: 'Evening mental', placeholder: 'Wind down routine, brain dump, gratitude line, in bed on time' },
    ],
  },
};
