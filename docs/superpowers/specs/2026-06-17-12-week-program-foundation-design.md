# 12-Week CREATE POWER Program Foundation — Design

**Date:** 2026-06-17
**Owner:** John (vuzzdotio@gmail.com)
**Parent spec:** [docs/create-power-program-spec.md](../../create-power-program-spec.md) — full program brief
**Source of truth (content):** Karen's canonical "CREATE POWER 12-Week Curriculum Map" + "V2 CREATE POWER Actions Tracker" PDF (Karen Atler, Dec 2025 corrected revision)
**Companion guidance:** `CLAUDE.md` + memories on workout-naming-convention, video-hosting-youtube, create-power-progressive-unlock-schedule, automation-pattern-supabase-edge, no em dashes, no countdowns, light-locked surfaces, progressive disclosure default, Pressable+flex layout.

---

## 1. Purpose

Replace our current 6-thread × 6-block curriculum data model (36 sections, 2 authored, 34 stubs) with the canonical 12-week structure Karen actually delivers. Ship the entire 12-week program wired end-to-end with **zero "coming soon"** anywhere. Author all 12 weeks of slide notes, daily action checklists, discussion prompts, and 24 Tools as native screens. Wire the Today tab around a daily action checklist. Add progressive feature unlocks tied to current week (meal logging at Week 3, TEB Loop at Week 5, Box Breathing at Week 7, Bare Minimum Protocol at Week 8). Refactor the Grow tab into a week archive.

The AI coach LLM wiring is **explicitly out of scope** for this slice (separate brainstorm + spec + plan + slice). The coach placeholder receives unlock context so it's ready when the LLM lands.

## 2. Locked decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Data model | **Weeks-only migration.** Replace `lib/curriculum.ts` with `lib/program.ts` (12 weeks). P/O/W/E/R becomes a tag on `ActionItem.thread`. | Karen ships per-week, not per-thread. Thread-based was a force-fit. |
| 2 | Today tab spine | **Daily checklist front-and-center.** Today's actions row at the top, primary focus card below. | Matches Karen's "one primary focus per week" + daily action grid from the PDF. |
| 3 | Unauthored workouts fallback | **3 distinct generic templates rotated.** Workout 2 = Upper Push, Workout 3 = Upper Pull, Workout 4 = Full Body Mix. Same compositions across all 6 blocks at slots 2/3/4. | Honors the 24-workout structure without faking authored content. No "coming soon". |
| 4 | Tools + slides delivery | **Native screens now.** All 24 Tools + 12 Slide outlines authored as in-app screens from the curriculum map verbatim. Canva decks replace them per-week when Karen ships. | Map already contains every Tool description + every Slide bullet. We can ship today. |
| 5 | AI coach gating | **Pass current_week + unlocked features into context.** Coach (when wired) only references unlocked frameworks. Locked = politely defer to when it unlocks. | "Just-in-time implementation" principle; matches Karen's drip release. |
| 6 | Slice shape | **One bundled slice.** Data model + 12 weeks content + 24 Tools + 3 workout templates + Today tab rewrite + daily action persistence + unlock gating + Grow tab refactor. AI coach LLM wiring deferred. | Everything wires together. AI coach is its own beast (system prompt design, edge function, streaming). |
| 7 | Locked feature UX | **Hidden entirely, not shown with "Coming soon" or "Locks at Week N".** | User's explicit "no coming soon" stance. Progressive disclosure default. |

## 3. Architecture

### 3.1 Program data model — `lib/program.ts`

```ts
export type WeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export const WEEK_NUMBERS: readonly WeekNumber[];

export type BlockId = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';
export const BLOCK_IDS: readonly BlockId[];

export type ThreadLetter = 'P' | 'O' | 'W' | 'E' | 'R';
export const THREAD_NAMES: Record<ThreadLetter, string>;
// 'P' = 'Patterns', 'O' = 'Ownership', 'W' = 'Wisdom',
// 'E' = 'Energy', 'R' = 'Resilience'

export type CompassRole = 'PRIMARY' | 'SECONDARY' | 'MAINTAIN';

export type ActionItem = {
  id: string;            // 'commit-w1-patterns', 'evolve-w5-teb-practice'
  label: string;         // 'Notice mental patterns and triggers'
  thread: ThreadLetter;
  weeklyTarget: number;  // 7 = daily, 3 = 3x/week, etc.
};

export type Week = {
  weekNumber: WeekNumber;
  blockId: BlockId;
  title: string;                 // 'Week 1: Awareness & First Steps'
  primaryFocus: string;          // 'P: Identify stuck patterns | W: Choose nutrition track'
  slideNotes: string[];          // 8-10 bullets verbatim from Karen's map
  weekAtAGlance: ActionItem[];   // 5-8 actions; daily checklist source
  toolSlugs: string[];           // slugs that appear this week (resolved via tools.ts)
  discussionPrompt: string;      // 1 line from Karen's map
};

export type Block = {
  blockId: BlockId;
  weekRange: [WeekNumber, WeekNumber];  // [1, 2] for COMMIT, [3, 4] for REFINE, etc.
  mindset: string;                       // 'Build your foundation...'
  consistencyTarget: string;             // '40-50%' for COMMIT
  powerCompass: Record<ThreadLetter, { role: CompassRole; note: string }>;
};

export const BLOCKS: readonly Block[];
export const WEEKS: readonly Week[];

export function weekFor(n: WeekNumber): Week;
export function blockFor(id: BlockId): Block;
export function currentBlockFor(week: WeekNumber): BlockId;
export function weeksInBlock(blockId: BlockId): Week[];
```

All 12 entries are authored end-to-end from the curriculum map. Content sources per field:
- `slideNotes`: the 8-10 bullets in each week's row in the map
- `weekAtAGlance`: Karen's PDF page 2+ "Daily checkboxes" + the actions tracker grid
- `toolSlugs`: the "TOOL:" lines per week
- `discussionPrompt`: the "Discussion Prompt" line per week
- `primaryFocus`: the "PRIMARY FOCUS" line per week
- `powerCompass`: the "POWER Compass" box per block
- `mindset`: the "MINDSET FOR THIS BLOCK" callout per block
- `consistencyTarget`: stated per block

### 3.2 Tools — `lib/tools.ts`

```ts
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
  | { kind: 'static-page'; sections: { heading: string; body: string }[] }
  | { kind: 'checklist'; items: { id: string; label: string }[] }
  | { kind: 'menu-list'; items: { title: string; body: string }[] }
  | { kind: 'fill-in-template'; fields: { id: string; label: string; placeholder?: string }[] };

export type Tool = {
  slug: ToolSlug;
  title: string;
  introducedInWeek: WeekNumber;
  isStar: boolean;            // ★ in Karen's map = high-impact
  body: ToolBody;
};

export const TOOLS: Record<ToolSlug, Tool>;
export function toolBySlug(slug: ToolSlug): Tool;
export function toolsAvailableAt(week: WeekNumber): Tool[];
```

24 tools authored. Each renders via a single `app/tool/[slug].tsx` route that switches on `body.kind`. Bodies drawn from Karen's map descriptions:
- `five-universal-patterns`: a static-page with each of the 5 patterns described + a "which sounds like you?" reflection
- `abc-power-meals-guide`: a static-page using the exact ABC definition from CLAUDE.md / memory `create-power-frameworks`
- `teb-loop-guide`: static-page with Thinking → Emotion → Behavior + 3 example scenarios
- `kitchen-reset-guide`: a checklist body (fridge organization, pantry triggers, etc.)
- `pause-practice-guide`: a static-page with Notice → Pause → Observe + when to use
- `bare-minimum-protocol-builder`: a fill-in-template body
- `movement-breaks-menu` / `non-food-stress-relief-menu` / `movement-snacks-menu`: menu-list bodies
- (full table below in §4)

Tool bodies live in `lib/toolContent/<slug>.ts` files (one per tool) — split to keep individual files manageable and easy to update when Karen ships polished copy.

### 3.3 Unlock gating — `lib/unlocks.ts`

```ts
import type { WeekNumber } from './program';

export type FeatureKey =
  | 'meal-logging'
  | 'teb-loop'
  | 'box-breathing'
  | 'bare-minimum-protocol'
  | 'identity-statements'
  | 'pause-practice'
  | 'kitchen-reset'
  | 'meal-prep'
  | 'three-energy-accounts'
  | 'pattern-maintenance';

export const UNLOCK_AT: Record<FeatureKey, WeekNumber>;
// meal-logging: 3
// pause-practice: 4
// teb-loop: 5
// identity-statements: 5
// meal-prep: 5
// box-breathing: 7
// bare-minimum-protocol: 8
// three-energy-accounts: 10
// pattern-maintenance: 11
// kitchen-reset: 3

export function isFeatureUnlocked(feature: FeatureKey, currentWeek: WeekNumber): boolean;
export function unlockedFeaturesAt(currentWeek: WeekNumber): FeatureKey[];
```

Used by:
- `app/(tabs)/_layout.tsx` — Fuel tab hidden until `isFeatureUnlocked('meal-logging', currentWeek)`
- `app/tool/[slug].tsx` — returns "not yet" 404-style screen if tool's `introducedInWeek > currentWeek` (only reachable via direct URL; not exposed in navigation)
- `app/(tabs)/grow.tsx` — future weeks hidden; only current + past weeks listed
- Future AI coach context — `unlockedFeaturesAt(currentWeek)` in coach payload

### 3.4 Daily action completion persistence — `hooks/useDailyActions.ts`

New dual-path hook. Schema:

```sql
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
```

Hook API:

```ts
export type DailyActionRecord = {
  actionId: string;
  completedDate: string;   // ISO date 'YYYY-MM-DD'
  completedAt: string;     // ISO timestamp
  weekNumber: number;
};

export function useDailyActions(): {
  todayCompletions: Set<string>;        // action ids done today
  weekCompletions: Map<string, number>;  // action id → days done this week
  weekProgress: { completed: number; total: number; percentage: number };
  toggleAction: (actionId: string, weekNumber: number) => Promise<void>;
  loading: boolean;
};
```

Dev mode: writes to `AsyncStorage` under `tel:daily-actions:<userId>`. Supabase mode: writes to `user_daily_actions` table. Matches the dual-path pattern from `useDailyEntry.ts` and `useWorkoutSessions.ts`.

### 3.5 Current week derivation — `hooks/useCurrentWeek.ts`

```ts
export function useCurrentWeek(): {
  weekNumber: WeekNumber;
  blockId: BlockId;
  loading: boolean;
};
```

Reads `profiles.current_week` if present; falls back to deriving from `current_block` (COMMIT → 1, REFINE → 3, etc.). Default for new users: 1.

A new migration adds `profiles.current_week smallint DEFAULT 1` if not present. Backfill from `current_block` on migration.

### 3.6 Today tab refactor — `app/(tabs)/today.tsx`

Full replace. New structure (light-locked):

```
SafeAreaView
  ScrollView
    [Header]
      "TODAY"
      "Week N of 12 · BLOCKID"
    [Daily Actions Card]
      "Today's Actions"
      For each action in this week's weekAtAGlance:
        <DailyActionRow
          label={action.label}
          thread={action.thread}     // renders P/O/W/E/R badge
          completed={todayCompletions.has(action.id)}
          onToggle={() => toggleAction(action.id, currentWeek)}
        />
      Footer: "{completed} of {total} done today"
    [Primary Focus Card]
      kicker: "THIS WEEK'S FOCUS"
      title: this week's primary focus
      → Slides
      → Tools (N)
    [Today's Workout Card]
      Reuses logic from current Train tab card
      → Workout detail
    [Discussion Prompt Card]
      kicker: "FROM THE COMMUNITY"
      this week's discussion prompt
      → Grow tab (week archive deep link)
```

No em dashes anywhere. No countdowns. No "X days left" or progress shaming. Per the Pressable+flex layout memory, each card's layout lives in an inner View.

### 3.7 Grow tab refactor — `app/(tabs)/grow.tsx`

Full replace. New structure:

- **Top section: "This Week"** — current week's slides + tools + discussion prompt (1 card per piece, deep-link to detail screens).
- **Middle section: "Past Weeks"** — list of completed weeks (read-only). Each row: week number, week title, completion %. Tap → `app/week/[n].tsx` archive view.
- **Bottom section: hidden** — future weeks are not visible. Once user reaches Week 5, weeks 1–4 appear in "Past Weeks", week 5 is "This Week", weeks 6–12 are hidden.

The existing `app/grow/[block].tsx` and `app/grow/[block]/[slug].tsx` are replaced by `app/week/[n].tsx` — a single week archive screen showing slides + tools + discussion + completed actions for that week.

### 3.8 Tool screens — `app/tool/[slug].tsx`

Renders a tool by its slug. Switches on `Tool.body.kind`:

- `static-page`: stacked sections with headings + paragraphs
- `checklist`: checkbox list (no persistence — for reading, not tracking)
- `menu-list`: card list with title + body per item
- `fill-in-template`: simple text inputs for each field, persisted to AsyncStorage under `tel:tool-fill:<userId>:<slug>`

If accessed before the tool's `introducedInWeek`: render a polite "This unlocks during {blockId} (Week {n})" message. (Tools are not exposed in nav before they unlock, but direct URL access deserves an answer.)

### 3.9 Train tab refresh — minor

The current Train tab grid stays as-is. The only updates:
- Header: kicker reads "BLOCK · {blockId} · Week N" instead of "BLOCK · {blockId}"
- Helper: pulled from `Block.mindset` instead of the hardcoded string

### 3.10 Workout templates — `lib/workoutSchedule.ts`

The 23 unauthored slots get 3 distinct compositions rotated:

```ts
// Workout 2 — Upper Push
const UPPER_PUSH = [
  { exerciseId: 'db-overhead-press', sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'push-ups',          sets: 3, reps: 'AMRAP',   restSeconds: 60 },
  { exerciseId: 'seated-db-press',   sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'push-up-from-deficit', sets: 3, reps: '6 to 10', restSeconds: 60 },
  { exerciseId: 'biceps-curls',      sets: 2, reps: '12 to 15', restSeconds: 45 },
  { exerciseId: 'wall-15-bicep-curls', sets: 2, reps: '8 to 10', restSeconds: 45 },
];

// Workout 3 — Upper Pull
const UPPER_PULL = [
  { exerciseId: 'db-deadlift',         sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'db-bent-over-row',    sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: '1-arm-bor',           sets: 3, reps: '8 to 10 per side', restSeconds: 60 },
  { exerciseId: 'db-bor-reverse-grip', sets: 3, reps: '8 to 12', restSeconds: 60 },
  { exerciseId: 'biceps-curls',        sets: 2, reps: '12 to 15', restSeconds: 45 },
];

// Workout 4 — Full Body Mix
const FULL_BODY = [
  { exerciseId: 'db-sumo-squat',         sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: 'push-ups',              sets: 3, reps: 'AMRAP',    restSeconds: 60 },
  { exerciseId: 'sumo-db-rdl',           sets: 3, reps: '8 to 12',  restSeconds: 60 },
  { exerciseId: 'db-bent-over-row',      sets: 3, reps: '10 to 12', restSeconds: 60 },
  { exerciseId: 'db-stagger-stance-dl',  sets: 3, reps: '8 per leg', restSeconds: 60 },
  { exerciseId: 'biceps-curls',          sets: 2, reps: '12 to 15', restSeconds: 45 },
];
```

The `buildSchedule()` function in `lib/workoutSchedule.ts` is updated: for every (block, slot) pair where there's no `AUTHORED` entry, instead of emitting `{ exercises: [] }`, it emits the appropriate template:

- Slot 1 → **LOWER_BODY** (Commit Workout 1's existing composition: db-squat → db-deadlift → db-split-squat → push-ups → db-bent-over-row → biceps-curls)
- Slot 2 → **UPPER_PUSH**
- Slot 3 → **UPPER_PULL**
- Slot 4 → **FULL_BODY**

Each block thus has 4 distinct workouts forming a complete weekly split (lower / upper push / upper pull / full body). Commit Workout 1 is the canonical authored slot 1 today; when Karen+Ryan author block-specific compositions for REFINE/EVOLVE/ADAPT/THRIVE/EXCEL slot 1, those replace LOWER_BODY for that block.

Per-block helper text shifts framing without changing exercises:
- COMMIT slot 2: "Upper push. Focus on form."
- REFINE slot 2: "Upper push. Same exercises, more attention."
- EVOLVE slot 2: "Upper push. Drive identity through the rep."
- ADAPT slot 2: "Upper push. Use TEB when you want to stop early."
- THRIVE slot 2: "Upper push. Notice what's automatic now."
- EXCEL slot 2: "Upper push. This is your lifestyle now."

`isStubWorkout()` is no longer used (every workout now has exercises). The stub render path in `app/workout/[id].tsx` and `StubWorkoutCard` are removed.

### 3.11 AI coach placeholder context

The placeholder coach screens (`app/coach.tsx`, `components/navigation/CoachBottomSheet.tsx`) get a small update: receive `currentWeek` and `unlockedFeatures` via a new `useCoachContext` rewrite (the existing one reads orphan `useAssignedProgram` — this rewires it to the new program/unlock model). The placeholder text becomes:

> "I'll be ready to support you through Week {currentWeek} of {blockId}. Wire-up coming soon for the AI coach itself."

This sets us up for the AI coach slice without requiring it to ship in this slice.

## 4. Tools inventory (24)

| Week | Slug | Title | ★ | Body kind |
|---|---|---|---|---|
| 0 | `initial-questionnaire` | Initial Questionnaire | | fill-in-template |
| 0 | `habits-over-checklists` | Habits Over Checklists | | static-page |
| 1 | `five-universal-patterns` | 5 Universal Patterns | ★ | static-page |
| 1 | `nutrition-track-chooser` | Nutrition Track Chooser | | static-page |
| 2 | `movement-breaks-menu` | Movement Breaks Menu | | menu-list |
| 2 | `sleep-environment-checklist` | Sleep Environment Checklist | | checklist |
| 3 | `kitchen-reset-guide` | Kitchen Reset Guide | ★ | checklist |
| 3 | `abc-power-meals-guide` | ABC Power Meals Guide | | static-page |
| 4 | `pause-practice-guide` | Pause Practice Guide | | static-page |
| 4 | `wind-down-routine-builder` | Wind-Down Routine Builder | | menu-list |
| 5 | `teb-loop-guide` | TEB Loop Guide | ★ | static-page |
| 5 | `meal-prep-system-guide` | Meal Prep System Guide | ★ | static-page |
| 6 | `social-situations-playbook` | Social Situations Playbook | | menu-list |
| 6 | `movement-snacks-menu` | Movement Snacks Menu | | menu-list |
| 7 | `box-breathing-guide` | 4-4-4-4 Breathing Guide | ★ | static-page |
| 7 | `non-food-stress-relief-menu` | Non-Food Stress Relief Menu | | menu-list |
| 8 | `bare-minimum-protocol-builder` | Bare Minimum Protocol Builder | ★ | fill-in-template |
| 9 | `automaticity-audit` | Automaticity Audit | | checklist |
| 9 | `stress-signal-identifier` | Stress Signal Identifier | | fill-in-template |
| 10 | `energy-orchestra-planner` | Energy Orchestra Planner | | fill-in-template |
| 10 | `my-system-documentation` | My System Documentation | | fill-in-template |
| 11 | `pattern-maintenance-system` | Pattern Maintenance System | | static-page |
| 12 | `transformation-summary` | Transformation Summary | | fill-in-template |
| 12 | `whats-next-guide` | What's Next Guide | | static-page |

Each tool body is authored from the descriptions in Karen's map. Examples:

**5 Universal Patterns** (static-page):
- Section: "Why patterns?" Paragraph from the map.
- Section: "Pattern 1: [name]" — description + a sentence on what it sounds like
- … through Pattern 5
- Section: "Which one sounds like you?" — reflection prompt

**ABC Power Meals Guide** (static-page): Uses the exact ABC definition from memory `create-power-frameworks` (A = Anchor with Protein 25 to 35g, B = Balance Your Meal carbs/fats/fiber, C = Complete with Embellishments herbs/spices/sauces).

**TEB Loop Guide** (static-page): Thinking → Emotion → Behavior. The "let thinking drive the behavior" framing. 2 examples (an eating trigger, a stress trigger).

(Full body content is authored in implementation, not the spec.)

## 5. Files

### Create
- `lib/program.ts` — 12-week data model + helpers
- `lib/programContent.ts` — all 12 Week records authored
- `lib/tools.ts` — Tool registry + helpers
- `lib/toolContent/*.ts` — one file per Tool (24 files) with body
- `lib/unlocks.ts` — unlock schedule + helpers
- `lib/workoutTemplates.ts` — UPPER_PUSH, UPPER_PULL, FULL_BODY composition definitions
- `hooks/useDailyActions.ts` — dual-path daily action completion
- `hooks/useCurrentWeek.ts` — current week derivation
- `hooks/useCoachContext.ts` — **rewrite** existing file to consume new program model (no LLM yet)
- `components/today/DailyActionRow.tsx` — checkbox row with thread badge
- `components/today/PrimaryFocusCard.tsx`
- `components/today/DiscussionCard.tsx`
- `components/tool/StaticPageBody.tsx`
- `components/tool/ChecklistBody.tsx`
- `components/tool/MenuListBody.tsx`
- `components/tool/FillInTemplateBody.tsx`
- `app/tool/[slug].tsx`
- `app/week/[n].tsx` — week archive detail
- `supabase/migrations/0009_user_daily_actions.sql` — new table + RLS
- `supabase/migrations/0010_profiles_current_week.sql` — `current_week` column on profiles

### Refactor (full replace)
- `app/(tabs)/today.tsx` → daily checklist spine
- `app/(tabs)/grow.tsx` → week archive
- `app/(tabs)/_layout.tsx` → gate Fuel tab on `meal-logging` unlock; minor block-label updates
- `app/(tabs)/fuel.tsx` → before Week 3: NutritionTrackChooser tool; from Week 3+: meal logging
- `lib/workoutSchedule.ts` → emit templates instead of `exercises: []` for unauthored slots
- `hooks/useCoachContext.ts` → rewire to new program model

### Touch lightly
- `app/(tabs)/train.tsx` — header reads `Block.mindset` + week number
- `app/workout/[id].tsx` — remove `isStubWorkout` branch (no more stubs)
- `components/workout/StubWorkoutCard.tsx` — delete (no more stubs)
- `app/_layout.tsx` — register `tool/[slug]` and `week/[n]` routes
- `lib/curriculum.ts` — **delete** after migration verified
- `app/grow/[block].tsx`, `app/grow/[block]/[slug].tsx` — **delete** (replaced by week/[n])
- `components/grow/WorkoutLessonView.tsx` — **delete** (week archive handles)
- `components/grow/EducationalLessonView.tsx` — **delete**
- `hooks/useSectionProgress.ts` → renamed `useWeekProgress.ts`, reshaped to track week completion (a week is "complete" when ≥ 70% of its actions have been done at least once that week)

### Leave alone
- `app/workout/active/[sessionId].tsx`, `app/workout/complete/[sessionId].tsx`
- `components/workout/ActiveSetLogger.tsx`, `ProgressionTable.tsx`, `RestTimerOverlay.tsx`
- `lib/exerciseLibrary.ts` (18 exercises stay as-is)
- `lib/workoutSessionAdapter.ts`
- `stores/activeWorkout.ts`
- `app/exercise/[id].tsx` (just landed with Start CTA)

### Becomes orphan (NOT deleted in this slice, future cleanup)
- `lib/programs.ts`, `lib/workoutSeed.ts`, `hooks/useAssignedProgram.ts`, `hooks/useWorkout.ts`, `hooks/useWorkoutLibrary.ts`, `components/workout/WorkoutLibraryPanel.tsx`

## 6. Migration

Two new migrations:

**0009_user_daily_actions.sql** — table + RLS for the daily action completion (schema in §3.4).

**0010_profiles_current_week.sql**:
```sql
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

## 7. Out of scope

- **AI coach LLM wiring** (system prompt design, edge function, streaming, personalization). The placeholder gets context; LLM is the next major slice.
- **Authoring Workouts 1 of Refine/Evolve/Adapt/Thrive/Excel.** Slot 1 in those blocks stays authored when Karen+Ryan provide the composition. Until then, it falls back to the same template logic as slots 2/3/4 (or remains as Commit Workout 1's composition — TBD: spec defaults to "use UPPER_PUSH for slot 1 until block-specific composition lands").
- **Canva slide decks / Tool PDFs as media.** Native screens ship now from the map's bullets/descriptions. When Karen ships polished assets, swap-in is a per-week PR.
- **Per-user workout assignment override.** Out for this slice.
- **Streak recalculation engine.** Streaks already exist from prior slices; daily actions feed in but the existing streak hook stays as-is.
- **Admin panel.** Out.
- **Weekly reflection** flow (separate from daily check-in). Out — addressed in a future slice if Karen+Ryan request it.
- **Onboarding changes.** New users land on Week 1 by default; the existing onboarding flow stays intact.
- **Wearable integration / Apple Health.** Out.

## 8. Definition of done

- [ ] `lib/program.ts` exports 12 Week entries; `WEEKS.length === 12`
- [ ] Every Week has authored `slideNotes` (≥ 6 bullets), `weekAtAGlance` (≥ 4 actions), `discussionPrompt`, `primaryFocus`, `toolSlugs`
- [ ] `lib/tools.ts` exports 24 Tools
- [ ] Each Tool has an authored body (static-page / checklist / menu-list / fill-in-template)
- [ ] All `lib/workoutSchedule.ts` slots have populated `exercises` (24 of 24, no stubs)
- [ ] Today tab renders daily action checklist + primary focus + today's workout + discussion prompt
- [ ] Tapping an action toggles its completion and persists across reload (dev + Supabase modes)
- [ ] Daily action footer shows "{n} of {total} done today"
- [ ] Fuel tab is hidden before Week 3; visible Week 3+ with NutritionTrackChooser placeholder until meal log lands later
- [ ] Grow tab shows This Week + Past Weeks; future weeks hidden
- [ ] Tool routes resolve and render correct body for all 24 tools
- [ ] Week archive route renders for week ≤ currentWeek; refuses politely for future weeks
- [ ] `useCoachContext` reads new program model (no AI yet)
- [ ] `npm run typecheck` clean
- [ ] No "Coming soon", no em dashes, no countdowns/shaming language
- [ ] `lib/curriculum.ts` deleted; replaced by `lib/program.ts`
- [ ] Old `grow/[block]` screens deleted; replaced by `week/[n]`

## 9. Open product items (defaults noted)

| Item | Default | Owner |
|------|---------|-------|
| Block-specific Workout 1 composition (REFINE through EXCEL) | Use LOWER_BODY template (Commit Workout 1 composition) until authored | Karen + Ryan to author |
| Polished Canva slide decks | Native screen from map bullets | Karen to produce |
| Tool PDFs (Karen's 1-pagers) | Native tool screens from map descriptions | Karen to produce |
| Sport-specific exercise variations | Out of scope; general program for now | Future slice |
| Weekly reflection prompt | Skipped in favor of discussion prompt | Karen+Ryan to confirm |
| Default new-user week | Week 1 (COMMIT) | OK as-is |
| Action completion celebration UX | Subtle haptic + visual; no confetti, no shaming | Confirmed by tone memory |
| Wearable / Apple Health integration | Phase 2 (out of scope) | Karen + Ryan |

