import type { Tool } from '../tools';

export const mySystemDocumentation: Tool = {
  slug: 'my-system-documentation',
  title: 'My System Documentation',
  introducedInWeek: 10,
  isStar: false,
  metadata: {
    block: 'EXCEL',
    primaryNeed: 'systems',
    secondaryNeeds: ['identity'],
    prerequisites: [],
    entryPointEligible: false,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 37,
      body: 'Seven fields. Write down the system that is actually working for you. Patterns you now manage. Food. Movement. Energy. Recovery. Bare minimum. If you can describe it in your own words, you can repeat it anywhere.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'fill-in-template',
        intro: 'Capture the system that is working for you. If you can describe it, you can repeat it. This is what you carry forward.',
        fields: [
          { id: 'patterns', label: 'My patterns I now manage', placeholder: 'The pattern, the trigger, the move I use' },
          { id: 'identity', label: 'Who I am', placeholder: 'I am someone who...' },
          { id: 'food', label: 'My food system', placeholder: 'Anchors, prep day, what I keep stocked, what stays out of the house' },
          { id: 'movement', label: 'My movement system', placeholder: 'Strength days, walks, movement snacks, what counts on a bad day' },
          { id: 'energy', label: 'My energy system', placeholder: 'Morning, midday, evening flow' },
          { id: 'recovery', label: 'My recovery system', placeholder: 'Wind down routine, bedtime, what I do when stress lands' },
          { id: 'minimum', label: 'My bare minimum', placeholder: 'What still happens on the worst day' },
        ],
      },
    },
  },
  body: {
    kind: 'fill-in-template',
    intro: 'Capture the system that is working for you. If you can describe it, you can repeat it. This is what you carry forward.',
    fields: [
      { id: 'patterns', label: 'My patterns I now manage', placeholder: 'The pattern, the trigger, the move I use' },
      { id: 'identity', label: 'Who I am', placeholder: 'I am someone who...' },
      { id: 'food', label: 'My food system', placeholder: 'Anchors, prep day, what I keep stocked, what stays out of the house' },
      { id: 'movement', label: 'My movement system', placeholder: 'Strength days, walks, movement snacks, what counts on a bad day' },
      { id: 'energy', label: 'My energy system', placeholder: 'Morning, midday, evening flow' },
      { id: 'recovery', label: 'My recovery system', placeholder: 'Wind down routine, bedtime, what I do when stress lands' },
      { id: 'minimum', label: 'My bare minimum', placeholder: 'What still happens on the worst day' },
    ],
  },
};
