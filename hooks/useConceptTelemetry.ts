// hooks/useConceptTelemetry.ts
import { useCallback } from 'react';

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

  const fire = useCallback(
    (kind: ConceptEventKind) =>
      (conceptSlug: string, block: ConceptScope, opts?: Opts) =>
        recordConceptEvent(userId, isDevSession, {
          conceptSlug,
          pathway,
          block,
          kind,
          durationMs: opts?.durationMs,
          meta: opts?.meta,
        }),
    [userId, isDevSession, pathway],
  );

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
  };
}
