import type { Tool } from '../tools';

export const sleepEnvironmentChecklist: Tool = {
  slug: 'sleep-environment-checklist',
  title: 'Sleep Environment Checklist',
  introducedInWeek: 2,
  isStar: false,
  body: {
    kind: 'checklist',
    intro: 'Walk through your bedroom right now and check what is already true. Then pick one to change this week.',
    items: [
      { id: 'temp', label: 'Bedroom is sixty five to sixty eight degrees overnight' },
      { id: 'dark', label: 'Room is dark enough that you cannot read a book' },
      { id: 'phone-out', label: 'Phone charges outside the bedroom' },
      { id: 'no-screens', label: 'No screens in the last hour before bed' },
      { id: 'comfy-bed', label: 'Mattress and pillow are working for your body' },
      { id: 'fresh-sheets', label: 'Sheets are clean and feel good' },
      { id: 'quiet', label: 'Room is quiet or has consistent low noise' },
      { id: 'no-clutter', label: 'No work or to do list visible from the bed' },
    ],
  },
};
