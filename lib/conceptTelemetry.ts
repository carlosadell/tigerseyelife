// lib/conceptTelemetry.ts
//
// Single write path for the Beta 2 telemetry hooks (layer choice,
// audio vs text completion, block entries / exits, time-eligibility
// opt-outs). Dual-path: dev/offline writes append to AsyncStorage so
// we can still inspect engagement during local development; prod
// writes hit Supabase concept_events.

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ConceptScope } from './conceptMetadata';
import type { PathwayId } from './pathway';
import { supabase } from './supabase';

export type ConceptEventKind =
  | 'layer1_viewed'
  | 'layer2_read_started'
  | 'layer2_read_completed'
  | 'layer2_listen_started'
  | 'layer2_listen_completed'
  | 'layer3_started'
  | 'layer3_completed'
  | 'block_entered'
  | 'block_exited'
  | 'time_eligibility_optout'
  // Self-serve questionnaire outcome. Tests Assumption 2 — was the
  // questionnaire's primary-limiter call confirmed by the member's
  // later engagement? `meta` carries the full score breakdown so
  // we can also see the runner-up.
  | 'limiter_scored';

export type ConceptEvent = {
  conceptSlug: string;
  pathway: PathwayId;
  block: ConceptScope;
  kind: ConceptEventKind;
  createdAt: string;
  durationMs?: number;
  meta?: Record<string, string | number | boolean | null>;
};

const bufferKey = (userId: string) => `tel:concept-events:${userId}`;

export async function recordConceptEvent(
  userId: string,
  isDevSession: boolean,
  event: Omit<ConceptEvent, 'createdAt'>,
): Promise<void> {
  const full: ConceptEvent = { ...event, createdAt: new Date().toISOString() };

  if (isDevSession || !supabase) {
    const existing = await readBufferedConceptEvents(userId);
    existing.push(full);
    await AsyncStorage.setItem(bufferKey(userId), JSON.stringify(existing));
    return;
  }

  await supabase.from('concept_events').insert({
    user_id: userId,
    concept_slug: full.conceptSlug,
    pathway: full.pathway,
    block: full.block,
    kind: full.kind,
    duration_ms: full.durationMs ?? null,
    meta: full.meta ?? {},
  });
}

export async function readBufferedConceptEvents(userId: string): Promise<ConceptEvent[]> {
  const raw = await AsyncStorage.getItem(bufferKey(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ConceptEvent[]) : [];
  } catch {
    return [];
  }
}

export async function clearBufferedConceptEvents(userId: string): Promise<void> {
  await AsyncStorage.removeItem(bufferKey(userId));
}
