# Curriculum Vertical Slice — Commit Block

**Date:** 2026-06-16
**Owner:** John (vuzzdotio@gmail.com)
**Parent spec:** [docs/create-power-program-spec.md](../../create-power-program-spec.md) — the full 12-week / 6-block CREATE POWER program brief
**Companion guidance:** `CLAUDE.md` (engineering) + `CLAUDE.product.md` (product direction) + memories on tone, em-dashes, palette discipline

---

## 1. Purpose

Ship the first vertical slice of the CREATE POWER program for verified Commit-block members. Curriculum *sections* replace the existing daily *power-actions* model as the canonical unit of progress. One slice proves the entire flow (data model → screens → completion → block advancement) end-to-end with two authored lessons, and stubs the rest so the remaining 34 sections become content work, not engineering work.

## 2. Locked decisions (from this brainstorming session)

| # | Decision | Choice |
|---|----------|--------|
| 1 | First subsystem | Curriculum (over daily check-in, onboarding deepening, AI coach) |
| 2 | Slice depth | One block end-to-end + block/section navigation scaffolding |
| 3 | Sections vs actions | Sections REPLACE the action model (semantically; physical cleanup deferred) |
| 4 | Lesson shape | Heterogeneous — discriminated union by `kind`. Ship `educational` + `workout` shapes in this slice. |
| 5 | Content home | TypeScript constants in `lib/curriculum.ts`. Migrate to SQL when admin editing lands. |
| 6 | Video hosting | Out of scope. Use a placeholder URL for the workout-shape sample. |

## 3. Architecture

### 3.1 Data model (`lib/curriculum.ts`)

```ts
export type BlockId = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';

// 6 threads per block — Wisdom is split into Nutrition + Workouts to total 6
// (matches the parent spec's "36 sections = 6 blocks × 6 threads" arithmetic).
export type ThreadLetter = 'P' | 'O' | 'W_NUTRITION' | 'W_WORKOUTS' | 'E' | 'R';

export const THREAD_NAMES: Record<ThreadLetter, string> = {
  P: 'Patterns',
  O: 'Ownership',
  W_NUTRITION: 'Wisdom · Nutrition',
  W_WORKOUTS: 'Wisdom · Workouts',
  E: 'Energy',
  R: 'Resilience',
};

export type LessonContent = EducationalContent | WorkoutContent;

export type EducationalContent = {
  kind: 'educational';
  introParagraph: string;
  keyConcepts: { title: string; body: string }[];
  takeaway: string;
  reflectionPrompt: string;
};

export type WorkoutContent = {
  kind: 'workout';
  videoUri: string;          // placeholder until hosting decided
  muscleGroups: { name: string; primary: boolean }[];
  instructions: string[];   // numbered steps
  setRepTarget?: string;     // e.g., "3 sets × 8 to 12 reps"
};

export type Section = {
  blockId: BlockId;
  threadLetter: ThreadLetter;
  order: 1 | 2 | 3 | 4 | 5 | 6;  // position within block
  slug: string;                   // stable identifier, used for progress key
  title: string;
  emoji?: string;
  content: LessonContent;
};

export const CURRICULUM: readonly Section[] = [/* 36 entries */];

// Helpers:
export function sectionsForBlock(blockId: BlockId): Section[];
export function sectionBySlug(slug: string): Section | undefined;
```

Adding a third lesson shape (recipes, breathwork, anything) later = a new arm of `LessonContent` plus a new render branch in the section detail screen. No schema migration, no consumer rewrites.

### 3.2 Schema (migration 0007)

```sql
-- supabase/migrations/0007_curriculum_section_progress.sql

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
```

### 3.3 RPCs

```sql
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
    set completed = true, completed_at = excluded.completed_at;

  perform public.maybe_advance_block(auth.uid());
end;
$$;

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
    where user_id = p_user_id and block_name = v_current and completed = true;

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
```

`maybe_advance_block` is `security definer` so it bypasses the `profiles_entitlement_guard` trigger from migration 0006 — the only legal path to changing `current_block` from inside a request. The trigger continues to reject any non-service-role direct update.

### 3.4 Hook (`hooks/useSectionProgress.ts`)

Dual-path per `CLAUDE.md`:

- **Supabase mode** — selects from `user_section_progress`, calls `complete_section_user` RPC, refetches on success.
- **Dev mode** — AsyncStorage key `tel:sections:<userId>` storing `Record<sectionSlug, completedAt>`. `completeSection` writes locally and updates `currentBlock` directly on the dev membership record when the 6th of a block completes.

Returned shape:

```ts
type UseSectionProgress = {
  loading: boolean;
  progress: Record<string, string>;  // slug → completedAt ISO
  isCompleted: (slug: string) => boolean;
  completedInBlock: (block: BlockId) => number;  // 0..6
  completeSection: (block: BlockId, slug: string) => Promise<void>;
  refresh: () => Promise<void>;
};
```

## 4. Screens

### 4.1 `/grow` — block list (refactor existing `app/(tabs)/grow.tsx`)

- Top intro stays (GROW kicker + "CREATE POWER blocks" title + helper text).
- Replace `BlockSummaryCard` mapping over `powerBlocks` with mapping over the 6 `BlockId`s, each rendered via a new `BlockCard` component pulling progress from `useSectionProgress`.
- Each card: block name, helper text, `progress / 6` chip, state (`current` highlighted gold, `done` checkmark, `locked` muted).
- `current_block` is the unlocked / highlighted block; others before it are `done`; others after are `locked` (visually softer but still tappable per spec §3.4).
- Existing microlearning section below the block list stays untouched.

### 4.2 `/grow/[block]` — section list (refactor existing)

- Header: block name + helper.
- Below: 6 rows ordered by `order`. Each row shows: kicker (P.O.W.E.R. letter via `THREAD_NAMES`), title, completion checkmark or chevron.
- Tap → `/grow/[block]/[slug]`.
- Drop the existing `[block].tsx` logic that consumed `powerBlocks`; replace with `sectionsForBlock(BlockId)`.

### 4.3 `/grow/[block]/[slug]` — section detail (NEW)

Renders by `content.kind`:

- `educational`: intro paragraph → list of key concepts (title + body) → "TAKEAWAY" callout card → "REFLECT" prompt card.
- `workout`: video placeholder card (gray rectangle with play icon for slice 1) → muscle groups (pills with `PRIMARY` tag when applicable) → numbered instructions → set/rep target chip.

"Complete and Next" CTA at the bottom:

- Activates immediately on mount. **No scroll-to-bottom detection, no IntersectionObserver, no timer** (parent-spec hard rule).
- On press: `completeSection(blockId, slug)` → resolves next incomplete section in same block → navigate there. If no incomplete remain, navigate back to `/grow/[block]` where the section list now shows all six rows checked plus an inline "Block complete. Karen and Ryan are loading the next block." note above the list.

**Stub sections** (the 34 that aren't authored): the renderer shows the kicker + title + a single-line "Karen and Ryan are writing this one." centered card. The Complete button stays present (relabelled to "Mark as read") so members can still progress through the block — without this, we can never validate the COMMIT → REFINE auto-advance because the Commit block has only 2 authored sections in this slice. Once Karen/Ryan author the remaining content, the button copy reverts to "Complete and Next" automatically (the renderer detects whether the content fields are populated).

## 5. Today integration

`components/today/NextLessonCard.tsx` becomes consumer of `useSectionProgress + useMembership.currentBlock`:

- Picks the next incomplete section (lowest `order` not in `progress`) in `current_block`.
- Renders title + thread name as meta, lesson thumbnail keeps the existing scene photo for now.
- Tap routes to `/grow/[block]/[slug]`.
- If all 6 sections of `current_block` are done: render a "Block complete" state ("Karen and Ryan are loading the next block. Take a breath.") with a tap → `/grow`.

`CommitBlockToday` and the anchors stay as they are. The 3 anchors (read labels / cut sugar / protein+veg) remain hardcoded for this slice; deriving them from `current_block`'s active sections is a follow-up.

## 6. Authored content

Two sections get real content. The other 34 are stubs.

**Real lesson 1 — educational**

```ts
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
}
```

ABC wording is **verbatim** per the frameworks memory.

**Real lesson 2 — workout**

```ts
{
  blockId: 'COMMIT',
  threadLetter: 'W_WORKOUTS',
  order: 4,
  slug: 'commit-hinge-pattern',
  title: 'Hinge Pattern: Deadlift Setup',
  emoji: '🏋',
  content: {
    kind: 'workout',
    videoUri: 'placeholder://ryan-hinge-pattern',  // hosting TBD
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
}
```

The other 34 entries have `title: '<thread name> · <block> coming soon'` and `content: { kind: 'educational', introParagraph: 'Karen and Ryan are writing this one.', keyConcepts: [], takeaway: '', reflectionPrompt: '' }`.

## 7. Files

### Create
- `supabase/migrations/0007_curriculum_section_progress.sql`
- `lib/curriculum.ts`
- `hooks/useSectionProgress.ts`
- `components/grow/BlockCard.tsx`
- `components/grow/SectionRow.tsx`
- `app/grow/[block]/[slug].tsx` (dynamic route, currently doesn't exist)

### Refactor (keep file, change body)
- `app/(tabs)/grow.tsx` — block list driven by `BlockId[]` not `powerBlocks`
- `app/grow/[block].tsx` — section list driven by `sectionsForBlock()`
- `components/today/NextLessonCard.tsx` — bind to `useSectionProgress` + `currentBlock`

### Out of scope (leave alone in this slice)
- `lib/powerBlocks.ts` — becomes orphan code, future slice deletes
- `hooks/usePowerActionProgress.ts` — same
- The existing microlearning section in `/grow` — keep visible below the new block list
- `components/today/CommitBlockToday.tsx` anchor list — stays hardcoded
- `app/(tabs)/_layout.tsx` — Nutrition lock stays as is

## 8. Out of scope (explicit, no scope creep)

- Daily check-in (separate subsystem; future slice)
- Weekly reflection (future slice)
- AI coach LLM wiring (future slice)
- Admin panel + Make.com webhook (future slice)
- 4-section deepened onboarding (future slice)
- Video hosting integration (Cloudflare Stream / Mux / Vimeo)
- Replacing the existing spreadsheet beta-tester tracking model in detail (we replace it semantically with section progress; mirroring specific spreadsheet fields is follow-up)
- Authoring content for the other 34 sections
- Routes for completed-block celebration screen beyond a simple inline state
- Migrating curriculum from `lib/` to a SQL `sections` table

## 9. Definition of done

- [ ] `supabase/migrations/0007_curriculum_section_progress.sql` applies cleanly
- [ ] `complete_section_user` RPC upserts progress
- [ ] `maybe_advance_block` advances `profiles.current_block` from `COMMIT` → `REFINE` when all 6 Commit sections are complete, verified in both Supabase mode and dev mode
- [ ] `lib/curriculum.ts` exports 36 sections (2 real + 34 stubs) typed against the discriminated union
- [ ] `useSectionProgress` hook works in both Supabase and dev modes
- [ ] `/grow` renders 6 block cards with progress chips; Commit is the highlighted/unlocked card
- [ ] `/grow/commit` renders 6 section rows
- [ ] `/grow/commit/commit-balanced-plate` renders the educational layout end-to-end and the Complete button works
- [ ] `/grow/commit/commit-hinge-pattern` renders the workout layout with placeholder video and the Complete button works
- [ ] Today's `NextLessonCard` dynamically picks the next incomplete section
- [ ] Completing the last Commit section + reloading shows REFINE as `current_block`
- [ ] `npm run typecheck` clean
- [ ] No em dashes in user-facing copy (per memory rule)
- [ ] No countdowns, deadlines, or shaming language (per program tone memory)

## 10. Open product items (defaults noted)

| Item | Default for slice | Owner |
|------|-------------------|-------|
| Video hosting service | Placeholder `'placeholder://…'` URI; renderer shows a gray play card | Future: Ryan + you choose Cloudflare Stream / Mux / Vimeo |
| Hinge pattern instructional copy | First-pass draft above | Ryan to refine |
| Block-complete celebration UX | Inline message on `/grow/[block]`; tap returns to `/grow` | Karen to voice the celebration copy |
| Spreadsheet beta-tester field mapping | None in this slice | Future scope to inspect current spreadsheet and decide what to mirror |
| Lock/teaser state for non-current blocks | Visually softer but still tappable; tapped block list shows "Coming in [block]" placeholder | OK as default; revisit when REFINE content arrives |
