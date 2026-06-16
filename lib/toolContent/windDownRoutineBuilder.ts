import type { Tool } from '../tools';

export const windDownRoutineBuilder: Tool = {
  slug: 'wind-down-routine-builder',
  title: 'Wind Down Routine Builder',
  introducedInWeek: 4,
  isStar: false,
  body: {
    kind: 'menu-list',
    intro: 'Pick three of these. Run them in the same order every night, ending thirty minutes before bed.',
    items: [
      { title: 'Phone in a drawer', body: 'In another room ideally. The bedroom is for sleep.' },
      { title: 'Warm shower or bath', body: 'Body temperature drops after, which is a sleep cue.' },
      { title: 'Dim the lights', body: 'Lamps only. Skip the overheads after dark.' },
      { title: 'Read fiction', body: 'Not work. Not news. Fiction. Paper preferred.' },
      { title: 'Light stretching', body: 'Five minutes. Hips, shoulders, neck.' },
      { title: 'Brain dump', body: "Tomorrow's to do list on paper. Out of your head and into the page." },
      { title: 'Gratitude line', body: 'One sentence. What was good today.' },
      { title: 'Calm tea', body: 'Chamomile or rooibos. Warm, not caffeinated.' },
    ],
  },
};
