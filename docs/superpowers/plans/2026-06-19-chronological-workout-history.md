# Chronological Workout History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the existing `ProgressionTable` on the exercise detail screen so Create Power members see their chronological weight/rep history per exercise — the Friday commit from Karen + Carlos June 17 catch-up.

**Architecture:** Reuse [components/workout/ProgressionTable.tsx](../../../components/workout/ProgressionTable.tsx) outside the active session by adding one backward-compatible prop (`showTodayColumn?: boolean`). Add a tiny `lib/units.ts` for lbs display (data model stays kg). Wire the section into [app/exercise/[id].tsx](../../../app/exercise/[id].tsx) between the YouTube player and Muscle Groups using `useWorkoutSessions` (which already returns all sessions, dev-mode or Supabase).

**Tech Stack:** React Native (Expo SDK), expo-router, TypeScript, React Query (already wired in `useWorkoutSessions`), StyleSheet + theme tokens from `lib/brand.ts`.

## Global Constraints

- **Verification gate:** `npm run typecheck`. No test runner, no ESLint, no formatter in this repo (per [CLAUDE.md](../../../CLAUDE.md)). Manual UI verification fills the test gap.
- **Dual-path data layer:** Every data read must work in both Supabase and dev mode (`isDevSession`). `useWorkoutSessions` already handles this — do not introduce a Supabase-only path.
- **Styling:** Use `StyleSheet.create` + theme tokens from `lib/brand.ts` and `useThemeColors()`. Do not introduce NativeWind on this screen — [app/exercise/[id].tsx](../../../app/exercise/[id].tsx) is StyleSheet-based.
- **No em dashes (—) in user-facing copy.** Periods or commas instead.
- **Workout naming:** "Workout 1/2/3/4," never body-part labels (memory: workout_naming_convention).
- **No countdowns, deadlines, or shaming copy** (memory: feedback_create_power_tone).
- **Backward compatibility:** The existing `ProgressionTable` call site in [app/workout/active/[sessionId].tsx](../../../app/workout/active/[sessionId].tsx) must continue to render the TODAY column unchanged. New prop defaults to `true` to preserve behavior.
- **Schema unchanged.** No migrations. `weight_kg` stays the storage unit; only display converts to lbs.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| [lib/units.ts](../../../lib/units.ts) | Create | `kgToLb` numeric conversion + `formatWeight` display formatter ("5lb", "12.5lb"). Pure functions, no React. |
| [components/workout/ProgressionTable.tsx](../../../components/workout/ProgressionTable.tsx) | Modify | Add `showTodayColumn?: boolean` prop (default `true`). Swap inline `formatWeight` for the shared helper. |
| [app/exercise/[id].tsx](../../../app/exercise/[id].tsx) | Modify | Render a "Your history" section between the YouTube player and Muscle Groups, using `ProgressionTable` with `showTodayColumn={false}` and `maxColumns={6}`. Empty-state card when no historical sets exist. |

No other files change. No new hooks, no new migrations, no new query keys.

---

## Task 1: Add the units helper

**Files:**
- Create: `lib/units.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `kgToLb(kg: number): number` and `formatWeight(kg: number): string`. `formatWeight` returns whole numbers without decimals ("5lb"), one decimal when fractional ("12.5lb"). Both consumed by `ProgressionTable` in Task 2 and the exercise detail screen in Task 3.

- [ ] **Step 1: Create the file**

Write `lib/units.ts`:

```ts
// lib/units.ts
//
// Display-side weight conversion. Storage stays kg (see schema in
// lib/workouts.ts: WorkoutSetLog.weight_kg). Beta cohort coaches and
// members work in lbs per Karen's worked examples, so progression UI
// shows lbs while the database stays SI.

const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function formatWeight(kg: number): string {
  const lb = kgToLb(kg);
  const rounded = Math.round(lb * 10) / 10;
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${display}lb`;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors (the new file has no consumers yet, so this is a sanity check that the syntax is valid).

- [ ] **Step 3: Commit**

```bash
git add lib/units.ts
git commit -m "$(cat <<'EOF'
Add lbs display helper for workout weights

Storage stays kg; display flips to lbs to match Karen's worked
examples and the beta cohort's coaching language.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Make `ProgressionTable` reusable outside the active session

**Files:**
- Modify: `components/workout/ProgressionTable.tsx`

**Interfaces:**
- Consumes: `formatWeight(kg: number): string` from `lib/units.ts` (Task 1).
- Produces: A `ProgressionTable` component whose new optional prop `showTodayColumn?: boolean` (default `true`) controls whether the trailing TODAY column is rendered. Task 3 calls this with `showTodayColumn={false}` and `maxColumns={6}`.

- [ ] **Step 1: Add the prop and the units import**

In [components/workout/ProgressionTable.tsx](../../../components/workout/ProgressionTable.tsx):

Add to the imports near the top (after the brand import):

```tsx
import { formatWeight } from '../../lib/units';
```

Extend the `Props` type:

```tsx
type Props = {
  exercise: WorkoutExercise;
  sessions: WorkoutSession[];
  workoutId?: string | null;
  todaySetLogs: WorkoutSetLog[];
  maxColumns?: number;
  showTodayColumn?: boolean;
};
```

Destructure the new prop in the component signature with its default:

```tsx
export function ProgressionTable({
  exercise,
  sessions,
  workoutId,
  todaySetLogs,
  maxColumns = 3,
  showTodayColumn = true,
}: Props) {
```

- [ ] **Step 2: Gate the TODAY column on the new prop**

In the `columns` `useMemo` (currently lines ~35-65), the `cols.push({ isToday: true, ... })` call unconditionally appends the TODAY column. Gate it on `showTodayColumn`:

```tsx
    if (showTodayColumn) {
      cols.push({
        isToday: true,
        key: 'today',
        label: 'TODAY',
        setLogs: todaySetLogs,
        sublabel: format(new Date(), 'MMM d'),
      });
    }

    return cols;
  }, [sessions, workoutId, exercise.id, todaySetLogs, maxColumns, showTodayColumn]);
```

(Note the dependency array now includes `showTodayColumn`.)

- [ ] **Step 3: Replace the local `formatWeight` with the shared helper**

The current file has a local `formatWeight(kg: number)` near the bottom (around line 215) that returns the raw number without a unit suffix, and the call site at line 201 wraps it with `${...}kg`. Remove the local helper entirely, and update the call site to use the shared helper:

Change line 201 from:

```tsx
        {match.weight_kg > 0 ? `${formatWeight(match.weight_kg)}kg` : '…'}
```

to:

```tsx
        {match.weight_kg > 0 ? formatWeight(match.weight_kg) : '…'}
```

Delete the local helper function (lines ~215-217):

```tsx
function formatWeight(kg: number) {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors. The default `showTodayColumn = true` preserves the existing active-session behavior.

- [ ] **Step 5: Manual smoke test of the active session call site**

Start the app: `npm start`
Navigate: sign in (or skip for dev) → onboard → Train tab → start any workout → log a set → confirm the progression table at the top of the active workout still shows the TODAY column with the logged set in lbs (e.g. "11lb × 8") rather than kg.

If the column is missing or weights still read "kg", the diff is wrong. Stop and fix before committing.

- [ ] **Step 6: Commit**

```bash
git add components/workout/ProgressionTable.tsx
git commit -m "$(cat <<'EOF'
Make ProgressionTable reusable outside the active session

Adds showTodayColumn prop (default true) so the same component can
render a pure history view on the exercise detail screen without a
TODAY column. Swaps the local kg formatter for the shared lbs
helper from lib/units.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Render "Your history" on the exercise detail screen

**Files:**
- Modify: `app/exercise/[id].tsx`

**Interfaces:**
- Consumes: `ProgressionTable` (Task 2) with `showTodayColumn={false}` and `maxColumns={6}`; `useWorkoutSessions` from `hooks/useWorkoutSessions`; `EXERCISE_LIBRARY` already imported on this screen.
- Produces: A new section titled "Your history" rendered between the YouTube player block (the `videoWrap` / `videoPlaceholder` ternary) and the "Muscle Groups" section. When the user has zero completed sessions containing this exercise, the section shows a one-line empty-state card instead of the table.

- [ ] **Step 1: Import `ProgressionTable` and the sessions hook**

In [app/exercise/[id].tsx](../../../app/exercise/[id].tsx), add to the existing imports:

```tsx
import { useMemo } from 'react';
import { ProgressionTable } from '../../components/workout/ProgressionTable';
```

(`useState` is already imported from `react`; extend the existing import to include `useMemo` instead of adding a separate line.)

`useWorkoutSessions` is already imported at the top of the file.

- [ ] **Step 2: Pull sessions and compute whether there is history for this exercise**

Inside the `ExerciseDetailScreen` component, after the existing `const { saveSession } = useWorkoutSessions();` line, add:

```tsx
  const { sessions } = useWorkoutSessions();

  const hasHistory = useMemo(() => {
    if (!exercise) return false;
    return sessions.some(
      (s) =>
        Boolean(s.completed_at) &&
        s.set_logs.some((log) => log.exercise_id === exercise.id),
    );
  }, [sessions, exercise]);
```

(Note: this replaces the existing `const { saveSession } = useWorkoutSessions();` line — destructure both off the same call instead of calling the hook twice.)

Final form of that line:

```tsx
  const { saveSession, sessions } = useWorkoutSessions();
```

- [ ] **Step 3: Render the "Your history" section between the video and Muscle Groups**

In the `ScrollView`, after the YouTube player block (the `exercise.youtubeVideoId ? (...) : (...)` ternary) and before the `<View>` that contains "Muscle Groups", insert:

```tsx
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your history</Text>
          {hasHistory ? (
            <View style={styles.historyWrap}>
              <ProgressionTable
                exercise={{
                  id: exercise.id,
                  name: exercise.name,
                  equipment: '',
                  target_sets: 4,
                  target_reps: '',
                  rest_seconds: 0,
                  is_warmup: false,
                }}
                sessions={sessions}
                todaySetLogs={[]}
                showTodayColumn={false}
                maxColumns={6}
              />
            </View>
          ) : (
            <View
              style={[
                styles.historyEmpty,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.historyEmptyText, { color: colors.mutedText }]}>
                No history yet. Your weights and reps will show here after your first session of this exercise.
              </Text>
            </View>
          )}
        </View>
```

Why the synthetic `WorkoutExercise` object: `EXERCISE_LIBRARY` entries are not full `WorkoutExercise` records (no target_sets/reps), so we build a minimal shape that `ProgressionTable` accepts. `target_sets: 4` matches the Create Power program's main-exercise default and determines how many rows the table renders for sets that have no logged data; `is_warmup: false` keeps the cell rendering in the weight+reps path rather than the warmup checkmark path.

- [ ] **Step 4: Add the new styles**

In the `StyleSheet.create({...})` block at the bottom, add two new entries (keep them alphabetized with the surrounding entries):

```tsx
  historyEmpty: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  historyEmptyText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  historyWrap: {
    marginTop: 12,
  },
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Manual verification — exercise with history**

Start the app in dev mode: `npm start` → "Skip for dev" on sign-in.

The dev seed in [lib/workoutHistorySeed.ts](../../../lib/workoutHistorySeed.ts) creates three past sessions of "Workout 1" with logged sets for `ex_2` through `ex_6` (and `ex_1` as warmup).

Navigate: Train tab → open Workout 1 → tap an exercise (e.g. the second exercise, which is `ex_2`). On the exercise detail screen, confirm:

- "Your history" section appears between the YouTube player and "Muscle Groups."
- Three historical columns appear, no TODAY column.
- Column headers show dates ("Jun 12", "Jun 5", "May 29" or similar relative to today) and "X wks ago" sublabels.
- Cell values render in lbs, e.g. "33lb × 10" rather than "15kg × 10."

- [ ] **Step 7: Manual verification — exercise with no history**

Still in dev mode, navigate to an exercise that has no historical entries (any exercise not in the lower-body-A seed, e.g. `ex_7` or beyond). Confirm the empty-state card renders with the copy "No history yet. Your weights and reps will show here after your first session of this exercise." and no broken table.

If the empty-state copy is wrong or the table renders empty rows instead, the `hasHistory` computation is wrong. Stop and fix before committing.

- [ ] **Step 8: Manual verification — active session still works**

Sanity-check the existing call site one more time: Train tab → start any workout → log a set → confirm the active-session progression table still includes the TODAY column with the logged set in lbs. This is the same check from Task 2 Step 5 but is worth re-running after the second edit lands.

- [ ] **Step 9: Commit**

```bash
git add app/exercise/[id].tsx
git commit -m "$(cat <<'EOF'
Show chronological history on the exercise detail screen

Adds a Your history section between the YouTube player and Muscle
Groups, rendering up to 6 past sessions per set. Empty state when
the member has not logged this exercise yet. This is the Friday
commit from the Karen catch-up.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage:**

- Exercise detail surface → Task 3.
- `ProgressionTable` reuse with `showTodayColumn` + `maxColumns=6` → Task 2 (prop), Task 3 (consumes).
- `lib/units.ts` with `kgToLb` + `formatWeight` → Task 1.
- `ProgressionTable` swaps inline formatter for shared helper → Task 2 Step 3.
- Empty state copy → Task 3 Step 3.
- `weight_kg` schema unchanged → no migration task, by design.
- Active session backward compatibility → Task 2 Step 5 + Task 3 Step 8.

**Spec audit step:** the spec calls for a one-pass audit of other on-screen cells reading `weight_kg` and hardcoding "kg". The only consumer of the local `formatWeight` was `ProgressionTable` itself (verified via earlier grep). The active session screen does render totals (`total_volume_kg`) but the spec explicitly defers that surface ("If it's deeper, defer."). No additional task required — flagged as a follow-up below.

**Placeholder scan:** no TBDs, no "implement later," no "similar to Task N." Every code step shows the actual code.

**Type consistency:**

- `formatWeight(kg: number): string` — signature consistent across Task 1 (definition), Task 2 (consumer), Task 3 (transitive via ProgressionTable).
- `showTodayColumn?: boolean` (default `true`) — added in Task 2, consumed as `false` in Task 3.
- `maxColumns?: number` (default 3) — already existed; Task 3 passes `6`.

**Follow-up (not in this plan, captured for next-week scope):**

- Audit active-session totals strip and history day for hardcoded "kg" rendering.
- Pre-start "recent sets" strip on the workout detail page.
- 12-week chart view if Karen asks after the demo.
