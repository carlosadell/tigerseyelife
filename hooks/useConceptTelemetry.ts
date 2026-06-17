// hooks/useConceptTelemetry.ts
import { useMemo } from 'react';

import type { ConceptScope } from '../lib/conceptMetadata';
import type { ConceptEventKind } from '../lib/conceptTelemetry';
import { recordConceptEvent } from '../lib/conceptTelemetry';
import { useAuth } from './useAuth';
import { useUserPathway } from './useUserPathway';

type Opts = {
  durationMs?: number;
  meta?: Record<string, string | number | boolean | null>;
};

export function useConceptTelemetry() {
  const { session, isDevSession } = useAuth();
  const { pathway } = useUserPathway();
  const userId = session?.user?.id ?? 'anon';

  return useMemo(() => {
    const fire = (kind: ConceptEventKind) =>
      (conceptSlug: string, block: ConceptScope, opts?: Opts) =>
        recordConceptEvent(userId, isDevSession, {
          conceptSlug,
          pathway,
          block,
          kind,
          durationMs: opts?.durationMs,
          meta: opts?.meta,
        });

    return {
      recordLayer1Viewed: fire('layer1_viewed'),
      recordLayer2ReadStart: fire('layer2_read_started'),
      recordLayer2ReadComplete: fire('layer2_read_completed'),
      recordLayer2ListenStart: fire('layer2_listen_started'),
      recordLayer2ListenComplete: fire('layer2_listen_completed'),
      recordLayer3Start: fire('layer3_started'),
      recordLayer3Complete: fire('layer3_completed'),
      recordBlockEntered: fire('block_entered'),
      recordBlockExited: fire('block_exited'),
      recordTimeEligibilityOptout: fire('time_eligibility_optout'),
      // Limiter-scoring outcome from the self-serve intake. Pass the
      // winning limiter as conceptSlug ("identity", "systems", …) and
      // the full score breakdown in meta. Block is 'library' because
      // scoring isn't block-scoped.
      recordLimiterScored: fire('limiter_scored'),
    };
  }, [userId, isDevSession, pathway]);
}
