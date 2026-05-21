export type PowerLetter = 'P' | 'O' | 'W' | 'E' | 'R';

export type PowerFocus = 'PRIMARY' | 'SECONDARY' | 'MAINTAIN';

export type PowerAction = {
  id: string;
  letter: PowerLetter;
  description: string;
  weekly_target: number;
};

export type PowerBlock = {
  id: string;
  name: string;
  letter: string;
  tagline: string;
  helper: string;
  focus: Record<PowerLetter, PowerFocus>;
  compass: Record<PowerLetter, string>;
  actions: PowerAction[];
};

export const POWER_LETTERS: Record<PowerLetter, string> = {
  P: 'Patterns',
  O: 'Ownership',
  W: 'Wisdom',
  E: 'Energy',
  R: 'Resilience',
};

export const powerBlocks: PowerBlock[] = [
  {
    id: 'commit',
    name: 'Commit Block',
    letter: 'C',
    tagline: 'Aim for 40-50% consistency in actions and follow through.',
    helper: 'Two weeks of small, repeatable actions that build identity through consistency.',
    focus: { P: 'PRIMARY', O: 'SECONDARY', W: 'PRIMARY', E: 'MAINTAIN', R: 'MAINTAIN' },
    compass: {
      P: 'Spot patterns & triggers',
      O: 'Small consistent steps',
      W: 'Sugar, whole foods, move',
      E: 'Just notice energy peaks',
      R: 'Consistent bedtime',
    },
    actions: [
      { id: 'commit-p1', letter: 'P', description: 'Learn which mental patterns are yours', weekly_target: 7 },
      { id: 'commit-p2', letter: 'P', description: 'Identify and log patterns and triggers', weekly_target: 7 },
      { id: 'commit-o1', letter: 'O', description: 'Work on something that holds you back', weekly_target: 7 },
      { id: 'commit-w1', letter: 'W', description: 'Start day with savory meal', weekly_target: 7 },
      { id: 'commit-w2', letter: 'W', description: 'Reduce quantity and frequency of night snacking', weekly_target: 5 },
      { id: 'commit-w3', letter: 'W', description: 'Walking', weekly_target: 3 },
      { id: 'commit-w4', letter: 'W', description: 'Strength training', weekly_target: 4 },
      { id: 'commit-e1', letter: 'E', description: 'Notice how your energy feels through the day', weekly_target: 7 },
      { id: 'commit-r1', letter: 'R', description: 'Get to bed on time (within 30 minutes of plan)', weekly_target: 5 },
      { id: 'commit-r2', letter: 'R', description: 'Optimize sleep environment', weekly_target: 5 },
    ],
  },
  {
    id: 'refine',
    name: 'Refine Block',
    letter: 'R',
    tagline: 'Smooth the edges. What worked stays, what didn’t gets refined.',
    helper: 'Tighten the routines you built in Commit. Less is more.',
    focus: { P: 'PRIMARY', O: 'PRIMARY', W: 'MAINTAIN', E: 'SECONDARY', R: 'PRIMARY' },
    compass: {
      P: 'Name what trips you up',
      O: 'Say no without overexplaining',
      W: 'Hold last block’s baseline',
      E: 'Map your daily energy dip',
      R: 'Lock the wind-down routine',
    },
    actions: [
      { id: 'refine-p1', letter: 'P', description: 'Identify what triggers your stress', weekly_target: 7 },
      { id: 'refine-o1', letter: 'O', description: 'Practice saying no without overexplaining', weekly_target: 3 },
      { id: 'refine-w1', letter: 'W', description: 'Stop eating 2 hours before bed', weekly_target: 5 },
      { id: 'refine-w2', letter: 'W', description: '5-minute walk after meals', weekly_target: 5 },
      { id: 'refine-w3', letter: 'W', description: 'Drink water before each meal', weekly_target: 7 },
      { id: 'refine-e1', letter: 'E', description: 'Track your evening energy dip', weekly_target: 7 },
      { id: 'refine-r1', letter: 'R', description: 'Stick to a 20-minute wind-down routine', weekly_target: 6 },
      { id: 'refine-r2', letter: 'R', description: 'Lights out by 10:30pm', weekly_target: 5 },
    ],
  },
  {
    id: 'evolve',
    name: 'Evolve Block',
    letter: 'E',
    tagline: 'New identity, scripted out. The change becomes who you are.',
    helper: 'Practice the version of you that handles the harder situations cleanly.',
    focus: { P: 'PRIMARY', O: 'PRIMARY', W: 'MAINTAIN', E: 'MAINTAIN', R: 'SECONDARY' },
    compass: {
      P: 'Catch old roles surfacing',
      O: 'Use a prepared script',
      W: '80% full · protein-forward',
      E: 'Hold afternoon energy',
      R: 'Same bedtime daily',
    },
    actions: [
      { id: 'evolve-p1', letter: 'P', description: 'Notice when you slip into old roles', weekly_target: 7 },
      { id: 'evolve-o1', letter: 'O', description: 'Use a prepared script in 1 social situation', weekly_target: 3 },
      { id: 'evolve-w1', letter: 'W', description: 'Stop eating at 80% full', weekly_target: 7 },
      { id: 'evolve-w2', letter: 'W', description: 'Choose protein-forward at every meal', weekly_target: 7 },
      { id: 'evolve-w3', letter: 'W', description: 'Walk after dinner', weekly_target: 4 },
      { id: 'evolve-e1', letter: 'E', description: 'Notice afternoon energy patterns', weekly_target: 5 },
      { id: 'evolve-r1', letter: 'R', description: 'Same bedtime daily', weekly_target: 7 },
    ],
  },
  {
    id: 'adapt',
    name: 'Adapt Block',
    letter: 'A',
    tagline: 'Pressure-test the system. Resilience under friction.',
    helper: 'When things go sideways, the habits stay. That’s the point.',
    focus: { P: 'PRIMARY', O: 'SECONDARY', W: 'MAINTAIN', E: 'PRIMARY', R: 'PRIMARY' },
    compass: {
      P: 'Catch the moment friction starts',
      O: 'Reframe setbacks as data',
      W: 'Hold strength + nutrition',
      E: 'Breath as a fast reset',
      R: 'Bedtime stays steady through stress',
    },
    actions: [
      { id: 'adapt-p1', letter: 'P', description: 'Recognize the moment friction starts', weekly_target: 7 },
      { id: 'adapt-o1', letter: 'O', description: 'Reframe one setback per day as data', weekly_target: 5 },
      { id: 'adapt-w1', letter: 'W', description: 'Don’t skip strength on hard days', weekly_target: 4 },
      { id: 'adapt-w2', letter: 'W', description: 'Stress-test your hydration habit', weekly_target: 7 },
      { id: 'adapt-w3', letter: 'W', description: 'Move 10 min during the worst part of the day', weekly_target: 5 },
      { id: 'adapt-e1', letter: 'E', description: 'Use breath as a reset (1× daily)', weekly_target: 7 },
      { id: 'adapt-r1', letter: 'R', description: 'Bedtime stays steady through stress', weekly_target: 6 },
    ],
  },
  {
    id: 'thrive',
    name: 'Thrive Block',
    letter: 'T',
    tagline: 'You’re running. Now keep the engine cool.',
    helper: 'Maintain what works. Mentor someone newer. Pay attention to what gives you energy.',
    focus: { P: 'SECONDARY', O: 'PRIMARY', W: 'MAINTAIN', E: 'PRIMARY', R: 'MAINTAIN' },
    compass: {
      P: 'Patterns that work — double down',
      O: 'Mentor someone newer',
      W: 'Maintain strength + nutrition baseline',
      E: 'What’s giving you energy now?',
      R: 'Protect recovery on purpose',
    },
    actions: [
      { id: 'thrive-p1', letter: 'P', description: 'Spot patterns that work and double down', weekly_target: 5 },
      { id: 'thrive-o1', letter: 'O', description: 'Mentor someone newer once a week', weekly_target: 1 },
      { id: 'thrive-w1', letter: 'W', description: 'Maintain strength training', weekly_target: 4 },
      { id: 'thrive-w2', letter: 'W', description: 'Keep nutrition baseline (protein-forward)', weekly_target: 7 },
      { id: 'thrive-w3', letter: 'W', description: 'Walking baseline', weekly_target: 4 },
      { id: 'thrive-e1', letter: 'E', description: 'Energy reflection — what’s giving you energy now?', weekly_target: 7 },
      { id: 'thrive-r1', letter: 'R', description: 'Sleep score check — what’s protecting recovery?', weekly_target: 7 },
    ],
  },
];

export function getPowerBlock(id: string): PowerBlock | undefined {
  return powerBlocks.find((block) => block.id === id);
}
