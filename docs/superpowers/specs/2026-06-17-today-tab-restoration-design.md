# Today Tab Visual Restoration — Design

**Date:** 2026-06-17
**Owner:** John (vuzzdotio@gmail.com)
**Source of truth (visual):** Screenshot from previous app iteration (CommitBlockToday.tsx, deleted commit c76ff44~1)
**Source of truth (content):** Karen Atler's V2 CREATE POWER Actions Tracker PDF + Karen's 12-Week Curriculum Map + Karen's Internal Dev Brief on Two-Pathway Architecture (2026-06-16, v1).
**Companion guidance:** `CLAUDE.md`, memories on no-em-dashes, no countdowns, light-locked surfaces, Pressable+flex layout, progressive disclosure default, program-foundation-landed, create-power-beta-2-architecture, create-power-progressive-unlock-schedule, workout-naming-convention.

---

## 1. Purpose

Restore the rich Today tab design from the screenshot the user shared (the original `CommitBlockToday.tsx` aesthetic) and drive it from the new 12-week program data model. Phase 12 of the program foundation slice replaced this surface with a utilitarian daily checklist; this slice puts back the personalized greeting, 7-day calendar strip, photo focus hero, anchor cards with icons, and `AwarenessCard` daily prompt — all while honoring Karen's beta-2 brief that POWER Compass governs prominence within a block.

Two important reconciliations this spec makes:
- **Karen's spreadsheet tracker** (10 items per block, daily checkboxes) is the participant's HOME tracking tool — not a 1:1 to the Today tab UI. The Today tab surfaces a **curated trio of "Today's Focus" anchors** per week (the screenshot's "Three things, every plate." model), distinct from the full week-at-a-glance.
- **Anchors are tap-to-engage cards**, not toggleable checkboxes. The user taps an anchor to learn or revisit the concept. Daily engagement is inferred from the user's interaction (tap, workout start, meal log) and rolls up to the WeekStrip dots. The `user_daily_actions` table we built is repurposed: it stores "engaged with this action today" events, not manual toggle state.

The daily-checklist UX from Phase 12 doesn't disappear — it relocates to the **Week Archive** (`app/week/[n].tsx`) where the user can see the full week-at-a-glance and toggle action completions explicitly. Today stays the narrative hub.

## 2. Locked decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Anchor count + curation | **Curated trio (3 anchors) per week, authored by Karen** | Matches screenshot. Aligns with Karen's "one primary focus per week" + the narrative headline ("Three things, every plate."). Compass roles still inform Karen's authoring; not a mechanical filter. |
| 2 | Anchor interaction | **Tap-to-engage (route to a concept/tool), not toggleable** | Matches the screenshot's clean card design. Engagement is inferred + persisted, not manually toggled. |
| 3 | Icon strategy | **Per-anchor icons authored in Week data** | Lucide icons (`Tag`, `Leaf`, `Carrot`, `Dumbbell`, `Moon`, `Brain`, etc.). 36 icons to author across 12 weeks × 3 anchors. |
| 4 | Hero photo cadence | **One per block (6 photos)** | Karen+Ryan deliver 6 stills. `coachStillForWeek(n)` repointed to map week → block → photo. |
| 5 | Daily-checklist UX | **Moves to Week Archive** (`/week/[n]`) | Today stays a narrative hub. Full daily tracker stays accessible but isn't the front door. |
| 6 | Persistence layer | **Reuse `user_daily_actions`** | Same table, semantics shift from "toggle done" to "engaged with action today." Schema unchanged. |
| 7 | WeekStrip data | **Engagement rollup from `user_daily_actions`** | Existing query, new interpretation. A day shows a dot if ≥1 engagement event landed. |
| 8 | "Next Lesson" slot from original | **Replaced by Today's Workout card** | The original's `NextLessonCard` overlaps semantically with the workout card we already render. Drop the lesson card; keep the workout card. Karen's "navigation vs teaching" split (per the beta brief) lives in the Week Archive, not Today. |
| 9 | AwarenessCard prompt | **Driven by `week.discussionPrompt`** | Existing field, no change. |
| 10 | Beta 2 brief implications | **Honor POWER Compass + 3-layer-ready data shape** | Carry `compassRole` on each anchor for future styling. Reserve `layerSet: { l1, l2, l3 }` field on HeroAnchor for 3-layer migration slice. Not rendered yet, but data is there. |

## 3. Architecture

### 3.1 Data model extensions — `lib/program.ts`

```ts
import type { LucideIcon } from 'lucide-react-native';

export type AnchorIcon =
  | 'tag' | 'leaf' | 'carrot' | 'dumbbell' | 'footprints' | 'moon'
  | 'brain' | 'compass' | 'zap' | 'shield' | 'eye' | 'hand'
  | 'utensils' | 'wind' | 'sparkles' | 'message-circle' | 'book-open'
  | 'sunrise' | 'apple' | 'droplet';

export type HeroAnchor = {
  id: string;                    // 'w1-read-labels'
  title: string;                 // 'Read labels'
  helper: string;                // "Know what's in it before it goes in."
  icon: AnchorIcon;              // 'tag'
  thread: ThreadLetter;          // informs which compass role colors it
  conceptRoute: string;          // '/tool/nutrition-track-chooser' or '/week/1'
};

export type Week = {
  weekNumber: WeekNumber;
  blockId: BlockId;
  title: string;
  primaryFocus: string;
  slideNotes: string[];
  weekAtAGlance: ActionItem[];   // unchanged - full tracker actions
  toolSlugs: string[];
  discussionPrompt: string;
  // NEW:
  heroHeadline: string;          // 'Three things, every plate.'
  heroAnchors: HeroAnchor[];     // 3 anchors, curated per week
};
```

Existing `ActionItem` stays as-is. The full week-at-a-glance still exists for the Week Archive's tracker view. `HeroAnchor` is the new, sparser concept that drives Today.

### 3.2 Authored anchor trios (all 12 weeks)

Each week gets 3 authored anchors + a headline. The headlines are short, evocative (matching "Three things, every plate." voice). Examples:

**Week 1 (COMMIT)** — headline: `"Three things, every plate."`
- `read-labels` Tag · "Read labels" · "Know what's in it before it goes in." · → `/tool/nutrition-track-chooser`
- `cut-sugar` Leaf · "Cut added sugar by half" · "One swap is a win." · → `/tool/nutrition-track-chooser`
- `protein-veg` Carrot · "Protein + vegetables" · "Build every plate around them." · → `/tool/abc-power-meals-guide` (gated until W3, falls back to nutrition-track-chooser)

**Week 2 (COMMIT)** — headline: `"Stack one thing this week."`
- `movement-break` Footprints · "One movement break today" · "Five minutes is ROI." · → `/tool/movement-breaks-menu`
- `notice-pattern` Brain · "Notice one pattern" · "Just name it. That is enough." · → `/tool/five-universal-patterns`
- `bedtime` Moon · "Within thirty minutes of plan" · "Bedtime is a system, not a feeling." · → `/tool/sleep-environment-checklist`

**Week 3 (REFINE)** — headline: `"Make the easy choice the default."`
- `kitchen-reset` Compass · "Kitchen reset action" · "Put the help where you'll see it." · → `/tool/kitchen-reset-guide`
- `abc-meal` Apple · "Build one ABC Power Meal" · "Anchor first. The rest follows." · → `/tool/abc-power-meals-guide`
- `whole-protein` Carrot · "Whole protein at meal one" · "Twenty-five to thirty-five grams." · → `/tool/abc-power-meals-guide`

**Week 4 (REFINE)** — headline: `"Pause before you react."`
- `pause-practice` Hand · "Pause practice today" · "Notice. Pause. Observe." · → `/tool/pause-practice-guide`
- `wind-down` Wind · "Wind down routine" · "Three things, same order, every night." · → `/tool/wind-down-routine-builder`
- `boundary` Shield · "One boundary conversation" · "Ask for what you need." · → `/tool/pause-practice-guide`

**Week 5 (EVOLVE)** — headline: `"Let thinking drive."`
- `teb-loop` Brain · "TEB practice today" · "Catch the thought before the emotion." · → `/tool/teb-loop-guide`
- `identity` Sparkles · "Read your identity statement" · "Who you are decides what you do." · → `/tool/teb-loop-guide`
- `meal-prep` Utensils · "Meal prep session" · "Ninety minutes buys a week." · → `/tool/meal-prep-system-guide`

**Week 6 (EVOLVE)** — headline: `"Pattern skills, in the room."`
- `social-nav` MessageCircle · "Navigate one social moment" · "TEB works in crowds too." · → `/tool/social-situations-playbook`
- `movement-snacks` Footprints · "Three movement snacks today" · "Thirty seconds counts." · → `/tool/movement-snacks-menu`
- `energy-audit` Zap · "End-of-day energy audit" · "Gains and drains. Aim net positive." · → `/tool/energy-orchestra-planner` (gated until W10, falls back to discussion)

**Week 7 (ADAPT)** — headline: `"Tools for the storm."`
- `box-breathing` Wind · "Box breathing, twice today" · "Sixteen seconds resets the system." · → `/tool/box-breathing-guide`
- `stress-signal` Eye · "Name one stress signal" · "The body tells you first." · → `/tool/stress-signal-identifier` (gated W9, falls back to box-breathing-guide)
- `non-food-relief` Sparkles · "One non-food relief move" · "Walk. Breathe. Text. Stretch." · → `/tool/non-food-stress-relief-menu`

**Week 8 (ADAPT)** — headline: `"Floor, not ceiling."`
- `bare-min-protocol` Shield · "Bare minimum protocol drafted" · "What still happens on the worst day." · → `/tool/bare-minimum-protocol-builder`
- `apply-protocol` Hand · "Use your protocol on a hard moment" · "This is staying in the game." · → `/tool/bare-minimum-protocol-builder`
- `integration` BookOpen · "Integration reflection" · "What's working? What needs adjusting?" · → `/week/8`

**Week 9 (THRIVE)** — headline: `"Notice what's automatic."`
- `automaticity` Sparkles · "Name one habit on autopilot" · "Week 1 you couldn't. Now you do." · → `/tool/automaticity-audit`
- `stress-mastery` Eye · "Track one stress signal early" · "Catch it before it lands." · → `/tool/stress-signal-identifier`
- `energy-roi` Zap · "One ROI energy choice today" · "Spend where it matters most." · → `/tool/automaticity-audit`

**Week 10 (THRIVE)** — headline: `"Three accounts, one day."`
- `energy-plan` Sunrise · "Run morning, midday, evening" · "All three feed the next." · → `/tool/energy-orchestra-planner`
- `three-accounts` Zap · "Audit all three energy accounts" · "Physical. Intellectual. Emotional." · → `/tool/energy-orchestra-planner`
- `document` BookOpen · "Document one piece of your system" · "If you can describe it, you can repeat it." · → `/tool/my-system-documentation`

**Week 11 (EXCEL)** — headline: `"Stay aware for life."`
- `pattern-maint` Brain · "Pattern maintenance check" · "Stays solved by staying watched." · → `/tool/pattern-maintenance-system`
- `energy-orchestra` Sunrise · "Run your energy plan" · "Your unique rhythm now." · → `/tool/energy-orchestra-planner`
- `progressive` Dumbbell · "Note a strength progression" · "What's heavier than Week 1?" · → `/week/11`

**Week 12 (EXCEL)** — headline: `"This is who you are now."`
- `celebrate` Sparkles · "Celebrate one specific win" · "Name it. Out loud counts." · → `/tool/transformation-summary`
- `reflect` BookOpen · "Week 1 versus Week 12" · "The evidence in your own words." · → `/tool/transformation-summary`
- `whats-next` Compass · "One step on what's next" · "Membership. GST. Round 2." · → `/tool/whats-next-guide`

(Final copy can be refined by Karen post-spec; the structure is the spec.)

### 3.3 Engagement persistence

`user_daily_actions` table stays. Semantics shift slightly:
- `action_id` now uses HeroAnchor `id` (e.g., `w1-read-labels`) when an anchor is tapped
- A new helper `useDailyEngagement` writes an engagement record on anchor tap:
  ```ts
  // hooks/useDailyEngagement.ts
  export function useDailyEngagement(): {
    recordEngagement: (anchorId: string, weekNumber: number) => Promise<void>;
    todayEngagements: Set<string>;
    last7DaysHadEngagement: Set<string>; // ISO date strings
  };
  ```
- WeekStrip consumes `last7DaysHadEngagement` to render dots
- The existing `useDailyActions` hook stays for the Week Archive's full tracker (where the daily checklist UX lives now)

Engagement does NOT show as a checkmark on the anchor card (per the screenshot — no visible toggle state). A subtle gold underline OR no visible state at all; deferred to implementation taste.

### 3.4 Today tab structure — `app/(tabs)/today.tsx`

Full replace. Composition:

```
SafeAreaView
  ScrollView
    TodayHeader (existing — streak + "This Week" pill + avatar)
    WeekStrip   (existing — 7 day rings, today gold, engagement dots)
    GreetingHeader (existing — "Morning, {firstName}." + "Commit Block · Week 1")
    FocusHeroCard (existing — kicker "THIS WEEK'S FOCUS" + week.heroHeadline + block photo)
    SectionHeader (existing — "Today's Focus" + "N anchors" meta)
    Stack of 3 AnchorRow (existing — per heroAnchor: Icon + title + helper, tap → conceptRoute)
    SectionHeader ("Today's Workout") — NEW use
    Workout card    — reused from train tab, deep-links to /workout/[slug]
    AwarenessCard (existing — daily prompt from week.discussionPrompt)
    (dev-only) Start Over reset card — preserved from original
```

### 3.5 WeekStrip data wiring

The existing `components/history/WeekStrip.tsx` is reused. New helper:

```ts
// hooks/useWeekStripData.ts
export function useWeekStripData(): {
  days: {
    iso: string;
    dayLetter: 'M' | 'T' | 'W' | 'TH' | 'F' | 'S' | 'SU';
    dayNumber: number;
    isToday: boolean;
    hasEngagement: boolean;
  }[];
};
```

Reads from `user_daily_actions` for the last 7 days. A day "has engagement" if ≥1 record exists for that date for the current user. Dual-path (Supabase OR AsyncStorage). **Rolling 7-day window ending today** (per the screenshot: T 11, F 12, S 13, S 14, M 15, T 16, **W 17**) — today is always rightmost and gold-filled. Not a calendar week.

### 3.6 Hero photos

```ts
// lib/coachStills.ts (modify)
import type { BlockId, WeekNumber } from './program';
import { currentBlockFor } from './program';

const STILLS_BY_BLOCK: Record<BlockId, ImageSourcePropType> = {
  COMMIT: require('../assets/coach-stills/commit.jpg'),
  REFINE: require('../assets/coach-stills/refine.jpg'),
  EVOLVE: require('../assets/coach-stills/evolve.jpg'),
  ADAPT:  require('../assets/coach-stills/adapt.jpg'),
  THRIVE: require('../assets/coach-stills/thrive.jpg'),
  EXCEL:  require('../assets/coach-stills/excel.jpg'),
};

export function coachStillForBlock(blockId: BlockId): ImageSourcePropType {
  return STILLS_BY_BLOCK[blockId];
}

export function coachStillForWeek(week: WeekNumber): ImageSourcePropType {
  return coachStillForBlock(currentBlockFor(week));
}
```

Until Karen+Ryan deliver the 6 stills, all 6 entries point to the existing seed `commit-training-front.jpg` (or whatever the current asset is). Memory note for Karen+Ryan tracks the 5 missing photos.

### 3.7 Greeting + period

`components/today/GreetingHeader.tsx` already computes "Morning / Afternoon / Evening" from `getDayPeriod()`. Reuse as-is. `firstName` comes from `useProfile().profile.firstName`.

### 3.8 PrimaryFocusCard removal

The PrimaryFocusCard introduced in Phase 12 is dropped — the FocusHeroCard replaces it. The "Slides" and "Tools" deep-links migrate to the Week Archive (already linked from the workout card and elsewhere).

### 3.9 DailyActionRow + DiscussionCard fate

- `components/today/DailyActionRow.tsx` — keep, repurpose for the Week Archive's daily tracker view (next slice or this slice depending on scope).
- `components/today/DiscussionCard.tsx` — keep as-is; renders inside the existing Week Archive. Drop from Today.

## 4. Files

### Create
- `hooks/useDailyEngagement.ts` — engagement helper (writes anchor-tap events, reads today's engagements, reads 7-day rollup)
- `hooks/useWeekStripData.ts` — 7-day engagement data for WeekStrip
- `lib/heroAnchors.ts` — exports `anchorsForWeek(n)` + `heroHeadlineFor(n)` helpers reading off `Week.heroAnchors` and `Week.heroHeadline`
- `assets/coach-stills/{commit,refine,evolve,adapt,thrive,excel}.jpg` — 6 hero photos (5 placeholders until Karen+Ryan deliver)

### Modify
- `lib/program.ts` — add `HeroAnchor` type + `heroHeadline` and `heroAnchors` fields on Week
- `lib/programContent.ts` — author `heroHeadline` + 3 `heroAnchors` per week × 12 weeks (36 anchors total)
- `lib/coachStills.ts` — add `coachStillForBlock(blockId)`; `coachStillForWeek(week)` repoints through block
- `app/(tabs)/today.tsx` — full replace per §3.4
- `components/history/WeekStrip.tsx` — accept `days` prop from `useWeekStripData()`; verify rendering matches screenshot (today gold-filled, others outlined, dot if engagement)

### Leave alone (existing primitives reused)
- `components/today/TodayHeader.tsx`
- `components/today/GreetingHeader.tsx`
- `components/today/FocusHeroCard.tsx`
- `components/ui/AnchorRow.tsx`
- `components/ui/AwarenessCard.tsx`
- `components/ui/SectionHeader.tsx`
- `components/ui/PhotoHeroCard.tsx`
- `hooks/useDailyActions.ts` (still used by Week Archive)
- `supabase/migrations/0009_user_daily_actions.sql` (table semantics shift; schema unchanged)

### Delete
- `components/today/PrimaryFocusCard.tsx` (replaced by FocusHeroCard)
- `lib/commitAnchors.ts` (replaced by `Week.heroAnchors`)
- `lib/commitPrompts.ts` (replaced by `week.discussionPrompt` from AwarenessCard wiring — verify AwarenessCard accepts a prompt prop; if not, minor edit)

### Leave alone but reclassify (was used by Phase 12 Today; will be reused elsewhere later)
- `components/today/DiscussionCard.tsx` — Phase 12 used it on Today; this slice drops it from Today but the component stays in the tree for a future Week Archive enrichment slice.

## 5. Out of scope (deferred to follow-up slices)

- **Karen + Ryan delivering the 6 block photos.** This slice ships with all 6 keys pointing to the existing seed photo; Karen+Ryan replace per-block as photos land.
- **Karen authoring final anchor copy.** Spec proposes copy in §3.2; Karen can revise after implementation lands. The structure is what's spec'd.
- **6th universal pattern** (per Karen's beta brief). Lands when Karen authors it.
- **3-layer content model migration** (Beta 2 brief §2). HeroAnchor already reserves a `layerSet` shape for future use, but Today doesn't render the layers yet.
- **Self-serve routing + 6-limiter taxonomy** (Beta 2 brief §3). Out for Beta 2.
- **POWER Meals module assembly** (Beta 2 brief content gap).
- **Telemetry instrumentation** (Beta 2 brief §4). Engagement events land in `user_daily_actions`; analytics extraction is a separate slice.
- **Block orientation split** (navigation vs teaching, per Beta 2 brief). Lives in Week Archive refactor, separate slice.
- **Week Archive's full daily tracker UI** — re-uses the `DailyActionRow` we keep; UI build is a follow-up slice.

## 6. Definition of done

- [ ] Today tab matches the screenshot pixel-close
- [ ] Per-week authored `heroAnchors` (3 each, 36 total) and `heroHeadline` (12 total) compile and render
- [ ] Tapping an anchor routes to its `conceptRoute` AND records an engagement event in `user_daily_actions`
- [ ] WeekStrip shows 7 day rings; today's is gold-filled; days with ≥1 engagement show a dot
- [ ] GreetingHeader reads "{Period}, {firstName}." with the user's profile firstName
- [ ] FocusHeroCard renders the block photo for the current week
- [ ] SectionHeader "Today's Focus" shows "3 anchors" meta
- [ ] Today's Workout card renders slot 1 workout for the block and routes to `/workout/[slug]` on tap
- [ ] AwarenessCard renders `week.discussionPrompt`
- [ ] Dev session shows the Start Over reset card at the bottom
- [ ] `npm run typecheck` clean
- [ ] No "Coming soon" anywhere, no em dashes, no countdowns/shaming

## 7. Open product items (defaults noted)

| Item | Default | Owner |
|------|---------|-------|
| 6 hero photos per block | Use existing seed for all 6 until delivered | Karen + Ryan |
| Final anchor copy per week | Spec copy in §3.2 ships as v1 | Karen revises post-implementation |
| Engagement visual treatment on anchor cards | No visible done state on the card (matches screenshot) | Confirm with user; alternative is a subtle gold underline |
| WeekStrip orientation | Rolling 7-day window ending today (today rightmost, gold-filled) | Confirmed from screenshot |
| "Three things, every plate." headline for Week 1 | Verbatim from screenshot | Karen can revise |
| Anchor conceptRoute targets when concept is gated | Fall back to nutrition-track-chooser or week archive when locked | Confirm direction |
| 6th pattern in Week 1 anchor target | Currently routes to fiveUniversalPatterns; add a TODO to rename when Karen delivers 6th | Karen authors |
| Block-specific awareness prompts | Use `week.discussionPrompt` (already authored) | Confirmed |
