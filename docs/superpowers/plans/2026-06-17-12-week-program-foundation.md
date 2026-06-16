# 12-Week CREATE POWER Program Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 6-thread × 6-block curriculum with a week-based 12-week structure matching Karen's canonical map. Author all 12 weeks of content + 24 Tools + 4 distinct workout templates as native screens. Wire daily action checklist on Today tab with persistence. Gate progressive feature unlocks tied to current week. Refactor Grow tab into a week archive.

**Architecture:** Pure-data modules (`lib/program.ts`, `lib/programContent.ts`, `lib/tools.ts`, `lib/toolContent/*.ts`, `lib/workoutTemplates.ts`, `lib/unlocks.ts`) feed a small set of presentational components and route screens. Two new dual-path hooks (`useDailyActions`, `useCurrentWeek`) wire to Supabase + AsyncStorage. Today tab becomes the daily checklist spine; Grow tab becomes the week archive; Fuel tab gates on Week 3.

**Tech Stack:** TypeScript, React Native, Expo Router, Supabase (Postgres + RLS), AsyncStorage (dev mode), zustand (active workout — untouched), brand tokens from `lib/brand.ts`, light-locked surfaces.

**Verification gate:** `npm run typecheck` (sole static check per CLAUDE.md). Each phase ends typecheck-clean with its own commit.

**Hard constraints across every phase:**
- **No "Coming soon" anywhere** — locked features hidden entirely, not labeled as locked
- **No em dashes** in any user-facing copy (use periods, commas, or restructure)
- **No countdowns, deadlines, time-pressure, or shaming language**
- **Light-locked surfaces** — use `useThemeColors()` + `THEME_COLORS.light` references following existing program-surface pattern
- **Pressable + flex layout memory** — when wrapping a card in Pressable, the inner View carries layout, the Pressable only carries `opacity` + sizing
- **Workout names** stay "Workout 1/2/3/4," never body-part labels (helper text can describe focus)
- **Dual-path data layer** — every hook works in BOTH Supabase mode AND dev mode (AsyncStorage fallback under `tel:<scope>:<userId>:<key>`)
- **Migrations** — numbered sequentially, GRANT statements BEFORE `ENABLE ROW LEVEL SECURITY`, default `GRANT SELECT, INSERT, UPDATE, DELETE TO authenticated; GRANT ALL TO service_role`
- **Commit identity** — git author missing on this Mac; every commit must be issued via `git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit ...`

---

## File Structure (decomposition lock)

### Create
- `lib/program.ts` — 12-week data model (types + helpers + empty exports)
- `lib/programContent.ts` — `BLOCKS` and `WEEKS` records authored from Karen's map
- `lib/tools.ts` — Tool registry (type + 24-entry record + helpers)
- `lib/toolContent/*.ts` — 24 individual files (one per Tool body)
- `lib/unlocks.ts` — unlock schedule + helpers
- `lib/workoutTemplates.ts` — LOWER_BODY, UPPER_PUSH, UPPER_PULL, FULL_BODY compositions
- `hooks/useDailyActions.ts` — dual-path completion persistence
- `hooks/useCurrentWeek.ts` — derives `{ weekNumber, blockId }` from profile/membership
- `components/today/DailyActionRow.tsx` — single checklist row
- `components/today/PrimaryFocusCard.tsx`
- `components/today/DiscussionCard.tsx`
- `components/tool/StaticPageBody.tsx`
- `components/tool/ChecklistBody.tsx`
- `components/tool/MenuListBody.tsx`
- `components/tool/FillInTemplateBody.tsx`
- `app/tool/[slug].tsx`
- `app/week/[n].tsx`
- `supabase/migrations/0009_user_daily_actions.sql`
- `supabase/migrations/0010_profiles_current_week.sql`

### Refactor (full replace)
- `app/(tabs)/today.tsx` — daily checklist spine
- `app/(tabs)/grow.tsx` — week archive
- `app/(tabs)/fuel.tsx` — gated content (NutritionTrackChooser pre-W3, meal-log scaffold W3+)
- `app/(tabs)/_layout.tsx` — gate Fuel tab on `meal-logging` unlock
- `lib/workoutSchedule.ts` — emit templates instead of empty arrays
- `hooks/useCoachContext.ts` — rewire to new program model (no LLM yet)

### Touch lightly
- `app/(tabs)/train.tsx` — header reads `Block.mindset` + `Week {n}`
- `app/workout/[id].tsx` — remove `isStubWorkout` branch
- `app/_layout.tsx` — register `tool/[slug]` + `week/[n]` routes

### Rename
- `hooks/useSectionProgress.ts` → `hooks/useWeekProgress.ts` — week is "complete" when ≥70% of its actions done at least once that week

### Delete
- `lib/curriculum.ts`
- `app/grow/[block].tsx`, `app/grow/[block]/[slug].tsx`
- `components/workout/StubWorkoutCard.tsx`
- `components/grow/WorkoutLessonView.tsx`, `components/grow/EducationalLessonView.tsx`

### Leave alone
- `app/workout/active/[sessionId].tsx`, `app/workout/complete/[sessionId].tsx`
- `components/workout/ActiveSetLogger.tsx`, `ProgressionTable.tsx`, `RestTimerOverlay.tsx`
- `lib/exerciseLibrary.ts`, `lib/workoutSessionAdapter.ts`
- `stores/activeWorkout.ts`
- `app/exercise/[id].tsx`

---

## Phase 1: Data model — `lib/program.ts`

**Goal:** Ship the types, helpers, and empty `BLOCKS`/`WEEKS` exports. Content authoring lands in Phase 2.

**Files:**
- Create: `lib/program.ts`

### Task 1.1: Create the data model

- [ ] **Step 1: Write `lib/program.ts`**

```ts
// lib/program.ts
//
// The CREATE POWER 12-week program data model. Replaces the old 6-thread
// x 6-block curriculum. Authored content lives in lib/programContent.ts.

export type WeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export const WEEK_NUMBERS: readonly WeekNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export type BlockId = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';
export const BLOCK_IDS: readonly BlockId[] = ['COMMIT', 'REFINE', 'EVOLVE', 'ADAPT', 'THRIVE', 'EXCEL'];

export type ThreadLetter = 'P' | 'O' | 'W' | 'E' | 'R';
export const THREAD_NAMES: Record<ThreadLetter, string> = {
  P: 'Patterns',
  O: 'Ownership',
  W: 'Wisdom',
  E: 'Energy',
  R: 'Resilience',
};

export type CompassRole = 'PRIMARY' | 'SECONDARY' | 'MAINTAIN';

export type ActionItem = {
  id: string;
  label: string;
  thread: ThreadLetter;
  weeklyTarget: number;
};

export type Week = {
  weekNumber: WeekNumber;
  blockId: BlockId;
  title: string;
  primaryFocus: string;
  slideNotes: string[];
  weekAtAGlance: ActionItem[];
  toolSlugs: string[];
  discussionPrompt: string;
};

export type Block = {
  blockId: BlockId;
  weekRange: [WeekNumber, WeekNumber];
  mindset: string;
  consistencyTarget: string;
  powerCompass: Record<ThreadLetter, { role: CompassRole; note: string }>;
};

import { BLOCKS, WEEKS } from './programContent';

export { BLOCKS, WEEKS };

export function weekFor(n: WeekNumber): Week {
  const w = WEEKS.find((w) => w.weekNumber === n);
  if (!w) throw new Error(`Week ${n} not found`);
  return w;
}

export function blockFor(id: BlockId): Block {
  const b = BLOCKS.find((b) => b.blockId === id);
  if (!b) throw new Error(`Block ${id} not found`);
  return b;
}

export function currentBlockFor(week: WeekNumber): BlockId {
  const map: Record<WeekNumber, BlockId> = {
    1: 'COMMIT', 2: 'COMMIT',
    3: 'REFINE', 4: 'REFINE',
    5: 'EVOLVE', 6: 'EVOLVE',
    7: 'ADAPT',  8: 'ADAPT',
    9: 'THRIVE', 10: 'THRIVE',
    11: 'EXCEL', 12: 'EXCEL',
  };
  return map[week];
}

export function weeksInBlock(blockId: BlockId): Week[] {
  return WEEKS.filter((w) => w.blockId === blockId);
}
```

- [ ] **Step 2: Create a stub `lib/programContent.ts` so the typecheck passes**

```ts
// lib/programContent.ts
//
// Authored content for all 12 weeks. Phase 2 fills this in fully.

import type { Block, Week } from './program';

export const BLOCKS: readonly Block[] = [];
export const WEEKS: readonly Week[] = [];
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: clean. (Existing `lib/curriculum.ts` still exists and is still imported by other files; this phase doesn't touch them.)

- [ ] **Step 4: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/program.ts lib/programContent.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add lib/program.ts data model with empty content shell

Types, helpers, and BLOCKS/WEEKS re-exports. Authored content lands
in the next phase.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: Author all 12 weeks + 6 blocks — `lib/programContent.ts`

**Goal:** Replace the stub with the full canonical content from Karen's 12-week curriculum map. All slide notes converted to no-em-dash phrasing, all weekAtAGlance actions tagged with P/O/W/E/R, all 6 powerCompass blocks authored.

**Files:**
- Modify: `lib/programContent.ts` (full replace)

### Task 2.1: Author the full content

- [ ] **Step 1: Overwrite `lib/programContent.ts`**

```ts
// lib/programContent.ts
//
// Authored content for all 12 weeks of CREATE POWER, from Karen's
// canonical 12-Week Curriculum Map + V2 Actions Tracker (Dec 2025
// corrected revision). Slide notes are paraphrased to remove em dashes
// per the no-em-dash project memory. Weekly targets are derived from
// the per-block "Block Target" in the Actions Tracker PDF, divided by 2.

import type { Block, Week } from './program';

export const BLOCKS: readonly Block[] = [
  {
    blockId: 'COMMIT',
    weekRange: [1, 2],
    mindset:
      "You're building the foundation for everything that follows. Showing up at 40 to 50% beats optimizing at 0%. Begin noticing how small choices connect to bigger outcomes. This is the start of systems thinking.",
    consistencyTarget: '40 to 50%',
    powerCompass: {
      P: { role: 'PRIMARY', note: 'Spot patterns and triggers' },
      O: { role: 'SECONDARY', note: 'Small consistent steps' },
      W: { role: 'PRIMARY', note: 'Sugar, whole foods, move' },
      E: { role: 'MAINTAIN', note: 'Just notice energy peaks' },
      R: { role: 'MAINTAIN', note: 'Consistent bedtime' },
    },
  },
  {
    blockId: 'REFINE',
    weekRange: [3, 4],
    mindset:
      'Motivation will likely dip around Week 3. That is expected and temporary. Refusing to quit matters more than optimizing. This is where you start designing your first systems by making healthy choices the default through environment setup, meal prep, and scheduling.',
    consistencyTarget: '50 to 60%',
    powerCompass: {
      P: { role: 'SECONDARY', note: 'TEB loop: pause before reacting' },
      O: { role: 'PRIMARY', note: 'Design your environment for success' },
      W: { role: 'PRIMARY', note: 'ABC Power Meals, eat to 80% full' },
      E: { role: 'MAINTAIN', note: 'Keep noticing energy patterns' },
      R: { role: 'SECONDARY', note: 'Wind down routine, expect the dip' },
    },
  },
  {
    blockId: 'EVOLVE',
    weekRange: [5, 6],
    mindset:
      "Skills are becoming automatic. Notice: this is just who you are now. Your general habits are ready to become specific personal systems. How you prep food, when you train, what your rest routine looks like, step by step.",
    consistencyTarget: '60 to 70%',
    powerCompass: {
      P: { role: 'PRIMARY', note: 'Pattern skills in social settings' },
      O: { role: 'PRIMARY', note: 'Identity shift: I am someone who' },
      W: { role: 'SECONDARY', note: 'ABC Power Meals as default; eating to 80%' },
      E: { role: 'SECONDARY', note: 'Three accounts: end of day audit' },
      R: { role: 'MAINTAIN', note: 'Sleep environment, keep what REFINE built' },
    },
  },
  {
    blockId: 'ADAPT',
    weekRange: [7, 8],
    mindset:
      "Stress tests your systems. That is useful data, not failure. Stress reveals which systems hold and which need to flex. What needs to bend while keeping your foundation solid? This block is about discovering you're stronger for it.",
    consistencyTarget: '70 to 80%',
    powerCompass: {
      P: { role: 'PRIMARY', note: 'Recognize the need behind the pattern' },
      O: { role: 'SECONDARY', note: 'Own setbacks, bare minimum protocols' },
      W: { role: 'MAINTAIN', note: 'Flexible consistency, best options' },
      E: { role: 'SECONDARY', note: 'Emotional energy, boundaries' },
      R: { role: 'PRIMARY', note: 'Box breathing, build antifragility' },
    },
  },
  {
    blockId: 'THRIVE',
    weekRange: [9, 10],
    mindset:
      "You're not trying anymore. This is how you live. Document the systems that are working. If you can describe it, you can repeat it. Your actions from here forward are self directed. Choose what matters most for your continued growth.",
    consistencyTarget: '80% and up',
    powerCompass: {
      P: { role: 'PRIMARY', note: 'Create your personal pattern guide' },
      O: { role: 'PRIMARY', note: 'Reflect on your identity transformation' },
      W: { role: 'SECONDARY', note: 'Optimize workout nutrition' },
      E: { role: 'SECONDARY', note: 'Three accounts: physical, intellectual, emotional' },
      R: { role: 'SECONDARY', note: 'Fine tune protocols, know your stress signals' },
    },
  },
  {
    blockId: 'EXCEL',
    weekRange: [11, 12],
    mindset:
      "This isn't the end. It's the foundation for your next chapter. Your systems are your lifestyle now. What you've built continues beyond this program. Take time to celebrate how far you've come and plan what comes next.",
    consistencyTarget: '80% and up',
    powerCompass: {
      P: { role: 'PRIMARY', note: 'Celebrate mastery, document what works' },
      O: { role: 'SECONDARY', note: 'Small consistent steps' },
      W: { role: 'MAINTAIN', note: 'Nutrition and strength are your lifestyle' },
      E: { role: 'PRIMARY', note: 'Document your energy routines' },
      R: { role: 'PRIMARY', note: 'Complete resilience toolkit, antifragility lived' },
    },
  },
];

export const WEEKS: readonly Week[] = [
  {
    weekNumber: 1,
    blockId: 'COMMIT',
    title: 'Week 1: Awareness and First Steps',
    primaryFocus: 'Identify your stuck patterns and choose a nutrition track.',
    slideNotes: [
      'Welcome to Week 1. Here is what to expect.',
      'The 5 Universal Patterns. Which one is yours?',
      'Two Nutrition Tracks explained: Blood Sugar versus Processed Food.',
      'Seventy percent consistency beats one hundred percent perfection.',
      'Sleep foundation. Pick your bedtime.',
      "This week's actions in a simple checklist.",
    ],
    weekAtAGlance: [
      { id: 'w1-notice-patterns', label: 'Notice and name one pattern today', thread: 'P', weeklyTarget: 7 },
      { id: 'w1-nutrition-track', label: 'Choose your nutrition track for today', thread: 'W', weeklyTarget: 7 },
      { id: 'w1-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 2 },
      { id: 'w1-walk', label: 'Walk', thread: 'W', weeklyTarget: 3 },
      { id: 'w1-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 5 },
    ],
    toolSlugs: ['five-universal-patterns', 'nutrition-track-chooser'],
    discussionPrompt: 'Which pattern did you identify as your main one? Share with the group.',
  },
  {
    weekNumber: 2,
    blockId: 'COMMIT',
    title: 'Week 2: Building Momentum',
    primaryFocus: 'Add the second nutrition track. Movement for energy. Sleep environment.',
    slideNotes: [
      'Week 2. You made it through Week 1.',
      'Adding the second nutrition track.',
      'Movement breaks for energy. Five minutes is high ROI.',
      'Sleep environment basics.',
      'Stacking without dropping.',
      'A note about Weeks 3 and 4: the motivation dip is coming. Prepare now.',
    ],
    weekAtAGlance: [
      { id: 'w2-both-tracks', label: 'Use both nutrition tracks today', thread: 'W', weeklyTarget: 7 },
      { id: 'w2-movement-break', label: 'One movement break today', thread: 'W', weeklyTarget: 5 },
      { id: 'w2-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 2 },
      { id: 'w2-walk', label: 'Walk', thread: 'W', weeklyTarget: 3 },
      { id: 'w2-energy-notice', label: 'Notice how your energy feels today', thread: 'E', weeklyTarget: 7 },
      { id: 'w2-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 5 },
      { id: 'w2-sleep-env', label: 'One sleep environment tweak today', thread: 'R', weeklyTarget: 5 },
    ],
    toolSlugs: ['movement-breaks-menu', 'sleep-environment-checklist'],
    discussionPrompt: "What's one thing that's already feeling easier than Day 1?",
  },
  {
    weekNumber: 3,
    blockId: 'REFINE',
    title: 'Week 3: Environment Design',
    primaryFocus: 'Design your environment for success. Whole protein emphasis.',
    slideNotes: [
      'Welcome to the dip. This is normal.',
      'Why environment beats willpower. A short neuroscience note.',
      'Kitchen Environment Reset. Plan 30 to 45 minutes.',
      'Workout environment setup.',
      'ABC Power Meals. Protein prioritization.',
      'Your systems carry you when motivation drops.',
    ],
    weekAtAGlance: [
      { id: 'w3-kitchen-reset', label: 'One kitchen reset action today', thread: 'O', weeklyTarget: 5 },
      { id: 'w3-abc-meal', label: 'Build one ABC Power Meal today', thread: 'W', weeklyTarget: 7 },
      { id: 'w3-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w3-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w3-energy-notice', label: 'Notice how your energy feels today', thread: 'E', weeklyTarget: 7 },
      { id: 'w3-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 5 },
    ],
    toolSlugs: ['kitchen-reset-guide', 'abc-power-meals-guide'],
    discussionPrompt: 'Post a photo of your kitchen reset (fridge, pantry, or workout space).',
  },
  {
    weekNumber: 4,
    blockId: 'REFINE',
    title: 'Week 4: The Pause Practice',
    primaryFocus: 'Notice, pause, observe. Wind down routine.',
    slideNotes: [
      "You survived the hardest week. You're a dip survivor.",
      'The Pause Practice: Notice, Pause, Observe.',
      'Creating space before reacting. Not changing yet.',
      'Boundary conversations. Asking for what you need.',
      'Wind down routine introduction.',
      "Week 5 is where things get easier. You're building the base.",
    ],
    weekAtAGlance: [
      { id: 'w4-pause-practice', label: 'Pause practice when a trigger lands', thread: 'P', weeklyTarget: 5 },
      { id: 'w4-boundary', label: 'One boundary conversation this week', thread: 'O', weeklyTarget: 1 },
      { id: 'w4-abc-meal', label: 'Build one ABC Power Meal today', thread: 'W', weeklyTarget: 7 },
      { id: 'w4-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w4-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w4-wind-down', label: 'Wind down routine before bed', thread: 'R', weeklyTarget: 5 },
      { id: 'w4-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 5 },
    ],
    toolSlugs: ['pause-practice-guide', 'wind-down-routine-builder'],
    discussionPrompt: 'What does your wind down routine look like? Share what you are trying.',
  },
  {
    weekNumber: 5,
    blockId: 'EVOLVE',
    title: 'Week 5: TEB Loop and Meal Prep',
    primaryFocus: 'TEB Loop. Identity statements. Meal prep system.',
    slideNotes: [
      'Things should feel easier now. Acknowledge progress.',
      'TEB Loop: Thinking, Emotion, Behavior.',
      'Let thinking drive your behavior, not emotion.',
      'Identity statements. I am someone who.',
      'Meal Prep System. Ninety minutes equals a week of easy choices.',
      "You're evolving from trying to being.",
    ],
    weekAtAGlance: [
      { id: 'w5-teb', label: 'TEB practice when a pattern shows up', thread: 'P', weeklyTarget: 5 },
      { id: 'w5-identity', label: 'Read and apply your identity statement', thread: 'O', weeklyTarget: 7 },
      { id: 'w5-meal-prep', label: 'Meal prep session', thread: 'W', weeklyTarget: 1 },
      { id: 'w5-abc-meal', label: 'Build ABC Power Meals today', thread: 'W', weeklyTarget: 7 },
      { id: 'w5-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w5-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w5-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 6 },
    ],
    toolSlugs: ['teb-loop-guide', 'meal-prep-system-guide'],
    discussionPrompt: 'Complete this: I am someone who __________. Share your identity statement.',
  },
  {
    weekNumber: 6,
    blockId: 'EVOLVE',
    title: 'Week 6: Social Navigation',
    primaryFocus: 'Social pattern navigation. Anti inflammatory focus. Movement snacks.',
    slideNotes: [
      "Halfway there. What's automatic now?",
      'Social situations: parties, dinners, sabotage.',
      'Using TEB in complex environments.',
      'Anti inflammatory foods. Colorful vegetables.',
      'Movement snacks. Thirty second micro movements.',
      'Recovery assessment. Good soreness versus bad pain.',
    ],
    weekAtAGlance: [
      { id: 'w6-social-nav', label: 'Navigate one social situation with TEB', thread: 'P', weeklyTarget: 2 },
      { id: 'w6-identity', label: 'Read and apply your identity statement', thread: 'O', weeklyTarget: 7 },
      { id: 'w6-movement-snack', label: 'Three or more movement snacks today', thread: 'W', weeklyTarget: 5 },
      { id: 'w6-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w6-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w6-energy-audit', label: 'End of day audit: gains and drains', thread: 'E', weeklyTarget: 5 },
      { id: 'w6-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 6 },
    ],
    toolSlugs: ['social-situations-playbook', 'movement-snacks-menu'],
    discussionPrompt: 'What social situation did you navigate this week? How did it go?',
  },
  {
    weekNumber: 7,
    blockId: 'ADAPT',
    title: 'Week 7: Stress Tools',
    primaryFocus: 'Box breathing. Recognize stress signals. Non food stress relief.',
    slideNotes: [
      "Life will test you. Let's prepare.",
      'Box Breathing: 4 4 4 4 technique.',
      'When patterns intensify under stress.',
      'Recognizing your stress signals.',
      'Non food stress relief options.',
      'A preview of what to do when everything falls apart.',
    ],
    weekAtAGlance: [
      { id: 'w7-breathing-am', label: 'Box breathing in the morning', thread: 'R', weeklyTarget: 7 },
      { id: 'w7-breathing-pm', label: 'Box breathing in the evening', thread: 'R', weeklyTarget: 7 },
      { id: 'w7-stress-signal', label: 'Name one stress signal today', thread: 'P', weeklyTarget: 5 },
      { id: 'w7-non-food', label: 'Use one non food stress relief option', thread: 'P', weeklyTarget: 5 },
      { id: 'w7-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w7-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w7-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 6 },
    ],
    toolSlugs: ['box-breathing-guide', 'non-food-stress-relief-menu'],
    discussionPrompt: 'What are your early stress signals? How does your body tell you?',
  },
  {
    weekNumber: 8,
    blockId: 'ADAPT',
    title: 'Week 8: Bare Minimum Protocol',
    primaryFocus: 'Crisis protocol. Flexible consistency. Integration check.',
    slideNotes: [
      'Bare Minimum Protocol. Your crisis plan.',
      "What counts when everything's falling apart.",
      'Flexible consistency versus rigid perfection.',
      'Mid program integration check.',
      'What is working? What needs adjustment?',
      'A preview of Weeks 9 and 10. Automaticity begins.',
    ],
    weekAtAGlance: [
      { id: 'w8-protocol-created', label: 'Bare minimum protocol drafted', thread: 'R', weeklyTarget: 1 },
      { id: 'w8-protocol-applied', label: 'Apply protocol on a hard day', thread: 'R', weeklyTarget: 2 },
      { id: 'w8-integration', label: 'Integration reflection today', thread: 'O', weeklyTarget: 3 },
      { id: 'w8-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w8-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w8-energy-audit', label: 'End of day audit: gains and drains', thread: 'E', weeklyTarget: 5 },
      { id: 'w8-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 6 },
    ],
    toolSlugs: ['bare-minimum-protocol-builder'],
    discussionPrompt: "What's your bare minimum when life gets hard? Share your protocol.",
  },
  {
    weekNumber: 9,
    blockId: 'THRIVE',
    title: 'Week 9: Automaticity Audit',
    primaryFocus: 'What is automatic now? Advanced sleep optimization. Energy ROI.',
    slideNotes: [
      "What's automatic now versus Week 1?",
      'Automaticity Audit. Where are you?',
      'Advanced sleep optimization.',
      'Stress signal mastery.',
      'Energy management. ROI thinking.',
      'Systems are running. Trust them.',
    ],
    weekAtAGlance: [
      { id: 'w9-automaticity', label: 'Name one habit that is now automatic', thread: 'O', weeklyTarget: 5 },
      { id: 'w9-energy-roi', label: 'One energy ROI choice today', thread: 'E', weeklyTarget: 5 },
      { id: 'w9-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w9-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w9-stress-signal', label: 'Track one stress signal today', thread: 'R', weeklyTarget: 5 },
      { id: 'w9-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 6 },
    ],
    toolSlugs: ['automaticity-audit', 'stress-signal-identifier'],
    discussionPrompt: 'What habit that was hard in Week 1 is now automatic?',
  },
  {
    weekNumber: 10,
    blockId: 'THRIVE',
    title: 'Week 10: Energy Orchestra',
    primaryFocus: 'Three energy accounts. Antifragility system. System documentation.',
    slideNotes: [
      'Your daily energy flow. Morning, midday, evening.',
      'Energy Orchestra. All routines working together.',
      'Three energy accounts: physical, intellectual, emotional.',
      "Documentation. What's your personal system?",
      'Recovery. When to push versus rest.',
      'Two weeks left. Celebration planning.',
    ],
    weekAtAGlance: [
      { id: 'w10-energy-plan', label: 'Run your morning, midday, evening plan', thread: 'E', weeklyTarget: 7 },
      { id: 'w10-three-accounts', label: 'Audit all three energy accounts today', thread: 'E', weeklyTarget: 5 },
      { id: 'w10-document', label: 'Document one piece of your system', thread: 'O', weeklyTarget: 5 },
      { id: 'w10-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w10-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w10-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 6 },
    ],
    toolSlugs: ['energy-orchestra-planner', 'my-system-documentation'],
    discussionPrompt: 'What would you tell Week 1 you about this journey?',
  },
  {
    weekNumber: 11,
    blockId: 'EXCEL',
    title: 'Week 11: Pattern Maintenance System',
    primaryFocus: 'Pattern maintenance. Energy Orchestra refinement.',
    slideNotes: [
      "Your pattern mastery. What's conquered?",
      'Pattern maintenance. Staying aware for life.',
      'Applying pattern skills to all life areas.',
      'Your unique rhythm. What works for you.',
      "Crowding out. What's naturally gone?",
      'A preview of Week 12. Celebration and what is next.',
    ],
    weekAtAGlance: [
      { id: 'w11-pattern-maint', label: 'Pattern maintenance check today', thread: 'P', weeklyTarget: 5 },
      { id: 'w11-energy-plan', label: 'Run your morning, midday, evening plan', thread: 'E', weeklyTarget: 7 },
      { id: 'w11-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w11-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
      { id: 'w11-bedtime', label: 'Bedtime within 30 minutes of plan', thread: 'R', weeklyTarget: 6 },
    ],
    toolSlugs: ['pattern-maintenance-system'],
    discussionPrompt: 'What pattern that used to own you is now under your control?',
  },
  {
    weekNumber: 12,
    blockId: 'EXCEL',
    title: 'Week 12: Celebration and Continuation',
    primaryFocus: 'Celebrate transformation. Plan continuation.',
    slideNotes: [
      'You did it. Transformation complete.',
      'Week 1 versus Week 12. The evidence.',
      'Your wins collection. Look at what you built.',
      "What's next: GST, Alumni, Round 2 options.",
      'Could you teach this? You are now the expert on you.',
      'This is who you are now, not what you do.',
    ],
    weekAtAGlance: [
      { id: 'w12-celebrate', label: 'Celebrate one specific win today', thread: 'O', weeklyTarget: 5 },
      { id: 'w12-reflect', label: 'Reflect on a Week 1 versus Week 12 difference', thread: 'P', weeklyTarget: 5 },
      { id: 'w12-plan-next', label: 'Take one step on the what is next plan', thread: 'O', weeklyTarget: 3 },
      { id: 'w12-workout', label: 'Strength workout', thread: 'W', weeklyTarget: 3 },
      { id: 'w12-walk', label: 'Walk', thread: 'W', weeklyTarget: 4 },
    ],
    toolSlugs: ['transformation-summary', 'whats-next-guide'],
    discussionPrompt: 'Share your biggest transformation. What changed for you?',
  },
];
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Sanity check counts**

Run: `grep -c "weekNumber:" lib/programContent.ts`
Expected: `12`

Run: `grep -c "blockId: '" lib/programContent.ts | head -1`
Expected: at least `18` (6 blocks + 12 weeks).

- [ ] **Step 4: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/programContent.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Author all 12 weeks + 6 blocks from Karen's curriculum map

Slide notes paraphrased to remove em dashes per the project memory.
Daily action items tagged with P/O/W/E/R threads. Power Compass per
block authored from the Actions Tracker PDF callouts.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3: Tools registry + first batch of bodies

**Goal:** Ship `lib/tools.ts` registry + the first 8 tool body files (Weeks 0–3). Tool routes/screens land in a later phase; this is pure data.

**Files:**
- Create: `lib/tools.ts`
- Create: `lib/toolContent/initialQuestionnaire.ts`
- Create: `lib/toolContent/habitsOverChecklists.ts`
- Create: `lib/toolContent/fiveUniversalPatterns.ts`
- Create: `lib/toolContent/nutritionTrackChooser.ts`
- Create: `lib/toolContent/movementBreaksMenu.ts`
- Create: `lib/toolContent/sleepEnvironmentChecklist.ts`
- Create: `lib/toolContent/kitchenResetGuide.ts`
- Create: `lib/toolContent/abcPowerMealsGuide.ts`

### Task 3.1: Tools registry

- [ ] **Step 1: Write `lib/tools.ts`**

```ts
// lib/tools.ts
//
// Tool registry. Each Tool is a one page native screen drawn from Karen's
// canonical curriculum map descriptions. Bodies live in lib/toolContent/.

import type { WeekNumber } from './program';

export type ToolSlug =
  | 'initial-questionnaire'
  | 'habits-over-checklists'
  | 'five-universal-patterns'
  | 'nutrition-track-chooser'
  | 'movement-breaks-menu'
  | 'sleep-environment-checklist'
  | 'kitchen-reset-guide'
  | 'abc-power-meals-guide'
  | 'pause-practice-guide'
  | 'wind-down-routine-builder'
  | 'teb-loop-guide'
  | 'meal-prep-system-guide'
  | 'social-situations-playbook'
  | 'movement-snacks-menu'
  | 'box-breathing-guide'
  | 'non-food-stress-relief-menu'
  | 'bare-minimum-protocol-builder'
  | 'automaticity-audit'
  | 'stress-signal-identifier'
  | 'energy-orchestra-planner'
  | 'my-system-documentation'
  | 'pattern-maintenance-system'
  | 'transformation-summary'
  | 'whats-next-guide';

export type ToolBody =
  | { kind: 'static-page'; intro?: string; sections: { heading: string; body: string }[] }
  | { kind: 'checklist'; intro?: string; items: { id: string; label: string }[] }
  | { kind: 'menu-list'; intro?: string; items: { title: string; body: string }[] }
  | { kind: 'fill-in-template'; intro?: string; fields: { id: string; label: string; placeholder?: string }[] };

export type Tool = {
  slug: ToolSlug;
  title: string;
  introducedInWeek: WeekNumber | 0;
  isStar: boolean;
  body: ToolBody;
};

import { initialQuestionnaire } from './toolContent/initialQuestionnaire';
import { habitsOverChecklists } from './toolContent/habitsOverChecklists';
import { fiveUniversalPatterns } from './toolContent/fiveUniversalPatterns';
import { nutritionTrackChooser } from './toolContent/nutritionTrackChooser';
import { movementBreaksMenu } from './toolContent/movementBreaksMenu';
import { sleepEnvironmentChecklist } from './toolContent/sleepEnvironmentChecklist';
import { kitchenResetGuide } from './toolContent/kitchenResetGuide';
import { abcPowerMealsGuide } from './toolContent/abcPowerMealsGuide';
import { pausePracticeGuide } from './toolContent/pausePracticeGuide';
import { windDownRoutineBuilder } from './toolContent/windDownRoutineBuilder';
import { tebLoopGuide } from './toolContent/tebLoopGuide';
import { mealPrepSystemGuide } from './toolContent/mealPrepSystemGuide';
import { socialSituationsPlaybook } from './toolContent/socialSituationsPlaybook';
import { movementSnacksMenu } from './toolContent/movementSnacksMenu';
import { boxBreathingGuide } from './toolContent/boxBreathingGuide';
import { nonFoodStressReliefMenu } from './toolContent/nonFoodStressReliefMenu';
import { bareMinimumProtocolBuilder } from './toolContent/bareMinimumProtocolBuilder';
import { automaticityAudit } from './toolContent/automaticityAudit';
import { stressSignalIdentifier } from './toolContent/stressSignalIdentifier';
import { energyOrchestraPlanner } from './toolContent/energyOrchestraPlanner';
import { mySystemDocumentation } from './toolContent/mySystemDocumentation';
import { patternMaintenanceSystem } from './toolContent/patternMaintenanceSystem';
import { transformationSummary } from './toolContent/transformationSummary';
import { whatsNextGuide } from './toolContent/whatsNextGuide';

export const TOOLS: Record<ToolSlug, Tool> = {
  'initial-questionnaire': initialQuestionnaire,
  'habits-over-checklists': habitsOverChecklists,
  'five-universal-patterns': fiveUniversalPatterns,
  'nutrition-track-chooser': nutritionTrackChooser,
  'movement-breaks-menu': movementBreaksMenu,
  'sleep-environment-checklist': sleepEnvironmentChecklist,
  'kitchen-reset-guide': kitchenResetGuide,
  'abc-power-meals-guide': abcPowerMealsGuide,
  'pause-practice-guide': pausePracticeGuide,
  'wind-down-routine-builder': windDownRoutineBuilder,
  'teb-loop-guide': tebLoopGuide,
  'meal-prep-system-guide': mealPrepSystemGuide,
  'social-situations-playbook': socialSituationsPlaybook,
  'movement-snacks-menu': movementSnacksMenu,
  'box-breathing-guide': boxBreathingGuide,
  'non-food-stress-relief-menu': nonFoodStressReliefMenu,
  'bare-minimum-protocol-builder': bareMinimumProtocolBuilder,
  'automaticity-audit': automaticityAudit,
  'stress-signal-identifier': stressSignalIdentifier,
  'energy-orchestra-planner': energyOrchestraPlanner,
  'my-system-documentation': mySystemDocumentation,
  'pattern-maintenance-system': patternMaintenanceSystem,
  'transformation-summary': transformationSummary,
  'whats-next-guide': whatsNextGuide,
};

export function toolBySlug(slug: string): Tool | undefined {
  return slug in TOOLS ? TOOLS[slug as ToolSlug] : undefined;
}

export function toolsForWeek(week: WeekNumber): Tool[] {
  return Object.values(TOOLS).filter((t) => t.introducedInWeek === week);
}
```

### Task 3.2: First 8 tool bodies

- [ ] **Step 1: Write `lib/toolContent/initialQuestionnaire.ts`**

```ts
import type { Tool } from '../tools';

export const initialQuestionnaire: Tool = {
  slug: 'initial-questionnaire',
  title: 'Initial Questionnaire',
  introducedInWeek: 0,
  isStar: false,
  body: {
    kind: 'fill-in-template',
    intro: 'Your baseline. Capture where you are today so you can see how far you go.',
    fields: [
      { id: 'sleep-baseline', label: 'How are you sleeping right now?', placeholder: 'Hours, quality, when you fall asleep' },
      { id: 'nutrition-baseline', label: 'What does a typical day of eating look like?', placeholder: 'Honest, not aspirational' },
      { id: 'movement-baseline', label: 'How much are you moving in a typical week?', placeholder: 'Walks, workouts, stairs, anything' },
      { id: 'patterns', label: 'What patterns do you already notice in yourself?', placeholder: 'Triggers, time of day, situations' },
      { id: 'big-why', label: 'Why now?', placeholder: 'What is the bigger picture behind this twelve weeks?' },
    ],
  },
};
```

- [ ] **Step 2: Write `lib/toolContent/habitsOverChecklists.ts`**

```ts
import type { Tool } from '../tools';

export const habitsOverChecklists: Tool = {
  slug: 'habits-over-checklists',
  title: 'Habits Over Checklists',
  introducedInWeek: 0,
  isStar: false,
  body: {
    kind: 'static-page',
    sections: [
      {
        heading: 'Willpower is finite',
        body: 'Decision fatigue is real. The more choices you make in a day, the worse your choices become by evening. That is why hard days end with snacking, scrolling, or skipping the workout. The system, not the person, is broken.',
      },
      {
        heading: 'Habits run on autopilot',
        body: 'A habit is a behavior that costs almost zero willpower. Your morning coffee is a habit. Brushing teeth is a habit. Once a behavior becomes a habit, it is free.',
      },
      {
        heading: 'Identity beats willpower',
        body: "When you say I am someone who walks every day, it is not a goal. It is a description. You walk because that is who you are. Identity carries the load that willpower cannot.",
      },
      {
        heading: 'How this program works',
        body: 'Each week we layer one new action on top of what is already running. We do not pile on. We stack. We are building habits, not collecting checkboxes.',
      },
    ],
  },
};
```

- [ ] **Step 3: Write `lib/toolContent/fiveUniversalPatterns.ts`**

```ts
import type { Tool } from '../tools';

export const fiveUniversalPatterns: Tool = {
  slug: 'five-universal-patterns',
  title: '5 Universal Patterns',
  introducedInWeek: 1,
  isStar: true,
  body: {
    kind: 'static-page',
    intro: 'Five patterns show up in almost everyone Karen and Ryan have worked with. Read them and notice which one is loudest in your life right now.',
    sections: [
      {
        heading: '1. The Overworker',
        body: 'You give every hour to other people. Work, kids, the household, the calendar. Your own care is the last thing on the list and it usually does not happen. You know what to do. You just never get there.',
      },
      {
        heading: '2. The Soother',
        body: 'When the day gets hard, food, alcohol, scrolling, or shopping is how you take the edge off. The reward is real and immediate. The cost shows up later, usually as guilt, weight, or sleep.',
      },
      {
        heading: '3. The Optimizer',
        body: 'You research everything. You collect plans, podcasts, frameworks, and supplements. The plan is always almost ready. Action waits for one more piece of information.',
      },
      {
        heading: '4. The All or Nothing',
        body: "You are either one hundred percent on or completely off. One off day means the week is blown. The diet starts Monday. Then it does not.",
      },
      {
        heading: '5. The Invisible',
        body: 'Your needs are smaller than everyone else\'s. You do not ask for help. You do not take up space. The body absorbs the cost quietly.',
      },
      {
        heading: 'Which one sounds like you?',
        body: 'Most people have one primary pattern and a secondary one that shows up under stress. Name yours. We will work with it.',
      },
    ],
  },
};
```

- [ ] **Step 4: Write `lib/toolContent/nutritionTrackChooser.ts`**

```ts
import type { Tool } from '../tools';

export const nutritionTrackChooser: Tool = {
  slug: 'nutrition-track-chooser',
  title: 'Nutrition Track Chooser',
  introducedInWeek: 1,
  isStar: false,
  body: {
    kind: 'static-page',
    intro: 'Two starting tracks. Pick the one that meets you where you are. You will add the second one in Week 2.',
    sections: [
      {
        heading: 'Track A. Blood Sugar',
        body: 'Best if you spike and crash through the day. Energy is up and down. You get hungry two hours after eating. Focus this week: pair carbs with protein and fat at every meal. No naked carbs.',
      },
      {
        heading: 'Track B. Processed Food',
        body: 'Best if a lot of what you eat comes from a package. Bars, chips, frozen meals, cereal. Focus this week: swap one processed item per day for a whole food version. Half the package counts.',
      },
      {
        heading: 'How to pick',
        body: 'If you are not sure, pick the one whose description annoyed you slightly. That is usually the truth.',
      },
      {
        heading: 'Why one and not both yet',
        body: 'Stacking comes in Week 2. Get one running first. Both starts overwhelmed and ends with neither.',
      },
    ],
  },
};
```

- [ ] **Step 5: Write `lib/toolContent/movementBreaksMenu.ts`**

```ts
import type { Tool } from '../tools';

export const movementBreaksMenu: Tool = {
  slug: 'movement-breaks-menu',
  title: 'Movement Breaks Menu',
  introducedInWeek: 2,
  isStar: false,
  body: {
    kind: 'menu-list',
    intro: 'Ten breaks that take five minutes or less. Pick one. Do it now.',
    items: [
      { title: 'Ten chair squats', body: 'Stand up, sit down, ten times. Slow on the way down.' },
      { title: 'Two minute walk', body: 'Out the door, around the block, back. Phone off.' },
      { title: 'Wall push ups', body: 'Three sets of ten against the kitchen wall while the kettle heats.' },
      { title: 'Calf raises during a call', body: 'Heels up, heels down. Do it for the whole call.' },
      { title: 'One minute plank', body: 'Forearms on the desk. Body straight. Watch the timer.' },
      { title: 'Stairs up and down', body: 'Find a flight. Up, down, three rounds.' },
      { title: 'Doorway stretch', body: 'Forearms on the frame. Step through. Hold thirty seconds each side.' },
      { title: 'Hip openers', body: 'Standing, one foot on a chair, lean in. Thirty seconds per side.' },
      { title: 'Shoulder rolls', body: 'Ten forward, ten back. Pull shoulder blades together at the end.' },
      { title: 'Three deep breaths plus a stretch', body: 'Reach up, fold over, repeat three times.' },
    ],
  },
};
```

- [ ] **Step 6: Write `lib/toolContent/sleepEnvironmentChecklist.ts`**

```ts
import type { Tool } from '../tools';

export const sleepEnvironmentChecklist: Tool = {
  slug: 'sleep-environment-checklist',
  title: 'Sleep Environment Checklist',
  introducedInWeek: 2,
  isStar: false,
  body: {
    kind: 'checklist',
    intro: 'Walk through your bedroom right now and check what is already true. Then pick one to change this week.',
    items: [
      { id: 'temp', label: 'Bedroom is sixty five to sixty eight degrees overnight' },
      { id: 'dark', label: 'Room is dark enough that you cannot read a book' },
      { id: 'phone-out', label: 'Phone charges outside the bedroom' },
      { id: 'no-screens', label: 'No screens in the last hour before bed' },
      { id: 'comfy-bed', label: 'Mattress and pillow are working for your body' },
      { id: 'fresh-sheets', label: 'Sheets are clean and feel good' },
      { id: 'quiet', label: 'Room is quiet or has consistent low noise' },
      { id: 'no-clutter', label: 'No work or to do list visible from the bed' },
    ],
  },
};
```

- [ ] **Step 7: Write `lib/toolContent/kitchenResetGuide.ts`**

```ts
import type { Tool } from '../tools';

export const kitchenResetGuide: Tool = {
  slug: 'kitchen-reset-guide',
  title: 'Kitchen Reset Guide',
  introducedInWeek: 3,
  isStar: true,
  body: {
    kind: 'checklist',
    intro: 'Thirty to forty five minutes. Once. Future you will thank present you every day this week.',
    items: [
      { id: 'fridge-front', label: 'Move proteins and vegetables to fridge eye level' },
      { id: 'fridge-back', label: 'Move sodas, condiments, and treats to the back or bottom drawer' },
      { id: 'cut-veg', label: 'Wash and pre cut at least two vegetables, store in clear containers' },
      { id: 'pantry-trigger', label: 'Identify three trigger foods in the pantry' },
      { id: 'pantry-trigger-out', label: 'Remove them or put them in opaque containers out of sight' },
      { id: 'snack-bowl', label: 'Set a grab and go protein snack on the counter (boiled eggs, jerky, nuts)' },
      { id: 'water', label: 'Fill a large water bottle and put it where you cannot miss it' },
      { id: 'workout-spot', label: 'Set out workout clothes for tomorrow morning where you will see them' },
    ],
  },
};
```

- [ ] **Step 8: Write `lib/toolContent/abcPowerMealsGuide.ts`**

```ts
import type { Tool } from '../tools';

export const abcPowerMealsGuide: Tool = {
  slug: 'abc-power-meals-guide',
  title: 'ABC Power Meals Guide',
  introducedInWeek: 3,
  isStar: false,
  body: {
    kind: 'static-page',
    intro: 'Half your plate, every plate. Under a minute to set up. This is the foundation of how Karen and Ryan teach eating.',
    sections: [
      {
        heading: 'A is for Anchor with Protein',
        body: 'Twenty five to thirty five grams per meal. Eggs, chicken, fish, beef, yogurt, cottage cheese, tofu, beans plus a protein. Anchor lands first on the plate.',
      },
      {
        heading: 'B is for Balance Your Meal',
        body: 'Carbs, fats, fiber. Round it out. Rice and vegetables. Bread and olive oil. Fruit and nut butter. Balance is the rest of the plate after the anchor.',
      },
      {
        heading: 'C is for Complete with Embellishments',
        body: 'Herbs, spices, sauces. The joy belongs. A bland meal is a meal you do not repeat. The embellishment is the difference between sustainable and grim.',
      },
      {
        heading: 'How to use ABC',
        body: 'Build one ABC meal today. Notice how you feel two hours later. Then build the next one. The goal this week is not perfect, it is anchored.',
      },
    ],
  },
};
```

- [ ] **Step 9: Typecheck**

Run: `npm run typecheck`
Expected: TypeScript errors for the 16 tools not yet authored (imports will fail). That is expected. Phase 4 and 5 finish the set.

For now, comment out the imports for the unauthored tools in `lib/tools.ts` so the typecheck passes, then uncomment them in subsequent phases as files land. Specifically: comment lines for `pausePracticeGuide` through `whatsNextGuide` and remove their entries from `TOOLS` until each phase lands them.

Concretely, replace the imports block AND the `TOOLS` body in `lib/tools.ts` so only the 8 newly authored tools are registered:

```ts
import { initialQuestionnaire } from './toolContent/initialQuestionnaire';
import { habitsOverChecklists } from './toolContent/habitsOverChecklists';
import { fiveUniversalPatterns } from './toolContent/fiveUniversalPatterns';
import { nutritionTrackChooser } from './toolContent/nutritionTrackChooser';
import { movementBreaksMenu } from './toolContent/movementBreaksMenu';
import { sleepEnvironmentChecklist } from './toolContent/sleepEnvironmentChecklist';
import { kitchenResetGuide } from './toolContent/kitchenResetGuide';
import { abcPowerMealsGuide } from './toolContent/abcPowerMealsGuide';

export const TOOLS: Partial<Record<ToolSlug, Tool>> = {
  'initial-questionnaire': initialQuestionnaire,
  'habits-over-checklists': habitsOverChecklists,
  'five-universal-patterns': fiveUniversalPatterns,
  'nutrition-track-chooser': nutritionTrackChooser,
  'movement-breaks-menu': movementBreaksMenu,
  'sleep-environment-checklist': sleepEnvironmentChecklist,
  'kitchen-reset-guide': kitchenResetGuide,
  'abc-power-meals-guide': abcPowerMealsGuide,
};

export function toolBySlug(slug: string): Tool | undefined {
  return slug in TOOLS ? TOOLS[slug as ToolSlug] : undefined;
}

export function toolsForWeek(week: WeekNumber): Tool[] {
  return Object.values(TOOLS).filter((t): t is Tool => Boolean(t) && t.introducedInWeek === week);
}
```

Run: `npm run typecheck`
Expected: clean. (Phase 5 changes `Partial<Record<...>>` back to `Record<...>` once all 24 are registered.)

- [ ] **Step 10: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/tools.ts lib/toolContent && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add tools registry + first 8 native tool bodies

Initial Questionnaire, Habits Over Checklists, 5 Universal Patterns,
Nutrition Track Chooser, Movement Breaks Menu, Sleep Environment
Checklist, Kitchen Reset Guide, ABC Power Meals Guide. The remaining
16 tools land in the next two phases. TOOLS map is Partial in the
interim and tightens to Record once all 24 are registered.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: Tool bodies batch 2 (Weeks 4–7)

**Goal:** Author the next 8 tool bodies and register them in `lib/tools.ts`.

**Files:**
- Create: `lib/toolContent/pausePracticeGuide.ts`
- Create: `lib/toolContent/windDownRoutineBuilder.ts`
- Create: `lib/toolContent/tebLoopGuide.ts`
- Create: `lib/toolContent/mealPrepSystemGuide.ts`
- Create: `lib/toolContent/socialSituationsPlaybook.ts`
- Create: `lib/toolContent/movementSnacksMenu.ts`
- Create: `lib/toolContent/boxBreathingGuide.ts`
- Create: `lib/toolContent/nonFoodStressReliefMenu.ts`
- Modify: `lib/tools.ts` (add the 8 imports + 8 TOOLS entries)

### Task 4.1: Eight tool bodies

- [ ] **Step 1: Write `lib/toolContent/pausePracticeGuide.ts`**

```ts
import type { Tool } from '../tools';

export const pausePracticeGuide: Tool = {
  slug: 'pause-practice-guide',
  title: 'Pause Practice Guide',
  introducedInWeek: 4,
  isStar: false,
  body: {
    kind: 'static-page',
    intro: 'Three words. Notice. Pause. Observe. This is the practice that creates space before you react.',
    sections: [
      {
        heading: 'Notice',
        body: 'A trigger lands. The thought, the feeling, the urge. Say to yourself, this is a trigger. Naming it is the whole first move.',
      },
      {
        heading: 'Pause',
        body: 'Do nothing for ten seconds. Not nothing forever. Ten seconds. Long enough for the wave to crest.',
      },
      {
        heading: 'Observe',
        body: "Watch what wants to happen. Watch what your body is asking for. You are not deciding yet. You are seeing.",
      },
      {
        heading: 'When to use it',
        body: 'Right before you reach for the snack. Right before you fire off the reply. Right before you skip the workout. This is not about willpower. It is about giving yourself one beat of awareness.',
      },
      {
        heading: 'Why it matters',
        body: 'You cannot change a pattern you cannot see. The pause creates the seeing. Once you see it, you have choices you did not have before.',
      },
    ],
  },
};
```

- [ ] **Step 2: Write `lib/toolContent/windDownRoutineBuilder.ts`**

```ts
import type { Tool } from '../tools';

export const windDownRoutineBuilder: Tool = {
  slug: 'wind-down-routine-builder',
  title: 'Wind Down Routine Builder',
  introducedInWeek: 4,
  isStar: false,
  body: {
    kind: 'menu-list',
    intro: 'Pick three of these. Run them in the same order every night, ending thirty minutes before bed.',
    items: [
      { title: 'Phone in a drawer', body: 'In another room ideally. The bedroom is for sleep.' },
      { title: 'Warm shower or bath', body: 'Body temperature drops after, which is a sleep cue.' },
      { title: 'Dim the lights', body: 'Lamps only. Skip the overheads after dark.' },
      { title: 'Read fiction', body: 'Not work. Not news. Fiction. Paper preferred.' },
      { title: 'Light stretching', body: 'Five minutes. Hips, shoulders, neck.' },
      { title: 'Brain dump', body: 'Tomorrow\'s to do list on paper. Out of your head and into the page.' },
      { title: 'Gratitude line', body: 'One sentence. What was good today.' },
      { title: 'Calm tea', body: 'Chamomile or rooibos. Warm, not caffeinated.' },
    ],
  },
};
```

- [ ] **Step 3: Write `lib/toolContent/tebLoopGuide.ts`**

```ts
import type { Tool } from '../tools';

export const tebLoopGuide: Tool = {
  slug: 'teb-loop-guide',
  title: 'TEB Loop Guide',
  introducedInWeek: 5,
  isStar: true,
  body: {
    kind: 'static-page',
    intro: 'Thinking, Emotion, Behavior. When you let thinking drive, you choose. When you let emotion drive, the pattern wins.',
    sections: [
      {
        heading: 'How the loop runs',
        body: 'A trigger lands. You have a thought about it. That thought creates an emotion. The emotion drives the behavior. Most people skip the thought step and let the emotion drive directly.',
      },
      {
        heading: 'Where the loop breaks',
        body: 'You break the loop at the thinking step. Catch the thought. Ask: is this true? Is this useful? What is the bigger picture here?',
      },
      {
        heading: 'Example: the late night snack',
        body: 'Trigger: tired at nine pm. Thought: I deserve this. Emotion: relief on the way. Behavior: the snack. Reframe at the thought: I deserve real rest, not sugar that wakes me at three am.',
      },
      {
        heading: 'Example: the skipped workout',
        body: 'Trigger: hard day at work. Thought: I cannot today. Emotion: defeat. Behavior: skip. Reframe at the thought: a twenty minute walk is still a workout, and it is what I do.',
      },
      {
        heading: 'The practice',
        body: 'Use TEB once a day this week. Pick one moment. Notice the trigger, the thought, the emotion, the behavior. Then ask: what would change if I changed the thought?',
      },
    ],
  },
};
```

- [ ] **Step 4: Write `lib/toolContent/mealPrepSystemGuide.ts`**

```ts
import type { Tool } from '../tools';

export const mealPrepSystemGuide: Tool = {
  slug: 'meal-prep-system-guide',
  title: 'Meal Prep System Guide',
  introducedInWeek: 5,
  isStar: true,
  body: {
    kind: 'static-page',
    intro: 'Ninety minutes once a week buys you five days of easy ABC meals. Same recipe every time. This is a system, not a hobby.',
    sections: [
      {
        heading: 'The ninety minute flow',
        body: 'Twenty minutes prep. Sixty minutes cook and assemble. Ten minutes clean. Pick a day. Sunday afternoon is common but pick what fits your week.',
      },
      {
        heading: 'Batch cook two proteins',
        body: 'A pound of chicken in the oven. A pound of ground beef on the stove. Or chicken plus tofu. Or salmon plus eggs. Two proteins, ready to anchor.',
      },
      {
        heading: 'Roast a tray of vegetables',
        body: 'Whatever was on sale. Toss in olive oil and salt. Roast at four hundred degrees for thirty minutes. This is your balance.',
      },
      {
        heading: 'Cook a starch',
        body: 'A pot of rice, quinoa, or potatoes. Three cups dry goes a long way.',
      },
      {
        heading: 'Grab and go assembly',
        body: 'Use the prepped pieces. Anchor first. Add a half plate of vegetables. Add a half cup of starch. Top with a sauce or herb mix you actually like. That is dinner in three minutes.',
      },
    ],
  },
};
```

- [ ] **Step 5: Write `lib/toolContent/socialSituationsPlaybook.ts`**

```ts
import type { Tool } from '../tools';

export const socialSituationsPlaybook: Tool = {
  slug: 'social-situations-playbook',
  title: 'Social Situations Playbook',
  introducedInWeek: 6,
  isStar: false,
  body: {
    kind: 'menu-list',
    intro: 'Scripts and moves for situations that used to derail you. Pick one to try this week.',
    items: [
      { title: 'Restaurant arrival', body: 'Read the menu before you go. Decide on an anchor protein and one balance side. Order first so you do not drift.' },
      { title: 'Buffet or party', body: 'Walk the whole table once before you take a plate. Pick the anchor and two sides. Sit far from the table.' },
      { title: "The pusher", body: 'You: Thanks, I am good. They: Just a little. You: I really am good. Repeat without explaining.' },
      { title: 'The drink offer', body: 'Have a non alcohol drink in your hand from the start. Sparkling water with lime looks like a cocktail.' },
      { title: 'Dinner at a friend\'s', body: 'Eat a small anchor before you go (eggs, yogurt, jerky). You are not hungry walking in, which makes choices easier.' },
      { title: 'Coworker treats at work', body: 'See it, name it, walk away. The cookies will be there tomorrow. They will not call out to you if you do not stand near them.' },
      { title: "The well meaning comment", body: 'Are you really not having any? Reframe in your head: this is them, not me. Say: yes, really, thanks for thinking of me.' },
    ],
  },
};
```

- [ ] **Step 6: Write `lib/toolContent/movementSnacksMenu.ts`**

```ts
import type { Tool } from '../tools';

export const movementSnacksMenu: Tool = {
  slug: 'movement-snacks-menu',
  title: 'Movement Snacks Menu',
  introducedInWeek: 6,
  isStar: false,
  body: {
    kind: 'menu-list',
    intro: 'Thirty seconds each. Three to five of these per day stack up. Pick three you can do without changing clothes.',
    items: [
      { title: 'Ten squats at the kitchen counter', body: 'While the coffee brews or the microwave runs.' },
      { title: 'Wall push ups during a call', body: 'Lean into the wall. Ten reps.' },
      { title: 'Calf raises at the sink', body: 'Heels up, heels down. While brushing teeth.' },
      { title: 'Stand and reach', body: 'Stand from your chair, reach overhead, fold forward, return.' },
      { title: 'Glute squeezes at the desk', body: 'Twenty hard squeezes. No one sees.' },
      { title: 'Stair set', body: 'Up one flight, down one flight. Twice.' },
      { title: 'Door frame stretch', body: 'Forearms on the frame, step through. Thirty seconds.' },
      { title: 'Walking lunge to the bathroom', body: 'Lunges instead of walking. Counts.' },
      { title: 'Ten jumping jacks', body: 'Yes, you can. No one cares.' },
      { title: 'Sit to stand from a low chair', body: 'No hands. Ten reps.' },
    ],
  },
};
```

- [ ] **Step 7: Write `lib/toolContent/boxBreathingGuide.ts`**

```ts
import type { Tool } from '../tools';

export const boxBreathingGuide: Tool = {
  slug: 'box-breathing-guide',
  title: '4-4-4-4 Breathing Guide',
  introducedInWeek: 7,
  isStar: true,
  body: {
    kind: 'static-page',
    intro: 'Sixteen seconds. Anywhere. Resets your nervous system from the inside.',
    sections: [
      {
        heading: 'The four counts',
        body: 'Inhale through the nose for four. Hold for four. Exhale through the mouth for four. Hold empty for four. Repeat.',
      },
      {
        heading: 'Why it works',
        body: 'The held exhale activates the vagus nerve, which is your body\'s built in calm down switch. This is not woo. This is physiology.',
      },
      {
        heading: 'When to use it',
        body: 'Before a hard conversation. After a hard conversation. In traffic. Before bed. When you reach for something you do not want to reach for.',
      },
      {
        heading: 'The practice',
        body: 'Two rounds in the morning. Two rounds in the evening. Add a round any time the urge hits. Sixteen seconds is the smallest possible intervention.',
      },
    ],
  },
};
```

- [ ] **Step 8: Write `lib/toolContent/nonFoodStressReliefMenu.ts`**

```ts
import type { Tool } from '../tools';

export const nonFoodStressReliefMenu: Tool = {
  slug: 'non-food-stress-relief-menu',
  title: 'Non Food Stress Relief Menu',
  introducedInWeek: 7,
  isStar: false,
  body: {
    kind: 'menu-list',
    intro: 'Fifteen options. When the stress lands and the snack call comes, pick one of these first.',
    items: [
      { title: 'Two minute walk outside', body: 'Light hits your eyes. Body moves. Stress drops.' },
      { title: 'Cold water on the wrists', body: 'Vagal reset. Thirty seconds.' },
      { title: 'Box breathing, four rounds', body: 'Sixty four seconds total.' },
      { title: 'Text a friend a question', body: 'Connection beats consumption.' },
      { title: 'Stretch for two minutes', body: 'Hips and shoulders carry the day\'s tension.' },
      { title: 'Make tea', body: 'The act of making it is the intervention. Drinking it is the bonus.' },
      { title: 'Play one song you love', body: 'Loud. Move while it plays.' },
      { title: 'Step outside for sunlight', body: 'Even cloudy daylight is ten times brighter than indoors.' },
      { title: 'Ten push ups', body: 'Reset the system through effort.' },
      { title: 'Splash water on your face', body: 'Old trick. Works.' },
      { title: 'Voice memo to yourself', body: 'Say what you are feeling out loud. Then move on.' },
      { title: 'Write three lines about it', body: 'Paper, not screen.' },
      { title: 'Three minutes of silence', body: 'No phone. No screen. Just sit.' },
      { title: 'Hug someone', body: 'Twenty seconds. Real one.' },
      { title: 'Pet the dog or cat', body: 'Co regulation works in both directions.' },
    ],
  },
};
```

### Task 4.2: Register the 8 new tools in `lib/tools.ts`

- [ ] **Step 1: Add imports + TOOLS entries**

Add to the imports block:
```ts
import { pausePracticeGuide } from './toolContent/pausePracticeGuide';
import { windDownRoutineBuilder } from './toolContent/windDownRoutineBuilder';
import { tebLoopGuide } from './toolContent/tebLoopGuide';
import { mealPrepSystemGuide } from './toolContent/mealPrepSystemGuide';
import { socialSituationsPlaybook } from './toolContent/socialSituationsPlaybook';
import { movementSnacksMenu } from './toolContent/movementSnacksMenu';
import { boxBreathingGuide } from './toolContent/boxBreathingGuide';
import { nonFoodStressReliefMenu } from './toolContent/nonFoodStressReliefMenu';
```

Add to the `TOOLS` object:
```ts
  'pause-practice-guide': pausePracticeGuide,
  'wind-down-routine-builder': windDownRoutineBuilder,
  'teb-loop-guide': tebLoopGuide,
  'meal-prep-system-guide': mealPrepSystemGuide,
  'social-situations-playbook': socialSituationsPlaybook,
  'movement-snacks-menu': movementSnacksMenu,
  'box-breathing-guide': boxBreathingGuide,
  'non-food-stress-relief-menu': nonFoodStressReliefMenu,
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/tools.ts lib/toolContent && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add 8 more tool bodies (Weeks 4 through 7)

Pause Practice, Wind Down Routine, TEB Loop, Meal Prep System, Social
Situations Playbook, Movement Snacks Menu, 4-4-4-4 Breathing,
Non Food Stress Relief Menu. Eight tools remain for Phase 5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5: Tool bodies batch 3 (Weeks 8–12) + tighten registry

**Goal:** Ship the last 8 tool bodies and tighten `TOOLS` from `Partial<Record<...>>` back to `Record<...>` (which requires all 24 to be registered).

**Files:**
- Create: `lib/toolContent/bareMinimumProtocolBuilder.ts`
- Create: `lib/toolContent/automaticityAudit.ts`
- Create: `lib/toolContent/stressSignalIdentifier.ts`
- Create: `lib/toolContent/energyOrchestraPlanner.ts`
- Create: `lib/toolContent/mySystemDocumentation.ts`
- Create: `lib/toolContent/patternMaintenanceSystem.ts`
- Create: `lib/toolContent/transformationSummary.ts`
- Create: `lib/toolContent/whatsNextGuide.ts`
- Modify: `lib/tools.ts` (add 8 imports + 8 entries; tighten Partial → Record)

### Task 5.1: Eight tool bodies

- [ ] **Step 1: Write `lib/toolContent/bareMinimumProtocolBuilder.ts`**

```ts
import type { Tool } from '../tools';

export const bareMinimumProtocolBuilder: Tool = {
  slug: 'bare-minimum-protocol-builder',
  title: 'Bare Minimum Protocol Builder',
  introducedInWeek: 8,
  isStar: true,
  body: {
    kind: 'fill-in-template',
    intro: 'Your floor. Not your ceiling. When the day falls apart, this is what still happens. Fill it in now while the day is calm.',
    fields: [
      { id: 'morning', label: 'Morning bare minimum', placeholder: 'One thing. Hydrate. Brush teeth. One small win.' },
      { id: 'movement', label: 'Movement bare minimum', placeholder: 'Five minute walk. Ten body weight squats. Anything counts.' },
      { id: 'food', label: 'Food bare minimum', placeholder: 'One anchor meal. Maybe two. Skip the rest if needed.' },
      { id: 'mind', label: 'Mind bare minimum', placeholder: 'One round of box breathing. One line of gratitude. One text to a friend.' },
      { id: 'sleep', label: 'Sleep bare minimum', placeholder: 'Bedtime within an hour of plan. Phone out of the bedroom.' },
      { id: 'reminder', label: 'The reminder', placeholder: 'On a hard day, this still counts. This is not giving up. This is staying in the game.' },
    ],
  },
};
```

- [ ] **Step 2: Write `lib/toolContent/automaticityAudit.ts`**

```ts
import type { Tool } from '../tools';

export const automaticityAudit: Tool = {
  slug: 'automaticity-audit',
  title: 'Automaticity Audit',
  introducedInWeek: 9,
  isStar: false,
  body: {
    kind: 'checklist',
    intro: 'Walk through your last forty eight hours. Which of these felt automatic? Which still required willpower?',
    items: [
      { id: 'first-meal', label: 'Anchor protein at your first meal of the day' },
      { id: 'water', label: 'Water before coffee' },
      { id: 'movement-break', label: 'At least one movement break in the work day' },
      { id: 'workout', label: 'Your scheduled workouts happened' },
      { id: 'walk', label: 'Daily walk happened' },
      { id: 'pause', label: 'You used the pause practice without thinking about it' },
      { id: 'wind-down', label: 'Wind down routine ran on autopilot' },
      { id: 'bedtime', label: 'Bedtime was close to plan without negotiation' },
      { id: 'breath', label: 'You used breathing without being reminded' },
      { id: 'identity', label: 'You did the thing because that is who you are now' },
    ],
  },
};
```

- [ ] **Step 3: Write `lib/toolContent/stressSignalIdentifier.ts`**

```ts
import type { Tool } from '../tools';

export const stressSignalIdentifier: Tool = {
  slug: 'stress-signal-identifier',
  title: 'Stress Signal Identifier',
  introducedInWeek: 9,
  isStar: false,
  body: {
    kind: 'fill-in-template',
    intro: 'Your body tells you stress is coming before your mind does. Document yours so you can catch them earlier next time.',
    fields: [
      { id: 'physical', label: 'Where do you feel stress in your body first?', placeholder: 'Jaw, shoulders, stomach, chest, headache' },
      { id: 'sleep', label: 'How does stress show up in your sleep?', placeholder: 'Trouble falling asleep, three am wake, restless' },
      { id: 'appetite', label: 'How does stress show up in your appetite?', placeholder: 'Crave sugar, skip meals, eat everything, no appetite' },
      { id: 'thoughts', label: 'What thoughts repeat when you are stressed?', placeholder: 'I can never catch up. I am failing. They are upset.' },
      { id: 'behavior', label: 'What do you do that you wish you did not?', placeholder: 'Snack, scroll, snap, withdraw, overdrink' },
      { id: 'first-move', label: 'Your first move when you spot a signal', placeholder: 'Box breathing. Walk outside. Text one person.' },
    ],
  },
};
```

- [ ] **Step 4: Write `lib/toolContent/energyOrchestraPlanner.ts`**

```ts
import type { Tool } from '../tools';

export const energyOrchestraPlanner: Tool = {
  slug: 'energy-orchestra-planner',
  title: 'Energy Orchestra Planner',
  introducedInWeek: 10,
  isStar: false,
  body: {
    kind: 'fill-in-template',
    intro: 'Three movements: morning, midday, evening. Each one feeds the next. Design yours.',
    fields: [
      { id: 'morning-physical', label: 'Morning physical', placeholder: 'Workout, walk, hydrate, sunlight, anchor breakfast' },
      { id: 'morning-mental', label: 'Morning mental', placeholder: 'No phone first hour, three priorities, identity statement read' },
      { id: 'midday-physical', label: 'Midday physical', placeholder: 'Anchor lunch, movement snack, water refill' },
      { id: 'midday-mental', label: 'Midday mental', placeholder: 'Single biggest task done before the afternoon dip' },
      { id: 'evening-physical', label: 'Evening physical', placeholder: 'Anchor dinner, gentle stretch, dim lights' },
      { id: 'evening-mental', label: 'Evening mental', placeholder: 'Wind down routine, brain dump, gratitude line, in bed on time' },
    ],
  },
};
```

- [ ] **Step 5: Write `lib/toolContent/mySystemDocumentation.ts`**

```ts
import type { Tool } from '../tools';

export const mySystemDocumentation: Tool = {
  slug: 'my-system-documentation',
  title: 'My System Documentation',
  introducedInWeek: 10,
  isStar: false,
  body: {
    kind: 'fill-in-template',
    intro: 'Capture the system that is working for you. If you can describe it, you can repeat it. This is what you carry forward.',
    fields: [
      { id: 'patterns', label: 'My patterns I now manage', placeholder: 'The pattern, the trigger, the move I use' },
      { id: 'identity', label: 'Who I am', placeholder: 'I am someone who...' },
      { id: 'food', label: 'My food system', placeholder: 'Anchors, prep day, what I keep stocked, what stays out of the house' },
      { id: 'movement', label: 'My movement system', placeholder: 'Strength days, walks, movement snacks, what counts on a bad day' },
      { id: 'energy', label: 'My energy system', placeholder: 'Morning, midday, evening flow' },
      { id: 'recovery', label: 'My recovery system', placeholder: 'Wind down routine, bedtime, what I do when stress lands' },
      { id: 'minimum', label: 'My bare minimum', placeholder: 'What still happens on the worst day' },
    ],
  },
};
```

- [ ] **Step 6: Write `lib/toolContent/patternMaintenanceSystem.ts`**

```ts
import type { Tool } from '../tools';

export const patternMaintenanceSystem: Tool = {
  slug: 'pattern-maintenance-system',
  title: 'Pattern Maintenance System',
  introducedInWeek: 11,
  isStar: false,
  body: {
    kind: 'static-page',
    intro: 'Patterns do not stay solved. They go quiet, then they test you again. Here is how to stay aware for life.',
    sections: [
      {
        heading: 'Monthly check in',
        body: 'Once a month, ask: which of my old patterns showed up this month? When? What triggered it? How did I respond? This is the practice that keeps the awareness alive.',
      },
      {
        heading: 'Stress is the test',
        body: 'Stress reveals which patterns are dormant and which are dead. A pattern that is dormant comes back under pressure. A pattern that is dead does not. Most are dormant. That is fine.',
      },
      {
        heading: 'The reframe',
        body: "When an old pattern shows up, do not call it failure. Call it information. The pattern is telling you the system needs a small tune up, not a full overhaul.",
      },
      {
        heading: 'Tune up moves',
        body: 'Run the wind down routine three nights in a row. Bring back the meal prep day. Do a kitchen reset. Pull back to bare minimum for a week. Small moves restore the system.',
      },
      {
        heading: 'Your unique rhythm',
        body: 'You know yourself now. The patterns, the energy, the food, the movement. You are not following anyone\'s plan. You are running yours.',
      },
    ],
  },
};
```

- [ ] **Step 7: Write `lib/toolContent/transformationSummary.ts`**

```ts
import type { Tool } from '../tools';

export const transformationSummary: Tool = {
  slug: 'transformation-summary',
  title: 'Transformation Summary',
  introducedInWeek: 12,
  isStar: false,
  body: {
    kind: 'fill-in-template',
    intro: 'Week 1 versus Week 12. The evidence in your own words.',
    fields: [
      { id: 'week1-body', label: 'Week 1: what was happening in my body', placeholder: 'Energy, sleep, pain, weight, strength' },
      { id: 'week12-body', label: 'Week 12: what is happening in my body now', placeholder: 'Compare honestly to Week 1' },
      { id: 'week1-mind', label: 'Week 1: my relationship with food, movement, stress', placeholder: 'The patterns, the autopilots' },
      { id: 'week12-mind', label: 'Week 12: my relationship now', placeholder: 'What is different. What I notice. What I do' },
      { id: 'biggest-win', label: 'My biggest win', placeholder: 'The one thing you are proudest of' },
      { id: 'surprised-by', label: 'What surprised me', placeholder: 'Something you did not expect' },
      { id: 'continuing', label: 'What I am continuing', placeholder: 'The systems that go with you from here' },
    ],
  },
};
```

- [ ] **Step 8: Write `lib/toolContent/whatsNextGuide.ts`**

```ts
import type { Tool } from '../tools';

export const whatsNextGuide: Tool = {
  slug: 'whats-next-guide',
  title: "What's Next Guide",
  introducedInWeek: 12,
  isStar: false,
  body: {
    kind: 'static-page',
    intro: 'Three paths from here. Pick what fits.',
    sections: [
      {
        heading: 'The membership',
        body: 'Stay in The Surge. Daily intentionality, workouts, nutrition, the coach. Your pod stays. Your systems stay. You stay accountable without starting over.',
      },
      {
        heading: 'Group Strength Training',
        body: 'GST is the small group strength training program. Invite only. If this is the next move for you, Karen and Ryan will tell you.',
      },
      {
        heading: 'CREATE POWER again',
        body: 'A second cohort, deeper. Same twelve weeks, but you bring the systems you built this round. Returning rate.',
      },
      {
        heading: 'How to decide',
        body: 'Notice what you need. If you need community and consistency, stay in the membership. If you want a strength focused small group, look at GST. If you want another round at the structure, do CREATE POWER again.',
      },
      {
        heading: 'You are now the expert on you',
        body: 'No one knows your patterns, your food, your movement, your recovery better than you do. Whatever you choose next, trust that.',
      },
    ],
  },
};
```

### Task 5.2: Register the final 8 tools and tighten the type

- [ ] **Step 1: Update `lib/tools.ts`**

Add to imports:
```ts
import { bareMinimumProtocolBuilder } from './toolContent/bareMinimumProtocolBuilder';
import { automaticityAudit } from './toolContent/automaticityAudit';
import { stressSignalIdentifier } from './toolContent/stressSignalIdentifier';
import { energyOrchestraPlanner } from './toolContent/energyOrchestraPlanner';
import { mySystemDocumentation } from './toolContent/mySystemDocumentation';
import { patternMaintenanceSystem } from './toolContent/patternMaintenanceSystem';
import { transformationSummary } from './toolContent/transformationSummary';
import { whatsNextGuide } from './toolContent/whatsNextGuide';
```

Add to TOOLS:
```ts
  'bare-minimum-protocol-builder': bareMinimumProtocolBuilder,
  'automaticity-audit': automaticityAudit,
  'stress-signal-identifier': stressSignalIdentifier,
  'energy-orchestra-planner': energyOrchestraPlanner,
  'my-system-documentation': mySystemDocumentation,
  'pattern-maintenance-system': patternMaintenanceSystem,
  'transformation-summary': transformationSummary,
  'whats-next-guide': whatsNextGuide,
```

Tighten the type from `Partial<Record<ToolSlug, Tool>>` to `Record<ToolSlug, Tool>`:
```ts
export const TOOLS: Record<ToolSlug, Tool> = {
  // ... all 24 entries ...
};
```

And restore the simpler helper signatures:
```ts
export function toolBySlug(slug: string): Tool | undefined {
  return slug in TOOLS ? TOOLS[slug as ToolSlug] : undefined;
}

export function toolsForWeek(week: WeekNumber): Tool[] {
  return Object.values(TOOLS).filter((t) => t.introducedInWeek === week);
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean. (TypeScript verifies all 24 keys present.)

- [ ] **Step 3: Sanity check**

Run: `ls lib/toolContent | wc -l`
Expected: `24`

- [ ] **Step 4: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/tools.ts lib/toolContent && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Author final 8 tool bodies and tighten TOOLS to Record

Bare Minimum Protocol Builder, Automaticity Audit, Stress Signal
Identifier, Energy Orchestra Planner, My System Documentation,
Pattern Maintenance System, Transformation Summary, What's Next
Guide. All 24 tools now registered.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6: Workout templates + workoutSchedule refactor

**Goal:** Ship `lib/workoutTemplates.ts` (LOWER_BODY, UPPER_PUSH, UPPER_PULL, FULL_BODY) and refactor `lib/workoutSchedule.ts` so every (block, slot) pair emits a populated workout instead of an empty `exercises: []`. Eliminate the stub workout path entirely.

**Files:**
- Create: `lib/workoutTemplates.ts`
- Modify: `lib/workoutSchedule.ts` (rewrite `buildSchedule` + remove `isStubWorkout` calls in stub-render paths)

### Task 6.1: Workout templates module

- [ ] **Step 1: Write `lib/workoutTemplates.ts`**

```ts
// lib/workoutTemplates.ts
//
// Four distinct workout compositions drawn from the 18-exercise library.
// Used as the default for unauthored (block, slot) pairs so every slot
// has populated exercises. When Karen+Ryan author block-specific Workout
// 1/2/3/4 compositions, those entries land in AUTHORED in workoutSchedule
// and override the template for that slot.

import type { WorkoutExercise } from './workoutSchedule';

export const LOWER_BODY: readonly WorkoutExercise[] = [
  { exerciseId: 'db-squat',         sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-deadlift',      sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-split-squat',   sets: 3, reps: '10 per leg', restSeconds: 60 },
  { exerciseId: 'push-ups',         sets: 3, reps: 'AMRAP', restSeconds: 60 },
  { exerciseId: 'db-bent-over-row', sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: 'biceps-curls',     sets: 2, reps: '12 to 15', restSeconds: 45 },
];

export const UPPER_PUSH: readonly WorkoutExercise[] = [
  { exerciseId: 'db-overhead-press',    sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'push-ups',             sets: 3, reps: 'AMRAP', restSeconds: 60 },
  { exerciseId: 'seated-db-press',      sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'push-up-from-deficit', sets: 3, reps: '6 to 10', restSeconds: 60 },
  { exerciseId: 'biceps-curls',         sets: 2, reps: '12 to 15', restSeconds: 45 },
  { exerciseId: 'wall-15-bicep-curls',  sets: 2, reps: '8 to 10', restSeconds: 45 },
];

export const UPPER_PULL: readonly WorkoutExercise[] = [
  { exerciseId: 'db-deadlift',         sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-bent-over-row',    sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: '1-arm-bor',           sets: 3, reps: '8 to 10 per side', restSeconds: 60 },
  { exerciseId: 'db-bor-reverse-grip', sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'biceps-curls',        sets: 2, reps: '12 to 15', restSeconds: 45 },
];

export const FULL_BODY: readonly WorkoutExercise[] = [
  { exerciseId: 'db-sumo-squat',        sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: 'push-ups',             sets: 3, reps: 'AMRAP', restSeconds: 60 },
  { exerciseId: 'sumo-db-rdl',          sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-bent-over-row',     sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: 'db-stagger-stance-dl', sets: 3, reps: '8 per leg', restSeconds: 60 },
  { exerciseId: 'biceps-curls',         sets: 2, reps: '12 to 15', restSeconds: 45 },
];

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
```

### Task 6.2: Rewrite `lib/workoutSchedule.ts` build path

- [ ] **Step 1: Modify `lib/workoutSchedule.ts`**

Replace the existing `buildSchedule()` and `isStubWorkout()` with this implementation. Keep the existing types + exports. The `AUTHORED` array stays — but the stub path goes away. Workout titles still follow the "Workout 1/2/3/4" naming convention (per the memory) and pull block-specific helper text from `BLOCK_HELPER_BY_SLOT`.

```ts
// lib/workoutSchedule.ts
//
// 24 workouts. 6 blocks x 4 slots. AUTHORED entries override the per-slot
// template (LOWER_BODY for slot 1, UPPER_PUSH/UPPER_PULL/FULL_BODY for
// slots 2/3/4). No stubs anywhere.

import type { BlockId } from './curriculum';
import { BLOCK_IDS } from './curriculum';
import type { ExerciseId } from './exerciseLibrary';
import {
  BLOCK_HELPER_BY_SLOT,
  FULL_BODY,
  LOWER_BODY,
  UPPER_PULL,
  UPPER_PUSH,
} from './workoutTemplates';

export type WorkoutSlotIndex = 1 | 2 | 3 | 4;
export const WORKOUT_SLOT_INDICES: readonly WorkoutSlotIndex[] = [1, 2, 3, 4];

export type WorkoutSlug = string;

export type WorkoutExercise = {
  exerciseId: ExerciseId;
  sets: number;
  reps: string;
  notes?: string;
  restSeconds?: number;
};

export type Workout = {
  slug: WorkoutSlug;
  blockId: BlockId;
  slotIndex: WorkoutSlotIndex;
  title: string;
  helper?: string;
  exercises: WorkoutExercise[];
};

const AUTHORED: Workout[] = [
  {
    slug: 'commit-workout-1',
    blockId: 'COMMIT',
    slotIndex: 1,
    title: 'Workout 1',
    helper: 'Lower body emphasis with dumbbells',
    exercises: [
      { exerciseId: 'db-squat',         sets: 3, reps: '8 to 12', restSeconds: 60 },
      { exerciseId: 'db-deadlift',      sets: 3, reps: '8 to 12', restSeconds: 60 },
      { exerciseId: 'db-split-squat',   sets: 3, reps: '10 per leg', restSeconds: 60 },
      { exerciseId: 'push-ups',         sets: 3, reps: 'AMRAP', restSeconds: 60 },
      { exerciseId: 'db-bent-over-row', sets: 3, reps: '10 to 12', restSeconds: 60 },
      { exerciseId: 'biceps-curls',     sets: 2, reps: '12 to 15', restSeconds: 45 },
    ],
  },
];

function slug(blockId: BlockId, slot: WorkoutSlotIndex): string {
  return `${blockId.toLowerCase()}-workout-${slot}`;
}

function templateFor(slot: WorkoutSlotIndex): readonly WorkoutExercise[] {
  switch (slot) {
    case 1: return LOWER_BODY;
    case 2: return UPPER_PUSH;
    case 3: return UPPER_PULL;
    case 4: return FULL_BODY;
  }
}

function authoredKey(w: Workout): string {
  return `${w.blockId}:${w.slotIndex}`;
}

function buildSchedule(): Workout[] {
  const authoredKeys = new Set(AUTHORED.map(authoredKey));
  const workouts: Workout[] = [...AUTHORED];

  for (const blockId of BLOCK_IDS) {
    for (const slot of WORKOUT_SLOT_INDICES) {
      const key = `${blockId}:${slot}`;
      if (authoredKeys.has(key)) continue;
      workouts.push({
        slug: slug(blockId, slot),
        blockId,
        slotIndex: slot,
        title: `Workout ${slot}`,
        helper: BLOCK_HELPER_BY_SLOT[blockId][slot],
        exercises: [...templateFor(slot)],
      });
    }
  }

  return workouts.sort((a, b) => {
    const blockCmp = BLOCK_IDS.indexOf(a.blockId) - BLOCK_IDS.indexOf(b.blockId);
    if (blockCmp !== 0) return blockCmp;
    return a.slotIndex - b.slotIndex;
  });
}

export const WORKOUTS: readonly Workout[] = buildSchedule();

export function workoutBySlug(slug: WorkoutSlug): Workout | undefined {
  return WORKOUTS.find((w) => w.slug === slug);
}

export function workoutsForBlock(blockId: BlockId): Workout[] {
  return WORKOUTS.filter((w) => w.blockId === blockId);
}

// Kept for backwards compatibility during refactor. Always returns false
// now that every workout has populated exercises. Delete in a follow up.
export function isStubWorkout(_w: Workout): boolean {
  return false;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Spot check**

Run: `grep -c "exerciseId:" lib/workoutSchedule.ts`
Expected: at least `6` (the authored Commit Workout 1).

The template-emitted workouts get their exercises by reference from `lib/workoutTemplates.ts`, so the file count grep is a check on authoring, not totals.

- [ ] **Step 4: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/workoutTemplates.ts lib/workoutSchedule.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Author 4 workout templates and remove stub workout path

LOWER_BODY, UPPER_PUSH, UPPER_PULL, FULL_BODY compositions drawn from
the 18-exercise library. buildSchedule now emits a populated workout
for every (block, slot) pair, falling back to the template when no
authored entry exists. isStubWorkout returns false now (kept as a noop
for backwards compatibility; cleaned up in a later phase).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 7: Unlock gating + current week derivation

**Goal:** Ship `lib/unlocks.ts` (feature unlock table + helpers) and `hooks/useCurrentWeek.ts` (resolves current week from membership/profile).

**Files:**
- Create: `lib/unlocks.ts`
- Create: `hooks/useCurrentWeek.ts`

### Task 7.1: Unlock table

- [ ] **Step 1: Write `lib/unlocks.ts`**

```ts
// lib/unlocks.ts
//
// Progressive feature unlock schedule. See memory
// create-power-progressive-unlock-schedule. Locked features are HIDDEN
// from navigation entirely, not shown with a "coming soon" badge.

import type { WeekNumber } from './program';

export type FeatureKey =
  | 'meal-logging'
  | 'pause-practice'
  | 'kitchen-reset'
  | 'teb-loop'
  | 'identity-statements'
  | 'meal-prep'
  | 'box-breathing'
  | 'bare-minimum-protocol'
  | 'three-energy-accounts'
  | 'pattern-maintenance';

export const UNLOCK_AT: Record<FeatureKey, WeekNumber> = {
  'kitchen-reset': 3,
  'meal-logging': 3,
  'pause-practice': 4,
  'teb-loop': 5,
  'identity-statements': 5,
  'meal-prep': 5,
  'box-breathing': 7,
  'bare-minimum-protocol': 8,
  'three-energy-accounts': 10,
  'pattern-maintenance': 11,
};

export function isFeatureUnlocked(feature: FeatureKey, currentWeek: WeekNumber): boolean {
  return currentWeek >= UNLOCK_AT[feature];
}

export function unlockedFeaturesAt(currentWeek: WeekNumber): FeatureKey[] {
  return (Object.keys(UNLOCK_AT) as FeatureKey[]).filter((f) =>
    isFeatureUnlocked(f, currentWeek),
  );
}
```

### Task 7.2: Current week hook

- [ ] **Step 1: Write `hooks/useCurrentWeek.ts`**

```ts
// hooks/useCurrentWeek.ts
//
// Resolves current week from the user's profile or membership state.
// Falls back to 1 (start of COMMIT) for new users.

import { useMembership } from './useMembership';
import type { BlockId, WeekNumber } from '../lib/program';
import { currentBlockFor } from '../lib/program';

const BLOCK_FIRST_WEEK: Record<BlockId, WeekNumber> = {
  COMMIT: 1,
  REFINE: 3,
  EVOLVE: 5,
  ADAPT: 7,
  THRIVE: 9,
  EXCEL: 11,
};

export function useCurrentWeek(): {
  weekNumber: WeekNumber;
  blockId: BlockId;
  loading: boolean;
} {
  const { membership, loading } = useMembership();

  const block = (membership.currentBlock ?? 'COMMIT') as BlockId;
  const weekNumber = BLOCK_FIRST_WEEK[block];

  return {
    weekNumber,
    blockId: currentBlockFor(weekNumber),
    loading,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add lib/unlocks.ts hooks/useCurrentWeek.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add unlock schedule + useCurrentWeek hook

Locked features are hidden, not labeled. Week is derived from
membership.currentBlock for now (each block first week). Future
migration adds profiles.current_week for finer-grained tracking.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 8: Daily action persistence (migration 0009 + hook)

**Goal:** Ship `supabase/migrations/0009_user_daily_actions.sql` and `hooks/useDailyActions.ts` (dual-path Supabase + AsyncStorage).

**Files:**
- Create: `supabase/migrations/0009_user_daily_actions.sql`
- Create: `hooks/useDailyActions.ts`

### Task 8.1: Migration

- [ ] **Step 1: Write `supabase/migrations/0009_user_daily_actions.sql`**

```sql
-- 0009_user_daily_actions.sql

CREATE TABLE public.user_daily_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_id text NOT NULL,
  completed_date date NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  week_number smallint NOT NULL,
  UNIQUE (user_id, action_id, completed_date)
);

GRANT SELECT, INSERT, DELETE ON public.user_daily_actions TO authenticated;
GRANT ALL ON public.user_daily_actions TO service_role;

ALTER TABLE public.user_daily_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own actions" ON public.user_daily_actions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users insert own actions" ON public.user_daily_actions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users delete own actions" ON public.user_daily_actions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_user_daily_actions_user_date
  ON public.user_daily_actions (user_id, completed_date);

CREATE INDEX idx_user_daily_actions_user_week
  ON public.user_daily_actions (user_id, week_number);
```

### Task 8.2: Hook

- [ ] **Step 1: Write `hooks/useDailyActions.ts`**

```ts
// hooks/useDailyActions.ts
//
// Dual-path persistence for daily action completions. Supabase mode
// writes to user_daily_actions. Dev mode writes to AsyncStorage under
// tel:daily-actions:<userId>. Same hook shape both ways.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import type { WeekNumber } from '../lib/program';

export type DailyActionRecord = {
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

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday-start week
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function storageKey(userId: string): string {
  return `tel:daily-actions:${userId}`;
}

export function useDailyActions(currentWeek: WeekNumber): {
  todayCompletions: Set<string>;
  weekCompletions: Map<string, number>;
  weekProgress: { completed: number; total: number; percentage: number };
  toggleAction: (actionId: string, weeklyTarget: number) => Promise<void>;
  loading: boolean;
} {
  const { session, isDevSession } = useAuth();
  const userId = session?.user.id;
  const [records, setRecords] = useState<DailyActionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (isDevSession || !supabase) {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        const parsed = raw ? (JSON.parse(raw) as DailyActionRecord[]) : [];
        setRecords(parsed);
      } else {
        const weekStart = startOfWeekISO();
        const { data, error } = await supabase
          .from('user_daily_actions')
          .select('action_id, completed_date, completed_at, week_number')
          .eq('user_id', userId)
          .gte('completed_date', weekStart);
        if (error) throw error;
        setRecords(
          (data ?? []).map((r) => ({
            actionId: r.action_id as string,
            completedDate: r.completed_date as string,
            completedAt: r.completed_at as string,
            weekNumber: r.week_number as number,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [isDevSession, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayISO();

  const todayCompletions = useMemo(() => {
    return new Set(
      records.filter((r) => r.completedDate === today).map((r) => r.actionId),
    );
  }, [records, today]);

  const weekCompletions = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of records) {
      if (r.weekNumber !== currentWeek) continue;
      m.set(r.actionId, (m.get(r.actionId) ?? 0) + 1);
    }
    return m;
  }, [records, currentWeek]);

  const toggleAction = useCallback(
    async (actionId: string, _weeklyTarget: number) => {
      if (!userId) return;
      const alreadyDone = todayCompletions.has(actionId);

      if (isDevSession || !supabase) {
        const next = alreadyDone
          ? records.filter((r) => !(r.actionId === actionId && r.completedDate === today))
          : [
              ...records,
              {
                actionId,
                completedDate: today,
                completedAt: new Date().toISOString(),
                weekNumber: currentWeek,
              },
            ];
        await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
        setRecords(next);
        return;
      }

      if (alreadyDone) {
        const { error } = await supabase
          .from('user_daily_actions')
          .delete()
          .eq('user_id', userId)
          .eq('action_id', actionId)
          .eq('completed_date', today);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_daily_actions').insert({
          user_id: userId,
          action_id: actionId,
          completed_date: today,
          week_number: currentWeek,
        });
        if (error) throw error;
      }
      await load();
    },
    [currentWeek, isDevSession, load, records, today, todayCompletions, userId],
  );

  const weekProgress = useMemo(() => {
    const completed = todayCompletions.size;
    return { completed, total: 0, percentage: 0 };
  }, [todayCompletions]);

  return { todayCompletions, weekCompletions, weekProgress, toggleAction, loading };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add supabase/migrations/0009_user_daily_actions.sql hooks/useDailyActions.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add daily action completion table + dual-path hook

Migration 0009 creates user_daily_actions with RLS. The hook handles
both Supabase mode and dev mode (AsyncStorage under tel:daily-actions
:<userId>). Today completions surface as a Set; week completions as a
Map; toggle is idempotent per (action, date).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 9: profiles.current_week migration + hook rewire/rename

**Goal:** Ship migration 0010 (adds `current_week` to profiles). Rewire `useCoachContext` to consume the new program model (no LLM yet). Rename `useSectionProgress` → `useWeekProgress` and reshape its logic to track week-level completion.

**Files:**
- Create: `supabase/migrations/0010_profiles_current_week.sql`
- Modify: `hooks/useCurrentWeek.ts` (read `current_week` when present)
- Modify: `hooks/useCoachContext.ts` (rewrite to new program model)
- Rename: `hooks/useSectionProgress.ts` → `hooks/useWeekProgress.ts` (rewrite body)

### Task 9.1: Migration 0010

- [ ] **Step 1: Write `supabase/migrations/0010_profiles_current_week.sql`**

```sql
-- 0010_profiles_current_week.sql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_week smallint NOT NULL DEFAULT 1;

UPDATE public.profiles SET current_week = CASE
  WHEN current_block = 'COMMIT' THEN 1
  WHEN current_block = 'REFINE' THEN 3
  WHEN current_block = 'EVOLVE' THEN 5
  WHEN current_block = 'ADAPT' THEN 7
  WHEN current_block = 'THRIVE' THEN 9
  WHEN current_block = 'EXCEL' THEN 11
  ELSE 1
END
WHERE current_week = 1;
```

### Task 9.2: Update `useCurrentWeek` to read `current_week` when available

- [ ] **Step 1: Modify `hooks/useCurrentWeek.ts`**

Read `current_week` from membership/profile when present, falling back to the block-first-week derivation. Treat values outside 1–12 as 1. (Implementer: the current file just returns BLOCK_FIRST_WEEK; expand to inspect a new `currentWeek` field on membership.)

```ts
// hooks/useCurrentWeek.ts
import { useMembership } from './useMembership';
import type { BlockId, WeekNumber } from '../lib/program';
import { currentBlockFor, WEEK_NUMBERS } from '../lib/program';

const BLOCK_FIRST_WEEK: Record<BlockId, WeekNumber> = {
  COMMIT: 1,
  REFINE: 3,
  EVOLVE: 5,
  ADAPT: 7,
  THRIVE: 9,
  EXCEL: 11,
};

function asWeekNumber(n: number | null | undefined): WeekNumber | null {
  if (n == null) return null;
  return (WEEK_NUMBERS as readonly number[]).includes(n) ? (n as WeekNumber) : null;
}

export function useCurrentWeek(): {
  weekNumber: WeekNumber;
  blockId: BlockId;
  loading: boolean;
} {
  const { membership, loading } = useMembership();
  const stored = asWeekNumber((membership as unknown as { currentWeek?: number }).currentWeek);
  const block = (membership.currentBlock ?? 'COMMIT') as BlockId;
  const weekNumber = stored ?? BLOCK_FIRST_WEEK[block];
  return {
    weekNumber,
    blockId: currentBlockFor(weekNumber),
    loading,
  };
}
```

Note: this also requires `useMembership` to expose `currentWeek`. Add a minimal change to `hooks/useMembership.ts` so it reads `current_week` from the Supabase row and returns it on `membership.currentWeek`. Dev mode also reads/writes `currentWeek` from the AsyncStorage payload. The shape change is additive (existing consumers continue to work).

Add to `useMembership.ts`:
- Add `currentWeek: number` to the membership state default at `null` or `1`
- Add `current_week` to the select list when reading from Supabase
- Set `currentWeek: (data?.current_week as number) ?? 1` on the read result
- Dev mode: read `currentWeek` from the AsyncStorage payload, default 1
- Dev mode setters do not need to write it (Today's actions update it via a separate flow in a future slice)

### Task 9.3: Rename `useSectionProgress` → `useWeekProgress` (reshape body)

- [ ] **Step 1: Create `hooks/useWeekProgress.ts` with new logic**

```ts
// hooks/useWeekProgress.ts
//
// A week is "complete" when >= 70% of its actions have been done at
// least once that week. Replaces useSectionProgress, which tracked
// curriculum section completion against the old 6-thread x 6-block
// model.

import { useMemo } from 'react';
import { useDailyActions } from './useDailyActions';
import { weekFor } from '../lib/program';
import type { WeekNumber } from '../lib/program';

export function useWeekProgress(weekNumber: WeekNumber): {
  completed: number;
  total: number;
  percentage: number;
  isWeekComplete: boolean;
  loading: boolean;
} {
  const { weekCompletions, loading } = useDailyActions(weekNumber);
  const week = weekFor(weekNumber);

  return useMemo(() => {
    const total = week.weekAtAGlance.length;
    const completed = week.weekAtAGlance.filter(
      (a) => (weekCompletions.get(a.id) ?? 0) >= 1,
    ).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      completed,
      total,
      percentage,
      isWeekComplete: percentage >= 70,
      loading,
    };
  }, [loading, week.weekAtAGlance, weekCompletions]);
}
```

- [ ] **Step 2: Delete the old `hooks/useSectionProgress.ts`**

```bash
rm hooks/useSectionProgress.ts
```

If any other file imports `useSectionProgress`, replace with `useWeekProgress` and pass the current week. Verify by typecheck — TypeScript surfaces stale imports.

### Task 9.4: Rewire `useCoachContext`

- [ ] **Step 1: Rewrite `hooks/useCoachContext.ts`**

```ts
// hooks/useCoachContext.ts
//
// Context the AI coach receives. In this slice no LLM is wired; this
// hook provides the structure the LLM slice will consume.

import { useCurrentWeek } from './useCurrentWeek';
import { useProfile } from './useProfile';
import { weekFor, blockFor } from '../lib/program';
import { unlockedFeaturesAt } from '../lib/unlocks';

export type CoachContext = {
  weekNumber: number;
  blockId: string;
  primaryFocus: string;
  consistencyTarget: string;
  unlockedFeatures: string[];
  userName: string | null;
  goal: string | null;
};

export function useCoachContext(): CoachContext {
  const { weekNumber, blockId } = useCurrentWeek();
  const { profile } = useProfile();
  const week = weekFor(weekNumber);
  const block = blockFor(blockId);
  return {
    weekNumber,
    blockId,
    primaryFocus: week.primaryFocus,
    consistencyTarget: block.consistencyTarget,
    unlockedFeatures: unlockedFeaturesAt(weekNumber),
    userName: profile.fullName ?? null,
    goal: (profile.intakeAnswers?.primary_goal as string | undefined) ?? null,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean. If `useMembership` doesn't yet expose `currentWeek`, follow the additive instructions in Task 9.2 to add it (one new optional field on the state).

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add supabase/migrations/0010_profiles_current_week.sql hooks/useCurrentWeek.ts hooks/useMembership.ts hooks/useWeekProgress.ts hooks/useCoachContext.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" rm hooks/useSectionProgress.ts && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add profiles.current_week; rewire coach context; rename progress hook

Migration 0010 adds the column with a backfill from current_block.
useCoachContext now reads from the 12-week program model and exposes
unlockedFeatures. useSectionProgress is renamed to useWeekProgress
and reshaped: a week is complete when >= 70% of its actions ran at
least once that week.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 10: Tool body components + tool route screen

**Goal:** Ship 4 small body components (one per body kind) and the route `app/tool/[slug].tsx` that resolves a slug and renders the appropriate body. Light-locked, no em dashes.

**Files:**
- Create: `components/tool/StaticPageBody.tsx`
- Create: `components/tool/ChecklistBody.tsx`
- Create: `components/tool/MenuListBody.tsx`
- Create: `components/tool/FillInTemplateBody.tsx`
- Create: `app/tool/[slug].tsx`
- Modify: `app/_layout.tsx` (register `tool/[slug]` route)

### Task 10.1: Body components

- [ ] **Step 1: Write `components/tool/StaticPageBody.tsx`**

```tsx
// components/tool/StaticPageBody.tsx
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Props = {
  intro?: string;
  sections: { heading: string; body: string }[];
};

export function StaticPageBody({ intro, sections }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}
      {sections.map((s) => (
        <View key={s.heading} style={styles.section}>
          <Text style={[styles.heading, { color: colors.text }]}>{s.heading}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>{s.body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  heading: { fontFamily: FONTS.sansBold, fontSize: 17, letterSpacing: -0.1, marginBottom: 6 },
  intro: { fontFamily: FONTS.sansMedium, fontSize: 16, lineHeight: 23 },
  section: { gap: 4 },
  stack: { gap: 20 },
});
```

- [ ] **Step 2: Write `components/tool/ChecklistBody.tsx`**

```tsx
// components/tool/ChecklistBody.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type Props = {
  toolSlug: string;
  intro?: string;
  items: { id: string; label: string }[];
};

export function ChecklistBody({ toolSlug, intro, items }: Props) {
  const colors = useThemeColors();
  const { session } = useAuth();
  const userId = session?.user.id;
  const storageKey = userId ? `tel:tool-check:${userId}:${toolSlug}` : null;
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!storageKey) return;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) setChecked(new Set(JSON.parse(raw) as string[]));
    });
  }, [storageKey]);

  const toggle = async (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify([...next]));
  };

  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}
      {items.map((item) => {
        const isChecked = checked.has(item.id);
        return (
          <Pressable
            key={item.id}
            onPress={() => toggle(item.id)}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <View
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.border },
                isChecked && { backgroundColor: '#F4E9D2', borderColor: '#E3CC92' },
              ]}
            >
              <View style={[styles.box, { borderColor: isChecked ? COLORS.tigerGold : colors.border }]}>
                {isChecked ? <Check color={COLORS.tigerGold} size={16} strokeWidth={2.6} /> : null}
              </View>
              <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1.6,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  intro: { fontFamily: FONTS.sansMedium, fontSize: 16, lineHeight: 23 },
  label: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 15, lineHeight: 21 },
  row: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  stack: { gap: 8 },
});
```

- [ ] **Step 3: Write `components/tool/MenuListBody.tsx`**

```tsx
// components/tool/MenuListBody.tsx
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Props = {
  intro?: string;
  items: { title: string; body: string }[];
};

export function MenuListBody({ intro, items }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}
      {items.map((item) => (
        <View key={item.title} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>{item.body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 12, borderWidth: 1, gap: 4, padding: 14 },
  intro: { fontFamily: FONTS.sansMedium, fontSize: 16, lineHeight: 23 },
  stack: { gap: 10 },
  title: { fontFamily: FONTS.sansBold, fontSize: 15 },
});
```

- [ ] **Step 4: Write `components/tool/FillInTemplateBody.tsx`**

```tsx
// components/tool/FillInTemplateBody.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Props = {
  toolSlug: string;
  intro?: string;
  fields: { id: string; label: string; placeholder?: string }[];
};

export function FillInTemplateBody({ toolSlug, intro, fields }: Props) {
  const colors = useThemeColors();
  const { session } = useAuth();
  const userId = session?.user.id;
  const storageKey = userId ? `tel:tool-fill:${userId}:${toolSlug}` : null;
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!storageKey) return;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) setValues(JSON.parse(raw) as Record<string, string>);
    });
  }, [storageKey]);

  const onChange = async (id: string, text: string) => {
    const next = { ...values, [id]: text };
    setValues(next);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}
      {fields.map((f) => (
        <View key={f.id} style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>{f.label}</Text>
          <TextInput
            multiline
            placeholder={f.placeholder}
            placeholderTextColor={colors.mutedText}
            value={values[f.id] ?? ''}
            onChangeText={(t) => onChange(f.id, t)}
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 72,
    padding: 12,
    textAlignVertical: 'top',
  },
  intro: { fontFamily: FONTS.sansMedium, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: FONTS.sansBold, fontSize: 14, letterSpacing: 0.1 },
  stack: { gap: 16 },
});
```

### Task 10.2: Tool route screen

- [ ] **Step 1: Write `app/tool/[slug].tsx`**

```tsx
// app/tool/[slug].tsx
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChecklistBody } from '../../components/tool/ChecklistBody';
import { FillInTemplateBody } from '../../components/tool/FillInTemplateBody';
import { MenuListBody } from '../../components/tool/MenuListBody';
import { StaticPageBody } from '../../components/tool/StaticPageBody';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';
import { toolBySlug } from '../../lib/tools';

export default function ToolScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = useThemeColors();
  const { weekNumber } = useCurrentWeek();

  const tool = slug ? toolBySlug(slug) : undefined;

  if (!tool) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Tool not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (tool.introducedInWeek !== 0 && weekNumber < tool.introducedInWeek) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>{tool.title}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            You will meet this one when you reach Week {tool.introducedInWeek}.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {tool.title}
        </Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tool.body.kind === 'static-page' && (
          <StaticPageBody intro={tool.body.intro} sections={tool.body.sections} />
        )}
        {tool.body.kind === 'checklist' && (
          <ChecklistBody toolSlug={tool.slug} intro={tool.body.intro} items={tool.body.items} />
        )}
        {tool.body.kind === 'menu-list' && (
          <MenuListBody intro={tool.body.intro} items={tool.body.items} />
        )}
        {tool.body.kind === 'fill-in-template' && (
          <FillInTemplateBody toolSlug={tool.slug} intro={tool.body.intro} fields={tool.body.fields} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  content: { gap: 16, paddingBottom: 40, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  empty: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenX,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  headerTitle: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 17, textAlign: 'center' },
  screen: { flex: 1 },
  spacer: { width: 26 },
  title: { fontFamily: FONTS.sansBold, fontSize: 20 },
});
```

### Task 10.3: Register the route

- [ ] **Step 1: Modify `app/_layout.tsx`**

Add a `<Stack.Screen name="tool/[slug]" />` line alongside the existing `workout/[id]` registration.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add components/tool app/tool app/_layout.tsx && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add tool body components + /tool/[slug] route

Static page, checklist, menu list, and fill in template bodies wired
to per-user AsyncStorage where applicable. Locked tools get a polite
"you will meet this one in Week N" screen instead of "coming soon".

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 11: Week archive route

**Goal:** Ship `app/week/[n].tsx` (renders one week: slides + tools + discussion + completed actions). Register route.

**Files:**
- Create: `app/week/[n].tsx`
- Modify: `app/_layout.tsx` (register `week/[n]`)

### Task 11.1: Week archive screen

- [ ] **Step 1: Write `app/week/[n].tsx`**

```tsx
// app/week/[n].tsx
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MessageSquare } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { WEEK_NUMBERS, weekFor } from '../../lib/program';
import { toolBySlug } from '../../lib/tools';
import type { WeekNumber } from '../../lib/program';

export default function WeekArchiveScreen() {
  const { n } = useLocalSearchParams<{ n: string }>();
  const colors = useThemeColors();
  const { weekNumber: currentWeek } = useCurrentWeek();
  const parsed = Number(n);
  const isValid = (WEEK_NUMBERS as readonly number[]).includes(parsed);
  const weekNumber = isValid ? (parsed as WeekNumber) : null;

  if (!weekNumber) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Week not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (weekNumber > currentWeek) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>This week is ahead.</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            You will arrive here when the time is right.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const week = weekFor(weekNumber);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {`Week ${week.weekNumber}`}
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.accent }]}>BLOCK · {week.blockId}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{week.title}</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>{week.primaryFocus}</Text>

        <Text style={[styles.section, { color: colors.text }]}>Slides</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {week.slideNotes.map((note, idx) => (
            <View key={idx} style={styles.slideRow}>
              <Text style={[styles.slideNum, { color: COLORS.tigerGold }]}>
                {String(idx + 1).padStart(2, '0')}
              </Text>
              <Text style={[styles.slideText, { color: colors.text }]}>{note}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Tools</Text>
        {week.toolSlugs.map((slug) => {
          const tool = toolBySlug(slug);
          if (!tool) return null;
          return (
            <Pressable
              key={slug}
              onPress={() => router.push(`/tool/${slug}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
                {tool.isStar ? (
                  <Text style={[styles.starBadge, { color: COLORS.tigerGold }]}>HIGH IMPACT</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}

        <Text style={[styles.section, { color: colors.text }]}>Discussion</Text>
        <View style={[styles.discussionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MessageSquare color={colors.accent} size={18} strokeWidth={1.8} />
          <Text style={[styles.discussionText, { color: colors.text }]}>
            {week.discussionPrompt}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  card: { borderRadius: 12, borderWidth: 1, gap: 12, padding: 14 },
  content: { gap: 14, paddingBottom: 40, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  discussionCard: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  discussionText: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 14, lineHeight: 20 },
  empty: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenX,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  headerTitle: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 17, textAlign: 'center' },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 2.2 },
  screen: { flex: 1 },
  section: { fontFamily: FONTS.sansBold, fontSize: 18, marginTop: 6 },
  slideNum: { fontFamily: FONTS.sansBold, fontSize: 12, minWidth: 24 },
  slideRow: { flexDirection: 'row', gap: 10 },
  slideText: { flex: 1, fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  spacer: { width: 26 },
  starBadge: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.2, lineHeight: 28 },
  toolCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  toolTitle: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 15 },
});
```

### Task 11.2: Register route

- [ ] **Step 1: Modify `app/_layout.tsx`**

Add `<Stack.Screen name="week/[n]" />` alongside the existing screen registrations.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add app/week app/_layout.tsx && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Add week archive route

/week/[n] renders one week: title, primary focus, slide notes,
tool cards, and discussion prompt. Future weeks return a polite "this
week is ahead" screen instead of any "coming soon" surface.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 12: Today components + Today tab refactor

**Goal:** Ship 3 Today components (DailyActionRow + PrimaryFocusCard + DiscussionCard) and fully replace `app/(tabs)/today.tsx` with the daily checklist spine.

**Files:**
- Create: `components/today/DailyActionRow.tsx`
- Create: `components/today/PrimaryFocusCard.tsx`
- Create: `components/today/DiscussionCard.tsx`
- Modify: `app/(tabs)/today.tsx` (full replace)

### Task 12.1: DailyActionRow

- [ ] **Step 1: Write `components/today/DailyActionRow.tsx`**

```tsx
// components/today/DailyActionRow.tsx
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';
import type { ThreadLetter } from '../../lib/program';

type Props = {
  label: string;
  thread: ThreadLetter;
  completed: boolean;
  onToggle: () => void;
};

export function DailyActionRow({ label, thread, completed, onToggle }: Props) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onToggle} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <View
        style={[
          styles.row,
          { backgroundColor: colors.card, borderColor: colors.border },
          completed && { backgroundColor: '#F4E9D2', borderColor: '#E3CC92' },
        ]}
      >
        <View style={[styles.box, { borderColor: completed ? COLORS.tigerGold : colors.border }]}>
          {completed ? <Check color={COLORS.tigerGold} size={16} strokeWidth={2.6} /> : null}
        </View>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.thread, { color: COLORS.tigerGold }]}>{thread}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1.6,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  label: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 15, lineHeight: 21 },
  row: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  thread: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 1.2 },
});
```

### Task 12.2: PrimaryFocusCard

- [ ] **Step 1: Write `components/today/PrimaryFocusCard.tsx`**

```tsx
// components/today/PrimaryFocusCard.tsx
import { router } from 'expo-router';
import { ArrowRight, BookOpen, Wrench } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type Props = {
  primaryFocus: string;
  toolSlugs: string[];
  weekNumber: number;
};

export function PrimaryFocusCard({ primaryFocus, toolSlugs, weekNumber }: Props) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.kicker, { color: colors.accent }]}>THIS WEEK'S FOCUS</Text>
      <Text style={[styles.body, { color: colors.text }]}>{primaryFocus}</Text>

      <View style={styles.linkRow}>
        <Pressable
          onPress={() => router.push(`/week/${weekNumber}`)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View style={styles.link}>
            <BookOpen color={COLORS.tangerine} size={16} strokeWidth={2} />
            <Text style={[styles.linkText, { color: COLORS.tangerine }]}>Slides</Text>
            <ArrowRight color={COLORS.tangerine} size={14} strokeWidth={2.4} />
          </View>
        </Pressable>

        {toolSlugs.length > 0 ? (
          <Pressable
            onPress={() => router.push(`/tool/${toolSlugs[0]}`)}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={styles.link}>
              <Wrench color={COLORS.tangerine} size={16} strokeWidth={2} />
              <Text style={[styles.linkText, { color: COLORS.tangerine }]}>
                {toolSlugs.length === 1 ? 'Tool' : `Tools (${toolSlugs.length})`}
              </Text>
              <ArrowRight color={COLORS.tangerine} size={14} strokeWidth={2.4} />
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sansBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  card: { borderRadius: 14, borderWidth: 1, gap: 8, padding: 14 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 2 },
  link: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  linkRow: { flexDirection: 'row', gap: 20, marginTop: 4 },
  linkText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
});
```

### Task 12.3: DiscussionCard

- [ ] **Step 1: Write `components/today/DiscussionCard.tsx`**

```tsx
// components/today/DiscussionCard.tsx
import { router } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type Props = {
  prompt: string;
  weekNumber: number;
};

export function DiscussionCard({ prompt, weekNumber }: Props) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => router.push(`/week/${weekNumber}`)}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <MessageSquare color={COLORS.tigerGold} size={18} strokeWidth={1.8} />
          <Text style={[styles.kicker, { color: colors.mutedText }]}>FROM THE COMMUNITY</Text>
        </View>
        <Text style={[styles.body, { color: colors.text }]} numberOfLines={3}>
          {prompt}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sansMedium, fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 12, borderWidth: 1, gap: 6, padding: 14 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.8 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
```

### Task 12.4: Today tab full replace

- [ ] **Step 1: Overwrite `app/(tabs)/today.tsx`**

```tsx
// app/(tabs)/today.tsx
import { router } from 'expo-router';
import { ArrowRight, Dumbbell } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyActionRow } from '../../components/today/DailyActionRow';
import { DiscussionCard } from '../../components/today/DiscussionCard';
import { PrimaryFocusCard } from '../../components/today/PrimaryFocusCard';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useDailyActions } from '../../hooks/useDailyActions';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { weekFor } from '../../lib/program';
import { workoutsForBlock } from '../../lib/workoutSchedule';

export default function TodayScreen() {
  const colors = useThemeColors();
  const { weekNumber, blockId } = useCurrentWeek();
  const week = weekFor(weekNumber);
  const { todayCompletions, toggleAction } = useDailyActions(weekNumber);

  const totalToday = week.weekAtAGlance.length;
  const doneToday = week.weekAtAGlance.filter((a) => todayCompletions.has(a.id)).length;

  const blockWorkouts = workoutsForBlock(blockId);
  const todayWorkout = blockWorkouts[0];

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>TODAY</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Week {weekNumber} of 12 · {blockId}
            </Text>
          </View>

          <View style={[styles.actionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.actionsHeader}>
              <Text style={[styles.actionsTitle, { color: colors.text }]}>Today's Actions</Text>
              <Text style={[styles.actionsCount, { color: colors.mutedText }]}>
                {doneToday} of {totalToday}
              </Text>
            </View>
            <View style={styles.actionsList}>
              {week.weekAtAGlance.map((action) => (
                <DailyActionRow
                  key={action.id}
                  label={action.label}
                  thread={action.thread}
                  completed={todayCompletions.has(action.id)}
                  onToggle={() => toggleAction(action.id, action.weeklyTarget)}
                />
              ))}
            </View>
          </View>

          <PrimaryFocusCard
            primaryFocus={week.primaryFocus}
            toolSlugs={week.toolSlugs}
            weekNumber={weekNumber}
          />

          {todayWorkout ? (
            <Pressable
              onPress={() => router.push(`/workout/${todayWorkout.slug}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View
                style={[
                  styles.workoutCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.workoutTop}>
                  <Dumbbell color={colors.accent} size={18} strokeWidth={1.8} />
                  <Text style={[styles.workoutKicker, { color: colors.mutedText }]}>
                    {todayWorkout.exercises.length} EXERCISES
                  </Text>
                </View>
                <Text style={[styles.workoutTitle, { color: colors.text }]}>
                  {todayWorkout.title}
                </Text>
                {todayWorkout.helper ? (
                  <Text style={[styles.workoutHelper, { color: colors.mutedText }]} numberOfLines={2}>
                    {todayWorkout.helper}
                  </Text>
                ) : null}
                <View style={styles.workoutCta}>
                  <Text style={[styles.workoutCtaText, { color: COLORS.tangerine }]}>Open</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>
          ) : null}

          <DiscussionCard prompt={week.discussionPrompt} weekNumber={weekNumber} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionsCard: { borderRadius: 14, borderWidth: 1, gap: 12, padding: 14 },
  actionsCount: { fontFamily: FONTS.sansBold, fontSize: 12, letterSpacing: 0.4 },
  actionsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsList: { gap: 8 },
  actionsTitle: { fontFamily: FONTS.sansBold, fontSize: 18 },
  content: { gap: 14, paddingBottom: 128, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  header: { gap: 6 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 2.4 },
  phoneFrame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  screen: { alignItems: 'center', flex: 1 },
  title: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.3, lineHeight: 28 },
  workoutCard: { borderRadius: 14, borderWidth: 1, gap: 8, padding: 14 },
  workoutCta: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 4 },
  workoutCtaText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
  workoutHelper: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18 },
  workoutKicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.4 },
  workoutTitle: { fontFamily: FONTS.sansBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 22 },
  workoutTop: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add components/today app/\(tabs\)/today.tsx && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Refactor Today tab around the daily action checklist

New spine: header (Week N of 12 + BLOCK), daily actions card with
P/O/W/E/R badge per row, primary focus card linking to slides + tools,
today's workout card, and discussion prompt card. All persisted action
toggles flow through useDailyActions.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 13: Grow refactor + Fuel gating + Train tweak + workout detail cleanup

**Goal:** Refactor the Grow tab into the week archive, gate the Fuel tab on week 3, update Train tab header, and remove the stub-workout branch from workout detail.

**Files:**
- Modify: `app/(tabs)/grow.tsx` (full replace)
- Modify: `app/(tabs)/fuel.tsx` (full replace)
- Modify: `app/(tabs)/_layout.tsx` (gate Fuel)
- Modify: `app/(tabs)/train.tsx` (header tweak)
- Modify: `app/workout/[id].tsx` (remove stub branch)

### Task 13.1: Grow tab → week archive list

- [ ] **Step 1: Overwrite `app/(tabs)/grow.tsx`**

```tsx
// app/(tabs)/grow.tsx
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { WEEKS } from '../../lib/program';

export default function GrowScreen() {
  const colors = useThemeColors();
  const { weekNumber } = useCurrentWeek();

  const thisWeek = WEEKS.find((w) => w.weekNumber === weekNumber);
  const pastWeeks = WEEKS.filter((w) => w.weekNumber < weekNumber);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>GROW</Text>
            <Text style={[styles.title, { color: colors.text }]}>Your program library</Text>
          </View>

          {thisWeek ? (
            <View>
              <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>THIS WEEK</Text>
              <Pressable
                onPress={() => router.push(`/week/${thisWeek.weekNumber}`)}
                style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
              >
                <View style={[styles.bigCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.weekKicker, { color: colors.accent }]}>
                    WEEK {thisWeek.weekNumber} · {thisWeek.blockId}
                  </Text>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{thisWeek.title}</Text>
                  <Text style={[styles.cardBody, { color: colors.mutedText }]}>{thisWeek.primaryFocus}</Text>
                  <View style={styles.cardCta}>
                    <Text style={[styles.cardCtaText, { color: COLORS.tangerine }]}>Open</Text>
                    <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                  </View>
                </View>
              </Pressable>
            </View>
          ) : null}

          {pastWeeks.length > 0 ? (
            <View>
              <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>PAST WEEKS</Text>
              <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {pastWeeks.map((week, idx) => (
                  <Pressable
                    key={week.weekNumber}
                    onPress={() => router.push(`/week/${week.weekNumber}`)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
                  >
                    <View
                      style={[
                        styles.pastRow,
                        idx < pastWeeks.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                      ]}
                    >
                      <View style={styles.pastCopy}>
                        <Text style={[styles.pastWeekLabel, { color: colors.mutedText }]}>
                          WEEK {week.weekNumber} · {week.blockId}
                        </Text>
                        <Text style={[styles.pastTitle, { color: colors.text }]} numberOfLines={1}>
                          {week.title}
                        </Text>
                      </View>
                      <ArrowRight color={colors.mutedText} size={16} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bigCard: { borderRadius: 14, borderWidth: 1, gap: 8, marginTop: 8, padding: 14 },
  cardBody: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  cardCta: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 4 },
  cardCtaText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
  cardTitle: { fontFamily: FONTS.sansBold, fontSize: 20, letterSpacing: -0.2, lineHeight: 26 },
  content: { gap: 18, paddingBottom: 128, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  header: { gap: 6 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 2.4 },
  listCard: { borderRadius: 12, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  pastCopy: { flex: 1, gap: 3 },
  pastRow: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 14 },
  pastTitle: { fontFamily: FONTS.sansBold, fontSize: 15 },
  pastWeekLabel: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.6 },
  phoneFrame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  screen: { alignItems: 'center', flex: 1 },
  sectionLabel: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 2.2, paddingHorizontal: 4 },
  title: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.3, lineHeight: 28 },
  weekKicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.8 },
});
```

### Task 13.2: Fuel tab gating

- [ ] **Step 1: Overwrite `app/(tabs)/fuel.tsx`**

```tsx
// app/(tabs)/fuel.tsx
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { isFeatureUnlocked } from '../../lib/unlocks';

export default function FuelScreen() {
  const colors = useThemeColors();
  const { weekNumber } = useCurrentWeek();
  const mealLoggingUnlocked = isFeatureUnlocked('meal-logging', weekNumber);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>FUEL</Text>
            <Text style={[styles.title, { color: colors.text }]}>Nutrition this week</Text>
          </View>

          {!mealLoggingUnlocked ? (
            <Pressable
              onPress={() => router.push('/tool/nutrition-track-chooser')}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardKicker, { color: colors.accent }]}>THIS BLOCK</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Choose your nutrition track
                </Text>
                <Text style={[styles.cardBody, { color: colors.mutedText }]}>
                  In COMMIT, awareness comes first. Pick the track that meets you where you are.
                  Logging joins us in REFINE.
                </Text>
                <View style={styles.cardCta}>
                  <Text style={[styles.cardCtaText, { color: COLORS.tangerine }]}>Open the chooser</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardKicker, { color: colors.accent }]}>ABC POWER MEALS</Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Log today's meals</Text>
              <Text style={[styles.cardBody, { color: colors.mutedText }]}>
                Anchor, Balance, Complete. Tap a meal slot to log what you ate.
              </Text>
              <View style={styles.mealSlots}>
                {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((slot) => (
                  <View key={slot} style={[styles.mealSlot, { borderColor: colors.border }]}>
                    <Text style={[styles.mealSlotLabel, { color: colors.mutedText }]}>{slot}</Text>
                    <Text style={[styles.mealSlotHint, { color: colors.mutedText }]}>Tap to log</Text>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => router.push('/tool/abc-power-meals-guide')}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginTop: 6 })}
              >
                <View style={styles.cardCta}>
                  <Text style={[styles.cardCtaText, { color: COLORS.tangerine }]}>ABC reminder</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, gap: 10, padding: 14 },
  cardBody: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  cardCta: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  cardCtaText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
  cardKicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 2 },
  cardTitle: { fontFamily: FONTS.sansBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  content: { gap: 18, paddingBottom: 128, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  header: { gap: 6 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 2.4 },
  mealSlot: {
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: '48%',
    gap: 4,
    padding: 12,
  },
  mealSlotHint: { fontFamily: FONTS.sans, fontSize: 12 },
  mealSlotLabel: { fontFamily: FONTS.sansBold, fontSize: 13 },
  mealSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  phoneFrame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  screen: { alignItems: 'center', flex: 1 },
  title: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.3, lineHeight: 28 },
});
```

### Task 13.3: Train tab header tweak

- [ ] **Step 1: Edit `app/(tabs)/train.tsx`**

Replace the header section so it reads `Week N · BLOCK` and pulls helper text from `blockFor(currentBlock).mindset`. Concretely, change:

```ts
import type { BlockId } from '../../lib/curriculum';
import { isStubWorkout, workoutsForBlock } from '../../lib/workoutSchedule';
```

to:

```ts
import type { BlockId } from '../../lib/program';
import { blockFor } from '../../lib/program';
import { workoutsForBlock } from '../../lib/workoutSchedule';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
```

Replace the body of `TrainScreen`:

```tsx
export default function TrainScreen() {
  const colors = useThemeColors();
  const { weekNumber, blockId } = useCurrentWeek();
  const workouts = workoutsForBlock(blockId);
  const block = blockFor(blockId);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>
              WEEK {weekNumber} · {blockId}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Workouts</Text>
            <Text style={[styles.helper, { color: colors.mutedText }]} numberOfLines={3}>
              {block.mindset}
            </Text>
          </View>

          <View style={styles.grid}>
            {workouts.map((workout) => (
              <View key={workout.slug} style={styles.cell}>
                <WorkoutCard
                  title={workout.title}
                  helper={workout.helper}
                  exerciseCount={workout.exercises.length}
                  onPress={() => router.push(`/workout/${workout.slug}`)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
```

Drop the `StubWorkoutCard` import and the conditional render — every workout is real now. Drop the `isStubWorkout` import.

### Task 13.4: Workout detail cleanup

- [ ] **Step 1: Edit `app/workout/[id].tsx`**

Remove the `isStubWorkout(workout)` branch. Every workout is real now. Concretely, delete the block:

```tsx
  if (isStubWorkout(workout)) {
    return (
      <SafeAreaView ...>
        ...
      </SafeAreaView>
    );
  }
```

Remove the `isStubWorkout` import from `lib/workoutSchedule`.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add app/\(tabs\)/grow.tsx app/\(tabs\)/fuel.tsx app/\(tabs\)/train.tsx app/workout/\[id\].tsx && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Refactor Grow, gate Fuel, tweak Train, remove stub paths

Grow becomes a week archive (This Week + Past Weeks; future weeks
hidden). Fuel shows the Nutrition Track Chooser tool until Week 3,
then a basic ABC meal log scaffold from Week 3 onward. Train header
shows "Week N . BLOCK" with the block mindset as the helper. Workout
detail no longer has a stub branch.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 14: Delete orphans + final verification + memory update

**Goal:** Delete the legacy files that the new program model replaces, run a clean typecheck, and update memory.

**Files to delete:**
- `lib/curriculum.ts`
- `app/grow/[block].tsx`
- `app/grow/[block]/[slug].tsx`
- `components/workout/StubWorkoutCard.tsx`
- `components/grow/WorkoutLessonView.tsx`
- `components/grow/EducationalLessonView.tsx` (if present)
- `hooks/useSectionProgress.ts` (already deleted in Phase 9; verify gone)

### Task 14.1: Delete orphans

- [ ] **Step 1: Verify no consumers remain**

Run: `grep -rn "from '\.\./lib/curriculum'" lib hooks app components 2>/dev/null`
Expected: empty (no consumers).

Run: `grep -rn "StubWorkoutCard\|WorkoutLessonView\|EducationalLessonView\|useSectionProgress" app components hooks lib 2>/dev/null`
Expected: empty.

If any consumer remains, fix it before deleting. Most common: a stale import in `app/grow/` (those files are themselves being deleted). The order matters: delete files in this order.

- [ ] **Step 2: Delete in this order**

```bash
rm -f app/grow/\[block\]/\[slug\].tsx
rm -f app/grow/\[block\].tsx
rmdir app/grow 2>/dev/null || true
rm -f components/grow/WorkoutLessonView.tsx
rm -f components/grow/EducationalLessonView.tsx
rmdir components/grow 2>/dev/null || true
rm -f components/workout/StubWorkoutCard.tsx
rm -f lib/curriculum.ts
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: clean.

If typecheck fails because `lib/curriculum.ts` is referenced by something (e.g., a memory or types import), fix the consumer to import from `lib/program.ts` instead.

### Task 14.2: Memory update

- [ ] **Step 1: Replace `memory/exercise_library_landed.md` with a broader "program-foundation-landed" memory**

```bash
mv /Users/johnbryanliwanag/.claude/projects/-Users-johnbryanliwanag-tigerseyelife/memory/exercise_library_landed.md /Users/johnbryanliwanag/.claude/projects/-Users-johnbryanliwanag-tigerseyelife/memory/program_foundation_landed.md
```

Overwrite the file content to reflect that the 12-week foundation has landed. Update MEMORY.md to reference the new file.

The new file should note:
- All 12 weeks authored as native screens (slides + actions + tools + discussion)
- 24 Tools as native screens (replace with Karen's Canva PDFs when she ships)
- 4 workout templates (LOWER_BODY / UPPER_PUSH / UPPER_PULL / FULL_BODY) backing all 24 slots
- Commit Workout 1 remains the only fully authored workout
- AI coach LLM wiring still pending (next slice)
- Cleanup orphans to revisit: `lib/programs.ts`, `lib/workoutSeed.ts`, `hooks/useAssignedProgram.ts`, `hooks/useWorkout.ts`, `hooks/useWorkoutLibrary.ts`, `components/workout/WorkoutLibraryPanel.tsx`

### Task 14.3: Final commit

- [ ] **Step 1: Commit deletes**

```bash
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" add -A && \
git -c user.email="vuzzdotio@gmail.com" -c user.name="John Bryan Liwanag" commit -m "$(cat <<'EOF'
Delete legacy curriculum + thread-based grow screens

lib/curriculum.ts, app/grow/[block]*, components/grow/*, and
components/workout/StubWorkoutCard are replaced by lib/program.ts,
app/week/[n].tsx, and the populated workout schedule.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

### Task 14.4: Manual smoke checklist (human-driven, run after every phase but mandatory here)

Hand the implementer this checklist:

- [ ] **Step 1: Boot the app.** Run `npm start` and open in dev client or Expo Go.
- [ ] **Step 2: Sign in (dev mode).**
- [ ] **Step 3: Today tab smoke.** Header reads "TODAY" / "Week 1 of 12 · COMMIT". Action checklist shows 5 rows with P/W/R badges. Tap an action: it checks; tap again: it unchecks. Counter at top of card updates.
- [ ] **Step 4: Tap "Slides" in the primary focus card.** Routes to `/week/1`. Slide notes render. Tools render. Discussion prompt renders.
- [ ] **Step 5: Tap a tool card (e.g., 5 Universal Patterns).** Routes to `/tool/five-universal-patterns`. Static page body renders with intro + 6 sections.
- [ ] **Step 6: Back to Today, tap the workout card.** Routes to `/workout/commit-workout-1`. Exercise list renders. Tap an exercise → exercise detail with Start CTA.
- [ ] **Step 7: Fuel tab smoke.** In Week 1 (COMMIT), Fuel shows the Nutrition Track Chooser card. Tap → routes to `/tool/nutrition-track-chooser`.
- [ ] **Step 8: Train tab smoke.** Header reads "WEEK 1 · COMMIT" + the block mindset. Grid shows 4 cards (Workout 1 authored, Workouts 2/3/4 from templates). Tap Workout 2 → real exercise list (UPPER_PUSH template). Start the workout. Active logger lifecycle still works.
- [ ] **Step 9: Grow tab smoke.** In Week 1, only "This Week" section renders (no Past Weeks). Tap the card → routes to `/week/1`.
- [ ] **Step 10: Visit a future-week URL.** Manually open `/week/5` in dev menu. Should render "This week is ahead." with back navigation. No "coming soon" string anywhere.
- [ ] **Step 11: Visit a future tool URL.** Manually open `/tool/teb-loop-guide`. Should render "You will meet this one when you reach Week 5."
- [ ] **Step 12: Restart the app.** Today actions you checked off should still be checked. Tool fill-in fields should still have your text.

### Definition of done

- [ ] `npm run typecheck` clean
- [ ] All 12 weeks navigable from Today / Grow / direct URL
- [ ] All 24 tools navigable from week archive + Today + direct URL
- [ ] Train tab grid shows 4 workouts per block, every block, every workout startable
- [ ] Fuel tab hidden behavior: pre-Week 3 shows Nutrition Track Chooser, Week 3+ shows ABC meal log scaffold
- [ ] Daily action toggles persist across reload (dev + Supabase modes)
- [ ] No "coming soon" anywhere in the codebase (grep)
- [ ] No em dashes anywhere in user-facing copy (grep `—` in `app/`, `components/`, `lib/`)
- [ ] No countdowns/shaming language
- [ ] `lib/curriculum.ts` deleted
- [ ] `app/grow/[block]*` deleted
- [ ] `components/workout/StubWorkoutCard.tsx` deleted
- [ ] `components/grow/*` deleted
- [ ] `hooks/useSectionProgress.ts` gone, replaced by `useWeekProgress.ts`
- [ ] Memory file updated (`program_foundation_landed.md`)
- [ ] MEMORY.md entry updated

---

## Self-Review (against spec)

**Spec coverage:**
- §3.1 Program data model → Phase 1 + 2
- §3.2 Tools → Phases 3 + 4 + 5
- §3.3 Unlock gating → Phase 7
- §3.4 Daily action persistence → Phase 8
- §3.5 Current week derivation → Phase 7 + 9
- §3.6 Today tab refactor → Phase 12
- §3.7 Grow tab refactor → Phase 13
- §3.8 Tool screens → Phase 10
- §3.9 Train tab tweak → Phase 13
- §3.10 Workout templates → Phase 6
- §3.11 AI coach placeholder context → Phase 9 (useCoachContext rewrite)
- §6 Migration → Phases 8 + 9
- §7 Out of scope → respected (AI coach LLM wiring deferred; Canva decks deferred; workouts 1 in non-Commit blocks fall back to LOWER_BODY template)

**Placeholder scan:** No "TBD"/"TODO" markers in the plan. All code shown verbatim. Where a phase requires reading another file to extract context (Train tab tweak), the structure of the edit is specified concretely with the imports + replacement function body.

**Type consistency:** `WeekNumber` is defined in `lib/program.ts` and reused throughout (`useDailyActions`, `useCurrentWeek`, `useWeekProgress`, `app/week/[n].tsx`, `app/tool/[slug].tsx`). `BlockId` flows from `lib/program.ts` to `lib/workoutSchedule.ts` to `Train tab`. `ThreadLetter` is used by `DailyActionRow`. `ToolSlug` keys are used consistently across `lib/tools.ts`, `lib/toolContent/*.ts`, and `app/tool/[slug].tsx`. `WorkoutExercise` shape stays compatible with `lib/workoutSessionAdapter.ts` (untouched).

**Plan ready for execution.**

---

**Execution handoff:**

Plan complete and saved to `docs/superpowers/plans/2026-06-17-12-week-program-foundation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per phase, two-stage review between phases, fast iteration. Same approach as the workouts foundation slice.

**2. Inline Execution** — Execute phases in this session using executing-plans, batch with checkpoints.

Which approach?
