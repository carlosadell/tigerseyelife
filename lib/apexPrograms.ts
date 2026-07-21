// lib/apexPrograms.ts
//
// Karen's workout-slotting decision tree (2026-07-21). This is the single
// source of truth for "which workout program does a member get at join."
//
// The tree (see docs/product-reference-checklist.md "Program-slotting decision
// tree — Karen 2026-07-21" and memory apex_program_slotting_tree):
//
//   Q1  Home vs commercial gym      -> Apex Home / Apex Gym
//   Q2  30 vs 60 min                -> 30 = Apex30 (pre-recorded)
//                                      60 = choose Live GST (Zoom) or Apex60
//
// Programs are Apex30 A/B/C… and Apex60 A/B/C…, each 12 weeks. A new joiner
// always starts at letter "A"; finishing a program means purchasing the next
// letter (the letter is the continuation arc, not a join-time question).
//
// Slotting is DETERMINISTIC — same answers always map to the same family. No
// randomness, no model/generative selection. This honors the long-standing
// "same key -> same program, per cohort" contract.

export type ApexLocation = 'home' | 'commercial';
export type ApexDuration = 30 | 60;
/** Only meaningful when duration === 60. 'live' is the Zoom group option. */
export type ApexFormat = 'prerecorded' | 'live';

export type ApexFamilyId =
  | 'apex30-home'
  | 'apex60-home'
  | 'apex30-gym'
  | 'apex60-gym'
  | 'live-gst';

export type ApexAnswers = {
  location: ApexLocation;
  duration: ApexDuration;
  /** Required when duration === 60; ignored at 30 (always pre-recorded). */
  format?: ApexFormat;
};

export type ApexFamily = {
  id: ApexFamilyId;
  /** Member-facing name, e.g. "Apex30 · Home". No em dashes in UI copy. */
  displayName: string;
  brand: 'Apex30' | 'Apex60' | 'Live GST';
  /** 'any' for live — it is a Zoom follow-along, location-agnostic. */
  location: ApexLocation | 'any';
  durationMinutes: ApexDuration;
  delivery: 'pre_recorded' | 'live';
  /**
   * False when the content does not exist yet. Commercial-gym video tutorials
   * are not authored until Q3/Q4 2026 — the UI must gate on this rather than
   * dropping a member into an empty program.
   */
  contentAvailable: boolean;
  /**
   * The concrete program id assigned to a NEW joiner (letter "A"). In dev this
   * matches an id in lib/programs.ts programSeed; in Supabase it matches a
   * workout_programs.slug. Null where the join program is not seeded yet.
   */
  joinProgramId: string | null;
  /** First workout of the join program, or null when not seeded/scheduled. */
  joinWorkoutId: string | null;
  note?: string;
};

/** The letter a new member always starts at. B/C… come from re-purchase. */
export const APEX_START_LETTER = 'A' as const;

/** Each pre-recorded Apex program (and the live block) is 12 weeks. */
export const APEX_PROGRAM_WEEKS = 12;

/**
 * Live Group Strength Training schedule (Karen, 2026-07-21). 60 min, 4×/week,
 * all times US Eastern. Shown on the 60-minute "live vs pre-recorded" choice.
 */
export const LIVE_GST_SCHEDULE: readonly { day: string; timeET: string }[] = [
  { day: 'Sunday', timeET: '8:00 AM ET' },
  { day: 'Tuesday', timeET: '7:40 AM ET' },
  { day: 'Thursday', timeET: '6:15 PM ET' },
  { day: 'Friday', timeET: '6:15 PM ET' },
];

/**
 * Canonical families (join-time "A" variant). Ordered for stable display.
 *
 * apex30-home reuses the existing "CREATE POWER · Foundations" program
 * (pre-recorded, 30 min, home basics) as its join program — that program is
 * already seeded with four workouts, so the most common path is testable
 * end-to-end without new content. The other families are seeded as program
 * rows; their per-workout content is a follow-up (and gym content is gated
 * off until Q3/Q4 2026).
 */
export const APEX_FAMILIES: readonly ApexFamily[] = [
  {
    id: 'apex30-home',
    displayName: 'Apex30 · Home',
    brand: 'Apex30',
    location: 'home',
    durationMinutes: 30,
    delivery: 'pre_recorded',
    contentAvailable: true,
    joinProgramId: '33333333-3333-4333-8333-333333333333',
    joinWorkoutId: 'seed-lower-body-a',
    note: 'Reuses the existing CREATE POWER · Foundations program (30 min, home basics).',
  },
  {
    id: 'apex60-home',
    displayName: 'Apex60 · Home',
    brand: 'Apex60',
    location: 'home',
    durationMinutes: 60,
    delivery: 'pre_recorded',
    contentAvailable: true,
    joinProgramId: 'apex60-home-a',
    joinWorkoutId: null,
    note: 'Program row seeded; per-workout content is a follow-up.',
  },
  {
    id: 'apex30-gym',
    displayName: 'Apex30 · Gym',
    brand: 'Apex30',
    location: 'commercial',
    durationMinutes: 30,
    delivery: 'pre_recorded',
    contentAvailable: false,
    joinProgramId: 'apex30-gym-a',
    joinWorkoutId: null,
    note: 'Commercial-gym tutorials do not exist until Q3/Q4 2026. Gate in UI.',
  },
  {
    id: 'apex60-gym',
    displayName: 'Apex60 · Gym',
    brand: 'Apex60',
    location: 'commercial',
    durationMinutes: 60,
    delivery: 'pre_recorded',
    contentAvailable: false,
    joinProgramId: 'apex60-gym-a',
    joinWorkoutId: null,
    note: 'Commercial-gym tutorials do not exist until Q3/Q4 2026. Gate in UI.',
  },
  {
    id: 'live-gst',
    displayName: 'Live Group Strength',
    brand: 'Live GST',
    location: 'any',
    durationMinutes: 60,
    delivery: 'live',
    contentAvailable: true,
    joinProgramId: 'live-gst',
    joinWorkoutId: null,
    note: 'Scheduled Zoom sessions (see LIVE_GST_SCHEDULE); no on-demand video library.',
  },
];

export function apexFamilyById(id: ApexFamilyId): ApexFamily {
  const family = APEX_FAMILIES.find((f) => f.id === id);
  if (!family) throw new Error(`Unknown Apex family: ${id}`);
  return family;
}

/**
 * The deterministic slotter. Maps the member's answers to exactly one family.
 *
 *   30 min           -> apex30-{home|gym}
 *   60 min + live    -> live-gst        (location-agnostic Zoom follow-along)
 *   60 min + prerec  -> apex60-{home|gym}
 *
 * Returns null only for an incoherent answer set (e.g. a 60-min path with no
 * format chosen) so callers can keep the member on the format question.
 */
export function slotApexProgram(answers: ApexAnswers): ApexFamily | null {
  const { location, duration, format } = answers;
  const wing = location === 'commercial' ? 'gym' : 'home';

  if (duration === 30) {
    return apexFamilyById(`apex30-${wing}` as ApexFamilyId);
  }

  if (duration === 60) {
    if (format === 'live') return apexFamilyById('live-gst');
    if (format === 'prerecorded') {
      return apexFamilyById(`apex60-${wing}` as ApexFamilyId);
    }
    // 60 min chosen but no live/pre-recorded decision yet.
    return null;
  }

  return null;
}

/**
 * What actually gets written to the member's profile at assignment time.
 * Callers persist this (dual-path: AsyncStorage in dev, profiles in Supabase).
 */
export type ApexAssignment = {
  answers: ApexAnswers;
  familyId: ApexFamilyId;
  letter: typeof APEX_START_LETTER;
  programId: string | null;
  workoutId: string | null;
  contentAvailable: boolean;
};

export function buildApexAssignment(answers: ApexAnswers): ApexAssignment | null {
  const family = slotApexProgram(answers);
  if (!family) return null;
  return {
    answers,
    familyId: family.id,
    letter: APEX_START_LETTER,
    programId: family.joinProgramId,
    workoutId: family.joinWorkoutId,
    contentAvailable: family.contentAvailable,
  };
}
