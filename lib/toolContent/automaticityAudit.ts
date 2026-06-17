import type { Tool } from '../tools';

export const automaticityAudit: Tool = {
  slug: 'automaticity-audit',
  title: 'Automaticity Audit',
  introducedInWeek: 9,
  isStar: false,
  metadata: {
    block: 'THRIVE',
    primaryNeed: 'systems',
    secondaryNeeds: ['identity'],
    prerequisites: ['habits-over-checklists'],
    entryPointEligible: false,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 39,
      body: 'Walk through your last forty eight hours and check which behaviors felt automatic. The ones that needed willpower are still habits in progress. The ones that ran on autopilot are yours now. That is the difference worth tracking.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'checklist',
        intro: 'Walk through your last forty eight hours. Which of these felt automatic? Which still required willpower?',
        items: [
          { id: 'first-meal', label: 'Anchor protein at your first meal of the day' },
          { id: 'water', label: 'Water before coffee' },
          { id: 'movement-break', label: 'At least one movement break in the work day' },
          { id: 'workout', label: 'Your scheduled workouts happened' },
          { id: 'walk', label: 'Daily walk happened' },
          { id: 'pause', label: 'You used the pause practice without thinking about it' },
          { id: 'wind-down', label: 'Wind down routine ran on autopilot' },
          { id: 'bedtime', label: 'Bedtime was close to plan without negotiation' },
          { id: 'breath', label: 'You used breathing without being reminded' },
          { id: 'identity', label: 'You did the thing because that is who you are now' },
        ],
      },
    },
  },
  body: {
    kind: 'checklist',
    intro: 'Walk through your last forty eight hours. Which of these felt automatic? Which still required willpower?',
    items: [
      { id: 'first-meal', label: 'Anchor protein at your first meal of the day' },
      { id: 'water', label: 'Water before coffee' },
      { id: 'movement-break', label: 'At least one movement break in the work day' },
      { id: 'workout', label: 'Your scheduled workouts happened' },
      { id: 'walk', label: 'Daily walk happened' },
      { id: 'pause', label: 'You used the pause practice without thinking about it' },
      { id: 'wind-down', label: 'Wind down routine ran on autopilot' },
      { id: 'bedtime', label: 'Bedtime was close to plan without negotiation' },
      { id: 'breath', label: 'You used breathing without being reminded' },
      { id: 'identity', label: 'You did the thing because that is who you are now' },
    ],
  },
};
