export type WorkoutProgram = {
  id: string;
  name: string;
  delivery_type: 'live' | 'pre_recorded' | 'written' | 'future';
  level: string;
  description: string | null;
  published: boolean;
  sort_order: number;
};

export type ProgramWorkout = {
  id: string;
  program_id: string;
  day_label: string;
  name: string;
  duration_minutes: number;
  exercise_count: number;
  equipment: string[];
  slotting_tags?: Record<string, unknown>;
  tutorial_urls: Array<{ title: string; url: string }>;
  sort_order: number;
};

export type MicrolearningModule = {
  id: string;
  block: string;
  title: string;
  description: string | null;
  tiiny_url: string;
  published: boolean;
  sort_order: number;
};

export const programSeed: WorkoutProgram[] = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Pre-recorded GST Level 1',
    delivery_type: 'pre_recorded',
    level: 'Level 1',
    description: 'Video-based program for newer members.',
    published: true,
    sort_order: 3,
  },
];

export const programWorkoutSeed: ProgramWorkout[] = [
  {
    id: 'seed-lower-body-a',
    program_id: '33333333-3333-4333-8333-333333333333',
    day_label: 'Today',
    name: 'Lower Body A',
    duration_minutes: 30,
    exercise_count: 6,
    equipment: ['dumbbells', 'bands'],
    slotting_tags: {
      duration: '30 min',
      equipment: 'Home basics',
      experience: ['novice', 'rusty'],
    },
    tutorial_urls: [],
    sort_order: 1,
  },
];

export const microlearningSeed: MicrolearningModule[] = [
  moduleSeed('adapt-block-orientation', 'ADAPT', 'ADAPT Block Orientation', 'Start the ADAPT block and learn the resilience frame.', 'https://adapt-block-orientation.tiiny.site/', 1),
  moduleSeed('adapt-backstop-protocol', 'ADAPT', 'Backstop Protocol', 'A simple protocol for catching stress before it becomes a slide.', 'https://adapt-backstop-protocol.tiiny.site/', 2),
  moduleSeed('adapt-breath-for-resilience', 'ADAPT', 'Breath for Resilience', 'Use breath as a fast body-based reset under pressure.', 'https://adapt-breath-for-resilience.tiiny.site/', 3),
  moduleSeed('adapt-build-optionality', 'ADAPT', 'Build Optionality', 'Create more than one path when the day does not cooperate.', 'https://adapt-build-optionality.tiiny.site/', 4),
  moduleSeed('adapt-growth-response-reframes', 'ADAPT', 'Growth Response Reframes', 'Practice reframes that turn friction into useful data.', 'https://adapt-growth-response-reframes.tiiny.site/', 5),
  moduleSeed('adapt-stress-testing-your-systems', 'ADAPT', 'Stress Testing Your Systems', 'Pressure-test the routines that support your energy and choices.', 'https://adapt-stress-testing-your-systems.tiiny.site/', 6),
  moduleSeed('refine-block-orientation', 'REFINE', 'REFINE Block Orientation', 'Start the REFINE block and sharpen your next decision.', 'https://refine-block-orientation.tiiny.site/', 7),
  moduleSeed('refine-wind-down-routine-strategies', 'REFINE', 'Wind-down Routine Strategies', 'Build an evening routine that protects recovery.', 'https://refine-wind-down-routine-strategies.tiiny.site/', 8),
  moduleSeed('refine-emotional-cycle-of-change', 'REFINE', 'Emotional Cycle of Change', 'Understand the emotional arc behind behavior change.', 'https://refine-emotional-cycle-of-change.tiiny.site/', 9),
  moduleSeed('refine-advocacy-boundaries', 'REFINE', 'Advocacy Boundaries', 'Use boundaries to protect what matters without overexplaining.', 'https://refine-advocacy-boundaries.tiiny.site/', 10),
  moduleSeed('commit-block-orientation', 'COMMIT', 'COMMIT Block Orientation', 'Start the COMMIT block and turn intention into repeatable action.', 'https://commit-block-orientation.tiiny.site/', 11),
  moduleSeed('commit-first-meal-quickstart', 'COMMIT', 'First Meal Quickstart', 'Make the first meal easier, clearer, and more protein-forward.', 'https://commit-first-meal-quickstart.tiiny.site/', 12),
  moduleSeed('commit-sugar-identifier-guide', 'COMMIT', 'Sugar Identifier Guide', 'Learn where sugar patterns hide and how to spot them.', 'https://commit-sugar-identifier-guide.tiiny.site/', 13),
  moduleSeed('commit-5-universal-patterns', 'COMMIT', '5 Universal Patterns', 'Recognize common patterns that shape daily food and energy choices.', 'https://commit-5-universal-patterns.tiiny.site/', 14),
  moduleSeed('commit-progressive-overload-primer', 'COMMIT', 'Progressive Overload Primer', 'Understand the strength principle behind smart progress.', 'https://commit-progressive-overload-primer.tiiny.site/', 15),
  moduleSeed('evolve-block-orientation', 'EVOLVE', 'EVOLVE Block Orientation', 'Start the EVOLVE block and integrate new habits into identity.', 'https://evolve-block-orientation.tiiny.site/', 16),
  moduleSeed('social-situation-scripts', 'EVOLVE', 'Social Situation Scripts', 'Use simple scripts to navigate pressure without losing the plan.', 'https://social-situation-scripts.tiiny.site/', 17),
  moduleSeed('evolve-eating-to-80-percent-full', 'EVOLVE', 'Eating to 80 Percent Full', 'Practice stopping with enough instead of stuffed.', 'https://evolve-eating-to-80-percent-full.tiiny.site/', 18),
  moduleSeed('evolve-social-pattern-navigation', 'EVOLVE', 'Social Pattern Navigation', 'Spot social patterns and choose your response with intention.', 'https://evolve-social-pattern-navigation.tiiny.site/', 19),
  moduleSeed('evolve-3-accounts-1-economy', 'EVOLVE', '3 Accounts, 1 Economy', 'Balance energy, attention, and choices as one operating system.', 'https://evolve-3-accounts-1-economy.tiiny.site/', 20),
  moduleSeed('evolve-identity-integration', 'EVOLVE', 'Identity Integration', 'Make the new behavior part of who you are becoming.', 'https://evolve-identity-integration.tiiny.site/', 21),
  moduleSeed('the-teb-loop', 'FOUNDATIONS', 'The TEB Loop', 'Connect thoughts, emotions, and behaviors as a practical loop.', 'https://the-teb-loop.tiiny.site/', 22),
  moduleSeed('app-v3', 'APP', 'App v3 Preview', 'Reference experience for the next member-app direction.', 'https://app-v3.tiiny.site/', 23),
  moduleSeed('nutrition-foundations-guide', 'FOUNDATIONS', 'Nutrition Foundations Guide', 'A grounding guide for nutrition choices without noise.', 'https://nutrition-foundations-guide.tiiny.site/', 24),
  moduleSeed('environment-design', 'FOUNDATIONS', 'Environment Design', 'Shape the environment so better choices become easier.', 'https://environment-design.tiiny.site/', 25),
  moduleSeed('abc-power-meals', 'FOUNDATIONS', 'ABC Power Meals', 'A practical meal frame for strength, energy, and consistency.', 'https://abc-power-meals.tiiny.site/', 26),
];

function moduleSeed(
  id: string,
  block: string,
  title: string,
  description: string,
  tiiny_url: string,
  sort_order: number,
): MicrolearningModule {
  return {
    id,
    block,
    title,
    description,
    tiiny_url,
    published: true,
    sort_order,
  };
}
