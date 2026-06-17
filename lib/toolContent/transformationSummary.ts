import type { Tool } from '../tools';

export const transformationSummary: Tool = {
  slug: 'transformation-summary',
  title: 'Transformation Summary',
  introducedInWeek: 12,
  isStar: false,
  metadata: {
    block: 'EXCEL',
    primaryNeed: 'identity',
    secondaryNeeds: [],
    prerequisites: [],
    entryPointEligible: false,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 33,
      body: 'Week 1 versus Week 12, in your own words. Seven fields: body, mind, food, movement, stress, biggest win, what surprised you. Writing it down makes it real and makes it yours to carry forward.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'fill-in-template',
        intro: 'Week 1 versus Week 12. The evidence in your own words.',
        fields: [
          { id: 'week1-body', label: 'Week 1: what was happening in my body', placeholder: 'Energy, sleep, pain, weight, strength' },
          { id: 'week12-body', label: 'Week 12: what is happening in my body now', placeholder: 'Compare honestly to Week 1' },
          { id: 'week1-mind', label: 'Week 1: my relationship with food, movement, stress', placeholder: 'The patterns, the autopilots' },
          { id: 'week12-mind', label: 'Week 12: my relationship now', placeholder: 'What is different. What I notice. What I do' },
          { id: 'biggest-win', label: 'My biggest win', placeholder: 'The one thing you are proudest of' },
          { id: 'surprised-by', label: 'What surprised me', placeholder: 'Something you did not expect' },
          { id: 'continuing', label: 'What I am continuing', placeholder: 'The systems that go with you from here' },
        ],
      },
    },
  },
  body: {
    kind: 'fill-in-template',
    intro: 'Week 1 versus Week 12. The evidence in your own words.',
    fields: [
      { id: 'week1-body', label: 'Week 1: what was happening in my body', placeholder: 'Energy, sleep, pain, weight, strength' },
      { id: 'week12-body', label: 'Week 12: what is happening in my body now', placeholder: 'Compare honestly to Week 1' },
      { id: 'week1-mind', label: 'Week 1: my relationship with food, movement, stress', placeholder: 'The patterns, the autopilots' },
      { id: 'week12-mind', label: 'Week 12: my relationship now', placeholder: 'What is different. What I notice. What I do' },
      { id: 'biggest-win', label: 'My biggest win', placeholder: 'The one thing you are proudest of' },
      { id: 'surprised-by', label: 'What surprised me', placeholder: 'Something you did not expect' },
      { id: 'continuing', label: 'What I am continuing', placeholder: 'The systems that go with you from here' },
    ],
  },
};
