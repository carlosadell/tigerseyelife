import type { Tool } from '../tools';

export const mealPrepSystemGuide: Tool = {
  slug: 'meal-prep-system-guide',
  title: 'Meal Prep System Guide',
  introducedInWeek: 5,
  isStar: true,
  body: {
    kind: 'static-page',
    intro: 'Ninety minutes once a week buys you five days of easy ABC meals. Same recipe every time. This is a system, not a hobby.',
    sections: [
      {
        heading: 'The ninety minute flow',
        body: 'Twenty minutes prep. Sixty minutes cook and assemble. Ten minutes clean. Pick a day. Sunday afternoon is common but pick what fits your week.',
      },
      {
        heading: 'Batch cook two proteins',
        body: 'A pound of chicken in the oven. A pound of ground beef on the stove. Or chicken plus tofu. Or salmon plus eggs. Two proteins, ready to anchor.',
      },
      {
        heading: 'Roast a tray of vegetables',
        body: 'Whatever was on sale. Toss in olive oil and salt. Roast at four hundred degrees for thirty minutes. This is your balance.',
      },
      {
        heading: 'Cook a starch',
        body: 'A pot of rice, quinoa, or potatoes. Three cups dry goes a long way.',
      },
      {
        heading: 'Grab and go assembly',
        body: 'Use the prepped pieces. Anchor first. Add a half plate of vegetables. Add a half cup of starch. Top with a sauce or herb mix you actually like. That is dinner in three minutes.',
      },
    ],
  },
};
