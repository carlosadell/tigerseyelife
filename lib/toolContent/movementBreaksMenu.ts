import type { Tool } from '../tools';

export const movementBreaksMenu: Tool = {
  slug: 'movement-breaks-menu',
  title: 'Movement Breaks Menu',
  introducedInWeek: 2,
  isStar: false,
  body: {
    kind: 'menu-list',
    intro: 'Ten breaks that take five minutes or less. Pick one. Do it now.',
    items: [
      { title: 'Ten chair squats', body: 'Stand up, sit down, ten times. Slow on the way down.' },
      { title: 'Two minute walk', body: 'Out the door, around the block, back. Phone off.' },
      { title: 'Wall push ups', body: 'Three sets of ten against the kitchen wall while the kettle heats.' },
      { title: 'Calf raises during a call', body: 'Heels up, heels down. Do it for the whole call.' },
      { title: 'One minute plank', body: 'Forearms on the desk. Body straight. Watch the timer.' },
      { title: 'Stairs up and down', body: 'Find a flight. Up, down, three rounds.' },
      { title: 'Doorway stretch', body: 'Forearms on the frame. Step through. Hold thirty seconds each side.' },
      { title: 'Hip openers', body: 'Standing, one foot on a chair, lean in. Thirty seconds per side.' },
      { title: 'Shoulder rolls', body: 'Ten forward, ten back. Pull shoulder blades together at the end.' },
      { title: 'Three deep breaths plus a stretch', body: 'Reach up, fold over, repeat three times.' },
    ],
  },
};
