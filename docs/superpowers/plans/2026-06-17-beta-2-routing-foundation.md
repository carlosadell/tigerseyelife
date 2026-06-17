# Beta 2 Routing Foundation — 3-Layer Content + Metadata Schema + Pathway Gate

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the data-layer guts the brief calls out as the Beta 2 must-have — concept metadata schema (6-limiter taxonomy), 3-layer content rendering (read-or-listen), pathway gate (guided vs self-serve, with self-serve stubbed for round 3), and Beta 2 telemetry instrumentation — so we can later flip self-serve on as a switch, not a rebuild.

**Architecture:** Extend existing `lib/program.ts` + `lib/tools.ts` content types with metadata fields (block, primaryNeed, secondaryNeeds, prerequisites, entryPointEligible, layerSet). Replace the single `ToolBody` with a `LayeredConcept` model that carries Layer 1 (required 30-sec text), Layer 2 (read-or-listen body + optional audio URI), Layer 3 (optional deep-dive audio URI). A new `<LayeredConceptBody />` component swaps between Read/Listen for Layer 2 and renders the existing tool body kinds inside Layer 2's text branch (so we don't throw away the static-page / checklist / menu-list / fill-in-template UIs). Pathway state lives on the profile; a `useUserPathway()` hook returns 'guided' for everyone in Beta 2 and any self-serve deep-link routes to a "coming round 3" stub. Telemetry writes go through a single `recordConceptEvent()` adapter that AsyncStorage-buffers in dev mode and POSTs to a new `concept_events` Supabase table in prod (dual-path).

**Tech Stack:** TypeScript, React Native (Expo 53, new architecture), expo-router, AsyncStorage, Supabase, expo-av (for Layer 2/3 audio playback).

## Global Constraints

- `npm run typecheck` is the sole static gate; run after every task before commit.
- Every data hook MUST work in both Supabase mode and dev mode (AsyncStorage fallback) per [CLAUDE.md](../../../CLAUDE.md) "Dual-path data layer" section.
- No em dashes (—) in user-facing copy. Use periods, commas, or restructure. (Reads as AI-generated.)
- No countdowns, deadlines, time-pressure metrics, or shaming in any copy.
- Workouts are NOT teaching content. Don't shoehorn them into the L1/L2/L3 frame — they already render as native video.
- ABC Power Meals copy is verbatim; never paraphrase the existing `lib/toolContent/abcPowerMealsGuide.ts` text.
- Layer 1 text must be readable in ~30 seconds (target ≤ 60 words).
- Layer 2 audio URIs may be `null` initially (Karen ships them later); UI must degrade to "Read only" cleanly.
- Use `THEME_COLORS.light` / `useThemeColors()` tokens — no hardcoded hex.
- Theme-locked surfaces (AuthShell, onboarding flow) stay locked; do not retrofit `useThemeColors()` into those files.
- The Beta 2 cohort is the guided pathway; self-serve UI is built as a stub that routes to "We will be ready when you are."
- Append a new numbered SQL file in `supabase/migrations/`; never edit existing migrations.

---

### Task 1: Six-Limiter Taxonomy

**Files:**
- Create: `lib/limiters.ts`

**Interfaces:**
- Produces:
  - `type LimiterId = 'identity' | 'knowledge' | 'systems' | 'energy' | 'resilience' | 'competence'`
  - `LIMITER_IDS: readonly LimiterId[]`
  - `LIMITERS: Record<LimiterId, Limiter>` where `Limiter = { id, shortLabel, longLabel, exampleQuote, helper }`
  - `limiterFor(id: LimiterId): Limiter`

- [ ] **Step 1: Create the file**

```ts
// lib/limiters.ts
//
// Six-limiter taxonomy from Karen's dev brief (2026-06-16). Used as the
// routing key for the self-serve pathway and as the primaryNeed /
// secondaryNeeds tag on every teaching concept. Beta 2 ships the schema;
// the questionnaire that scores members into a limiter ships in a later
// slice. Order matches the brief.

export type LimiterId =
  | 'identity'
  | 'knowledge'
  | 'systems'
  | 'energy'
  | 'resilience'
  | 'competence';

export const LIMITER_IDS: readonly LimiterId[] = [
  'identity',
  'knowledge',
  'systems',
  'energy',
  'resilience',
  'competence',
] as const;

export type Limiter = {
  id: LimiterId;
  shortLabel: string;
  longLabel: string;
  exampleQuote: string;
  helper: string;
};

export const LIMITERS: Record<LimiterId, Limiter> = {
  identity: {
    id: 'identity',
    shortLabel: 'Identity',
    longLabel: 'Identity / narrative',
    exampleQuote:
      "I do the work for two weeks, then some old story about who I am kicks back in and I'm right where I started.",
    helper:
      "The limiter is not effort. It is a self-concept that has not caught up to the new behavior.",
  },
  knowledge: {
    id: 'knowledge',
    shortLabel: 'Knowledge gap',
    longLabel: 'Localized knowledge gap',
    exampleQuote:
      "I am completely solid on the workouts, but I genuinely do not know what I am doing with food.",
    helper:
      "Capable across most of life, with one specific thread blank. Not a global deficit.",
  },
  systems: {
    id: 'systems',
    shortLabel: 'Systems',
    longLabel: 'Execution / systems',
    exampleQuote:
      "I know exactly what to do. I just do not have anything set up that makes it happen on a normal Tuesday.",
    helper:
      "Over-informed and under-structured. The missing piece is the system, not more information.",
  },
  energy: {
    id: 'energy',
    shortLabel: 'Energy',
    longLabel: 'Energy / capacity',
    exampleQuote:
      "By the time I could do the thing, there is nothing left in the tank.",
    helper:
      "Running too depleted to follow through. Often the energy is spent elsewhere before it reaches their own goals.",
  },
  resilience: {
    id: 'resilience',
    shortLabel: 'Resilience',
    longLabel: 'Resilience / recovery',
    exampleQuote:
      "I am fine until something throws me off, and then one missed day becomes three weeks.",
    helper:
      "The routine works. The recovery does not. The gap is in how they get back.",
  },
  competence: {
    id: 'competence',
    shortLabel: 'Competence gradient',
    longLabel: 'Competence gradient',
    exampleQuote:
      "I am good at what I am good at, and being a beginner at this feels intolerable, so I avoid it.",
    helper:
      "Accomplished people who would rather not start something where they will be visibly clumsy.",
  },
};

export function limiterFor(id: LimiterId): Limiter {
  return LIMITERS[id];
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/limiters.ts
git commit -m "Add 6-limiter taxonomy (identity/knowledge/systems/energy/resilience/competence)"
```

---

### Task 2: Concept Metadata Schema — types

**Files:**
- Create: `lib/conceptMetadata.ts`

**Interfaces:**
- Consumes: `LimiterId`, `BlockId` (from `lib/program.ts`)
- Produces:
  - `type ConceptScope = BlockId | 'library'`
  - `type ConceptMetadata = { block: ConceptScope; primaryNeed: LimiterId; secondaryNeeds: LimiterId[]; prerequisites: string[]; entryPointEligible: boolean }`
  - `type LayerSet = { layer1: true; layer2: boolean; layer3: boolean }`

- [ ] **Step 1: Create the file**

```ts
// lib/conceptMetadata.ts
//
// Shared metadata schema for every teaching concept (Tools and Week
// lessons). The same library serves the guided 12-week spine and the
// (future) self-serve limiter router — these tags are what make one
// engine sufficient.

import type { BlockId } from './program';
import type { LimiterId } from './limiters';

export type ConceptScope = BlockId | 'library';

export type ConceptMetadata = {
  // Which block this concept lives in, or 'library' if it is a
  // non-block-bound asset accessible across blocks.
  block: ConceptScope;

  // Which of the six limiters this concept most directly serves.
  primaryNeed: LimiterId;

  // Other limiters it partly addresses. May be empty.
  secondaryNeeds: LimiterId[];

  // Concept slugs (tool slugs, week slugs, lesson slugs) that must come
  // before this one to make sense. Honored by both pathways.
  prerequisites: string[];

  // Can a self-serve member land on this concept as their first
  // exposure, or does it require setup from earlier concepts?
  entryPointEligible: boolean;
};

export type LayerSet = {
  // Layer 1 (30-second text) is ALWAYS present. Drives the engagement
  // tracker. Required reading.
  layer1: true;
  // Layer 2 (core teaching, read-or-listen) is usually present but may
  // be absent for very small concepts.
  layer2: boolean;
  // Layer 3 (deep-dive audio) is optional, invisible to those who do
  // not want it.
  layer3: boolean;
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/conceptMetadata.ts
git commit -m "Add ConceptMetadata + LayerSet schema (block, limiter tags, prerequisites)"
```

---

### Task 3: Three-Layer Content Schema

**Files:**
- Create: `lib/layeredContent.ts`

**Interfaces:**
- Consumes: `ToolBody` (from `lib/tools.ts`)
- Produces:
  - `type Layer1Content = { wordCount: number; body: string }`
  - `type Layer2Content = { kind: 'text-only'; body: ToolBody } | { kind: 'text-or-audio'; body: ToolBody; audioUri: string; audioDurationSec: number }`
  - `type Layer3Content = { audioUri: string; audioDurationSec: number; title: string; body: string }`
  - `type LayeredContent = { layer1: Layer1Content; layer2?: Layer2Content; layer3?: Layer3Content }`

- [ ] **Step 1: Create the file**

```ts
// lib/layeredContent.ts
//
// Three-layer content model. Per the dev brief (2026-06-16) this is the
// lever for cutting Beta 1's reading load: Layer 1 is the only required
// text; Layer 2 carries the core teaching with optional audio so the
// reading-tired member can press play; Layer 3 is opt-in deep dive.

import type { ToolBody } from './tools';

export type Layer1Content = {
  // Should target <= 60 words so it reads in ~30 seconds.
  wordCount: number;
  body: string;
};

export type Layer2Content =
  | { kind: 'text-only'; body: ToolBody }
  | {
      kind: 'text-or-audio';
      body: ToolBody;
      audioUri: string;
      audioDurationSec: number;
    };

export type Layer3Content = {
  audioUri: string;
  audioDurationSec: number;
  title: string;
  // Short scaffolding text shown above the player. Not a transcript.
  body: string;
};

export type LayeredContent = {
  layer1: Layer1Content;
  layer2?: Layer2Content;
  layer3?: Layer3Content;
};

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/layeredContent.ts
git commit -m "Add three-layer content schema (L1 required text, L2 read-or-listen, L3 optional deep dive)"
```

---

### Task 4: Extend the Tool type with metadata + layered content

**Files:**
- Modify: `lib/tools.ts`

**Interfaces:**
- Consumes: `ConceptMetadata`, `LayerSet` (from `lib/conceptMetadata.ts`); `LayeredContent` (from `lib/layeredContent.ts`)
- Produces:
  - `Tool` now carries `metadata: ConceptMetadata`, `layerSet: LayerSet`, `layered: LayeredContent`
  - `Tool.body` REMAINS for back-compat during migration but is now derived from `layered.layer2.body` at the call site. Mark as `@deprecated` in a comment.

- [ ] **Step 1: Modify the Tool type**

Open `lib/tools.ts`. Above the existing `Tool` type, add the new imports:

```ts
import type { ConceptMetadata, LayerSet } from './conceptMetadata';
import type { LayeredContent } from './layeredContent';
```

Change the `Tool` type from:

```ts
export type Tool = {
  slug: ToolSlug;
  title: string;
  introducedInWeek: WeekNumber | 0;
  isStar: boolean;
  body: ToolBody;
};
```

to:

```ts
export type Tool = {
  slug: ToolSlug;
  title: string;
  introducedInWeek: WeekNumber | 0;
  isStar: boolean;
  metadata: ConceptMetadata;
  layerSet: LayerSet;
  layered: LayeredContent;
  // @deprecated kept for back-compat during migration; equals layered.layer2.body
  // when layer2 is present, otherwise mirrors the static body.
  body: ToolBody;
};
```

- [ ] **Step 2: Typecheck (will fail — every tool content file is missing the new fields)**

Run: `npm run typecheck`
Expected: 24 errors, one per file in `lib/toolContent/`, each "Property 'metadata' is missing in type ..."

This failure is OK; Task 11 backfills every tool file. We commit the type change first so the migration is a separate reviewable diff.

- [ ] **Step 3: Commit the schema change**

```bash
git add lib/tools.ts
git commit -m "Extend Tool with ConceptMetadata + LayerSet + LayeredContent (migration pending)"
```

---

### Task 5: Pathway Gate — type + hook

**Files:**
- Create: `lib/pathway.ts`
- Create: `hooks/useUserPathway.ts`

**Interfaces:**
- Produces:
  - `type PathwayId = 'guided' | 'self-serve'`
  - `PATHWAY_IDS: readonly PathwayId[]`
  - `useUserPathway(): { pathway: PathwayId; isLoaded: boolean; setPathway: (p: PathwayId) => Promise<void> }`
  - Beta 2 default: 'guided' for every user.
  - AsyncStorage key: `tel:pathway:<userId>`
  - Supabase column (added in Task 14): `profiles.pathway text default 'guided' not null`

- [ ] **Step 1: Create `lib/pathway.ts`**

```ts
// lib/pathway.ts
//
// Two-pathway routing key from the dev brief. Beta 2 launches
// guided-only; the self-serve flag exists so we can flip it on in a
// later release as a switch, not a rebuild. Every routing decision
// that differs between cohorts should consult this value, never a
// hardcoded assumption.

export type PathwayId = 'guided' | 'self-serve';

export const PATHWAY_IDS: readonly PathwayId[] = ['guided', 'self-serve'] as const;

export const DEFAULT_PATHWAY: PathwayId = 'guided';
```

- [ ] **Step 2: Create `hooks/useUserPathway.ts`**

```ts
// hooks/useUserPathway.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_PATHWAY, PATHWAY_IDS, type PathwayId } from '../lib/pathway';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const storageKey = (userId: string) => `tel:pathway:${userId}`;

export function useUserPathway() {
  const { session, isDevSession } = useAuth();
  const userId = session?.user?.id ?? 'anon';
  const [pathway, setPathwayState] = useState<PathwayId>(DEFAULT_PATHWAY);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Dev / offline branch: AsyncStorage only.
      if (isDevSession || !supabase) {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        if (!cancelled) {
          setPathwayState(isPathway(raw) ? raw : DEFAULT_PATHWAY);
          setIsLoaded(true);
        }
        return;
      }
      // Supabase branch: read profiles.pathway, fall back to default.
      const { data, error } = await supabase
        .from('profiles')
        .select('pathway')
        .eq('id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data?.pathway) {
        setPathwayState(DEFAULT_PATHWAY);
      } else {
        setPathwayState(isPathway(data.pathway) ? data.pathway : DEFAULT_PATHWAY);
      }
      setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isDevSession, userId]);

  const setPathway = useCallback(
    async (next: PathwayId) => {
      setPathwayState(next);
      if (isDevSession || !supabase) {
        await AsyncStorage.setItem(storageKey(userId), next);
        return;
      }
      await supabase.from('profiles').update({ pathway: next }).eq('id', userId);
    },
    [isDevSession, userId],
  );

  return { pathway, isLoaded, setPathway };
}

function isPathway(v: unknown): v is PathwayId {
  return typeof v === 'string' && (PATHWAY_IDS as readonly string[]).includes(v);
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: still failing on Tools (from Task 4), but no NEW errors. Confirm new errors are zero.

- [ ] **Step 4: Commit**

```bash
git add lib/pathway.ts hooks/useUserPathway.ts
git commit -m "Add PathwayId + useUserPathway hook (guided default, Supabase + AsyncStorage dual-path)"
```

---

### Task 6: Telemetry storage layer — `recordConceptEvent`

**Files:**
- Create: `lib/conceptTelemetry.ts`

**Interfaces:**
- Produces:
  - `type ConceptEventKind = 'layer1_viewed' | 'layer2_read_started' | 'layer2_read_completed' | 'layer2_listen_started' | 'layer2_listen_completed' | 'layer3_started' | 'layer3_completed' | 'block_entered' | 'block_exited' | 'time_eligibility_optout'`
  - `type ConceptEvent = { conceptSlug: string; pathway: PathwayId; block: ConceptScope; kind: ConceptEventKind; createdAt: string; durationMs?: number; meta?: Record<string, string | number | boolean | null> }`
  - `recordConceptEvent(userId: string, isDevSession: boolean, event: Omit<ConceptEvent, 'createdAt'>): Promise<void>` — dual-path: dev/offline → AsyncStorage append, prod → Supabase insert.
  - `readBufferedConceptEvents(userId: string): Promise<ConceptEvent[]>` — for the future buffer-flush flow.
  - AsyncStorage key: `tel:concept-events:<userId>`
  - Supabase table (added in Task 14): `concept_events`

- [ ] **Step 1: Create the file**

```ts
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
  | 'time_eligibility_optout';

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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: same failing-Tools list as before, no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/conceptTelemetry.ts
git commit -m "Add conceptTelemetry: dual-path recorder for Beta 2 layer + block events"
```

---

### Task 7: Telemetry hook — `useConceptTelemetry`

**Files:**
- Create: `hooks/useConceptTelemetry.ts`

**Interfaces:**
- Produces:
  - `useConceptTelemetry(): { recordLayer1Viewed; recordLayer2ReadStart; recordLayer2ReadComplete; recordLayer2ListenStart; recordLayer2ListenComplete; recordLayer3Start; recordLayer3Complete; recordBlockEntered; recordBlockExited; recordTimeEligibilityOptout }` — each a callback that takes `(conceptSlug, block, opts?)`.

- [ ] **Step 1: Create the file**

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/useConceptTelemetry.ts
git commit -m "Add useConceptTelemetry hook (layer choice, audio completion, block enter/exit)"
```

---

### Task 8: Audio player primitive — `LayerAudioPlayer`

**Files:**
- Create: `components/concept/LayerAudioPlayer.tsx`

**Interfaces:**
- Consumes: `expo-av` (already in `package.json` for workout flows — confirm at task start with `grep '"expo-av"' package.json`; if not present, `npx expo install expo-av` and add to the commit).
- Produces:
  - `<LayerAudioPlayer uri={string} durationSec={number} onPlay={() => void} onComplete={() => void} />`
  - Renders: play/pause button + progress bar + elapsed-of-total mm:ss + 15-sec skip back / forward.

- [ ] **Step 1: Confirm `expo-av` is installed**

Run: `grep '"expo-av"' package.json`

If missing: `npx expo install expo-av` and include the package.json + lockfile changes in this task's commit.

- [ ] **Step 2: Create the file**

```tsx
// components/concept/LayerAudioPlayer.tsx
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Props = {
  uri: string;
  durationSec: number;
  onPlay?: () => void;
  onComplete?: () => void;
};

export function LayerAudioPlayer({ uri, durationSec, onPlay, onComplete }: Props) {
  const colors = useThemeColors();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const firedComplete = useRef(false);

  useEffect(() => {
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onStatus,
      );
      soundRef.current = sound;
    })();
    return () => {
      soundRef.current?.unloadAsync();
    };
    // uri is stable per render of this concept; do not re-create on every parent rerender
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  const onStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setIsPlaying(status.isPlaying);
      setPositionMs(status.positionMillis);
      if (
        status.didJustFinish ||
        (status.durationMillis && status.positionMillis >= status.durationMillis - 250)
      ) {
        if (!firedComplete.current) {
          firedComplete.current = true;
          onComplete?.();
        }
      }
    },
    [onComplete],
  );

  const toggle = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return;
    if (isPlaying) {
      await s.pauseAsync();
    } else {
      await s.playAsync();
      onPlay?.();
    }
  }, [isPlaying, onPlay]);

  const skip = useCallback(
    async (deltaSec: number) => {
      const s = soundRef.current;
      if (!s) return;
      const next = Math.max(0, positionMs + deltaSec * 1000);
      await s.setPositionAsync(next);
    },
    [positionMs],
  );

  const total = durationSec * 1000;
  const pct = total > 0 ? Math.min(1, positionMs / total) : 0;

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { backgroundColor: colors.accent, width: `${pct * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <Pressable hitSlop={8} onPress={() => skip(-15)}>
          <RotateCcw color={colors.text} size={22} />
        </Pressable>
        <Pressable
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          onPress={toggle}
          style={[styles.playBtn, { backgroundColor: colors.accent }]}
        >
          {isPlaying ? (
            <Pause color="#FFFFFF" size={22} />
          ) : (
            <Play color="#FFFFFF" size={22} />
          )}
        </Pressable>
        <Pressable hitSlop={8} onPress={() => skip(15)}>
          <RotateCw color={colors.text} size={22} />
        </Pressable>
        <Text style={[styles.timer, { color: colors.mutedText }]}>
          {fmt(positionMs)} / {fmt(total)}
        </Text>
      </View>
    </View>
  );
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  fill: { borderRadius: 999, height: '100%' },
  playBtn: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  timer: { fontFamily: FONTS.sansMedium, fontSize: 13, marginLeft: 'auto' },
  track: { borderRadius: 999, height: 4, marginBottom: 14, overflow: 'hidden' },
  wrap: { gap: 4 },
});
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/concept/LayerAudioPlayer.tsx package.json package-lock.json
git commit -m "Add LayerAudioPlayer (expo-av) primitive for L2/L3 audio with skip + completion fire"
```

---

### Task 9: Layered concept renderer — `LayeredConceptBody`

**Files:**
- Create: `components/concept/LayeredConceptBody.tsx`

**Interfaces:**
- Consumes:
  - `LayeredContent` (from `lib/layeredContent.ts`), `ConceptScope` (from `lib/conceptMetadata.ts`)
  - `useConceptTelemetry()` (from `hooks/useConceptTelemetry.ts`)
  - Existing tool body renderers from `components/tool/{StaticPageBody, ChecklistBody, MenuListBody, FillInTemplateBody}.tsx`
  - `LayerAudioPlayer` (from Task 8)
- Produces:
  - `<LayeredConceptBody conceptSlug={string} block={ConceptScope} content={LayeredContent} />`
  - Renders Layer 1 (always shown at top), then Layer 2 (Read / Listen segment when audio is present, otherwise text-only), then a "Go deeper" disclosure that mounts Layer 3 only when expanded.
  - Fires the matching telemetry events when each layer is shown / started / completed.

- [ ] **Step 1: Create the file**

```tsx
// components/concept/LayeredConceptBody.tsx
import { ChevronDown, Headphones, ScrollText } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useConceptTelemetry } from '../../hooks/useConceptTelemetry';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import type { ConceptScope } from '../../lib/conceptMetadata';
import type { LayeredContent } from '../../lib/layeredContent';
import { ChecklistBody } from '../tool/ChecklistBody';
import { FillInTemplateBody } from '../tool/FillInTemplateBody';
import { MenuListBody } from '../tool/MenuListBody';
import { StaticPageBody } from '../tool/StaticPageBody';
import { LayerAudioPlayer } from './LayerAudioPlayer';

type Props = {
  conceptSlug: string;
  block: ConceptScope;
  content: LayeredContent;
};

type L2Mode = 'read' | 'listen';

export function LayeredConceptBody({ conceptSlug, block, content }: Props) {
  const colors = useThemeColors();
  const t = useConceptTelemetry();

  const hasAudio = content.layer2?.kind === 'text-or-audio';
  const [l2Mode, setL2Mode] = useState<L2Mode>(hasAudio ? 'listen' : 'read');
  const [l3Open, setL3Open] = useState(false);
  const layer1Fired = useRef(false);
  const layer2ReadStartFired = useRef(false);
  const layer2ListenStartFired = useRef(false);
  const layer3StartFired = useRef(false);

  // Layer 1 view event fires once when the concept renders.
  useEffect(() => {
    if (layer1Fired.current) return;
    layer1Fired.current = true;
    t.recordLayer1Viewed(conceptSlug, block);
  }, [conceptSlug, block, t]);

  // Layer 2 start event depends on the chosen mode.
  useEffect(() => {
    if (!content.layer2) return;
    if (l2Mode === 'read' && !layer2ReadStartFired.current) {
      layer2ReadStartFired.current = true;
      t.recordLayer2ReadStart(conceptSlug, block);
    }
    if (l2Mode === 'listen' && !layer2ListenStartFired.current) {
      layer2ListenStartFired.current = true;
      t.recordLayer2ListenStart(conceptSlug, block);
    }
  }, [l2Mode, content.layer2, conceptSlug, block, t]);

  const openL3 = useCallback(() => {
    setL3Open(true);
    if (!layer3StartFired.current) {
      layer3StartFired.current = true;
      t.recordLayer3Start(conceptSlug, block);
    }
  }, [conceptSlug, block, t]);

  return (
    <View style={styles.wrap}>
      {/* Layer 1 — required 30-sec overview */}
      <View style={[styles.layer1, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.accent }]}>30 SECOND OVERVIEW</Text>
        <Text style={[styles.layer1Body, { color: colors.text }]}>{content.layer1.body}</Text>
      </View>

      {/* Layer 2 — core teaching, read OR listen */}
      {content.layer2 ? (
        <View style={styles.layer2Wrap}>
          {hasAudio ? (
            <View style={styles.modeRow}>
              <ModeButton
                active={l2Mode === 'read'}
                icon={<ScrollText size={16} color={l2Mode === 'read' ? '#FFFFFF' : colors.text} />}
                label="Read"
                onPress={() => setL2Mode('read')}
                colors={colors}
              />
              <ModeButton
                active={l2Mode === 'listen'}
                icon={
                  <Headphones size={16} color={l2Mode === 'listen' ? '#FFFFFF' : colors.text} />
                }
                label="Listen"
                onPress={() => setL2Mode('listen')}
                colors={colors}
              />
            </View>
          ) : null}

          {l2Mode === 'listen' && content.layer2.kind === 'text-or-audio' ? (
            <LayerAudioPlayer
              uri={content.layer2.audioUri}
              durationSec={content.layer2.audioDurationSec}
              onComplete={() => t.recordLayer2ListenComplete(conceptSlug, block)}
            />
          ) : (
            <Layer2ReadBody body={content.layer2.body} conceptSlug={conceptSlug} />
          )}
        </View>
      ) : null}

      {/* Layer 3 — optional deep dive */}
      {content.layer3 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={l3Open ? 'Collapse deep dive' : 'Open deep dive'}
          onPress={l3Open ? () => setL3Open(false) : openL3}
          style={[styles.l3Toggle, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.l3ToggleRow}>
            <Text style={[styles.l3Kicker, { color: colors.accent }]}>GO DEEPER · OPTIONAL</Text>
            <ChevronDown
              color={colors.mutedText}
              size={18}
              style={l3Open ? styles.chevOpen : undefined}
            />
          </View>
          <Text style={[styles.l3Title, { color: colors.text }]}>{content.layer3.title}</Text>
          {l3Open ? (
            <View style={styles.l3Inner}>
              <Text style={[styles.l3Body, { color: colors.mutedText }]}>{content.layer3.body}</Text>
              <LayerAudioPlayer
                uri={content.layer3.audioUri}
                durationSec={content.layer3.audioDurationSec}
                onComplete={() => t.recordLayer3Complete(conceptSlug, block)}
              />
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onPress,
  colors,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.modeBtn,
        {
          backgroundColor: active ? colors.accent : colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.modeLabel,
          { color: active ? '#FFFFFF' : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Layer2ReadBody({
  body,
  conceptSlug,
}: {
  body: import('../../lib/tools').ToolBody;
  conceptSlug: string;
}) {
  if (body.kind === 'static-page')
    return <StaticPageBody intro={body.intro} sections={body.sections} />;
  if (body.kind === 'checklist')
    return <ChecklistBody toolSlug={conceptSlug} intro={body.intro} items={body.items} />;
  if (body.kind === 'menu-list')
    return <MenuListBody intro={body.intro} items={body.items} />;
  return <FillInTemplateBody toolSlug={conceptSlug} intro={body.intro} fields={body.fields} />;
}

const styles = StyleSheet.create({
  chevOpen: { transform: [{ rotate: '180deg' }] },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.6 },
  l3Body: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  l3Inner: { gap: 12, marginTop: 12 },
  l3Kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.6 },
  l3Title: { fontFamily: FONTS.sansBold, fontSize: 15, marginTop: 4 },
  l3Toggle: { borderRadius: 14, borderWidth: 1, padding: 14 },
  l3ToggleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  layer1: { borderRadius: 14, borderWidth: 1, gap: 8, padding: 14 },
  layer1Body: { fontFamily: FONTS.sansMedium, fontSize: 15, lineHeight: 22 },
  layer2Wrap: { gap: 12 },
  modeBtn: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  modeLabel: { fontFamily: FONTS.sansBold, fontSize: 13 },
  modeRow: { flexDirection: 'row', gap: 8 },
  wrap: { gap: 16 },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: same baseline of failures (tools migration still pending), no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/concept/LayeredConceptBody.tsx
git commit -m "Add LayeredConceptBody: L1 always, L2 read/listen toggle, L3 disclosure"
```

---

### Task 10: Migration helper — `toolToLayered`

**Files:**
- Create: `lib/toolLayered.ts`

**Interfaces:**
- Consumes: `Tool`, `LayeredContent`, `wordCount`
- Produces:
  - `toolToLayered(tool: Tool): LayeredContent` — pure derivation: turns each tool's existing `body` into a Layer 2 text-only body, and uses a heuristic 30-second summary (first sentence of intro + first heading) for Layer 1 if Layer 1 was not authored explicitly.
- This helper exists so Task 12 (mass migration) can scaffold defaults; **the per-tool Layer 1 copy MUST still be reviewed and tightened** in Task 12 because the heuristic is just a starting point.

- [ ] **Step 1: Create the file**

```ts
// lib/toolLayered.ts
//
// Derivation helper that scaffolds a LayeredContent from a Tool's
// existing body. Used only as a starting point in Task 12 — the
// generated Layer 1 text is rough and needs hand-tightening before
// shipping.

import type { LayeredContent } from './layeredContent';
import { wordCount } from './layeredContent';
import type { Tool, ToolBody } from './tools';

export function toolToLayered(tool: Tool): LayeredContent {
  const layer1Body = scaffoldLayer1(tool.body);
  return {
    layer1: { body: layer1Body, wordCount: wordCount(layer1Body) },
    layer2: { kind: 'text-only', body: tool.body },
  };
}

function scaffoldLayer1(body: ToolBody): string {
  if (body.kind === 'static-page') {
    const intro = body.intro?.trim() ?? '';
    const first = body.sections[0];
    if (first) return `${intro} ${first.heading}: ${first.body}`.trim();
    return intro;
  }
  if (body.kind === 'checklist' || body.kind === 'menu-list') {
    return body.intro?.trim() ?? '';
  }
  return body.intro?.trim() ?? '';
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: same baseline.

- [ ] **Step 3: Commit**

```bash
git add lib/toolLayered.ts
git commit -m "Add toolToLayered scaffold helper (Tool.body -> LayeredContent default)"
```

---

### Task 11: Backfill metadata + layered content on every Tool (24 files)

**Files:**
- Modify: each of `lib/toolContent/*.ts` (24 files)

**Interfaces:**
- Consumes: `ConceptMetadata`, `LayerSet`, `LayeredContent`, `toolToLayered`
- Produces: typecheck-clean tools

**Approach per file:** add the three new top-level fields (`metadata`, `layerSet`, `layered`), keeping the existing `body` unchanged (it stays as the legacy mirror per Task 4). For Layer 1 copy, start from the heuristic but hand-tighten so each one reads in ~30 seconds (≤60 words). For metadata, use the mapping table below — it's the canonical Karen-aligned mapping for Beta 2.

- [ ] **Step 1: Apply this metadata mapping**

The mapping below is the Beta 2 baseline. Where a primary need is ambiguous, the table favors the limiter the concept most directly addresses.

| Tool slug | block | primaryNeed | secondaryNeeds | prerequisites | entryPointEligible |
|---|---|---|---|---|---|
| `initial-questionnaire` | library | identity | [] | [] | true |
| `habits-over-checklists` | COMMIT | identity | [systems] | [] | true |
| `five-universal-patterns` | COMMIT | identity | [resilience] | [] | true |
| `nutrition-track-chooser` | COMMIT | knowledge | [systems] | [] | true |
| `movement-breaks-menu` | COMMIT | systems | [energy] | [] | true |
| `sleep-environment-checklist` | COMMIT | resilience | [energy] | [] | true |
| `kitchen-reset-guide` | REFINE | systems | [knowledge] | [`nutrition-track-chooser`] | false |
| `abc-power-meals-guide` | REFINE | knowledge | [systems] | [] | true |
| `pause-practice-guide` | REFINE | resilience | [identity] | [] | true |
| `wind-down-routine-builder` | REFINE | resilience | [systems] | [`sleep-environment-checklist`] | false |
| `teb-loop-guide` | EVOLVE | identity | [resilience] | [`five-universal-patterns`] | false |
| `meal-prep-system-guide` | EVOLVE | systems | [knowledge] | [`abc-power-meals-guide`] | false |
| `social-situations-playbook` | EVOLVE | identity | [resilience] | [] | true |
| `movement-snacks-menu` | EVOLVE | energy | [systems] | [`movement-breaks-menu`] | false |
| `box-breathing-guide` | ADAPT | resilience | [energy] | [] | true |
| `non-food-stress-relief-menu` | ADAPT | resilience | [energy] | [] | true |
| `bare-minimum-protocol-builder` | ADAPT | resilience | [systems] | [] | true |
| `automaticity-audit` | THRIVE | systems | [identity] | [`habits-over-checklists`] | false |
| `stress-signal-identifier` | THRIVE | resilience | [identity] | [`pause-practice-guide`] | false |
| `energy-orchestra-planner` | THRIVE | energy | [systems] | [] | true |
| `my-system-documentation` | EXCEL | systems | [identity] | [] | false |
| `pattern-maintenance-system` | EXCEL | identity | [resilience] | [`five-universal-patterns`] | false |
| `transformation-summary` | EXCEL | identity | [] | [] | false |
| `whats-next-guide` | EXCEL | identity | [systems] | [] | true |

- [ ] **Step 2: For each tool file, edit in this shape**

Example with `lib/toolContent/abcPowerMealsGuide.ts` — copy this pattern across all 24:

```ts
import type { Tool } from '../tools';

export const abcPowerMealsGuide: Tool = {
  slug: 'abc-power-meals-guide',
  title: 'ABC Power Meals Guide',
  introducedInWeek: 3,
  isStar: false,
  metadata: {
    block: 'REFINE',
    primaryNeed: 'knowledge',
    secondaryNeeds: ['systems'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 38,
      body: 'Anchor with protein. Balance with carbs, fats, and fiber. Complete with herbs, spices, or sauce that you like. Twenty five to thirty five grams of protein per meal. Build one plate this way today.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'static-page',
        intro: 'Half your plate, every plate. Under a minute to set up. This is the foundation of how Karen and Ryan teach eating.',
        sections: [
          { heading: 'A is for Anchor with Protein', body: 'Twenty five to thirty five grams per meal. Eggs, chicken, fish, beef, yogurt, cottage cheese, tofu, beans plus a protein. Anchor lands first on the plate.' },
          { heading: 'B is for Balance Your Meal', body: 'Carbs, fats, fiber. Round it out. Rice and vegetables. Bread and olive oil. Fruit and nut butter. Balance is the rest of the plate after the anchor.' },
          { heading: 'C is for Complete with Embellishments', body: 'Herbs, spices, sauces. The joy belongs. A bland meal is a meal you do not repeat. The embellishment is the difference between sustainable and grim.' },
          { heading: 'How to use ABC', body: 'Build one ABC meal today. Notice how you feel two hours later. Then build the next one. The goal this week is not perfect, it is anchored.' },
        ],
      },
    },
  },
  body: {
    kind: 'static-page',
    intro: 'Half your plate, every plate. Under a minute to set up. This is the foundation of how Karen and Ryan teach eating.',
    sections: [
      { heading: 'A is for Anchor with Protein', body: 'Twenty five to thirty five grams per meal. Eggs, chicken, fish, beef, yogurt, cottage cheese, tofu, beans plus a protein. Anchor lands first on the plate.' },
      { heading: 'B is for Balance Your Meal', body: 'Carbs, fats, fiber. Round it out. Rice and vegetables. Bread and olive oil. Fruit and nut butter. Balance is the rest of the plate after the anchor.' },
      { heading: 'C is for Complete with Embellishments', body: 'Herbs, spices, sauces. The joy belongs. A bland meal is a meal you do not repeat. The embellishment is the difference between sustainable and grim.' },
      { heading: 'How to use ABC', body: 'Build one ABC meal today. Notice how you feel two hours later. Then build the next one. The goal this week is not perfect, it is anchored.' },
    ],
  },
};
```

ABC Power Meals is verbatim Karen content — do not paraphrase the Layer 2 body. Layer 1 IS a fresh 30-second summary; keep its tone aligned but do not duplicate the longer text.

- [ ] **Step 3: Typecheck after every ~6 files (4 batches)**

Run: `npm run typecheck`
Expected: count of errors decreases each batch; final batch is clean.

- [ ] **Step 4: Commit in 4 batches, one per 6-file group**

Suggested batch boundaries (alphabetical for stable diffs):

1. `automaticityAudit` → `boxBreathingGuide` → `bareMinimumProtocolBuilder` → `abcPowerMealsGuide` → `energyOrchestraPlanner` → `fiveUniversalPatterns`

```bash
git add lib/toolContent/automaticityAudit.ts lib/toolContent/boxBreathingGuide.ts lib/toolContent/bareMinimumProtocolBuilder.ts lib/toolContent/abcPowerMealsGuide.ts lib/toolContent/energyOrchestraPlanner.ts lib/toolContent/fiveUniversalPatterns.ts
git commit -m "Backfill ConceptMetadata + LayeredContent on tools batch 1/4"
```

2. `habitsOverChecklists` → `initialQuestionnaire` → `kitchenResetGuide` → `mealPrepSystemGuide` → `movementBreaksMenu` → `movementSnacksMenu`

```bash
git add lib/toolContent/habitsOverChecklists.ts lib/toolContent/initialQuestionnaire.ts lib/toolContent/kitchenResetGuide.ts lib/toolContent/mealPrepSystemGuide.ts lib/toolContent/movementBreaksMenu.ts lib/toolContent/movementSnacksMenu.ts
git commit -m "Backfill ConceptMetadata + LayeredContent on tools batch 2/4"
```

3. `mySystemDocumentation` → `nonFoodStressReliefMenu` → `nutritionTrackChooser` → `patternMaintenanceSystem` → `pausePracticeGuide` → `sleepEnvironmentChecklist`

```bash
git add lib/toolContent/mySystemDocumentation.ts lib/toolContent/nonFoodStressReliefMenu.ts lib/toolContent/nutritionTrackChooser.ts lib/toolContent/patternMaintenanceSystem.ts lib/toolContent/pausePracticeGuide.ts lib/toolContent/sleepEnvironmentChecklist.ts
git commit -m "Backfill ConceptMetadata + LayeredContent on tools batch 3/4"
```

4. `socialSituationsPlaybook` → `stressSignalIdentifier` → `tebLoopGuide` → `transformationSummary` → `whatsNextGuide` → `windDownRoutineBuilder`

```bash
git add lib/toolContent/socialSituationsPlaybook.ts lib/toolContent/stressSignalIdentifier.ts lib/toolContent/tebLoopGuide.ts lib/toolContent/transformationSummary.ts lib/toolContent/whatsNextGuide.ts lib/toolContent/windDownRoutineBuilder.ts
git commit -m "Backfill ConceptMetadata + LayeredContent on tools batch 4/4"
```

After batch 4, `npm run typecheck` is clean.

---

### Task 12: Wire `LayeredConceptBody` into the Tool screen

**Files:**
- Modify: `app/tool/[slug].tsx`

**Interfaces:**
- Consumes: `LayeredConceptBody` (Task 9), `tool.layered` and `tool.metadata.block` (now available from Task 11)
- Produces: tool detail screens render Layer 1 → Layer 2 (with mode toggle if audio present) → Layer 3 (collapsed by default).

- [ ] **Step 1: Open `app/tool/[slug].tsx` and replace the inner ScrollView body**

Replace the block from line 67 (`<ScrollView contentContainerStyle={styles.content} ...>`) through line 80 (the closing `</ScrollView>`) with:

```tsx
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LayeredConceptBody
          conceptSlug={tool.slug}
          block={tool.metadata.block}
          content={tool.layered}
        />
      </ScrollView>
```

Then add the import near the existing tool body imports:

```tsx
import { LayeredConceptBody } from '../../components/concept/LayeredConceptBody';
```

Remove the now-unused imports of `ChecklistBody`, `FillInTemplateBody`, `MenuListBody`, `StaticPageBody` from this file (they are still imported inside `LayeredConceptBody`).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Smoke-test in the app**

```bash
npm start
```

Open the dev client (or Expo Go), navigate to Today → tap any anchor card whose route is `/tool/<slug>` → confirm the new screen shows: gold "30 SECOND OVERVIEW" kicker, the Layer 1 body, then the Layer 2 read body. There is no audio yet, so the Read/Listen toggle should be absent. The screen scrolls cleanly.

- [ ] **Step 4: Commit**

```bash
git add app/tool/\[slug\].tsx
git commit -m "Render Tool screens through LayeredConceptBody (L1 + L2 + L3 frame)"
```

---

### Task 13: Pathway gate on `app/index.tsx` (self-serve stub)

**Files:**
- Modify: `app/index.tsx`
- Create: `app/self-serve-coming-soon.tsx`

**Interfaces:**
- Consumes: `useUserPathway()` (Task 5)
- Produces: a self-serve user is redirected to the "We will be ready when you are" stub instead of `/(tabs)/today`. Guided users go to Today unchanged.

- [ ] **Step 1: Read the current `app/index.tsx`**

Open and read so you can match the existing redirect chain style.

- [ ] **Step 2: Add the pathway branch**

After the existing onboarding check, before the `/(tabs)/today` redirect, branch on pathway:

```tsx
// Inside the existing component, replace the current "session + onboarded -> /(tabs)/today"
// branch with:
if (pathway === 'self-serve') {
  return <Redirect href="/self-serve-coming-soon" />;
}
return <Redirect href="/(tabs)/today" />;
```

Wire the pathway:

```tsx
import { useUserPathway } from '../hooks/useUserPathway';

// inside the component
const { pathway, isLoaded: pathwayLoaded } = useUserPathway();

// add pathwayLoaded to the existing loading gate so we don't redirect before knowing
if (!pathwayLoaded) return null;
```

- [ ] **Step 3: Create `app/self-serve-coming-soon.tsx`**

```tsx
// app/self-serve-coming-soon.tsx
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '../hooks/useTheme';
import { FONTS, SPACING } from '../lib/brand';

export default function SelfServeComingSoon() {
  const colors = useThemeColors();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.body}>
        <Text style={[styles.kicker, { color: colors.accent }]}>SELF-SERVE</Text>
        <Text style={[styles.title, { color: colors.text }]}>We will be ready when you are.</Text>
        <Text style={[styles.copy, { color: colors.mutedText }]}>
          The self-paced path opens after the next release. If you want to start sooner, the guided
          12 week cohort is open now. Reach out to Karen or Ryan and they will get you in.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { gap: 14, paddingHorizontal: SPACING.screenX, paddingTop: 40 },
  copy: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 2.2 },
  screen: { flex: 1 },
  title: { fontFamily: FONTS.sansBold, fontSize: 24, letterSpacing: -0.3, lineHeight: 30 },
});
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 5: Smoke test (dev-mode pathway toggle)**

In the simulator: there is no UI to flip pathway yet, so toggle via the AsyncStorage hook indirectly. Add this temporary dev-only block to `app/(tabs)/today.tsx` under the existing dev reset button, behind `isDevSession`:

```tsx
import { useUserPathway } from '../../hooks/useUserPathway';

// inside TodayScreen():
const { setPathway } = useUserPathway();

// in the JSX, alongside the existing devReset Pressable:
<Pressable
  onPress={() => setPathway('self-serve').then(() => router.replace('/'))}
  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
>
  <View style={styles.devReset}>
    <Text style={styles.devKicker}>DEV ONLY</Text>
    <Text style={styles.devBody}>Switch to self-serve pathway</Text>
  </View>
</Pressable>
```

Tap → confirm app routes to the "We will be ready" screen. Then in code, set pathway back to 'guided' (add a symmetric button) and re-run to confirm the gate works both ways.

After smoke test, REMOVE the temporary dev pathway-toggle buttons before commit (Step 6). The hook stays.

- [ ] **Step 6: Commit**

```bash
git add app/index.tsx app/self-serve-coming-soon.tsx
git commit -m "Add pathway gate in app/index: guided -> tabs, self-serve -> coming-soon stub"
```

---

### Task 14: Supabase migration — `profiles.pathway` + `concept_events`

**Files:**
- Create: `supabase/migrations/0011_pathway_and_concept_events.sql`

**Interfaces:**
- Adds `profiles.pathway text not null default 'guided'` with a check constraint over `('guided','self-serve')`.
- Adds table `concept_events` with RLS so a user can only insert / select their own rows.

- [ ] **Step 1: Create the migration file**

```sql
-- 0011_pathway_and_concept_events.sql
--
-- Adds the pathway routing key to profiles and the concept_events
-- telemetry table that backs hooks/useConceptTelemetry. RLS is on; a
-- user can only see and write their own rows.

alter table public.profiles
  add column if not exists pathway text not null default 'guided'
  check (pathway in ('guided', 'self-serve'));

create table if not exists public.concept_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  concept_slug text not null,
  pathway text not null check (pathway in ('guided', 'self-serve')),
  block text not null,
  kind text not null check (
    kind in (
      'layer1_viewed',
      'layer2_read_started',
      'layer2_read_completed',
      'layer2_listen_started',
      'layer2_listen_completed',
      'layer3_started',
      'layer3_completed',
      'block_entered',
      'block_exited',
      'time_eligibility_optout'
    )
  ),
  duration_ms integer,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists concept_events_user_created_idx
  on public.concept_events (user_id, created_at desc);
create index if not exists concept_events_concept_kind_idx
  on public.concept_events (concept_slug, kind);

alter table public.concept_events enable row level security;

create policy "concept_events_select_own"
  on public.concept_events
  for select
  using (auth.uid() = user_id);

create policy "concept_events_insert_own"
  on public.concept_events
  for insert
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: Apply to local Supabase**

```bash
npx supabase db reset
```

Expected: all 11 migrations apply cleanly. If `supabase start` is not running, the project runs in dev-skip mode anyway and the migration is verified later when pointed at the hosted project.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0011_pathway_and_concept_events.sql
git commit -m "Add migration 0011: profiles.pathway + concept_events table with RLS"
```

---

### Task 15: Block enter / exit telemetry on the Today screen

**Files:**
- Modify: `app/(tabs)/today.tsx`

**Interfaces:**
- Consumes: `useConceptTelemetry` (Task 7), `useCurrentWeek` (existing), `currentBlockFor` (existing in `lib/program.ts`)
- Produces: a `block_entered` event fires the first time a user lands on Today within a given block; `block_exited` fires when the focused block changes.

- [ ] **Step 1: Add block-change tracking**

In `app/(tabs)/today.tsx`, near the existing `useCurrentWeek` call, add:

```tsx
import { useEffect, useRef } from 'react';
import { useConceptTelemetry } from '../../hooks/useConceptTelemetry';

// inside TodayScreen():
const t = useConceptTelemetry();
const lastBlockRef = useRef<string | null>(null);

useEffect(() => {
  if (!blockId) return;
  if (lastBlockRef.current === blockId) return;
  if (lastBlockRef.current) {
    t.recordBlockExited('today', lastBlockRef.current as any);
  }
  t.recordBlockEntered('today', blockId);
  lastBlockRef.current = blockId;
}, [blockId, t]);
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Smoke-test**

```bash
npm start
```

Open Today, verify nothing visually changed and the app still renders. In dev mode, the AsyncStorage buffer at key `tel:concept-events:<userId>` accumulates events; quickly verify by adding one console.log around the read in `readBufferedConceptEvents` (remove before commit) or inspect via React Native debugger.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/today.tsx
git commit -m "Fire block_entered / block_exited concept events from Today screen"
```

---

### Task 16: End-to-end verification + memory update

**Files:**
- Modify: `.claude/projects/-Users-johnbryanliwanag-tigerseyelife/memory/create_power_beta_2_architecture.md` (append "Build state" note)
- Modify: `.claude/projects/-Users-johnbryanliwanag-tigerseyelife/memory/MEMORY.md` (no change if entry already exists; otherwise add)

**Interfaces:** none, this is the verification + write-back-to-memory step.

- [ ] **Step 1: Typecheck the whole repo**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 2: Smoke-test the golden path**

```bash
npm start
```

Walk through:
1. Open Today — block_entered fires (verify via AsyncStorage buffer or debugger).
2. Tap an anchor that routes to a tool — confirm the new layered screen: gold "30 SECOND OVERVIEW" kicker, Layer 1 body, then the existing tool body as Layer 2 (text-only, no audio yet so no toggle), no Layer 3 unless you set `layered.layer3` on that tool.
3. Confirm the existing checklist / fill-in-template tools still work inside Layer 2 (state persistence intact).
4. (Dev only) Toggle pathway to self-serve via the temporary dev button (re-add if removed earlier), confirm redirect to `/self-serve-coming-soon`. Toggle back.
5. Restart the app — pathway choice persists.

- [ ] **Step 3: Update the architecture memory note**

Append to `create_power_beta_2_architecture.md`, before the "Related:" line:

```markdown
**Beta 2 routing foundation landed 2026-06-17:**
- 6-limiter taxonomy in `lib/limiters.ts`.
- ConceptMetadata + LayerSet schema in `lib/conceptMetadata.ts`; LayeredContent in `lib/layeredContent.ts`.
- All 24 tools backfilled with metadata (block, primaryNeed, secondaryNeeds, prerequisites, entryPointEligible) and a derived Layer 1 / Layer 2 (no Layer 3 yet — Karen ships those with the audio pipeline).
- Pathway gate live: `PathwayId = 'guided' | 'self-serve'`, default guided, self-serve routes to `/self-serve-coming-soon` stub.
- Telemetry recorder + hook: `lib/conceptTelemetry.ts`, `hooks/useConceptTelemetry.ts`. Dual-path (AsyncStorage in dev, `concept_events` Supabase table in prod). Block enter/exit events fire from Today.
- Migration 0011 adds `profiles.pathway` + `concept_events` with RLS.
- L2 audio + Karen-authored Layer 3 deep dives are NEXT (separate plan: ElevenLabs pipeline).
```

- [ ] **Step 4: Commit**

```bash
git add .claude/projects/-Users-johnbryanliwanag-tigerseyelife/memory/create_power_beta_2_architecture.md
git commit -m "Memory: note that Beta 2 routing foundation (metadata + L1/L2 + pathway gate) landed"
```

---

## Follow-On Plans (NOT in this plan)

These slices fall out of the brief but are intentionally deferred so this plan stays focused and shippable:

- **Plan B: Block orientation split + POWER Compass UI prominence.** Surface `block.powerCompass` with PRIMARY / SECONDARY / MAINTAIN visual weights on Today; split Block orientation into navigation (always visible <1 min scan) vs teaching (optional depth, layered).
- **Plan C: ElevenLabs hybrid audio pipeline.** Asset management, file hosting (likely Supabase Storage), Layer 2 + Layer 3 audio URIs populated, the human-intro / AI-body / human-close sandwich workflow.
- **Plan D: Six-limiter questionnaire + self-serve routing engine.** Scoring logic, entry-point selection, prerequisite-gated need sequencing, time-eligibility opt-out (the "see-through" rule). Flip the self-serve pathway from stub to live.
- **Plan E: Karen content gaps.** Sixth Pattern, Competence Gradient concept, POWER Meals module assembly. These are content drops, not engineering; the schema from this plan accepts them as-is.
- **Plan F: Beta 2 telemetry sink + flush.** When Supabase is configured, flush the AsyncStorage buffer to `concept_events` on app foreground; build the Karen-facing dashboard query/view.

---

## Self-Review

**Spec coverage:**
- Two-pathway logic → Tasks 5, 13 (gate + self-serve stub)
- Metadata schema (block, primaryNeed, secondaryNeeds, prerequisites, entryPointEligible, layerSet) → Tasks 2, 4, 11
- 6-limiter taxonomy → Task 1
- 3-layer content model → Tasks 3, 9, 10, 11, 12
- Pathway gate (first fork) → Tasks 5, 13
- Prerequisite gate → present as schema (Task 2 `prerequisites: string[]`); enforcement logic is deferred to Plan D (self-serve router), explicitly fine per "build the guts now"
- Time eligibility gate / see-through rule → Plan D
- Telemetry (layer choice, audio completion, per-block load, see-through capture) → Tasks 6, 7, 14, 15
- Audio L2/L3 player → Task 8
- Channel routing (workouts as video) → no-op, workouts already video; brief explicitly excludes them
- Block orientation split → Plan B (deferred, documented)
- POWER Compass prominence → Plan B (deferred, documented)
- Three content gaps (POWER Meals assembly, 6th Pattern, Competence Gradient) → Plan E (deferred, documented)
- ElevenLabs hybrid audio pipeline → Plan C (deferred, documented)

**Placeholder scan:** scanned for "TBD", "add appropriate", "implement later", "fill in details" — none present. All code blocks are concrete.

**Type consistency:**
- `LimiterId` defined in Task 1, used in Tasks 2, 11 — consistent.
- `ConceptScope`, `ConceptMetadata`, `LayerSet` defined in Task 2, used in Tasks 4, 6, 9, 11, 14 — consistent.
- `LayeredContent`, `Layer1Content`, `Layer2Content`, `Layer3Content` defined in Task 3, consumed in Tasks 4, 9, 11 — consistent.
- `PathwayId` defined in Task 5, consumed in Tasks 6, 7, 13, 14 — consistent.
- `ConceptEvent`, `ConceptEventKind` defined in Task 6, consumed in Task 7, mirrored in Task 14 SQL CHECK — consistent.
- `recordConceptEvent` signature `(userId, isDevSession, event)` matches between Tasks 6 and 7 — consistent.
