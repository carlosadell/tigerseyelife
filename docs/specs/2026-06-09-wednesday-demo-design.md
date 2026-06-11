# Wednesday Direction Demo — Design Spec

**Drafted:** 2026-06-09 (day before the Wed 2026-06-10 John + Ryan + Carlos meeting).
**Source memos:** Ryan 2026-06-07 (voice), Karen 2026-06-08 (two voice memos). Full verbatim transcripts live in `docs/product-reference-checklist.md` § "Ryan direction memo — 2026-06-07".
**Status:** Design approved by John 2026-06-09. Not yet implemented.

## Why this exists

Karen needs to see something runnable on Expo Go before Wednesday that demonstrates the org has heard her two-track reframing of Ryan's pitch. The previous plan to deliver annotated wireframes inside the spec doc was upgraded to runnable screens after John's 2026-06-09 pivot.

**Karen is the primary voice; Ryan is supporting.** The demo's center of gravity is Create Power refinement + strategic framing. Ryan's pitch is acknowledged in one parking-lot screen, not three flow screens.

## Goals

- Four runnable demo screens in Expo Go that Karen can tap through.
- Two-track framing (Create Power vs general-public) visible as the first screen.
- One concrete Create Power refinement Karen named: protein-only nutrition as a Level 2 variant.
- Ryan's diagnostic-question idea shown once, parked as "for the future general-public app."

## Non-goals

- Not touching the real onboarding gate chain, real Fuel screen, real tab nav, or real auth.
- Not adding a feature flag system or persistence layer.
- Not committing these screens' product choices to the actual roadmap. They are presentation surfaces.
- Not using Reanimated worklet libraries, Lottie native, or `@gorhom/bottom-sheet` on these surfaces (Expo Go on the new arch crashes on those — same gate the coach overlay uses per `CLAUDE.md`).

## Architecture

### Route group

New modal stack under `app/wednesday-demo/`:

- `app/wednesday-demo/_layout.tsx` — stack layout, modal presentation matching the existing workout-modal pattern.
- `app/wednesday-demo/index.tsx` — Screen 1: two-track framing.
- `app/wednesday-demo/beta-wins.tsx` — Screen 2: what the beta showed works.
- `app/wednesday-demo/precision-levels.tsx` — Screen 3: Create Power nutrition precision (the concrete refinement).
- `app/wednesday-demo/general-public-parking.tsx` — Screen 4: general-public parking lot.

`app/_layout.tsx` registers `wednesday-demo` as a modal stack route.

### Entry point

`components/today/WednesdayDemoCard.tsx` — a card tile slotted near the top of `app/(tabs)/today.tsx`. Title text: `Wednesday demo`. Subtitle: "Two-track product direction preview." The bracketed-temporary signal is conveyed by the card's visual treatment (muted background, "Demo" badge) rather than punctuation in the title — keeps it scannable. Always visible (no flag). Cleanup is part of the plan, not deferred.

### Styling

`StyleSheet.create` + theme tokens from `lib/brand.ts` (`COLORS`, `THEME_COLORS`, `FONTS`, `SPACING`). `useThemeColors()` from `hooks/useTheme.tsx` for theme-aware values. Match the existing app's style discipline — no NativeWind on these screens.

## Screen-by-screen

### Screen 1 — Two-track framing (`app/wednesday-demo/index.tsx`)

ScrollView, top-down:
- **Header:** "Two products, one strategy"
- **Karen quote card** (verbatim, attributed "Karen, 2026-06-08"):
  > "Let's think about this in two separate tracks. Number one is the app that has a function that supports the people in the Create Power program, and the other is a different version of the app that's more for the general public."
- **Two product cards** stacked vertically (vertical for narrow phone width; side-by-side would crowd):
  - **Create Power supplement.** Caption: "Current focus. Beta-validated. Keep refining."
  - **General-public self-guided.** Caption: "Future product. Parks Ryan's direction."
- **Three navigation buttons** stacked at the bottom:
  - "What the beta showed →" (Screen 2)
  - "Create Power refinement →" (Screen 3)
  - "General-public parking lot →" (Screen 4)

### Screen 2 — Beta wins (`app/wednesday-demo/beta-wins.tsx`)

ScrollView, top-down:
- **Header:** "Create Power's pacing, curriculum, blocks — keep"
- **Karen quote card** (verbatim, attributed "Karen, 2026-06-08"):
  > "What we have found in the beta test… has rousing success on what people have said in terms of the pacing and the curriculum and the blocks. This is really working well."
- **Three labeled cards:**
  - **Pacing.** "12-week structure: First Five Minutes, weekly check-ins, daily lessons."
  - **Curriculum.** "Round-by-round delivery — Today / onboarding / Train / Fuel / Grow."
  - **Blocks.** "Workout block structure with deterministic 4-axis program assignment."
- **Footer button:** "← Back to two-track framing"

### Screen 3 — Nutrition precision (`app/wednesday-demo/precision-levels.tsx`)

ScrollView, top-down. This is the visible "we did something" screen.

- **Header:** "Slimming Create Power: three precision levels for food tracking"
- **Karen quote card** (verbatim, attributed "Karen, 2026-06-08"):
  > "I know that there are three sort of levels of precision for how one can track their food. Number one is just to begin to do a better job of eating less processed food and less added sugar, and then eating to — as we say in the Create Power program too — 80% full… The second level of precision is somebody who's really tracking their macros only for protein and then eyeballing the rest of it… And third is at the macros level, and that is what the Built With Science program is all about… I don't think we wanna really focus on for the Create Power program."
- **Three precision cards** stacked:
  - **Level 1 — ABC Power Meals + 80% full.** Caption: "Current default in Create Power. No tracking; behavioral cues only." Status pill: "Current."
  - **Level 2 — Protein-only + eyeball the rest.** Caption: "New variant Karen named. Track protein grams; intuit volume for everything else." Status pill: "Proposed."
  - **Level 3 — Full macros (protein / carbs / fat / calories).** Visibly disabled (50% opacity, no tap target). Caption: "NOT in Create Power per Karen. Belongs in the future general-public app."
- **Below Level 2, always visible** (no expand/collapse — keep it simple): a Fuel slot card mock matching the existing `MealSlotCard.tsx` style, showing:
  - Meal name: "Lunch — Power Bowl"
  - One chip: `Protein: 32g` (matches existing protein-chip pattern)
  - NO calorie chip, NO carb/fat row.
  - Small italic caption under the card: "Level 2 preview — what a Fuel meal could look like with protein-only tracking."
- **Footer button:** "← Back to two-track framing"

### Screen 4 — General-public parking (`app/wednesday-demo/general-public-parking.tsx`)

ScrollView, top-down. Single screen for Ryan's parked direction.

- **Header:** "Where Ryan's direction lives — the future general-public app"
- **Karen attribution caption** (paraphrase, italic): "Karen 2026-06-08: Ryan's diagnostic + progressive unlock is for the general-public self-guided app, not Create Power."
- **Mock of the diagnostic question screen**, rendered inside a bordered card with a small top-left label badge reading "Mockup — future general-public app." The badge makes the framing unambiguous so Karen reads this as "a mock," not "a feature Create Power just added."
  - Title: "What is the main reason you have fallen behind?"
  - Subtitle: "Ryan 2026-06-07, verbatim."
  - Four option cards (radio-style, selectable for tactile feel; selection is local-state only, has no downstream effect):
    - "I don't know what to do in the gym."
    - "My mindset is out of whack."
    - "I don't have the right systems."
    - "Something else."
  - "Continue" button, non-functional (greyed or visually disabled with caption "Mockup — no downstream action").
- **Footer note** (italic, small):
  > "Full progressive-unlock design is deferred to the general-public app design phase. This screen is the entry point for that future product, not for Create Power."
- **Footer button:** "← Back to two-track framing"

## Data and state

- No persistence: no Supabase calls, no AsyncStorage writes.
- All state is local `useState` inside each screen (the Level 2 layout is static; Screen 4's radio selection is local-state only).
- Works identically in dev mode and Supabase mode because no data layer is touched.

## Error handling

Not applicable — no async operations, no external dependencies, no failure modes beyond render errors. Standard React component conventions apply.

## Testing

- **TypeScript:** `npm run typecheck` must pass.
- **Manual:** `npm start`, scan QR in Expo Go on a real device. Tap entry card → walk all four screens. Verify no "missing default export" warnings, no Reanimated crash on mount.
- No automated tests — these are presentation surfaces with a known short lifetime.

## Cleanup plan

Post-Wednesday-meeting (the day after, or earlier if the meeting reroutes us):

- Remove the `[Wednesday demo]` card from `app/(tabs)/today.tsx`.
- Remove `components/today/WednesdayDemoCard.tsx`.
- Remove `app/wednesday-demo/` and its modal-stack registration in `app/_layout.tsx`.
- Decision on whether any of the screens informs real implementation is made in the meeting, not here.

Default: delete unless explicitly retained.
