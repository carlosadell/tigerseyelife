# Today Tab Visual Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the original CommitBlockToday visual treatment (greeting + rolling 7-day strip + photo hero + 3 anchor cards + AwarenessCard) and drive it from the new 12-week program data model. Anchors are tap-to-engage (no toggle UI); engagement persists silently and rolls up to the WeekStrip dots.

**Architecture:** Extend `Week` with `heroHeadline` + `heroAnchors`; author 36 anchors across 12 weeks. Reuse the surviving primitives (`TodayHeader`, `WeekStrip`, `GreetingHeader`, `FocusHeroCard`, `AnchorRow`, `AwarenessCard`). Add one new hook (`useDailyEngagement`) that writes anchor-tap events into the existing `user_daily_actions` table. Extend `useEngagementDates` so the WeekStrip's dots react to those events. Full replace of `app/(tabs)/today.tsx`.

**Tech Stack:** TypeScript, React Native, Expo Router, Supabase + AsyncStorage (dual-path), zustand (untouched), brand tokens from `lib/brand.ts`, light-locked surfaces.

**Verification gate:** `npm run typecheck` (sole static check per CLAUDE.md). Each phase ends typecheck-clean with its own commit.

**Hard constraints across every phase:**
- **No "Coming soon" anywhere**
- **No em dashes** in user-facing copy
- **No countdowns, deadlines, time-pressure, or shaming language**
- **Light-locked surfaces** — use `THEME_COLORS.light` references (the today screen surface follows the existing pattern in `components/today/*` which uses `THEME_COLORS.light` directly, not `useThemeColors()`)
- **Pressable + flex layout memory** — layout in inner View, Pressable opacity only
- **Workout names** stay "Workout 1/2/3/4"
- **Dual-path data layer** — every new hook works in Supabase mode AND dev mode (AsyncStorage)
- **Commit identity** — `git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit ...`

---

## File Structure (decomposition lock)

### Create
- `lib/heroAnchors.ts` — `anchorsForWeek(n)` + `heroHeadlineFor(n)` helpers
- `hooks/useDailyEngagement.ts` — write engagement events on anchor tap; expose today's engagement Set

### Modify
- `lib/program.ts` — add `AnchorIcon` union, `HeroAnchor` type; extend `Week` with `heroHeadline: string` and `heroAnchors: HeroAnchor[]`
- `lib/programContent.ts` — author `heroHeadline` + 3 `heroAnchors` per week × 12 weeks (36 anchors)
- `lib/coachStills.ts` — add `coachStillForBlock(blockId)`; map `coachStillForWeek(n)` via `currentBlockFor`; all 6 block keys point to existing seed image until Karen+Ryan deliver
- `hooks/useEngagementDates.ts` — also read from `user_daily_actions` so WeekStrip dots reflect anchor-tap engagement
- `components/today/FocusHeroCard.tsx` — accept `headline` prop instead of hardcoding the title
- `components/ui/AwarenessCard.tsx` — move the `DailyPrompt` type definition into this file (was imported from `lib/commitPrompts.ts` which gets deleted)
- `app/(tabs)/today.tsx` — full replace per spec §3.4

### Delete (orphan after this slice)
- `components/today/PrimaryFocusCard.tsx` (replaced by `FocusHeroCard`)
- `lib/commitAnchors.ts` (replaced by `Week.heroAnchors`)
- `lib/commitPrompts.ts` (rotation function obsolete; `DailyPrompt` type moves to `AwarenessCard.tsx`)

### Reuse as-is (no edits)
- `components/today/TodayHeader.tsx`
- `components/today/GreetingHeader.tsx`
- `components/history/WeekStrip.tsx` (already does rolling 7-day, today-rightmost-gold; consumes `useEngagementDates` which we extend in Phase 6)
- `components/ui/AnchorRow.tsx`
- `components/ui/SectionHeader.tsx`
- `components/ui/PhotoHeroCard.tsx`
- `hooks/useDailyActions.ts` (still used by Week Archive)
- `hooks/useStreak.ts`, `hooks/useProfile.ts`, `hooks/useCurrentWeek.ts`
- `supabase/migrations/0009_user_daily_actions.sql` (schema unchanged; semantics shift)

---

## Phase 1: Data model — `lib/program.ts` + stub for `lib/programContent.ts`

**Goal:** Extend the `Week` type with `heroHeadline` + `heroAnchors`. Add `AnchorIcon` union and `HeroAnchor` type. Update every entry in `lib/programContent.ts` with empty defaults so typecheck stays green; Phase 2 fills them in.

**Files:**
- Modify: `lib/program.ts`
- Modify: `lib/programContent.ts` (add `heroHeadline: ''` and `heroAnchors: []` to all 12 entries)

### Task 1.1: Extend the types

- [ ] **Step 1: Open `lib/program.ts` and add the new types above the `Week` type**

Add after the existing `ActionItem` type definition (around line 28):

```ts
export type AnchorIcon =
  | 'tag' | 'leaf' | 'carrot' | 'dumbbell' | 'footprints' | 'moon'
  | 'brain' | 'compass' | 'zap' | 'shield' | 'eye' | 'hand'
  | 'utensils' | 'wind' | 'sparkles' | 'message-circle' | 'book-open'
  | 'sunrise' | 'apple' | 'droplet';

export type HeroAnchor = {
  id: string;
  title: string;
  helper: string;
  icon: AnchorIcon;
  thread: ThreadLetter;
  conceptRoute: string;
};
```

- [ ] **Step 2: Extend `Week` with the two new fields**

Replace the existing `Week` type with:

```ts
export type Week = {
  weekNumber: WeekNumber;
  blockId: BlockId;
  title: string;
  primaryFocus: string;
  slideNotes: string[];
  weekAtAGlance: ActionItem[];
  toolSlugs: string[];
  discussionPrompt: string;
  heroHeadline: string;
  heroAnchors: HeroAnchor[];
};
```

- [ ] **Step 3: Add an empty `heroHeadline: ''` and `heroAnchors: []` to every Week in `lib/programContent.ts`**

For each of the 12 Week entries in `lib/programContent.ts`, add these two lines after the `discussionPrompt:` field:

```ts
    heroHeadline: '',
    heroAnchors: [],
```

The implementer should add them as the last two fields in each Week object. Do NOT modify any other field. The empty defaults are placeholders — Phase 2 fills them with the canonical content from the spec.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: clean. TypeScript verifies all 12 Weeks have the new fields.

- [ ] **Step 5: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/program.ts lib/programContent.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Extend Week with heroHeadline + heroAnchors fields

AnchorIcon union covers the Lucide icons used across the 12-week
program. HeroAnchor carries the tap-to-engage card data. All 12 Week
entries get empty defaults so typecheck stays green; Phase 2 fills
them with canonical content.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: Author 12 `heroHeadline`s + 36 `heroAnchors` in `lib/programContent.ts`

**Goal:** Replace the 12 empty-default placeholders from Phase 1 with the canonical content from spec §3.2.

**Files:**
- Modify: `lib/programContent.ts` (set `heroHeadline` and `heroAnchors` for all 12 weeks)

### Task 2.1: Author per-week content

For each of the 12 Week entries, replace the `heroHeadline: ''` and `heroAnchors: []` lines with the canonical values below.

- [ ] **Step 1: Week 1 (COMMIT)**

```ts
    heroHeadline: 'Three things, every plate.',
    heroAnchors: [
      {
        id: 'w1-read-labels',
        title: 'Read labels',
        helper: "Know what's in it before it goes in.",
        icon: 'tag',
        thread: 'W',
        conceptRoute: '/tool/nutrition-track-chooser',
      },
      {
        id: 'w1-cut-sugar',
        title: 'Cut added sugar by half',
        helper: 'One swap is a win.',
        icon: 'leaf',
        thread: 'W',
        conceptRoute: '/tool/nutrition-track-chooser',
      },
      {
        id: 'w1-protein-veg',
        title: 'Protein and vegetables',
        helper: 'Build every plate around them.',
        icon: 'carrot',
        thread: 'W',
        conceptRoute: '/tool/nutrition-track-chooser',
      },
    ],
```

- [ ] **Step 2: Week 2 (COMMIT)**

```ts
    heroHeadline: 'Stack one thing this week.',
    heroAnchors: [
      {
        id: 'w2-movement-break',
        title: 'One movement break today',
        helper: 'Five minutes is ROI.',
        icon: 'footprints',
        thread: 'W',
        conceptRoute: '/tool/movement-breaks-menu',
      },
      {
        id: 'w2-notice-pattern',
        title: 'Notice one pattern',
        helper: 'Just name it. That is enough.',
        icon: 'brain',
        thread: 'P',
        conceptRoute: '/tool/five-universal-patterns',
      },
      {
        id: 'w2-bedtime',
        title: 'Within thirty minutes of plan',
        helper: 'Bedtime is a system, not a feeling.',
        icon: 'moon',
        thread: 'R',
        conceptRoute: '/tool/sleep-environment-checklist',
      },
    ],
```

- [ ] **Step 3: Week 3 (REFINE)**

```ts
    heroHeadline: 'Make the easy choice the default.',
    heroAnchors: [
      {
        id: 'w3-kitchen-reset',
        title: 'Kitchen reset action',
        helper: "Put the help where you'll see it.",
        icon: 'compass',
        thread: 'O',
        conceptRoute: '/tool/kitchen-reset-guide',
      },
      {
        id: 'w3-abc-meal',
        title: 'Build one ABC Power Meal',
        helper: 'Anchor first. The rest follows.',
        icon: 'apple',
        thread: 'W',
        conceptRoute: '/tool/abc-power-meals-guide',
      },
      {
        id: 'w3-whole-protein',
        title: 'Whole protein at meal one',
        helper: 'Twenty-five to thirty-five grams.',
        icon: 'carrot',
        thread: 'W',
        conceptRoute: '/tool/abc-power-meals-guide',
      },
    ],
```

- [ ] **Step 4: Week 4 (REFINE)**

```ts
    heroHeadline: 'Pause before you react.',
    heroAnchors: [
      {
        id: 'w4-pause-practice',
        title: 'Pause practice today',
        helper: 'Notice. Pause. Observe.',
        icon: 'hand',
        thread: 'P',
        conceptRoute: '/tool/pause-practice-guide',
      },
      {
        id: 'w4-wind-down',
        title: 'Wind down routine',
        helper: 'Three things, same order, every night.',
        icon: 'wind',
        thread: 'R',
        conceptRoute: '/tool/wind-down-routine-builder',
      },
      {
        id: 'w4-boundary',
        title: 'One boundary conversation',
        helper: 'Ask for what you need.',
        icon: 'shield',
        thread: 'O',
        conceptRoute: '/tool/pause-practice-guide',
      },
    ],
```

- [ ] **Step 5: Week 5 (EVOLVE)**

```ts
    heroHeadline: 'Let thinking drive.',
    heroAnchors: [
      {
        id: 'w5-teb-loop',
        title: 'TEB practice today',
        helper: 'Catch the thought before the emotion.',
        icon: 'brain',
        thread: 'P',
        conceptRoute: '/tool/teb-loop-guide',
      },
      {
        id: 'w5-identity',
        title: 'Read your identity statement',
        helper: 'Who you are decides what you do.',
        icon: 'sparkles',
        thread: 'O',
        conceptRoute: '/tool/teb-loop-guide',
      },
      {
        id: 'w5-meal-prep',
        title: 'Meal prep session',
        helper: 'Ninety minutes buys a week.',
        icon: 'utensils',
        thread: 'W',
        conceptRoute: '/tool/meal-prep-system-guide',
      },
    ],
```

- [ ] **Step 6: Week 6 (EVOLVE)**

```ts
    heroHeadline: 'Pattern skills, in the room.',
    heroAnchors: [
      {
        id: 'w6-social-nav',
        title: 'Navigate one social moment',
        helper: 'TEB works in crowds too.',
        icon: 'message-circle',
        thread: 'P',
        conceptRoute: '/tool/social-situations-playbook',
      },
      {
        id: 'w6-movement-snacks',
        title: 'Three movement snacks today',
        helper: 'Thirty seconds counts.',
        icon: 'footprints',
        thread: 'W',
        conceptRoute: '/tool/movement-snacks-menu',
      },
      {
        id: 'w6-energy-audit',
        title: 'End-of-day energy audit',
        helper: 'Gains and drains. Aim net positive.',
        icon: 'zap',
        thread: 'E',
        conceptRoute: '/week/6',
      },
    ],
```

- [ ] **Step 7: Week 7 (ADAPT)**

```ts
    heroHeadline: 'Tools for the storm.',
    heroAnchors: [
      {
        id: 'w7-box-breathing',
        title: 'Box breathing, twice today',
        helper: 'Sixteen seconds resets the system.',
        icon: 'wind',
        thread: 'R',
        conceptRoute: '/tool/box-breathing-guide',
      },
      {
        id: 'w7-stress-signal',
        title: 'Name one stress signal',
        helper: 'The body tells you first.',
        icon: 'eye',
        thread: 'P',
        conceptRoute: '/tool/box-breathing-guide',
      },
      {
        id: 'w7-non-food-relief',
        title: 'One non-food relief move',
        helper: 'Walk. Breathe. Text. Stretch.',
        icon: 'sparkles',
        thread: 'R',
        conceptRoute: '/tool/non-food-stress-relief-menu',
      },
    ],
```

- [ ] **Step 8: Week 8 (ADAPT)**

```ts
    heroHeadline: 'Floor, not ceiling.',
    heroAnchors: [
      {
        id: 'w8-bare-min-protocol',
        title: 'Bare minimum protocol drafted',
        helper: 'What still happens on the worst day.',
        icon: 'shield',
        thread: 'R',
        conceptRoute: '/tool/bare-minimum-protocol-builder',
      },
      {
        id: 'w8-apply-protocol',
        title: 'Use your protocol on a hard moment',
        helper: 'This is staying in the game.',
        icon: 'hand',
        thread: 'R',
        conceptRoute: '/tool/bare-minimum-protocol-builder',
      },
      {
        id: 'w8-integration',
        title: 'Integration reflection',
        helper: "What's working? What needs adjusting?",
        icon: 'book-open',
        thread: 'O',
        conceptRoute: '/week/8',
      },
    ],
```

- [ ] **Step 9: Week 9 (THRIVE)**

```ts
    heroHeadline: "Notice what's automatic.",
    heroAnchors: [
      {
        id: 'w9-automaticity',
        title: 'Name one habit on autopilot',
        helper: "Week 1 you couldn't. Now you do.",
        icon: 'sparkles',
        thread: 'O',
        conceptRoute: '/tool/automaticity-audit',
      },
      {
        id: 'w9-stress-mastery',
        title: 'Track one stress signal early',
        helper: 'Catch it before it lands.',
        icon: 'eye',
        thread: 'R',
        conceptRoute: '/tool/stress-signal-identifier',
      },
      {
        id: 'w9-energy-roi',
        title: 'One ROI energy choice today',
        helper: 'Spend where it matters most.',
        icon: 'zap',
        thread: 'E',
        conceptRoute: '/tool/automaticity-audit',
      },
    ],
```

- [ ] **Step 10: Week 10 (THRIVE)**

```ts
    heroHeadline: 'Three accounts, one day.',
    heroAnchors: [
      {
        id: 'w10-energy-plan',
        title: 'Run morning, midday, evening',
        helper: 'All three feed the next.',
        icon: 'sunrise',
        thread: 'E',
        conceptRoute: '/tool/energy-orchestra-planner',
      },
      {
        id: 'w10-three-accounts',
        title: 'Audit all three energy accounts',
        helper: 'Physical. Intellectual. Emotional.',
        icon: 'zap',
        thread: 'E',
        conceptRoute: '/tool/energy-orchestra-planner',
      },
      {
        id: 'w10-document',
        title: 'Document one piece of your system',
        helper: 'If you can describe it, you can repeat it.',
        icon: 'book-open',
        thread: 'O',
        conceptRoute: '/tool/my-system-documentation',
      },
    ],
```

- [ ] **Step 11: Week 11 (EXCEL)**

```ts
    heroHeadline: 'Stay aware for life.',
    heroAnchors: [
      {
        id: 'w11-pattern-maint',
        title: 'Pattern maintenance check',
        helper: 'Stays solved by staying watched.',
        icon: 'brain',
        thread: 'P',
        conceptRoute: '/tool/pattern-maintenance-system',
      },
      {
        id: 'w11-energy-orchestra',
        title: 'Run your energy plan',
        helper: 'Your unique rhythm now.',
        icon: 'sunrise',
        thread: 'E',
        conceptRoute: '/tool/energy-orchestra-planner',
      },
      {
        id: 'w11-progressive',
        title: 'Note a strength progression',
        helper: "What's heavier than Week 1?",
        icon: 'dumbbell',
        thread: 'W',
        conceptRoute: '/week/11',
      },
    ],
```

- [ ] **Step 12: Week 12 (EXCEL)**

```ts
    heroHeadline: 'This is who you are now.',
    heroAnchors: [
      {
        id: 'w12-celebrate',
        title: 'Celebrate one specific win',
        helper: 'Name it. Out loud counts.',
        icon: 'sparkles',
        thread: 'O',
        conceptRoute: '/tool/transformation-summary',
      },
      {
        id: 'w12-reflect',
        title: 'Week 1 versus Week 12',
        helper: 'The evidence in your own words.',
        icon: 'book-open',
        thread: 'P',
        conceptRoute: '/tool/transformation-summary',
      },
      {
        id: 'w12-whats-next',
        title: "One step on what's next",
        helper: 'Membership. GST. Round 2.',
        icon: 'compass',
        thread: 'O',
        conceptRoute: '/tool/whats-next-guide',
      },
    ],
```

- [ ] **Step 13: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 14: Sanity check counts**

Run: `grep -c "heroHeadline:" lib/programContent.ts`
Expected: `12`

Run: `grep -c "id: 'w" lib/programContent.ts`
Expected: at least `36` (12 weeks × 3 anchors).

- [ ] **Step 15: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/programContent.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Author 12 hero headlines + 36 hero anchors per spec

Each week ships a curated trio (Today's Focus on the Today tab) with
icon + title + helper + conceptRoute. Karen can revise copy after the
slice lands. Thread tagging carried for future POWER Compass styling.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3: `lib/heroAnchors.ts` helpers + icon resolver

**Goal:** Ship the helpers Today reads — `anchorsForWeek(n)` + `heroHeadlineFor(n)` + a `resolveAnchorIcon(name)` function that maps `AnchorIcon` strings to Lucide components.

**Files:**
- Create: `lib/heroAnchors.ts`

### Task 3.1: Create the helpers

- [ ] **Step 1: Write `lib/heroAnchors.ts`**

```ts
// lib/heroAnchors.ts
//
// Per-week hero anchor resolution. Anchors are tap-to-engage cards on
// the Today tab. Engagement persists via hooks/useDailyEngagement; no
// toggle UI per the design.

import {
  Apple,
  BookOpen,
  Brain,
  Carrot,
  Compass,
  Droplet,
  Dumbbell,
  Eye,
  Footprints,
  Hand,
  Leaf,
  MessageCircle,
  Moon,
  Shield,
  Sparkles,
  Sunrise,
  Tag,
  Utensils,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { weekFor } from './program';
import type { AnchorIcon, HeroAnchor, WeekNumber } from './program';

const ICONS: Record<AnchorIcon, LucideIcon> = {
  apple: Apple,
  'book-open': BookOpen,
  brain: Brain,
  carrot: Carrot,
  compass: Compass,
  droplet: Droplet,
  dumbbell: Dumbbell,
  eye: Eye,
  footprints: Footprints,
  hand: Hand,
  leaf: Leaf,
  'message-circle': MessageCircle,
  moon: Moon,
  shield: Shield,
  sparkles: Sparkles,
  sunrise: Sunrise,
  tag: Tag,
  utensils: Utensils,
  wind: Wind,
  zap: Zap,
};

export function resolveAnchorIcon(name: AnchorIcon): LucideIcon {
  return ICONS[name];
}

export function anchorsForWeek(n: WeekNumber): HeroAnchor[] {
  return weekFor(n).heroAnchors;
}

export function heroHeadlineFor(n: WeekNumber): string {
  return weekFor(n).heroHeadline;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/heroAnchors.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add heroAnchors helpers + Lucide icon resolver

anchorsForWeek + heroHeadlineFor read off the Week records.
resolveAnchorIcon maps the AnchorIcon string union to the actual
Lucide component, so today.tsx stays agnostic to the icon library.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: `lib/coachStills.ts` — block-keyed hero photos

**Goal:** Add `coachStillForBlock(blockId)` and repoint `coachStillForWeek(n)` through the block map. All 6 block keys point to the existing seed asset until Karen+Ryan deliver real photos.

**Files:**
- Modify: `lib/coachStills.ts`

### Task 4.1: Block-keyed map + helpers

- [ ] **Step 1: Read the current `lib/coachStills.ts`**

The implementer first reads the file to see the existing exports (`coachStillForToday`, `coachStillForWeek`) and the current seed image path. The seed image path used by `coachStillForToday()` is what populates all 6 block entries until real photos land.

- [ ] **Step 2: Update `lib/coachStills.ts`**

Preserve the existing `coachStillForToday()` export (still used by `TodayHeader.tsx`). Add a `STILLS_BY_BLOCK` map keyed by `BlockId` where every value initially points to the same seed image the current `coachStillForToday()` uses. Add `coachStillForBlock(blockId)` and reimplement `coachStillForWeek(week)` to dispatch through `currentBlockFor`.

The full file should end up looking like:

```ts
// lib/coachStills.ts
//
// Coach photo asset resolution. Six block-keyed entries; all currently
// point to the seed image until Karen+Ryan deliver real per-block photos.

import type { BlockId, WeekNumber } from './program';
import { currentBlockFor } from './program';

// The existing seed image used across all surfaces. Replace this and the
// individual block entries below when real per-block photos land.
const SEED_STILL = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800';

const STILLS_BY_BLOCK: Record<BlockId, string> = {
  COMMIT: SEED_STILL,
  REFINE: SEED_STILL,
  EVOLVE: SEED_STILL,
  ADAPT: SEED_STILL,
  THRIVE: SEED_STILL,
  EXCEL: SEED_STILL,
};

export function coachStillForBlock(blockId: BlockId): string {
  return STILLS_BY_BLOCK[blockId];
}

export function coachStillForWeek(week: WeekNumber): string {
  return coachStillForBlock(currentBlockFor(week));
}

export function coachStillForToday(): string {
  return SEED_STILL;
}
```

**Important:** Before overwriting, the implementer reads the existing file to recover the actual seed image URL/path the project uses. Replace `SEED_STILL` above with that real value. If the existing file already exports `coachStillForToday()` returning a specific URL, use that exact URL in `SEED_STILL`.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: clean. (Existing consumers of `coachStillForToday` and `coachStillForWeek` keep working because the signatures don't change.)

- [ ] **Step 4: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/coachStills.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add coachStillForBlock and route per-week through block map

Six block keys point to the existing seed photo until Karen + Ryan
deliver real per-block stills. coachStillForWeek now resolves via
currentBlockFor so Week 1 and Week 2 share the COMMIT photo, etc.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5: `hooks/useDailyEngagement.ts` — record anchor-tap events

**Goal:** Ship a dual-path hook that records an engagement event when the user taps an anchor. Writes to the existing `user_daily_actions` table (Supabase mode) or `AsyncStorage` under `tel:daily-actions:<userId>` (dev mode). Returns today's engagement Set so anchor cards can render an optional "engaged" treatment in the future.

**Files:**
- Create: `hooks/useDailyEngagement.ts`

### Task 5.1: Engagement hook

- [ ] **Step 1: Write `hooks/useDailyEngagement.ts`**

```ts
// hooks/useDailyEngagement.ts
//
// Anchor-tap engagement events. Writes silently to user_daily_actions
// (Supabase) or AsyncStorage tel:daily-actions:<userId> (dev). Returns
// today's engagement set so cards can render an "engaged today" state
// in the future. WeekStrip dots aggregate via useEngagementDates.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { useCurrentWeek } from './useCurrentWeek';
import { supabase } from '../lib/supabase';

type EngagementRecord = {
  actionId: string;
  completedDate: string;
  completedAt: string;
  weekNumber: number;
};

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function storageKey(userId: string): string {
  return `tel:daily-actions:${userId}`;
}

export function useDailyEngagement(): {
  todayEngagements: Set<string>;
  recordEngagement: (anchorId: string) => Promise<void>;
  loading: boolean;
} {
  const { session, isDevSession } = useAuth();
  const { weekNumber } = useCurrentWeek();
  const userId = session?.user.id;
  const [todayEngagements, setTodayEngagements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setTodayEngagements(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const today = todayISO();
      if (isDevSession || !supabase) {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        const parsed = raw ? (JSON.parse(raw) as EngagementRecord[]) : [];
        setTodayEngagements(
          new Set(parsed.filter((r) => r.completedDate === today).map((r) => r.actionId)),
        );
      } else {
        const { data, error } = await supabase
          .from('user_daily_actions')
          .select('action_id')
          .eq('user_id', userId)
          .eq('completed_date', today);
        if (error) throw error;
        setTodayEngagements(new Set((data ?? []).map((r) => r.action_id as string)));
      }
    } finally {
      setLoading(false);
    }
  }, [isDevSession, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const recordEngagement = useCallback(
    async (anchorId: string) => {
      if (!userId) return;
      const today = todayISO();
      if (todayEngagements.has(anchorId)) return;

      if (isDevSession || !supabase) {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        const parsed = raw ? (JSON.parse(raw) as EngagementRecord[]) : [];
        const next: EngagementRecord[] = [
          ...parsed,
          {
            actionId: anchorId,
            completedDate: today,
            completedAt: new Date().toISOString(),
            weekNumber,
          },
        ];
        await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
        setTodayEngagements(new Set([...todayEngagements, anchorId]));
        return;
      }

      const { error } = await supabase.from('user_daily_actions').insert({
        user_id: userId,
        action_id: anchorId,
        completed_date: today,
        week_number: weekNumber,
      });
      if (error && error.code !== '23505') throw error; // 23505 = unique violation, idempotent
      setTodayEngagements(new Set([...todayEngagements, anchorId]));
    },
    [isDevSession, todayEngagements, userId, weekNumber],
  );

  return { todayEngagements, recordEngagement, loading };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add hooks/useDailyEngagement.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add useDailyEngagement hook for anchor-tap events

Dual-path: Supabase writes to user_daily_actions, dev mode writes to
AsyncStorage tel:daily-actions:<userId>. Insert errors with code
23505 (unique violation) are swallowed so taps are idempotent per
(user, anchor, date). Exposes today's engagement set.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6: Extend `hooks/useEngagementDates.ts` to include `user_daily_actions`

**Goal:** The existing `useEngagementDates` aggregates engagement dates from workout sessions, daily entries, power-progress, and meal logs. Extend it to ALSO read `user_daily_actions` (where Phase 5 events land) so the WeekStrip dots reflect anchor-tap engagement.

**Files:**
- Modify: `hooks/useEngagementDates.ts`

### Task 6.1: Aggregate from user_daily_actions

- [ ] **Step 1: Read the current `hooks/useEngagementDates.ts`**

The implementer reads the file to see the existing `fetchEngagementDates` function and how it merges sources. The hook already returns a `Set<string>` of `yyyy-MM-dd` keys, used by `WeekStrip` for the dots.

- [ ] **Step 2: Add a Supabase fetch + dev-mode read for `user_daily_actions`**

In `fetchEngagementDates`, after the existing dev/Supabase path that reads `daily_entries`, add another source:

**Supabase mode** (after the existing `.from('daily_entries')` block, still inside the `else if (supabase)` branch):

```ts
    const { data: actionData } = await supabase
      .from('user_daily_actions')
      .select('completed_date')
      .eq('user_id', userId)
      .gte('completed_date', since);
    for (const row of actionData ?? []) {
      if (row.completed_date) dates.add(row.completed_date);
    }
```

**Dev mode** (inside the `if (useLocal)` branch, after the existing daily-entry key sweep):

```ts
    const actionsKey = `tel:daily-actions:${userId}`;
    const raw = await AsyncStorage.getItem(actionsKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { completedDate?: string }[];
        for (const r of parsed) {
          if (r.completedDate) dates.add(r.completedDate);
        }
      } catch {
        // ignore malformed payload
      }
    }
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add hooks/useEngagementDates.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Aggregate user_daily_actions into useEngagementDates

WeekStrip dots now react to anchor-tap engagement from
useDailyEngagement. Both dev and Supabase paths read the new source.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 7: Component prop tweaks — `FocusHeroCard` + `AwarenessCard`

**Goal:** Add a `headline` prop to `FocusHeroCard` so each week passes its own copy. Move the `DailyPrompt` type from `lib/commitPrompts.ts` (which gets deleted in Phase 9) into `components/ui/AwarenessCard.tsx` so the consumer is self-contained.

**Files:**
- Modify: `components/today/FocusHeroCard.tsx`
- Modify: `components/ui/AwarenessCard.tsx`

### Task 7.1: FocusHeroCard accepts a `headline` prop

- [ ] **Step 1: Overwrite `components/today/FocusHeroCard.tsx`**

```tsx
// components/today/FocusHeroCard.tsx
import { coachStillForWeek } from '../../lib/coachStills';
import { PhotoHeroCard } from '../ui/PhotoHeroCard';

type FocusHeroCardProps = {
  weekIndex: number;
  headline: string;
};

/**
 * Weekly focus hero. The kicker is fixed; the headline is the week's
 * curated copy (Week.heroHeadline). Photo resolves through the block
 * via coachStillForWeek.
 */
export function FocusHeroCard({ weekIndex, headline }: FocusHeroCardProps) {
  return (
    <PhotoHeroCard
      kicker="THIS WEEK'S FOCUS"
      title={headline}
      photoUri={coachStillForWeek(weekIndex as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12)}
    />
  );
}
```

### Task 7.2: AwarenessCard owns the DailyPrompt type

- [ ] **Step 1: Modify `components/ui/AwarenessCard.tsx`**

Remove the import line `import { type DailyPrompt } from '../../lib/commitPrompts';` and replace it with an inline `export type DailyPrompt` definition. The full file should look like this (preserving everything else verbatim):

```tsx
// components/ui/AwarenessCard.tsx
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

export type DailyPrompt =
  | { kind: 'awareness'; body: string }
  | { kind: 'nudge'; body: string; attribution?: string };

type AwarenessCardProps = {
  prompt: DailyPrompt;
};

/**
 * Single slot for the day. Awareness prompt OR coach nudge. Kicker label
 * adjusts; body and attribution render conditionally.
 */
export function AwarenessCard({ prompt }: AwarenessCardProps) {
  const kicker = prompt.kind === 'nudge' ? 'FROM YOUR COACH' : 'FOR TODAY';

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Sparkles color={light.accent} size={18} strokeWidth={2.2} />
      </View>
      <View style={styles.col}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.body}>{prompt.body}</Text>
        {prompt.kind === 'nudge' && prompt.attribution ? (
          <Text style={styles.attribution}>· {prompt.attribution}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  attribution: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    marginTop: 6,
  },
  body: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14.5,
    letterSpacing: -0.1,
    lineHeight: 20,
    marginTop: 2,
  },
  card: {
    alignItems: 'flex-start',
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: light.background,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  kicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean. (Any other consumer of `DailyPrompt` from `lib/commitPrompts` will now error — none expected besides this file, but if any surface, point their import at `'../ui/AwarenessCard'` / appropriate relative path.)

If TypeScript flags `lib/commitPrompts.ts` itself for unused-import after this change, that's expected — it gets deleted in Phase 9. Leave it for now.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add components/today/FocusHeroCard.tsx components/ui/AwarenessCard.tsx && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add headline prop to FocusHeroCard; AwarenessCard owns DailyPrompt type

FocusHeroCard now takes a per-week headline instead of hardcoding
"Three things, every plate." DailyPrompt type relocates from
lib/commitPrompts (to be deleted) into AwarenessCard so the consumer
is self-contained.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 8: `app/(tabs)/today.tsx` — full replace

**Goal:** Replace the current daily-checklist Today tab with the restored design driven by the new data: TodayHeader → WeekStrip → GreetingHeader → FocusHeroCard → Today's Focus N anchors → Today's Workout → AwarenessCard → dev-only Start Over.

**Files:**
- Modify: `app/(tabs)/today.tsx` (full replace)

### Task 8.1: Restore the Today tab

- [ ] **Step 1: Overwrite `app/(tabs)/today.tsx`**

```tsx
// app/(tabs)/today.tsx
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocusHeroCard } from '../../components/today/FocusHeroCard';
import { GreetingHeader } from '../../components/today/GreetingHeader';
import { TodayHeader } from '../../components/today/TodayHeader';
import { WeekStrip } from '../../components/history/WeekStrip';
import { AnchorRow } from '../../components/ui/AnchorRow';
import { AwarenessCard, type DailyPrompt } from '../../components/ui/AwarenessCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useDailyEngagement } from '../../hooks/useDailyEngagement';
import { useMembership } from '../../hooks/useMembership';
import { useProfile } from '../../hooks/useProfile';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';
import { anchorsForWeek, heroHeadlineFor, resolveAnchorIcon } from '../../lib/heroAnchors';
import { weekFor } from '../../lib/program';
import { workoutsForBlock } from '../../lib/workoutSchedule';

const light = THEME_COLORS.light;

export default function TodayScreen() {
  const { isDevSession } = useAuth();
  const { profile } = useProfile();
  const { devReset } = useMembership();
  const { weekNumber, blockId } = useCurrentWeek();
  const { recordEngagement } = useDailyEngagement();

  const week = weekFor(weekNumber);
  const headline = heroHeadlineFor(weekNumber);
  const anchors = anchorsForWeek(weekNumber);
  const blockWorkouts = workoutsForBlock(blockId);
  const todayWorkout = blockWorkouts[0];
  const prompt: DailyPrompt = { kind: 'awareness', body: week.discussionPrompt };

  const blockTitle = `${blockId.charAt(0)}${blockId.slice(1).toLowerCase()}`;

  const openAnchor = async (anchorId: string, route: string) => {
    await recordEngagement(anchorId);
    router.push(route);
  };

  const onStartOver = async () => {
    await devReset();
    router.replace('/membership');
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TodayHeader />
        <WeekStrip />

        <View style={styles.greetingWrap}>
          <GreetingHeader
            firstName={profile.firstName}
            subtitle={`${blockTitle} Block · Week ${weekNumber}`}
          />
        </View>

        <FocusHeroCard weekIndex={weekNumber} headline={headline} />

        <SectionHeader title="Today's Focus" meta={`${anchors.length} anchors`} />
        <View>
          {anchors.map((anchor) => {
            const Icon = resolveAnchorIcon(anchor.icon);
            return (
              <AnchorRow
                key={anchor.id}
                Icon={Icon}
                title={anchor.title}
                sub={anchor.helper}
                onPress={() => openAnchor(anchor.id, anchor.conceptRoute)}
              />
            );
          })}
        </View>

        {todayWorkout ? (
          <>
            <SectionHeader title="Today's Workout" />
            <Pressable
              onPress={() => router.push(`/workout/${todayWorkout.slug}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View style={styles.workoutCard}>
                <Text style={styles.workoutKicker}>
                  {todayWorkout.exercises.length} EXERCISES
                </Text>
                <Text style={styles.workoutTitle}>{todayWorkout.title}</Text>
                {todayWorkout.helper ? (
                  <Text style={styles.workoutHelper} numberOfLines={2}>
                    {todayWorkout.helper}
                  </Text>
                ) : null}
                <Text style={styles.workoutCta}>Open</Text>
              </View>
            </Pressable>
          </>
        ) : null}

        <View style={styles.awarenessWrap}>
          <AwarenessCard prompt={prompt} />
        </View>

        {isDevSession ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dev: start over"
            onPress={onStartOver}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View style={styles.devReset}>
              <Text style={styles.devKicker}>DEV ONLY</Text>
              <Text style={styles.devBody}>Start over from the fork</Text>
            </View>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  awarenessWrap: { marginTop: 22 },
  content: {
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
  devBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    letterSpacing: -0.1,
    marginTop: 4,
  },
  devKicker: {
    color: COLORS.tangerine,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  devReset: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginTop: 28,
    padding: 14,
  },
  greetingWrap: { marginBottom: 18, marginTop: 28 },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  workoutCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  workoutCta: {
    color: COLORS.tangerine,
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
    marginTop: 6,
  },
  workoutHelper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  workoutKicker: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  workoutTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add app/\(tabs\)/today.tsx && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Restore Today tab to the original CommitBlockToday aesthetic

Driven by the new 12-week data model. TodayHeader, WeekStrip,
GreetingHeader, FocusHeroCard, AnchorRows, today's workout card,
and AwarenessCard all back. Anchor taps record silent engagement
events that feed the WeekStrip dots.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 9: Delete orphans

**Goal:** Remove the legacy files replaced by this slice. Verify no consumers remain before deleting.

**Files to delete:**
- `components/today/PrimaryFocusCard.tsx`
- `lib/commitAnchors.ts`
- `lib/commitPrompts.ts`

### Task 9.1: Verify orphan status + delete

- [ ] **Step 1: Verify no consumers**

Run: `grep -rn "PrimaryFocusCard\|commitAnchors\|commitPrompts\|COMMIT_ANCHORS\|dailyPrompt" app components hooks lib 2>/dev/null`

Expected: only matches inside the three files we're about to delete. If any other file imports from any of these, fix that consumer first (typically by inlining what it needs or pointing at the new module).

- [ ] **Step 2: Delete the three files**

```bash
git rm components/today/PrimaryFocusCard.tsx
git rm lib/commitAnchors.ts
git rm lib/commitPrompts.ts
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: clean.

If TypeScript surfaces a stale import we missed, fix it (replace with the corresponding new module or inline the small bit needed) and re-stage.

- [ ] **Step 4: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Delete orphan PrimaryFocusCard, commitAnchors, commitPrompts

Replaced by FocusHeroCard (Phase 7), Week.heroAnchors (Phase 2), and
the DailyPrompt type now living in AwarenessCard.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 10: Final verification + memory update + smoke checklist

**Goal:** Confirm the whole-app typecheck still passes at HEAD. Update the project-foundation memory entry with a "Today restored" note. Hand the implementer a manual smoke checklist.

### Task 10.1: Final typecheck

- [ ] **Step 1: Run typecheck across the whole app**

Run: `npm run typecheck`
Expected: clean.

### Task 10.2: Manual smoke checklist

Hand the implementer this list. It is human-driven:

- [ ] **Step 1: Boot the app.** Run `npm start` and open in dev client.
- [ ] **Step 2: Sign in (dev mode).**
- [ ] **Step 3: Today tab smoke.**
   - TodayHeader: streak count + "This Week" pill + avatar cluster render
   - WeekStrip: 7 day rings, today rightmost gold-filled, day-number text inside
   - Greeting: "Morning, {firstName}." (or Afternoon/Evening based on time) + "Commit Block · Week 1" subtitle
   - FocusHeroCard: tan card with kicker "THIS WEEK'S FOCUS" + title "Three things, every plate." + block photo
   - SectionHeader "Today's Focus" + "3 anchors" meta
   - 3 AnchorRow cards: tag icon "Read labels" / leaf "Cut added sugar by half" / carrot "Protein and vegetables"
- [ ] **Step 4: Tap an anchor.**
   - Routes to `/tool/nutrition-track-chooser`
   - Quietly persists an engagement event
- [ ] **Step 5: Pop back to Today.**
   - No visible "done" treatment on the anchor card (per the screenshot)
- [ ] **Step 6: Restart the app.**
   - Today's WeekStrip should now show a dot under today's ring (engagement landed)
- [ ] **Step 7: Tap Today's Workout card.** Routes to `/workout/commit-workout-1` and the existing exercise drill-down flow works as before.
- [ ] **Step 8: AwarenessCard renders** the week's `discussionPrompt` in the "FOR TODAY" slot.
- [ ] **Step 9: Dev-only Start Over** card appears at the bottom and routes back to `/membership` when tapped.

### Task 10.3: Memory update

- [ ] **Step 1: Update `program_foundation_landed.md`**

Add a short note at the bottom of the existing `/Users/johnbryanliwanag/.claude/projects/-Users-johnbryanliwanag-tigerseyelife/memory/program_foundation_landed.md` confirming the Today tab visual treatment is restored and the daily-checklist UX has migrated conceptually to the Week Archive (next slice will surface it there).

The implementer just appends a `**Today tab restoration landed 2026-06-17:**` paragraph referencing the spec + this plan path + the commit range. No new memory file required.

### Task 10.4: Definition of done

- [ ] Today tab matches the screenshot pixel-close
- [ ] All 12 weeks have an authored `heroHeadline` and 3 `heroAnchors`
- [ ] Tapping an anchor records an engagement event AND navigates to the concept
- [ ] WeekStrip dot appears under days with ≥1 engagement
- [ ] Today's Workout card replaces Phase 12's "Next Lesson" slot
- [ ] AwarenessCard renders `week.discussionPrompt`
- [ ] Dev session shows the Start Over reset card
- [ ] `npm run typecheck` clean
- [ ] `lib/curriculum.ts`-era orphans (`PrimaryFocusCard`, `commitAnchors`, `commitPrompts`) gone
- [ ] Memory updated

---

## Self-Review (against spec)

**Spec coverage:**
- §3.1 Data model — Phase 1
- §3.2 Anchor copy verbatim — Phase 2
- §3.3 Engagement persistence — Phase 5 + 6
- §3.4 Today tab structure — Phase 8
- §3.5 WeekStrip rolling 7 days — already in `WeekStrip.tsx` (no edit); Phase 6 makes engagement dots react to anchor taps
- §3.6 Hero photos block-keyed — Phase 4
- §3.7 Greeting + period — uses existing `GreetingHeader`
- §3.8 PrimaryFocusCard removal — Phase 9
- §3.9 DailyActionRow + DiscussionCard fate — left alone, repurposed later (Week Archive enrichment slice)

**Placeholder scan:** No "TBD"/"TODO" markers. Every step shows the exact code or exact command. The two reads-first instructions (Phase 4 Step 1, Phase 6 Step 1) are deliberate — the implementer needs to recover the current seed-image URL from the existing `coachStills.ts` and verify the existing aggregation shape in `useEngagementDates.ts`.

**Type consistency:**
- `HeroAnchor`, `AnchorIcon`, `WeekNumber`, `BlockId`, `ThreadLetter` all defined in `lib/program.ts` (Phase 1) and consumed by Phases 2, 3, 5, 8 consistently
- `DailyPrompt` defined in `AwarenessCard.tsx` (Phase 7) and consumed by `today.tsx` (Phase 8)
- `recordEngagement(anchorId)` from `useDailyEngagement` matches the call site in `today.tsx`
- `resolveAnchorIcon(name)` from `heroAnchors.ts` matches the `Icon` prop expected by `AnchorRow`

Plan ready for execution.

---

**Execution handoff:**

Plan complete and saved to `docs/superpowers/plans/2026-06-17-today-tab-restoration.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per phase + two-stage review between phases. Same approach as the program foundation slice.

**2. Inline Execution** — execute phases in this session with batch checkpoints.

Which approach?
