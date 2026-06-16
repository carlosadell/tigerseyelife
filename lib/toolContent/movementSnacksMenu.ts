import type { Tool } from '../tools';

export const movementSnacksMenu: Tool = {
  slug: 'movement-snacks-menu',
  title: 'Movement Snacks Menu',
  introducedInWeek: 6,
  isStar: false,
  body: {
    kind: 'menu-list',
    intro: 'Thirty seconds each. Three to five of these per day stack up. Pick three you can do without changing clothes.',
    items: [
      { title: 'Ten squats at the kitchen counter', body: 'While the coffee brews or the microwave runs.' },
      { title: 'Wall push ups during a call', body: 'Lean into the wall. Ten reps.' },
      { title: 'Calf raises at the sink', body: 'Heels up, heels down. While brushing teeth.' },
      { title: 'Stand and reach', body: 'Stand from your chair, reach overhead, fold forward, return.' },
      { title: 'Glute squeezes at the desk', body: 'Twenty hard squeezes. No one sees.' },
      { title: 'Stair set', body: 'Up one flight, down one flight. Twice.' },
      { title: 'Door frame stretch', body: 'Forearms on the frame, step through. Thirty seconds.' },
      { title: 'Walking lunge to the bathroom', body: 'Lunges instead of walking. Counts.' },
      { title: 'Ten jumping jacks', body: 'Yes, you can. No one cares.' },
      { title: 'Sit to stand from a low chair', body: 'No hands. Ten reps.' },
    ],
  },
};
