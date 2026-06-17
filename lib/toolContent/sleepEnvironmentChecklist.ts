import type { Tool } from '../tools';

export const sleepEnvironmentChecklist: Tool = {
  slug: 'sleep-environment-checklist',
  title: 'Sleep Environment Checklist',
  introducedInWeek: 2,
  isStar: false,
  metadata: {
    block: 'COMMIT',
    primaryNeed: 'resilience',
    secondaryNeeds: ['energy'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 37,
      body: 'Eight conditions that determine whether your bedroom is working for sleep. Walk through them now and check what is already true. Pick one to change this week. The environment does the convincing before your body even tries.',
    },
    layer2: {
      kind: 'text-only',
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
    },
  },
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
