import type { Tool } from '../tools';

export const patternMaintenanceSystem: Tool = {
  slug: 'pattern-maintenance-system',
  title: 'Pattern Maintenance System',
  introducedInWeek: 11,
  isStar: false,
  metadata: {
    block: 'EXCEL',
    primaryNeed: 'identity',
    secondaryNeeds: ['resilience'],
    prerequisites: ['five-universal-patterns'],
    entryPointEligible: false,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 42,
      body: 'Patterns go quiet, not away. A monthly check-in keeps you aware: which pattern showed up, what triggered it, how you responded. When stress reveals an old pattern, that is not failure. It is information telling you which small tune-up move to run.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'static-page',
        intro: 'Patterns do not stay solved. They go quiet, then they test you again. Here is how to stay aware for life.',
        sections: [
          {
            heading: 'Monthly check in',
            body: 'Once a month, ask: which of my old patterns showed up this month? When? What triggered it? How did I respond? This is the practice that keeps the awareness alive.',
          },
          {
            heading: 'Stress is the test',
            body: 'Stress reveals which patterns are dormant and which are dead. A pattern that is dormant comes back under pressure. A pattern that is dead does not. Most are dormant. That is fine.',
          },
          {
            heading: 'The reframe',
            body: "When an old pattern shows up, do not call it failure. Call it information. The pattern is telling you the system needs a small tune up, not a full overhaul.",
          },
          {
            heading: 'Tune up moves',
            body: 'Run the wind down routine three nights in a row. Bring back the meal prep day. Do a kitchen reset. Pull back to bare minimum for a week. Small moves restore the system.',
          },
          {
            heading: 'Your unique rhythm',
            body: "You know yourself now. The patterns, the energy, the food, the movement. You are not following anyone's plan. You are running yours.",
          },
        ],
      },
    },
  },
  body: {
    kind: 'static-page',
    intro: 'Patterns do not stay solved. They go quiet, then they test you again. Here is how to stay aware for life.',
    sections: [
      {
        heading: 'Monthly check in',
        body: 'Once a month, ask: which of my old patterns showed up this month? When? What triggered it? How did I respond? This is the practice that keeps the awareness alive.',
      },
      {
        heading: 'Stress is the test',
        body: 'Stress reveals which patterns are dormant and which are dead. A pattern that is dormant comes back under pressure. A pattern that is dead does not. Most are dormant. That is fine.',
      },
      {
        heading: 'The reframe',
        body: "When an old pattern shows up, do not call it failure. Call it information. The pattern is telling you the system needs a small tune up, not a full overhaul.",
      },
      {
        heading: 'Tune up moves',
        body: 'Run the wind down routine three nights in a row. Bring back the meal prep day. Do a kitchen reset. Pull back to bare minimum for a week. Small moves restore the system.',
      },
      {
        heading: 'Your unique rhythm',
        body: "You know yourself now. The patterns, the energy, the food, the movement. You are not following anyone's plan. You are running yours.",
      },
    ],
  },
};
