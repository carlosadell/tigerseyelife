// lib/onboardingSchema.ts
//
// Typed Zod schemas for the CREATE POWER §3.2 onboarding intake. Each section
// has its own schema; final submit type is the intersection. Conditional
// fields use `.optional()` so partial form state validates while the user
// is mid-flow; the review screen runs the final composed schema before submit.

import { z } from "zod";

export const obstacleEnum = z.enum([
  "time",
  "motivation",
  "knowledge",
  "injury",
  "cost",
  "other",
]);
export type Obstacle = z.infer<typeof obstacleEnum>;

export const workSituationEnum = z.enum([
  "office",
  "remote",
  "shift",
  "unemployed",
  "retired",
  "student",
]);
export type WorkSituation = z.infer<typeof workSituationEnum>;

export const livingSituationEnum = z.enum([
  "alone",
  "partner",
  "children",
  "roommates",
  "family",
]);
export type LivingSituation = z.infer<typeof livingSituationEnum>;

export const coachingStyleEnum = z.enum([
  "direct",
  "warm",
  "balanced",
  "challenging",
]);
export type CoachingStyle = z.infer<typeof coachingStyleEnum>;

// Per-section schemas. The conditional fields (confidence_barriers,
// other_obstacle, specific_habits, other_success_factor) are .optional()
// here so the partial form state can validate at any point. The route guards
// (Phase 7) enforce conditional presence using the registry's predicate.

export const goalsMotivationSchema = z.object({
  age: z.number().min(13).max(120),
  primary_goal: z.string().min(3),
  success_vision: z.string().min(3),
  importance_level: z.number().int().min(0).max(10),
  confidence_level: z.number().int().min(0).max(10),
  confidence_barriers: z.string().optional(),
});

export const roadblocksSchema = z.object({
  obstacles: z.array(obstacleEnum).min(1).max(2),
  other_obstacle: z.string().optional(),
  top_obstacles: z.array(z.string()).max(2).optional(),
  obstacle_deep_dive: z.string().optional(),
});

export const contextSchema = z.object({
  work_situation: workSituationEnum,
  living_situation: z.array(livingSituationEnum).min(1),
  past_experience: z.string().optional(),
});

export const habitsSchema = z.object({
  concerns: z.string().optional(),
  needle_mover: z.string().optional(),
  specific_habits: z.string().optional(),
  success_factor: z.string().optional(),
  other_success_factor: z.string().optional(),
  emotion_response: z.string().optional(),
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
  primary_goal: "",
  success_vision: "",
  importance_level: undefined,
  confidence_level: undefined,
  confidence_barriers: "",
  obstacles: [],
  other_obstacle: "",
  top_obstacles: [],
  obstacle_deep_dive: "",
  work_situation: undefined,
  living_situation: [],
  past_experience: "",
  concerns: "",
  needle_mover: "",
  specific_habits: "",
  success_factor: "",
  other_success_factor: "",
  emotion_response: "",
  coaching_style: undefined,
};
