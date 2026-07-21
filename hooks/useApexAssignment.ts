// hooks/useApexAssignment.ts
//
// Persists Karen's Apex workout-slotting result (2026-07-21) alongside the
// §3.2 intake. Dual-path per CLAUDE.md.
//
// The assignment itself is built deterministically by buildApexAssignment in
// lib/apexPrograms.ts. This hook only persists the result; it does not
// re-derive slotting logic.
//
// Dev mode (isDevSession || no supabase):
//   AsyncStorage.setItem('tel:apex-assignment:<userId>', JSON.stringify(assignment))
//
// Supabase mode:
//   1. Merge the assignment into profiles.intake_answers under an `apex` key.
//   2. When the family carries a concrete UUID join program (apex30-home),
//      set profiles.assigned_program_id / assigned_workout_id directly.
//   3. When the family's programId is a slug, resolve the UUID from
//      workout_programs.slug and set assigned_program_id if found; otherwise
//      keep it in intake_answers.apex only (never write a slug into the uuid
//      column).
//
// The Supabase path is fire-and-forget like the existing onboarding submit:
// it never throws, so a failure here cannot block onboarding routing.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import {
  buildApexAssignment,
  type ApexAnswers,
  type ApexAssignment,
} from '../lib/apexPrograms';

const devKey = (userId: string) => `tel:apex-assignment:${userId}`;

// A join programId is a concrete UUID when it looks like one; otherwise it is a
// family slug (e.g. 'apex60-home-a', 'live-gst') that we resolve against
// workout_programs.slug.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useApexAssignment() {
  const { isDevSession, session } = useAuth();
  const userId = session?.user.id ?? null;

  /**
   * Build + persist the Apex assignment for the given answers. Returns the
   * assignment when it could be built (coherent answers), or null when the
   * answer set was incomplete (e.g. 60-min path with no format). Never throws.
   */
  const record = useCallback(
    async (answers: ApexAnswers): Promise<ApexAssignment | null> => {
      if (!userId) return null;

      const assignment = buildApexAssignment(answers);
      if (!assignment) return null;

      try {
        if (isDevSession || !supabase) {
          await AsyncStorage.setItem(devKey(userId), JSON.stringify(assignment));
          return assignment;
        }

        // Resolve the UUID we can safely write to the assigned_program_id column.
        let programUuid: string | null =
          assignment.programId && UUID_RE.test(assignment.programId)
            ? assignment.programId
            : null;

        // Slug-based programId: look up the real UUID from workout_programs.
        if (assignment.programId && !programUuid) {
          const { data } = await supabase
            .from('workout_programs')
            .select('id')
            .eq('slug', assignment.programId)
            .maybeSingle();
          if (data?.id) programUuid = data.id as string;
        }

        // Merge onto whatever intake_answers already holds (do not clobber).
        const { data: existing } = await supabase
          .from('profiles')
          .select('intake_answers')
          .eq('id', userId)
          .maybeSingle();

        const priorAnswers =
          existing?.intake_answers && typeof existing.intake_answers === 'object'
            ? (existing.intake_answers as Record<string, unknown>)
            : {};

        const update: Record<string, unknown> = {
          intake_answers: { ...priorAnswers, apex: assignment },
        };

        if (programUuid) {
          update.assigned_program_id = programUuid;
          // Only write a workout id when it is itself a UUID. The dev seed uses
          // string ids (e.g. 'seed-lower-body-a') that would violate the uuid
          // column and fail the whole update (losing the intake_answers merge).
          if (assignment.workoutId && UUID_RE.test(assignment.workoutId)) {
            update.assigned_workout_id = assignment.workoutId;
          }
        }

        await supabase.from('profiles').update(update).eq('id', userId);

        return assignment;
      } catch {
        // Swallow — assignment persistence is best-effort and must never block
        // onboarding completion.
        return assignment;
      }
    },
    [isDevSession, userId],
  );

  return { record };
}
