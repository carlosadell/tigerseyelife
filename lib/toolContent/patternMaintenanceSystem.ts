import type { Tool } from '../tools';

export const patternMaintenanceSystem: Tool = {
  slug: 'pattern-maintenance-system',
  title: 'Pattern Maintenance System',
  introducedInWeek: 11,
  isStar: false,
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
