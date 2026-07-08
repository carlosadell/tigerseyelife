// lib/workoutTemplates.ts
//
// Block helper copy for the 4 canonical workouts, per block. The
// multi-exercise template arrays (LOWER_BODY / UPPER_PUSH / etc.)
// that used to live here were removed 2026-07-08 when Karen
// clarified that each numbered "workout" is a single primary
// movement, not a multi-exercise session. If Karen ever authors
// multi-movement variants in the future, they land in
// workoutSchedule.WORKOUTS directly, not here.

export const BLOCK_HELPER_BY_SLOT: Record<
  'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL',
  Record<1 | 2 | 3 | 4, string>
> = {
  COMMIT: {
    1: 'Lower body emphasis with dumbbells',
    2: 'Upper push. Focus on form.',
    3: 'Upper pull. Slow on the lower.',
    4: 'Full body mix. Steady pace.',
  },
  REFINE: {
    1: 'Lower body. Same exercises, more attention.',
    2: 'Upper push. Same exercises, more attention.',
    3: 'Upper pull. Notice your set up before the rep.',
    4: 'Full body. Pause practice between sets.',
  },
  EVOLVE: {
    1: 'Lower body. Drive identity through the rep.',
    2: 'Upper push. Drive identity through the rep.',
    3: 'Upper pull. You are someone who pulls hard.',
    4: 'Full body. Your body knows this now.',
  },
  ADAPT: {
    1: 'Lower body. Use TEB when you want to stop early.',
    2: 'Upper push. Use TEB when you want to stop early.',
    3: 'Upper pull. Bare minimum still counts.',
    4: 'Full body. Flexible is not loose.',
  },
  THRIVE: {
    1: 'Lower body. Notice what is automatic now.',
    2: 'Upper push. Notice what is automatic now.',
    3: 'Upper pull. Progressive overload is your default.',
    4: 'Full body. This is what trained looks like.',
  },
  EXCEL: {
    1: 'Lower body. This is your lifestyle now.',
    2: 'Upper push. This is your lifestyle now.',
    3: 'Upper pull. Maintain mastery.',
    4: 'Full body. The systems are running you.',
  },
};
