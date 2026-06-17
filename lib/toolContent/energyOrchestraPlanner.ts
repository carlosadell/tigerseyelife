import type { Tool } from '../tools';

export const energyOrchestraPlanner: Tool = {
  slug: 'energy-orchestra-planner',
  title: 'Energy Orchestra Planner',
  introducedInWeek: 10,
  isStar: false,
  metadata: {
    block: 'THRIVE',
    primaryNeed: 'energy',
    secondaryNeeds: ['systems'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 35,
      body: 'Your energy has three movements: morning, midday, and evening. Each one sets up the next. Design what goes in each slot, physical and mental, and you stop reacting to the day and start conducting it.',
    },
    layer2: {
      kind: 'text-only',
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
    },
  },
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
