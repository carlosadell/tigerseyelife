import type { Tool } from '../tools';

export const habitsOverChecklists: Tool = {
  slug: 'habits-over-checklists',
  title: 'Habits Over Checklists',
  introducedInWeek: 0,
  isStar: false,
  metadata: {
    block: 'COMMIT',
    primaryNeed: 'identity',
    secondaryNeeds: ['systems'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 40,
      body: 'Willpower runs out by evening. Habits do not. This program works by layering one new behavior per week until it runs automatically. The goal is not a longer checklist. It is an identity: you are someone who does these things.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'static-page',
        sections: [
          {
            heading: 'Willpower is finite',
            body: 'Decision fatigue is real. The more choices you make in a day, the worse your choices become by evening. That is why hard days end with snacking, scrolling, or skipping the workout. The system, not the person, is broken.',
          },
          {
            heading: 'Habits run on autopilot',
            body: 'A habit is a behavior that costs almost zero willpower. Your morning coffee is a habit. Brushing teeth is a habit. Once a behavior becomes a habit, it is free.',
          },
          {
            heading: 'Identity beats willpower',
            body: "When you say I am someone who walks every day, it is not a goal. It is a description. You walk because that is who you are. Identity carries the load that willpower cannot.",
          },
          {
            heading: 'How this program works',
            body: 'Each week we layer one new action on top of what is already running. We do not pile on. We stack. We are building habits, not collecting checkboxes.',
          },
        ],
      },
    },
  },
  body: {
    kind: 'static-page',
    sections: [
      {
        heading: 'Willpower is finite',
        body: 'Decision fatigue is real. The more choices you make in a day, the worse your choices become by evening. That is why hard days end with snacking, scrolling, or skipping the workout. The system, not the person, is broken.',
      },
      {
        heading: 'Habits run on autopilot',
        body: 'A habit is a behavior that costs almost zero willpower. Your morning coffee is a habit. Brushing teeth is a habit. Once a behavior becomes a habit, it is free.',
      },
      {
        heading: 'Identity beats willpower',
        body: "When you say I am someone who walks every day, it is not a goal. It is a description. You walk because that is who you are. Identity carries the load that willpower cannot.",
      },
      {
        heading: 'How this program works',
        body: 'Each week we layer one new action on top of what is already running. We do not pile on. We stack. We are building habits, not collecting checkboxes.',
      },
    ],
  },
};
