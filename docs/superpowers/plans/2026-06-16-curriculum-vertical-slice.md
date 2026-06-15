# Curriculum Vertical Slice — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the first vertical slice of the CREATE POWER curriculum — schema + 36-section data model + dual-path progress hook + block/section/detail screens + Today integration — so a verified Commit member can complete sections, advance from COMMIT to REFINE server-side, and see the next incomplete section dynamically on Today.

**Architecture:** New `user_section_progress` table + `complete_section_user` + `maybe_advance_block` RPCs (security-definer so the latter can bypass the existing entitlement guard). Curriculum lives in `lib/curriculum.ts` as a discriminated-union typed array (educational | workout). Dual-path `useSectionProgress` hook (Supabase + AsyncStorage). Three screens (refactored block list + refactored section list + new section detail route) compose against existing UI primitives.

**Tech Stack:** Expo SDK 54 / React Native 0.81 (new arch) · expo-router · Supabase (Postgres + RPCs) · @tanstack/react-query · `@react-native-async-storage/async-storage` · `lucide-react-native` icons · TEL brand tokens (`lib/brand.ts` light theme) · existing UI primitives `AnchorRow`, `LessonCard`, `PhotoHeroCard`, `SectionHeader`.

**Verification gate:** `npm run typecheck`. No test runner, no linter. Manual smoke via `npm start` after Phase 9.

---

## Pre-flight

Read once before starting:

- `docs/superpowers/specs/2026-06-16-curriculum-vertical-slice-design.md` (the spec — source of truth)
- `docs/create-power-program-spec.md` (parent program brief — for context on threads, frameworks, tone)
- `CLAUDE.md` (engineering conventions — dual-path, light-lock pattern, no NativeWind migration)
- `lib/brand.ts:31-74` (THEME_COLORS.light palette)
- `hooks/useMembership.ts` (you'll consume `currentBlock` from this in Phase 8)
- `hooks/useAuth.tsx` (you need `isDevSession` for the dual-path hook in Phase 3)

Memories that apply (do not violate):
- **No em dashes** in user-facing copy.
- **No countdowns / deadlines / shaming** in any program copy.
- **ABC Power Meals wording is verbatim** when referenced (A = Anchor with Protein 25–35g · B = Balance Your Meal · C = Complete with Embellishments).
- **Pressable + flex layout gotcha**: layout lives in an inner View, Pressable only carries opacity.

The slice is on `main`, on top of commit `a0bf011` (the spec). No worktree.

---

## File map

### Create

- `supabase/migrations/0007_curriculum_section_progress.sql` — table, RLS policies, complete_section_user RPC, maybe_advance_block RPC
- `lib/curriculum.ts` — typed discriminated-union curriculum data + helpers (`sectionsForBlock`, `sectionBySlug`, `nextIncompleteSection`)
- `hooks/useSectionProgress.ts` — dual-path progress hook
- `components/grow/BlockCard.tsx` — block list row (used in refactored `/grow`)
- `components/grow/SectionRow.tsx` — section list row (used in refactored `/grow/[block]`)
- `components/grow/EducationalLessonView.tsx` — renderer for `kind: 'educational'`
- `components/grow/WorkoutLessonView.tsx` — renderer for `kind: 'workout'`
- `components/grow/StubLessonView.tsx` — renderer for stub sections
- `app/grow/[block]/[slug].tsx` — NEW dynamic route for section detail

### Refactor

- `app/(tabs)/grow.tsx` — block list driven by `BlockCard` over `BlockId[]`; existing microlearning section preserved below
- `app/grow/[block].tsx` — section list driven by `sectionsForBlock()`
- `components/today/NextLessonCard.tsx` — binds to `useSectionProgress + currentBlock`

### Leave alone (explicit)

- `lib/powerBlocks.ts` — becomes orphan; future slice deletes
- `hooks/usePowerActionProgress.ts` — becomes orphan
- `components/today/CommitBlockToday.tsx` — anchors stay hardcoded (no derivation in this slice)
- `app/(tabs)/_layout.tsx` — Nutrition lock stays as is

---

## Phase 1 — Migration 0007

### Task 1.1: Write the curriculum section progress migration

**Files:**
- Create: `supabase/migrations/0007_curriculum_section_progress.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/0007_curriculum_section_progress.sql
--
-- Curriculum section progress + completion RPCs.
--
-- Adds the `user_section_progress` table (one row per (user, block, slug)),
-- the `complete_section_user` RPC (upserts progress, triggers block-advance
-- check), and the `maybe_advance_block` RPC (security-definer so it can
-- bypass the entitlement guard from migration 0006 when advancing
-- profiles.current_block).
--
-- RLS: users select/insert/update their own rows. service_role bypasses.

create table public.user_section_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  block_name text not null,
  section_slug text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, block_name, section_slug)
);

grant select, insert, update on public.user_section_progress to authenticated;
grant all on public.user_section_progress to service_role;

alter table public.user_section_progress enable row level security;

create policy "users select own progress" on public.user_section_progress
  for select using (auth.uid() = user_id);

create policy "users insert own progress" on public.user_section_progress
  for insert with check (auth.uid() = user_id);

create policy "users update own progress" on public.user_section_progress
  for update using (auth.uid() = user_id);

create index if not exists user_section_progress_user_block_idx
  on public.user_section_progress (user_id, block_name);

-- ----------------------------------------------------------------------------
-- complete_section_user(block_name, section_slug)
--
-- Upserts a completed progress row for the calling user. After upsert, calls
-- maybe_advance_block to see if all 6 sections of the current block are done.
-- ----------------------------------------------------------------------------

create or replace function public.complete_section_user(
  p_block_name text,
  p_section_slug text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_section_progress (user_id, block_name, section_slug, completed, completed_at)
  values (auth.uid(), upper(p_block_name), p_section_slug, true, now())
  on conflict (user_id, block_name, section_slug) do update
    set completed = true,
        completed_at = excluded.completed_at;

  perform public.maybe_advance_block(auth.uid());
end;
$$;

-- ----------------------------------------------------------------------------
-- maybe_advance_block(user_id)
--
-- If all 6 sections of the user's current_block are completed, advances
-- profiles.current_block to the next block. security-definer so it can
-- bypass profiles_entitlement_guard from migration 0006 (which forbids
-- non-service-role writes to current_block).
-- ----------------------------------------------------------------------------

create or replace function public.maybe_advance_block(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_next text;
  v_completed int;
begin
  select current_block into v_current from profiles where id = p_user_id;
  if v_current is null then return; end if;

  select count(*) into v_completed
    from user_section_progress
    where user_id = p_user_id
      and block_name = v_current
      and completed = true;

  if v_completed < 6 then return; end if;

  v_next := case v_current
    when 'COMMIT'  then 'REFINE'
    when 'REFINE'  then 'EVOLVE'
    when 'EVOLVE'  then 'ADAPT'
    when 'ADAPT'   then 'THRIVE'
    when 'THRIVE'  then 'EXCEL'
    else null end;

  if v_next is null then return; end if;

  update profiles set current_block = v_next where id = p_user_id;
end;
$$;

grant execute on function public.complete_section_user(text, text) to authenticated;
grant execute on function public.maybe_advance_block(uuid) to authenticated;
```

- [ ] **Step 2: Apply locally if Supabase stack is running**

If `npx supabase status` shows the local stack:
Run: `npx supabase db reset`
Expected: migrations apply, no errors. Verify the new table:
Run: `npx supabase db inspect --table user_section_progress` (or use the Supabase Studio UI).

If no local stack: skip. The migration ships untested locally; it will apply on hosted via `npx supabase db push` at deploy time.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0, no output.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0007_curriculum_section_progress.sql
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add migration 0007: user_section_progress + completion RPCs"
```

---

## Phase 2 — Curriculum data (`lib/curriculum.ts`)

### Task 2.1: Write the curriculum module

**Files:**
- Create: `lib/curriculum.ts`

This single file holds all 36 sections plus helpers. The 2 authored sections use the exact copy from spec §6; the 34 stubs are generated programmatically.

- [ ] **Step 1: Write the file**

```typescript
// lib/curriculum.ts
//
// The CREATE POWER curriculum. 36 sections (6 blocks × 6 threads on the
// P.O.W.E.R. framework, with Wisdom split into Nutrition + Workouts).
//
// 2 sections are authored end-to-end in this slice (the two below); the
// other 34 ship as stubs that render a "Karen and Ryan are writing this
// one." placeholder. The renderer flips Complete button copy ("Mark as
// read" vs "Complete and Next") based on whether the section is a stub.
//
// Adding a new lesson shape later = a new arm of LessonContent + a new
// renderer. No data migration required since sections live in this module.

export type BlockId = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';
export const BLOCK_IDS: readonly BlockId[] = ['COMMIT', 'REFINE', 'EVOLVE', 'ADAPT', 'THRIVE', 'EXCEL'];

export type ThreadLetter = 'P' | 'O' | 'W_NUTRITION' | 'W_WORKOUTS' | 'E' | 'R';

export const THREAD_NAMES: Record<ThreadLetter, string> = {
  P: 'Patterns',
  O: 'Ownership',
  W_NUTRITION: 'Wisdom · Nutrition',
  W_WORKOUTS: 'Wisdom · Workouts',
  E: 'Energy',
  R: 'Resilience',
};

// Canonical thread order within each block: 1..6 = P, O, W_NUTRITION,
// W_WORKOUTS, E, R. The two authored sections (W_NUTRITION + W_WORKOUTS)
// land at orders 3 and 4 to match.
export const THREAD_ORDER: readonly ThreadLetter[] = [
  'P', 'O', 'W_NUTRITION', 'W_WORKOUTS', 'E', 'R',
];

// Lesson content discriminated union. New shapes = new arms.
export type EducationalContent = {
  kind: 'educational';
  introParagraph: string;
  keyConcepts: { title: string; body: string }[];
  takeaway: string;
  reflectionPrompt: string;
};

export type WorkoutContent = {
  kind: 'workout';
  videoUri: string;
  muscleGroups: { name: string; primary: boolean }[];
  instructions: string[];
  setRepTarget?: string;
};

export type StubContent = {
  kind: 'stub';
};

export type LessonContent = EducationalContent | WorkoutContent | StubContent;

export type Section = {
  blockId: BlockId;
  threadLetter: ThreadLetter;
  order: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
  title: string;
  emoji?: string;
  content: LessonContent;
};

// ──────────────────────────────────────────────────────────────────────────────
// Authored sections (2 in this slice; copy is exact per spec §6)
// ──────────────────────────────────────────────────────────────────────────────

const AUTHORED: Section[] = [
  {
    blockId: 'COMMIT',
    threadLetter: 'W_NUTRITION',
    order: 3,
    slug: 'commit-balanced-plate',
    title: 'Building a Balanced Plate',
    emoji: '🥗',
    content: {
      kind: 'educational',
      introParagraph: 'Before we count anything, we name what a meal even is.',
      keyConcepts: [
        { title: 'A is for Anchor with Protein', body: '25 to 35g per meal.' },
        { title: 'B is for Balance Your Meal', body: 'Carbs, fats, fiber. Round it out.' },
        { title: 'C is for Complete with Embellishments', body: 'Herbs, spices, sauces. The joy belongs.' },
      ],
      takeaway: 'Half your plate, every plate. Under a minute to set up.',
      reflectionPrompt: 'Name one meal this week where you can run ABC start to finish.',
    },
  },
  {
    blockId: 'COMMIT',
    threadLetter: 'W_WORKOUTS',
    order: 4,
    slug: 'commit-hinge-pattern',
    title: 'Hinge Pattern: Deadlift Setup',
    emoji: '🏋',
    content: {
      kind: 'workout',
      videoUri: 'placeholder://ryan-hinge-pattern',
      muscleGroups: [
        { name: 'Posterior chain', primary: true },
        { name: 'Glutes', primary: true },
        { name: 'Hamstrings', primary: false },
        { name: 'Core', primary: false },
      ],
      instructions: [
        'Stand tall with feet hip-width, bar over the middle of your foot.',
        'Push hips back like closing a car door. Knees soft, chest proud.',
        'Drive the floor away, lockout at the top, repeat.',
      ],
      setRepTarget: '3 sets × 8 to 12 reps',
    },
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Stub generation — produces (BLOCK × THREAD) - AUTHORED = 34 stubs
// ──────────────────────────────────────────────────────────────────────────────

function stubSlug(blockId: BlockId, threadLetter: ThreadLetter): string {
  return `${blockId.toLowerCase()}-${threadLetter.toLowerCase()}`;
}

function stubTitle(blockId: BlockId, threadLetter: ThreadLetter): string {
  const block = blockId.charAt(0) + blockId.slice(1).toLowerCase();
  return `${block} · ${THREAD_NAMES[threadLetter]}`;
}

function authoredKey(s: Section): string {
  return `${s.blockId}:${s.threadLetter}`;
}

function buildCurriculum(): Section[] {
  const authoredKeys = new Set(AUTHORED.map(authoredKey));
  const sections: Section[] = [...AUTHORED];

  for (const blockId of BLOCK_IDS) {
    THREAD_ORDER.forEach((threadLetter, idx) => {
      const key = `${blockId}:${threadLetter}`;
      if (authoredKeys.has(key)) return;
      const order = (idx + 1) as Section['order'];
      sections.push({
        blockId,
        threadLetter,
        order,
        slug: stubSlug(blockId, threadLetter),
        title: stubTitle(blockId, threadLetter),
        content: { kind: 'stub' },
      });
    });
  }

  return sections.sort((a, b) => {
    const blockCmp = BLOCK_IDS.indexOf(a.blockId) - BLOCK_IDS.indexOf(b.blockId);
    if (blockCmp !== 0) return blockCmp;
    return a.order - b.order;
  });
}

export const CURRICULUM: readonly Section[] = buildCurriculum();

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

export function sectionsForBlock(blockId: BlockId): Section[] {
  return CURRICULUM.filter((s) => s.blockId === blockId);
}

export function sectionBySlug(slug: string): Section | undefined {
  return CURRICULUM.find((s) => s.slug === slug);
}

export function nextIncompleteSection(
  blockId: BlockId,
  isCompleted: (slug: string) => boolean,
): Section | undefined {
  return sectionsForBlock(blockId).find((s) => !isCompleted(s.slug));
}

export function isStub(section: Section): section is Section & { content: StubContent } {
  return section.content.kind === 'stub';
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0, no output.

- [ ] **Step 3: Sanity-check that CURRICULUM has exactly 36 entries**

Run: `node -e "const {CURRICULUM} = require('./lib/curriculum.ts'); console.log(CURRICULUM.length);"`

Expected: Errors (TS file). Skip this step if errors — `npm run typecheck` will catch shape issues. Alternative: temporarily add `console.log(CURRICULUM.length)` at file end, run `npx ts-node` if available, then remove. If neither tool is set up, trust the loop math (6 blocks × 6 threads = 36).

- [ ] **Step 4: Commit**

```bash
git add lib/curriculum.ts
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add lib/curriculum.ts: 36 sections (2 authored + 34 stubs), typed discriminated union"
```

---

## Phase 3 — `useSectionProgress` hook

### Task 3.1: Write the dual-path hook

**Files:**
- Create: `hooks/useSectionProgress.ts`

- [ ] **Step 1: Write the hook**

```typescript
// hooks/useSectionProgress.ts
//
// Dual-path progress tracker for curriculum sections. Per CLAUDE.md, every
// data hook must work in both Supabase mode (real DB) and dev mode
// (AsyncStorage only) — the rebuild's gating is broken otherwise.
//
// Supabase mode: selects from user_section_progress, calls
// complete_section_user RPC on completion. RPC server-side will trigger
// maybe_advance_block.
//
// Dev mode: AsyncStorage under tel:sections:<userId> holding
// Record<sectionSlug, completedAtISO>. When a section completion would
// finish a block (6 of 6), updates the dev membership record's currentBlock
// directly (no trigger to bypass in dev).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { useMembership, type Block } from './useMembership';
import {
  BLOCK_IDS,
  sectionsForBlock,
  type BlockId,
} from '../lib/curriculum';
import { supabase } from '../lib/supabase';

type ProgressMap = Record<string, string>; // slug → completedAt ISO

const devProgressKey = (userId: string) => `tel:sections:${userId}`;
const devMembershipKey = (userId: string) => `tel:membership:${userId}`;

function nextBlock(current: Block | null): Block | null {
  if (!current) return null;
  const idx = BLOCK_IDS.indexOf(current as BlockId);
  if (idx < 0) return null;
  const next = BLOCK_IDS[idx + 1];
  return (next ?? null) as Block | null;
}

export function useSectionProgress() {
  const { isDevSession, session } = useAuth();
  const { membership, refresh: refreshMembership } = useMembership();
  const userId = session?.user.id ?? null;

  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(Boolean(session));

  const load = useCallback(async () => {
    if (!session || !userId) {
      setProgress({});
      setLoading(false);
      return;
    }
    setLoading(true);

    if (isDevSession || !supabase) {
      const raw = await AsyncStorage.getItem(devProgressKey(userId));
      setProgress(raw ? (JSON.parse(raw) as ProgressMap) : {});
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_section_progress')
      .select('section_slug,completed_at,completed')
      .eq('user_id', userId)
      .eq('completed', true);

    const map: ProgressMap = {};
    (data ?? []).forEach((row) => {
      if (row.section_slug && row.completed_at) {
        map[row.section_slug] = row.completed_at;
      }
    });
    setProgress(map);
    setLoading(false);
  }, [isDevSession, session, userId]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const isCompleted = useCallback(
    (slug: string) => Boolean(progress[slug]),
    [progress],
  );

  const completedInBlock = useCallback(
    (blockId: BlockId) =>
      sectionsForBlock(blockId).reduce(
        (n, s) => (progress[s.slug] ? n + 1 : n),
        0,
      ),
    [progress],
  );

  const completeSection = useCallback(
    async (blockId: BlockId, slug: string) => {
      if (!userId) return;
      const now = new Date().toISOString();
      const nextProgress = { ...progress, [slug]: now };

      if (isDevSession || !supabase) {
        // Write progress first
        await AsyncStorage.setItem(devProgressKey(userId), JSON.stringify(nextProgress));

        // If this completes the block (6 of 6), advance dev membership currentBlock
        const blockCompletedCount = sectionsForBlock(blockId).reduce(
          (n, s) => (nextProgress[s.slug] ? n + 1 : n),
          0,
        );

        if (blockCompletedCount === 6 && membership.currentBlock === blockId) {
          const advance = nextBlock(membership.currentBlock);
          if (advance) {
            const raw = await AsyncStorage.getItem(devMembershipKey(userId));
            if (raw) {
              const parsed = JSON.parse(raw);
              parsed.currentBlock = advance;
              await AsyncStorage.setItem(devMembershipKey(userId), JSON.stringify(parsed));
              await refreshMembership();
            }
          }
        }

        setProgress(nextProgress);
        return;
      }

      // Supabase mode — call the RPC, then refresh both progress + membership
      await supabase.rpc('complete_section_user', {
        p_block_name: blockId,
        p_section_slug: slug,
      });

      await load();
      await refreshMembership();
    },
    [isDevSession, load, membership.currentBlock, progress, refreshMembership, userId],
  );

  return {
    loading,
    progress,
    isCompleted,
    completedInBlock,
    completeSection,
    refresh: load,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

If it fails: the most likely cause is `useMembership`'s `Block` type not being exported. Check `hooks/useMembership.ts` exports `Block` (it does as of the latest commit). If it doesn't, add the export there.

- [ ] **Step 3: Commit**

```bash
git add hooks/useSectionProgress.ts
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add useSectionProgress hook (dual-path Supabase/AsyncStorage)"
```

---

## Phase 4 — Lesson renderers

Three small renderer components, one per `LessonContent` kind. Pure UI, no progress logic.

### Task 4.1: `EducationalLessonView`

**Files:**
- Create: `components/grow/EducationalLessonView.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/grow/EducationalLessonView.tsx
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import type { EducationalContent } from '../../lib/curriculum';

const light = THEME_COLORS.light;

type Props = {
  content: EducationalContent;
};

/**
 * Renders a `kind: 'educational'` section body. Composes:
 *   - Intro paragraph
 *   - Key concepts (title + body cards)
 *   - Takeaway callout (gold-tint card)
 *   - Reflection prompt (cream card)
 *
 * No completion logic here — the parent screen owns the CTA.
 */
export function EducationalLessonView({ content }: Props) {
  return (
    <View style={styles.stack}>
      <Text style={styles.intro}>{content.introParagraph}</Text>

      {content.keyConcepts.map((concept, idx) => (
        <View key={`${concept.title}-${idx}`} style={styles.conceptCard}>
          <Text style={styles.conceptTitle}>{concept.title}</Text>
          <Text style={styles.conceptBody}>{concept.body}</Text>
        </View>
      ))}

      <View style={styles.takeawayCard}>
        <View style={styles.takeawayIcon}>
          <Sparkles color={light.accent} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.takeawayBody}>
          <Text style={styles.takeawayKicker}>TAKEAWAY</Text>
          <Text style={styles.takeawayText}>{content.takeaway}</Text>
        </View>
      </View>

      <View style={styles.reflectCard}>
        <Text style={styles.reflectKicker}>REFLECT</Text>
        <Text style={styles.reflectText}>{content.reflectionPrompt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conceptBody: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  conceptCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  conceptTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  intro: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  reflectCard: {
    backgroundColor: light.cardAlt,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  reflectKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  reflectText: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: 6,
  },
  stack: {
    gap: 14,
  },
  takeawayBody: {
    flex: 1,
    minWidth: 0,
  },
  takeawayCard: {
    alignItems: 'flex-start',
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  takeawayIcon: {
    alignItems: 'center',
    backgroundColor: light.background,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  takeawayKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  takeawayText: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
});
```

### Task 4.2: `WorkoutLessonView`

**Files:**
- Create: `components/grow/WorkoutLessonView.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/grow/WorkoutLessonView.tsx
import { Play } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import type { WorkoutContent } from '../../lib/curriculum';

const light = THEME_COLORS.light;

type Props = {
  content: WorkoutContent;
};

/**
 * Renders a `kind: 'workout'` section body. Composes:
 *   - Video placeholder card (real streaming swap is a future slice)
 *   - Muscle groups (chip list with PRIMARY tag for primary movers)
 *   - Numbered instructions
 *   - Set/rep target chip
 */
export function WorkoutLessonView({ content }: Props) {
  return (
    <View style={styles.stack}>
      <View style={styles.videoPlaceholder}>
        <View style={styles.playWell}>
          <Play color={light.text} fill={light.text} size={24} />
        </View>
        <Text style={styles.videoLabel}>Video coming soon</Text>
      </View>

      <View>
        <Text style={styles.sectionKicker}>MUSCLE GROUPS</Text>
        <View style={styles.muscleRow}>
          {content.muscleGroups.map((m) => (
            <View
              key={m.name}
              style={[
                styles.muscleChip,
                m.primary && styles.muscleChipPrimary,
              ]}
            >
              <Text
                style={[
                  styles.muscleChipText,
                  m.primary && styles.muscleChipTextPrimary,
                ]}
              >
                {m.name}
              </Text>
              {m.primary ? <Text style={styles.muscleChipTag}> PRIMARY</Text> : null}
            </View>
          ))}
        </View>
      </View>

      <View>
        <Text style={styles.sectionKicker}>INSTRUCTIONS</Text>
        <View style={styles.instructionsCard}>
          {content.instructions.map((step, idx) => (
            <View key={`${idx}-${step.slice(0, 10)}`} style={styles.instructionRow}>
              <Text style={styles.instructionNum}>{String(idx + 1).padStart(2, '0')}</Text>
              <Text style={styles.instructionText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      {content.setRepTarget ? (
        <View style={styles.targetChip}>
          <Text style={styles.targetText}>{content.setRepTarget}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  instructionNum: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
    minWidth: 26,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  instructionText: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  instructionsCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  muscleChip: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  muscleChipPrimary: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  muscleChipTag: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  muscleChipText: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  muscleChipTextPrimary: {
    color: light.text,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  playWell: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  sectionKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  stack: {
    gap: 18,
  },
  targetChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  targetText: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  videoLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  videoPlaceholder: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    justifyContent: 'center',
    minHeight: 200,
    padding: 24,
  },
});
```

### Task 4.3: `StubLessonView`

**Files:**
- Create: `components/grow/StubLessonView.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/grow/StubLessonView.tsx
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

/**
 * Renderer for unauthored sections. Single centered card so members can still
 * "Mark as read" and progress through the block while content is being
 * written. The Complete button on the parent screen relabels itself when the
 * section is a stub.
 */
export function StubLessonView() {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>IN THE WORKS</Text>
      <Text style={styles.body}>Karen and Ryan are writing this one.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
});
```

### Task 4.4: Typecheck + commit Phase 4

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 2: Commit**

```bash
git add components/grow/EducationalLessonView.tsx components/grow/WorkoutLessonView.tsx components/grow/StubLessonView.tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add lesson renderers (educational, workout, stub)"
```

---

## Phase 5 — Section detail screen

### Task 5.1: Write the section detail dynamic route

**Files:**
- Create: `app/grow/[block]/[slug].tsx`

Note: expo-router needs a directory called `[block]` containing `[slug].tsx` for the nested dynamic route. The existing `app/grow/[block].tsx` becomes the path `/grow/[block]` (matched at the directory level). Confirm directory structure before writing.

- [ ] **Step 1: Create the directory and file**

Run: `mkdir -p app/grow/\[block\]`

- [ ] **Step 2: Write the screen**

```typescript
// app/grow/[block]/[slug].tsx
import { ChevronLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EducationalLessonView } from '../../../components/grow/EducationalLessonView';
import { StubLessonView } from '../../../components/grow/StubLessonView';
import { WorkoutLessonView } from '../../../components/grow/WorkoutLessonView';
import { useSectionProgress } from '../../../hooks/useSectionProgress';
import {
  BLOCK_IDS,
  isStub,
  nextIncompleteSection,
  sectionBySlug,
  THREAD_NAMES,
  type BlockId,
} from '../../../lib/curriculum';
import {
  COLORS,
  FONTS,
  SPACING,
  THEME_COLORS,
  ctaTextOnTangerine,
} from '../../../lib/brand';

const light = THEME_COLORS.light;

export default function SectionDetailScreen() {
  const params = useLocalSearchParams<{ block?: string; slug?: string }>();
  const blockId = useMemo<BlockId | null>(() => {
    const upper = String(params.block ?? '').toUpperCase();
    return (BLOCK_IDS as readonly string[]).includes(upper) ? (upper as BlockId) : null;
  }, [params.block]);
  const slug = String(params.slug ?? '');
  const section = sectionBySlug(slug);
  const { isCompleted, completeSection } = useSectionProgress();

  if (!blockId || !section || section.blockId !== blockId) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
        <View style={styles.frame}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>This section doesn't exist.</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.notFoundBack}>Back</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const stub = isStub(section);
  const alreadyDone = isCompleted(section.slug);
  const ctaLabel = alreadyDone
    ? 'Continue'
    : stub
      ? 'Mark as read'
      : 'Complete and Next';

  const onComplete = async () => {
    if (!alreadyDone) await completeSection(blockId, section.slug);
    const next = nextIncompleteSection(blockId, isCompleted);
    if (next && next.slug !== section.slug) {
      router.replace(`/grow/${blockId.toLowerCase()}/${next.slug}` as never);
    } else {
      router.replace(`/grow/${blockId.toLowerCase()}` as never);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={light.text} size={24} />
          </Pressable>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {THREAD_NAMES[section.threadLetter]}
          </Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerStack}>
            {section.emoji ? <Text style={styles.emoji}>{section.emoji}</Text> : null}
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.thread}>
              {`Block ${section.blockId} · ${THREAD_NAMES[section.threadLetter]}`}
            </Text>
          </View>

          <View style={styles.body}>
            {section.content.kind === 'educational' ? (
              <EducationalLessonView content={section.content} />
            ) : section.content.kind === 'workout' ? (
              <WorkoutLessonView content={section.content} />
            ) : (
              <StubLessonView />
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            onPress={onComplete}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={styles.cta}>
              <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                {ctaLabel}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    height: 32,
    width: 32,
  },
  body: {
    marginTop: 24,
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 16,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaText: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: -0.1,
  },
  emoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  footer: {
    paddingBottom: 12,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  headerStack: {
    gap: 6,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  notFoundBack: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  notFoundText: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  thread: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
  },
  topBarTitle: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.2,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
});
```

- [ ] **Step 3: Register the route in the root stack**

`app/_layout.tsx` already declares `<Stack.Screen name="grow/[block]" />`. Add a sibling line for the nested route after that one:

Open `app/_layout.tsx`. Find the line `<Stack.Screen name="grow/[block]" />` and insert immediately after it:

```typescript
<Stack.Screen name="grow/[block]/[slug]" />
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/grow/\[block\]/\[slug\].tsx app/_layout.tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Add section detail screen with content.kind-driven renderer + Complete CTA"
```

---

## Phase 6 — Section list refactor

### Task 6.1: Replace `app/grow/[block].tsx`

The existing file (533 lines) was built against `powerBlocks` and `usePowerActionProgress`. Full rewrite per spec §4.2.

**Files:**
- Modify (full replace): `app/grow/[block].tsx`

- [ ] **Step 1: Replace the file**

```typescript
// app/grow/[block].tsx
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSectionProgress } from '../../hooks/useSectionProgress';
import {
  BLOCK_IDS,
  sectionsForBlock,
  THREAD_NAMES,
  type BlockId,
  type Section,
} from '../../lib/curriculum';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

const BLOCK_LABEL: Record<BlockId, string> = {
  COMMIT: 'Commit',
  REFINE: 'Refine',
  EVOLVE: 'Evolve',
  ADAPT: 'Adapt',
  THRIVE: 'Thrive',
  EXCEL: 'Excel',
};

export default function BlockSectionListScreen() {
  const params = useLocalSearchParams<{ block?: string }>();
  const blockId = useMemo<BlockId | null>(() => {
    const upper = String(params.block ?? '').toUpperCase();
    return (BLOCK_IDS as readonly string[]).includes(upper) ? (upper as BlockId) : null;
  }, [params.block]);
  const { isCompleted, completedInBlock } = useSectionProgress();

  if (!blockId) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
        <View style={styles.frame}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>That block doesn't exist.</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.notFoundBack}>Back</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const sections = sectionsForBlock(blockId);
  const done = completedInBlock(blockId);
  const blockComplete = done >= 6;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={light.text} size={24} />
          </Pressable>
          <Text style={styles.topBarTitle}>{BLOCK_LABEL[blockId]}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerStack}>
            <Text style={styles.kicker}>BLOCK · {blockId}</Text>
            <Text style={styles.title}>{`${BLOCK_LABEL[blockId]} Block`}</Text>
            <Text style={styles.helper}>{`${done} of 6 sections done.`}</Text>
          </View>

          {blockComplete ? (
            <View style={styles.completeBanner}>
              <Text style={styles.completeKicker}>BLOCK COMPLETE</Text>
              <Text style={styles.completeBody}>
                Karen and Ryan are loading the next block. Take a breath.
              </Text>
            </View>
          ) : null}

          <View style={styles.list}>
            {sections.map((section) => (
              <SectionRow
                key={section.slug}
                section={section}
                isDone={isCompleted(section.slug)}
                onPress={() =>
                  router.push(
                    `/grow/${blockId.toLowerCase()}/${section.slug}` as never,
                  )
                }
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type RowProps = {
  section: Section;
  isDone: boolean;
  onPress: () => void;
};

function SectionRow({ section, isDone, onPress }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${section.title}, ${isDone ? 'done' : 'not done'}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View style={styles.row}>
        <View style={styles.rowNum}>
          <Text style={styles.rowNumText}>{String(section.order).padStart(2, '0')}</Text>
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowKicker}>{THREAD_NAMES[section.threadLetter]}</Text>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {section.title}
          </Text>
        </View>
        <View style={styles.rowTrail}>
          {isDone ? (
            <Check color={COLORS.deepGreen} size={20} strokeWidth={2.4} />
          ) : (
            <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backBtn: { height: 32, width: 32 },
  completeBanner: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 22,
    padding: 14,
  },
  completeBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: 4,
  },
  completeKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 16,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  headerStack: { gap: 6 },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  list: {
    marginTop: 22,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  notFoundBack: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  notFoundText: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 14,
  },
  rowBody: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  rowKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  rowNum: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rowNumText: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  rowTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  rowTrail: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  screen: { alignItems: 'center', flex: 1 },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
  },
  topBarTitle: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.2,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/grow/\[block\].tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Section list driven by curriculum (replaces powerBlocks consumer)"
```

---

## Phase 7 — Block list refactor

### Task 7.1: BlockCard primitive

**Files:**
- Create: `components/grow/BlockCard.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/grow/BlockCard.tsx
import { ChevronRight, Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BLOCK_IDS, type BlockId } from '../../lib/curriculum';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

const BLOCK_LABEL: Record<BlockId, string> = {
  COMMIT: 'Commit',
  REFINE: 'Refine',
  EVOLVE: 'Evolve',
  ADAPT: 'Adapt',
  THRIVE: 'Thrive',
  EXCEL: 'Excel',
};

const BLOCK_HELPER: Record<BlockId, string> = {
  COMMIT: 'Two weeks of small, repeatable wins.',
  REFINE: 'Sharpen the patterns that stuck.',
  EVOLVE: 'Layer in deeper habits.',
  ADAPT: 'Make it work when life gets hard.',
  THRIVE: 'Find what makes it sustainable.',
  EXCEL: 'Own the identity, keep the engine running.',
};

type BlockStatus = 'done' | 'current' | 'locked';

function statusFor(blockId: BlockId, currentBlock: BlockId | null): BlockStatus {
  if (!currentBlock) return blockId === 'COMMIT' ? 'current' : 'locked';
  const blockIdx = BLOCK_IDS.indexOf(blockId);
  const currentIdx = BLOCK_IDS.indexOf(currentBlock);
  if (blockIdx < currentIdx) return 'done';
  if (blockIdx === currentIdx) return 'current';
  return 'locked';
}

type Props = {
  blockId: BlockId;
  currentBlock: BlockId | null;
  doneCount: number;
  onPress: () => void;
};

export function BlockCard({ blockId, currentBlock, doneCount, onPress }: Props) {
  const status = statusFor(blockId, currentBlock);
  const isCurrent = status === 'current';
  const isLocked = status === 'locked';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Block ${BLOCK_LABEL[blockId]}, ${status}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View style={[styles.card, isCurrent && styles.cardCurrent, isLocked && styles.cardLocked]}>
        <View style={styles.left}>
          <Text style={[styles.kicker, isCurrent && styles.kickerCurrent]}>BLOCK · {blockId}</Text>
          <Text style={[styles.title, isLocked && styles.titleLocked]}>{BLOCK_LABEL[blockId]}</Text>
          <Text style={[styles.helper, isLocked && styles.helperLocked]} numberOfLines={2}>
            {BLOCK_HELPER[blockId]}
          </Text>
        </View>
        <View style={styles.right}>
          <View style={[styles.chip, isCurrent && styles.chipCurrent]}>
            <Text style={[styles.chipText, isCurrent && styles.chipTextCurrent]}>
              {doneCount} / 6
            </Text>
          </View>
          <View style={styles.trail}>
            {isLocked ? (
              <Lock color={light.mutedText} size={18} strokeWidth={2} />
            ) : (
              <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 16,
  },
  cardCurrent: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  cardLocked: {
    opacity: 0.55,
  },
  chip: {
    backgroundColor: light.cardAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipCurrent: {
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  chipTextCurrent: {
    color: light.accent,
  },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  helperLocked: {
    color: light.mutedText,
  },
  kicker: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
  },
  kickerCurrent: {
    color: light.accent,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  titleLocked: {
    color: light.text,
  },
  trail: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
});
```

### Task 7.2: Refactor `app/(tabs)/grow.tsx`

Replace the block-list portion with `BlockCard` mapping over `BLOCK_IDS`. Preserve the existing microlearning section below.

**Files:**
- Modify: `app/(tabs)/grow.tsx`

- [ ] **Step 1: Read the existing file first to identify the block-list section vs the microlearning section**

Run: `cat app/\(tabs\)/grow.tsx`
Identify: the loop over `powerBlocks.map((block) => <BlockSummaryCard …/>)` (the part to replace) and everything that comes after (the microlearning section to preserve).

- [ ] **Step 2: Write the refactored file**

Replace the entire contents of `app/(tabs)/grow.tsx` with the following. This preserves the microlearning section but drops the powerBlocks import + BlockSummaryCard local component (no longer used).

```typescript
// app/(tabs)/grow.tsx
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { ArrowUpRight, BookOpenCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlockCard } from '../../components/grow/BlockCard';
import { useMembership } from '../../hooks/useMembership';
import { useMicrolearningModules } from '../../hooks/useMicrolearningModules';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { BLOCK_IDS, type BlockId } from '../../lib/curriculum';
import type { MicrolearningModule } from '../../lib/programs';

export default function GrowScreen() {
  const colors = useThemeColors();
  const { membership } = useMembership();
  const { completedInBlock } = useSectionProgress();
  const { data = [] } = useMicrolearningModules();

  const currentBlock = (membership.currentBlock ?? 'COMMIT') as BlockId;

  const [activeBlock, setActiveBlock] = useState('ALL');
  const blocks = useMemo(
    () => ['ALL', ...Array.from(new Set(data.map((module) => module.block)))],
    [data],
  );
  const visibleModules = activeBlock === 'ALL' ? data : data.filter((module) => module.block === activeBlock);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.headerKicker, { color: colors.accent }]}>GROW</Text>
            <Text style={[styles.title, { color: colors.text }]}>CREATE POWER blocks</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Two-week cycles of small actions. Aim for 40 to 50 percent consistency. The rest is bonus.
            </Text>
          </View>

          <View style={styles.blockStack}>
            {BLOCK_IDS.map((blockId) => (
              <BlockCard
                key={blockId}
                blockId={blockId}
                currentBlock={currentBlock}
                doneCount={completedInBlock(blockId)}
                onPress={() => router.push(`/grow/${blockId.toLowerCase()}` as never)}
              />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>MICROLEARNING</Text>
            <Text style={[styles.sectionHelper, { color: colors.mutedText }]}>
              Karen and Ryan’s modules stay full-length by design. Cards open the current Tiiny version in-app.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.filterContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {blocks.map((block) => {
              const active = block === activeBlock;
              return (
                <Pressable
                  key={block}
                  onPress={() => setActiveBlock(block)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? colors.accent : colors.card,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterText, { color: active ? colors.inverseText : colors.mutedText }]}>
                    {block}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.sectionInline}>
            <Text style={[styles.sectionLabel, { color: colors.accent }]}>
              {activeBlock === 'ALL' ? 'ALL MODULES' : `${activeBlock} MODULES`}
            </Text>
            <Text style={[styles.sectionHelper, { color: colors.mutedText }]}>
              {visibleModules.length} modules
            </Text>
          </View>

          {visibleModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ModuleCard({ module }: { module: MicrolearningModule }) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open module ${module.title}`}
      onPress={() => {
        if (!module.url) return;
        WebBrowser.openBrowserAsync(module.url).catch(() => {});
      }}
      style={({ pressed }) => [
        styles.moduleCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.94 : 1 },
      ]}
    >
      <View style={styles.moduleHead}>
        <View style={[styles.moduleIcon, { backgroundColor: colors.cardAlt }]}>
          <BookOpenCheck color={colors.accent} size={18} strokeWidth={2} />
        </View>
        <Text style={[styles.moduleBlock, { color: colors.mutedText }]}>{module.block}</Text>
      </View>
      <Text style={[styles.moduleTitle, { color: colors.text }]} numberOfLines={2}>
        {module.title}
      </Text>
      <View style={styles.moduleFooter}>
        <Text style={[styles.moduleDuration, { color: colors.mutedText }]}>{module.duration_label}</Text>
        <ArrowUpRight color={COLORS.tangerine} size={18} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blockStack: {
    marginBottom: 24,
    marginTop: 8,
  },
  content: {
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterContent: {
    paddingRight: 14,
  },
  filterScroll: {
    marginTop: 8,
  },
  filterText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.8,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  intro: {
    gap: 6,
    paddingTop: 4,
  },
  moduleBlock: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  moduleCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  moduleDuration: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
  },
  moduleFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  moduleHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  moduleIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  moduleTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  section: {
    gap: 4,
    marginTop: 8,
  },
  sectionHelper: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 18,
  },
  sectionInline: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    marginTop: 14,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    color: '#141416',
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

If `useMicrolearningModules` doesn't have a `MicrolearningModule` export at the location used (`../../lib/programs`), look at how `useMicrolearningModules` is currently used in the original file — match the existing import path. The original file imported from `../../lib/programs`, so this should match.

- [ ] **Step 3: Commit**

```bash
git add components/grow/BlockCard.tsx app/\(tabs\)/grow.tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Refactor Grow tab block list to use BlockCard + useSectionProgress"
```

---

## Phase 8 — Today integration

### Task 8.1: Update `NextLessonCard` to bind to next incomplete section

**Files:**
- Modify (full replace): `components/today/NextLessonCard.tsx`

- [ ] **Step 1: Replace the file**

```typescript
// components/today/NextLessonCard.tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useMembership } from '../../hooks/useMembership';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import {
  nextIncompleteSection,
  sectionsForBlock,
  THREAD_NAMES,
  type BlockId,
} from '../../lib/curriculum';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { LessonCard } from '../ui/LessonCard';

const light = THEME_COLORS.light;

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop';

/**
 * Today's "Next Lesson" — dynamically resolved against the current block and
 * the user's progress. If all 6 sections of the current block are done,
 * renders a "Block complete" celebration card instead of routing to a
 * section that no longer exists.
 */
export function NextLessonCard() {
  const { membership } = useMembership();
  const { isCompleted, loading } = useSectionProgress();

  const blockId = (membership.currentBlock ?? 'COMMIT') as BlockId;

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  const next = nextIncompleteSection(blockId, isCompleted);

  if (!next) {
    // Block-complete celebration
    return (
      <View style={styles.completeCard}>
        <Text style={styles.completeKicker}>BLOCK COMPLETE</Text>
        <Text style={styles.completeTitle}>
          {`You finished the ${blockTitleOf(blockId)} block.`}
        </Text>
        <Text style={styles.completeBody}>
          Karen and Ryan are loading what comes next. Take a breath.
        </Text>
      </View>
    );
  }

  return (
    <LessonCard
      meta={THREAD_NAMES[next.threadLetter]}
      title={next.title}
      body={lessonBlurb(next.content.kind)}
      thumbUri={FALLBACK_THUMB}
      onPress={() => router.push(`/grow/${blockId.toLowerCase()}/${next.slug}` as never)}
    />
  );
}

function lessonBlurb(kind: 'educational' | 'workout' | 'stub'): string {
  switch (kind) {
    case 'workout':
      return 'A movement lesson with Ryan.';
    case 'educational':
      return 'A short read.';
    case 'stub':
      return 'Open it when you are ready.';
  }
}

function blockTitleOf(blockId: BlockId): string {
  return blockId.charAt(0) + blockId.slice(1).toLowerCase();
}

const styles = StyleSheet.create({
  completeBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: 6,
  },
  completeCard: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  completeKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  completeTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  loading: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  loadingText: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
  },
});
```

- [ ] **Step 2: Verify CommitBlockToday's call site no longer passes onPress (the wrapper handles routing internally)**

The current `CommitBlockToday` renders `<NextLessonCard onPress={() => router.push('/(tabs)/grow' as never)} />`. The new shape ignores `onPress` since the wrapper resolves the next section and routes itself. TypeScript will allow the unused prop because we don't define it — but to keep the call site honest, edit it to drop the prop.

Open `components/today/CommitBlockToday.tsx`. Find:

```typescript
<NextLessonCard onPress={() => router.push('/(tabs)/grow' as never)} />
```

Replace with:

```typescript
<NextLessonCard />
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/today/NextLessonCard.tsx components/today/CommitBlockToday.tsx
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Today: NextLessonCard binds to next incomplete section dynamically"
```

---

## Phase 9 — Final verification

### Task 9.1: Full typecheck + manual smoke

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: Exit 0, no output.

- [ ] **Step 2: Sweep for em dashes introduced in this slice**

Run: `git diff main~10..HEAD -- 'lib/curriculum.ts' 'hooks/useSectionProgress.ts' 'components/grow/' 'app/grow/' 'components/today/NextLessonCard.tsx' 'app/(tabs)/grow.tsx' | grep '+' | grep '—' | head -5`
Expected: no matches.

- [ ] **Step 3: Start Expo and walk the slice**

Run: `npm start -- --clear`
Press `i` (or `a`) to launch.

Sign in (dev mode is fine — any email ending in `+member` for the Yes branch).

**Block list — `/grow`:**
1. Tap the Grow tab.
2. Confirm 6 BlockCards render. COMMIT is highlighted (current). Others below it are softer / locked-looking.
3. Each card shows `0 / 6` initially.
4. Microlearning section still appears below the block list.

**Section list — `/grow/commit`:**
1. Tap the COMMIT block card.
2. Confirm 6 SectionRows render in P / O / W_NUTRITION / W_WORKOUTS / E / R order.
3. Row 3 = "Building a Balanced Plate" (Wisdom · Nutrition).
4. Row 4 = "Hinge Pattern: Deadlift Setup" (Wisdom · Workouts).
5. Rows 1, 2, 5, 6 show stub titles.

**Authored educational lesson — `/grow/commit/commit-balanced-plate`:**
1. Tap row 3.
2. Confirm header (emoji + title + thread), intro paragraph, three key concept cards (A / B / C — ABC wording verbatim), takeaway callout, reflection prompt.
3. CTA reads "Complete and Next". Tap it.
4. Lands on the workout lesson (next incomplete in same block).

**Authored workout lesson — `/grow/commit/commit-hinge-pattern`:**
1. Confirm header, video placeholder card with Play icon, muscle groups chip list (Posterior chain + Glutes marked PRIMARY), 3 numbered instructions, set-rep target chip.
2. CTA reads "Complete and Next". Tap it.
3. Lands on the next incomplete stub.

**Stub — any of `/grow/commit/commit-p`, `commit-o`, `commit-e`, `commit-r`:**
1. Confirm the "Karen and Ryan are writing this one." card.
2. CTA reads "Mark as read". Tap it.
3. Lands on the next incomplete stub (or back to `/grow/commit` if none).

**Block advancement:**
1. After clearing all 4 stubs + 2 authored, return to `/grow/commit`.
2. Confirm "BLOCK COMPLETE — Karen and Ryan are loading the next block. Take a breath." banner.
3. Go back to `/grow`.
4. Confirm the COMMIT card now reads "6 / 6" and REFINE is the new current block.

**Today integration:**
1. Sign-out reset, sign in fresh, walk the verify flow into Today.
2. Confirm NextLessonCard reads "Building a Balanced Plate" with "Wisdom · Nutrition" meta.
3. Complete it from Today, reload Today, confirm next is "Hinge Pattern" workout.
4. Repeat until block is empty — confirm Today renders the "BLOCK COMPLETE" celebration state.

- [ ] **Step 4: If anything failed, capture and fix**

Common failure modes:
- Route mismatch (`/grow/commit/commit-balanced-plate` 404s) → confirm `app/_layout.tsx` registers `grow/[block]/[slug]` and the directory structure `app/grow/[block]/[slug].tsx` exists.
- Dev-mode block advancement doesn't trigger → confirm `useSectionProgress.completeSection` writes to the right `tel:membership:<userId>` AsyncStorage key (matches what `useMembership` reads).
- TypeScript errors after a refactor → most often a stale import path; double-check `../../lib/curriculum` paths against the new directory depth.

- [ ] **Step 5: Commit any final fixes**

```bash
git add -A
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "Fix final typecheck and smoke issues from curriculum slice"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Plan task(s) |
|--------------|--------------|
| §3.1 Data model (LessonContent union + Section) | 2.1 |
| §3.2 Schema (user_section_progress + RLS) | 1.1 |
| §3.3 RPCs (complete_section_user + maybe_advance_block) | 1.1 |
| §3.4 useSectionProgress hook (dual-path) | 3.1 |
| §4.1 /grow block list | 7.1, 7.2 |
| §4.2 /grow/[block] section list | 6.1 |
| §4.3 /grow/[block]/[slug] section detail (kind-driven) | 4.1, 4.2, 4.3, 5.1 |
| §5 Today NextLessonCard wiring | 8.1 |
| §6 Two authored lessons | 2.1 |
| §9 DOD checklist | 9.1 (smoke) |

**Placeholder scan:** no TBD / TODO / "similar to Task N" / unimplemented edge cases. Every step has full code.

**Type consistency:**
- `BlockId`, `ThreadLetter`, `Section`, `LessonContent`, `EducationalContent`, `WorkoutContent`, `StubContent` defined in 2.1 and consumed identically in 3.1, 4.1, 4.2, 4.3, 5.1, 6.1, 7.1, 7.2, 8.1.
- `nextIncompleteSection(blockId, isCompleted)` signature used the same way in 5.1, 8.1.
- `useSectionProgress` returns `{loading, progress, isCompleted, completedInBlock, completeSection, refresh}` and every consumer uses one of those names exactly.
- `BlockCard` props match between Task 7.1 (definition) and Task 7.2 (consumption).
- `SectionRow` lives inline in Task 6.1 (not split into a separate file — was originally listed in the file map but inlining keeps related code together for the engineer; this is consistent with the actual code in Task 6.1).

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-16-curriculum-vertical-slice.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
