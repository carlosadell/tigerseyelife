import type { Tool } from '../tools';

export const fiveUniversalPatterns: Tool = {
  slug: 'five-universal-patterns',
  title: '5 Universal Patterns',
  introducedInWeek: 1,
  isStar: true,
  body: {
    kind: 'static-page',
    intro: 'Five patterns show up in almost everyone Karen and Ryan have worked with. Read them and notice which one is loudest in your life right now.',
    sections: [
      {
        heading: '1. The Overworker',
        body: 'You give every hour to other people. Work, kids, the household, the calendar. Your own care is the last thing on the list and it usually does not happen. You know what to do. You just never get there.',
      },
      {
        heading: '2. The Soother',
        body: 'When the day gets hard, food, alcohol, scrolling, or shopping is how you take the edge off. The reward is real and immediate. The cost shows up later, usually as guilt, weight, or sleep.',
      },
      {
        heading: '3. The Optimizer',
        body: 'You research everything. You collect plans, podcasts, frameworks, and supplements. The plan is always almost ready. Action waits for one more piece of information.',
      },
      {
        heading: '4. The All or Nothing',
        body: "You are either one hundred percent on or completely off. One off day means the week is blown. The diet starts Monday. Then it does not.",
      },
      {
        heading: '5. The Invisible',
        body: 'Your needs are smaller than everyone else\'s. You do not ask for help. You do not take up space. The body absorbs the cost quietly.',
      },
      {
        heading: 'Which one sounds like you?',
        body: 'Most people have one primary pattern and a secondary one that shows up under stress. Name yours. We will work with it.',
      },
    ],
  },
};
