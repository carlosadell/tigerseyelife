// lib/onboardingSchema.ts
//
// Typed Zod schemas for the CREATE POWER §3.2 onboarding intake. Each section
// has its own schema; final submit type is the intersection. Conditional
// fields use `.optional()` so partial form state validates while the user
// is mid-flow; the review screen runs the final composed schema before submit.

import { z } from 'zod';

export const obstacleEnum = z.enum([
  'time',
  'motivation',
  'knowledge',
  'injury',
  'cost',
  'other',
]);
export type Obstacle = z.infer<typeof obstacleEnum>;

export const workSituationEnum = z.enum([
  'office',
  'remote',
  'shift',
  'unemployed',
  'retired',
  'student',
]);
export type WorkSituation = z.infer<typeof workSituationEnum>;

export const livingSituationEnum = z.enum([
  'alone',
  'partner',
  'children',
  'roommates',
  'family',
]);
export type LivingSituation = z.infer<typeof livingSituationEnum>;

export const coachingStyleEnum = z.enum([
  'direct',
  'warm',
  'balanced',
  'challenging',
]);
export type CoachingStyle = z.infer<typeof coachingStyleEnum>;

// Apex workout-slotting answers (Karen 2026-07-21). These feed
// buildApexAssignment in lib/apexPrograms.ts. training_format is only
// meaningful on the 60-minute path, so it is optional here.
export const trainingLocationEnum = z.enum(['home', 'commercial']);
export type TrainingLocation = z.infer<typeof trainingLocationEnum>;

export const trainingFormatEnum = z.enum(['prerecorded', 'live']);
export type TrainingFormat = z.infer<typeof trainingFormatEnum>;

// Per-section schemas. The conditional fields (confidence_barriers,
// other_obstacle, specific_habits, other_success_factor) are .optional()
// here so the partial form state can validate at any point. The route guards
// (Phase 7) enforce conditional presence using the registry's predicate.

export const goalsMotivationSchema = z.object({
  age: z.number().min(13).max(120),
  // Apex slotting answers (sit right after age in the flow). Optional so the
  // mid-flow partial state validates; the 60-min format is conditional.
  training_location: trainingLocationEnum.optional(),
  training_duration: z.union([z.literal(30), z.literal(60)]).optional(),
  training_format: trainingFormatEnum.optional(),
  primary_goal: z.string().min(3),
  success_vision: z.string().min(3),
  importance_level: z.number().int().min(0).max(10),
  confidence_level: z.number().int().min(0).max(10),
  confidence_barriers: z.string().optional(),
});

export const roadblocksSchema = z.object({
  obstacles: z.array(obstacleEnum).min(1),
  other_obstacle: z.string().optional(),
  top_obstacles: z.array(z.string()).max(2),
  obstacle_deep_dive: z.string().min(3),
});

export const contextSchema = z.object({
  work_situation: workSituationEnum,
  living_situation: z.array(livingSituationEnum).min(1),
  past_experience: z.string().optional(),
});

export const habitsSchema = z.object({
  concerns: z.string().optional(),
  needle_mover: z.string().min(1),
  specific_habits: z.string().optional(),
  success_factor: z.string().min(1),
  other_success_factor: z.string().optional(),
  emotion_response: z.string().min(1),
  coaching_style: coachingStyleEnum,
});

// Final composed type — the union of all 4 sections.
export const intakeSchema = goalsMotivationSchema
  .merge(roadblocksSchema)
  .merge(contextSchema)
  .merge(habitsSchema);

export type Intake = z.infer<typeof intakeSchema>;

// Partial used for mid-flow form state.
export type PartialIntake = Partial<Intake>;

// Default (all-empty) form values used to initialize useForm.
export const intakeDefaults: PartialIntake = {
  age: undefined,
  training_location: undefined,
  training_duration: undefined,
  training_format: undefined,
  primary_goal: '',
  success_vision: '',
  importance_level: undefined,
  confidence_level: undefined,
  confidence_barriers: '',
  obstacles: [],
  other_obstacle: '',
  top_obstacles: [],
  obstacle_deep_dive: '',
  work_situation: undefined,
  living_situation: [],
  past_experience: '',
  concerns: '',
  needle_mover: '',
  specific_habits: '',
  success_factor: '',
  other_success_factor: '',
  emotion_response: '',
  coaching_style: undefined,
};
