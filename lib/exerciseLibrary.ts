// lib/exerciseLibrary.ts
//
// The CREATE POWER exercise library. 18 atomic exercises Ryan shared
// 2026-06-16. Each entry holds a YouTube video id (unlisted), muscle
// groups, and short cues. `youtubeVideoId === null` means Ryan has not
// delivered the asset yet; the renderer shows a poster placeholder.

export type MuscleGroupName =
  | 'Quads'
  | 'Glutes'
  | 'Hamstrings'
  | 'Core'
  | 'Chest'
  | 'Shoulders'
  | 'Back'
  | 'Biceps'
  | 'Triceps'
  | 'Posterior chain'
  | 'Forearms';

export type ExerciseId =
  | 'db-squat'
  | 'push-ups'
  | 'db-overhead-press'
  | 'db-split-squat'
  | 'chair-squat'
  | 'db-deadlift'
  | 'db-bor-reverse-grip'
  | 'db-stagger-stance-dl'
  | '1-arm-bor'
  | 'biceps-curls'
  | 'db-sumo-squat'
  | 'seated-db-press'
  | '3-phase-sissy-squat'
  | 'push-up-from-deficit'
  | 'sumo-db-rdl'
  | 'db-bent-over-row'
  | 'feet-close-together-dl'
  | 'wall-15-bicep-curls';

export type Exercise = {
  id: ExerciseId;
  name: string;
  youtubeVideoId: string | null;
  muscleGroups: { name: MuscleGroupName; primary: boolean }[];
  instructions: string[];
  defaultSets?: number;
  defaultReps?: string;
};

export const EXERCISE_LIBRARY: Record<ExerciseId, Exercise> = {
  'db-squat': {
    id: 'db-squat',
    name: 'DB Squat',
    youtubeVideoId: 'YdcHrtaXMP4',
    muscleGroups: [
      { name: 'Quads', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Hold a dumbbell in each hand at your sides, feet shoulder-width.',
      'Sit back into the squat. Chest tall, knees tracking the toes.',
      'Drive through the whole foot to stand.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'push-ups': {
    id: 'push-ups',
    name: 'Push Ups',
    youtubeVideoId: 'fSCo_IRlsLk',
    muscleGroups: [
      { name: 'Chest', primary: true },
      { name: 'Shoulders', primary: false },
      { name: 'Triceps', primary: false },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Plank position, hands a touch wider than the shoulders.',
      'Lower the chest with elbows at a 45-degree angle.',
      'Press the floor away to lockout.',
    ],
    defaultSets: 3,
    defaultReps: 'AMRAP',
  },
  'db-overhead-press': {
    id: 'db-overhead-press',
    name: 'DB Overhead Press',
    youtubeVideoId: 'LuFqvlUiX5g',
    muscleGroups: [
      { name: 'Shoulders', primary: true },
      { name: 'Triceps', primary: false },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Stand tall. Dumbbells at shoulder height, palms forward.',
      'Brace the core, press straight overhead.',
      'Lower with control to the start.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'db-split-squat': {
    id: 'db-split-squat',
    name: 'DB Split Squat',
    youtubeVideoId: 'R1Wk_-s4oTI',
    muscleGroups: [
      { name: 'Quads', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Hamstrings', primary: false },
    ],
    instructions: [
      'Split stance. Dumbbells at your sides.',
      'Lower the back knee toward the floor.',
      'Drive through the front foot to stand. Switch sides each set.',
    ],
    defaultSets: 3,
    defaultReps: '10 per leg',
  },
  'chair-squat': {
    id: 'chair-squat',
    name: 'Chair Squat',
    youtubeVideoId: 'NpxSf4lT8EI',
    muscleGroups: [
      { name: 'Quads', primary: true },
      { name: 'Glutes', primary: true },
    ],
    instructions: [
      'Stand a foot in front of a chair, feet shoulder-width.',
      'Sit back until the chair grazes your hips.',
      'Stand without bouncing off the seat.',
    ],
    defaultSets: 3,
    defaultReps: '10 to 15',
  },
  'db-deadlift': {
    id: 'db-deadlift',
    name: 'DB Deadlift',
    youtubeVideoId: 'TyA7K9gc6U8',
    muscleGroups: [
      { name: 'Posterior chain', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Hamstrings', primary: false },
      { name: 'Back', primary: false },
    ],
    instructions: [
      'Dumbbells in front of the thighs, feet hip-width.',
      'Hinge at the hips. Soft knees, flat back.',
      'Drive the floor away to lockout.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'db-bor-reverse-grip': {
    id: 'db-bor-reverse-grip',
    name: 'DB Bent Over Row, Reverse Grip',
    youtubeVideoId: 'Q2h_L3joYuE',
    muscleGroups: [
      { name: 'Back', primary: true },
      { name: 'Biceps', primary: true },
      { name: 'Posterior chain', primary: false },
    ],
    instructions: [
      'Hinge at the hips. Dumbbells under the shoulders, palms forward.',
      'Pull the dumbbells toward the ribs, elbows close to the body.',
      'Lower with control.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'db-stagger-stance-dl': {
    id: 'db-stagger-stance-dl',
    name: 'DB Stagger Stance Deadlift',
    youtubeVideoId: '_dg4dbC5U8Q',
    muscleGroups: [
      { name: 'Posterior chain', primary: true },
      { name: 'Hamstrings', primary: true },
      { name: 'Glutes', primary: false },
    ],
    instructions: [
      'One foot back on the toes. Most weight in the front leg.',
      'Hinge from the front hip. Dumbbells track the front shin.',
      'Stand by squeezing the front glute. Switch sides each set.',
    ],
    defaultSets: 3,
    defaultReps: '8 per leg',
  },
  '1-arm-bor': {
    id: '1-arm-bor',
    name: '1 Arm Bent Over Row',
    youtubeVideoId: 'V6H7gsd5pVc',
    muscleGroups: [
      { name: 'Back', primary: true },
      { name: 'Biceps', primary: false },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Hinge at the hips. Free hand on a bench or knee for support.',
      'Pull the dumbbell toward the hip, elbow leading.',
      'Lower with control. Switch sides each set.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 10 per side',
  },
  'biceps-curls': {
    id: 'biceps-curls',
    name: 'Biceps Curls',
    youtubeVideoId: 'ZlJME5Xn9zs',
    muscleGroups: [
      { name: 'Biceps', primary: true },
      { name: 'Forearms', primary: false },
    ],
    instructions: [
      'Stand tall. Dumbbells at your sides, palms forward.',
      'Curl to the shoulder without swinging.',
      'Lower with control.',
    ],
    defaultSets: 2,
    defaultReps: '12 to 15',
  },
  'db-sumo-squat': {
    id: 'db-sumo-squat',
    name: 'DB Sumo Squat',
    youtubeVideoId: 'wIvuMgx1hfQ',
    muscleGroups: [
      { name: 'Glutes', primary: true },
      { name: 'Quads', primary: true },
      { name: 'Hamstrings', primary: false },
    ],
    instructions: [
      'Wide stance, toes turned out. One dumbbell held vertically.',
      'Sit straight down between the heels. Knees track the toes.',
      'Stand by squeezing the glutes.',
    ],
    defaultSets: 3,
    defaultReps: '10 to 12',
  },
  'seated-db-press': {
    id: 'seated-db-press',
    name: 'Seated DB Press',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Shoulders', primary: true },
      { name: 'Triceps', primary: false },
    ],
    instructions: [
      'Seated, back supported. Dumbbells at shoulder height.',
      'Press straight overhead without arching the lower back.',
      'Lower with control.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  '3-phase-sissy-squat': {
    id: '3-phase-sissy-squat',
    name: '3 Phase Sissy Squat',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Quads', primary: true },
      { name: 'Core', primary: false },
    ],
    instructions: [
      'Heels elevated. Lean back as the knees track forward.',
      'Pause at three depths on the way down.',
      'Drive back up through the toes.',
    ],
    defaultSets: 3,
    defaultReps: '6 to 8',
  },
  'push-up-from-deficit': {
    id: 'push-up-from-deficit',
    name: 'Push Up From Deficit',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Chest', primary: true },
      { name: 'Shoulders', primary: false },
      { name: 'Triceps', primary: false },
    ],
    instructions: [
      'Hands on raised handles or plates. Plank position.',
      'Lower the chest below the hands.',
      'Press the floor away to lockout.',
    ],
    defaultSets: 3,
    defaultReps: '6 to 10',
  },
  'sumo-db-rdl': {
    id: 'sumo-db-rdl',
    name: 'Sumo DB Romanian Deadlift',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Hamstrings', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Posterior chain', primary: false },
    ],
    instructions: [
      'Wide stance, toes turned out. Dumbbells in front of the thighs.',
      'Hinge at the hips with a soft knee. Dumbbells stay close to the legs.',
      'Stand by squeezing the glutes.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 12',
  },
  'db-bent-over-row': {
    id: 'db-bent-over-row',
    name: 'Dumbbell Bent Over Row',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Back', primary: true },
      { name: 'Biceps', primary: false },
      { name: 'Posterior chain', primary: false },
    ],
    instructions: [
      'Hinge at the hips. Dumbbells under the shoulders, palms facing each other.',
      'Pull the dumbbells toward the ribs.',
      'Lower with control.',
    ],
    defaultSets: 3,
    defaultReps: '10 to 12',
  },
  'feet-close-together-dl': {
    id: 'feet-close-together-dl',
    name: 'Feet Close Together Deadlift',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Posterior chain', primary: true },
      { name: 'Glutes', primary: true },
      { name: 'Hamstrings', primary: false },
    ],
    instructions: [
      'Feet touching. Dumbbells in front of the thighs.',
      'Hinge at the hips with a flat back.',
      'Stand by driving the floor away.',
    ],
    defaultSets: 3,
    defaultReps: '8 to 10',
  },
  'wall-15-bicep-curls': {
    id: 'wall-15-bicep-curls',
    name: 'Wall 1.5 Bicep Curls',
    youtubeVideoId: null,
    muscleGroups: [
      { name: 'Biceps', primary: true },
      { name: 'Forearms', primary: false },
    ],
    instructions: [
      'Stand with the back against a wall. Dumbbells at your sides.',
      'Curl all the way up, lower to ninety degrees, curl back up, lower fully.',
      'That sequence is one rep.',
    ],
    defaultSets: 2,
    defaultReps: '8 to 10',
  },
};

export const EXERCISE_IDS: readonly ExerciseId[] = Object.keys(
  EXERCISE_LIBRARY,
) as ExerciseId[];

export function exerciseById(id: ExerciseId): Exercise {
  return EXERCISE_LIBRARY[id];
}
