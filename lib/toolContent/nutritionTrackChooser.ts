import type { Tool } from '../tools';

export const nutritionTrackChooser: Tool = {
  slug: 'nutrition-track-chooser',
  title: 'Nutrition Track Chooser',
  introducedInWeek: 1,
  isStar: false,
  body: {
    kind: 'static-page',
    intro: 'Two starting tracks. Pick the one that meets you where you are. You will add the second one in Week 2.',
    sections: [
      {
        heading: 'Track A. Blood Sugar',
        body: 'Best if you spike and crash through the day. Energy is up and down. You get hungry two hours after eating. Focus this week: pair carbs with protein and fat at every meal. No naked carbs.',
      },
      {
        heading: 'Track B. Processed Food',
        body: 'Best if a lot of what you eat comes from a package. Bars, chips, frozen meals, cereal. Focus this week: swap one processed item per day for a whole food version. Half the package counts.',
      },
      {
        heading: 'How to pick',
        body: 'If you are not sure, pick the one whose description annoyed you slightly. That is usually the truth.',
      },
      {
        heading: 'Why one and not both yet',
        body: 'Stacking comes in Week 2. Get one running first. Both starts overwhelmed and ends with neither.',
      },
    ],
  },
};
