---
name: create-power-beta-2-architecture
description: "Karen's internal dev brief 2026-06-16 establishing the Two-Pathway architecture (Guided + Self-serve), 3-layer content model, 6-limiter taxonomy, and routing metadata schema. Beta 2 launches guided-only; build the routing guts now so self-serve flips on later."
metadata: 
  node_type: memory
  type: project
  originSessionId: fde15fd3-03fc-4534-b2d7-19b06c00e339
---

Karen's internal dev brief (2026-06-16, v1) is the canonical architecture document for Beta 2 and beyond. **Build the routing guts now, even if Beta 2 ships guided-only.** Treat this memory as load-bearing context for every slice from here forward.

**Central finding from Beta 1:** "Well-organized and thorough" was the same observation as "a lot of reading." Thoroughness = volume. The fix is to re-channel and re-sequence, not cut. Cumulative block load (orientation file + every module hitting at once) is the real problem, not any individual module.

**Two pathways, one library + one engine:**

| | Guided (12-week cohort) | Self-serve |
|---|---|---|
| Entry | Always COMMIT, fixed spine COMMIT → REFINE → EVOLVE → ADAPT → THRIVE → EXCEL | Varies by limiter |
| Sequence | Curriculum order, cohort pace | Need-driven, built from limiter score |
| Onboarding | Sets emphasis + entry-module order within the spine, never changes the spine | Six-limiter questionnaire scores the entry point |
| Coaching | Live coaching supports; app tracks | App does the routing |
| Beta 2 | LAUNCHES this pathway | Hold for round 3 |

**3-layer content model per concept** (the lever for reducing read-load):
- **Layer 1**: 30-second required text. Drives the tracker. Floor of mandatory reading drops hard.
- **Layer 2**: Core teaching, read OR listen. Same content, two channels. This is where most reading relief comes from.
- **Layer 3**: Deep dive, audio-first (likely ElevenLabs), optional. Invisible to those who don't want it.

**Channel routing by content type:**
- Workouts → video (already built; Ryan tutorials + pre-recorded follow-alongs)
- Teaching → hybrid audio at L2/L3 (Karen/Ryan intro → ElevenLabs body → Karen/Ryan close)
- Navigation → stays scannable text, separate from teaching, <1 min to orient

**Block orientation splits in two:** (a) Navigation (always visible, how to get the most out of the block) and (b) Teaching (optional depth, can be written/audio/video).

**POWER Compass governs within a block.** POWER stands tall at the program level. Inside any given block, the Compass's PRIMARY / SECONDARY / MAINTAIN emphasis decides prominence. **Don't force all four threads to equal weight in every block.** (Our `lib/programContent.ts` already carries this data on each Block's powerCompass field — we just haven't surfaced it in UI yet.)

**6-limiter taxonomy** (self-serve routing key, unverified — Beta 2 validates):
1. **Identity/narrative** — old story kicks back in after 2 weeks; self-concept hasn't caught up
2. **Localized knowledge gap** — solid almost everywhere, one specific thread blank
3. **Execution/systems** — knows what to do, no system that makes it happen on a Tuesday
4. **Energy/capacity** — running too depleted to follow through
5. **Resilience/recovery** — fine until thrown off, then one missed day becomes three weeks
6. **Competence gradient** — accomplished people avoiding being a beginner

**See-through rule:** "No time" + self-soothing behavior (scrolling, TV) reads as systems or energy limiter, never as a time problem. Time is either an honest opt-out gate OR a disguise for something else we route.

**Routing concentration assumption:** Identity and systems are the most likely self-serve entry points. Watch the data; don't trust the design alone.

**Build state by thread (priority order):**
- Workouts — built and rich. Apex30 B + 60-min options need filming. Apex30 C/D over time.
- Nutrition / POWER Meals — content exists in depth, just not assembled into the app module. Follow-through, not gap.
- Patterns / Ownership / Energy / Resilience — built across all 6 blocks as HTML modules. Beta testers found high value.

**Three content gaps Karen owns:**
1. POWER Meals module (assembly, not new content)
2. Competence gradient concept (currently borrows from identity)
3. Patterns thread expands from **5 to 6** patterns

**Concept metadata schema (both pathways read this):**

| Field | Holds | Used by |
|---|---|---|
| `block` | COMMIT through EXCEL, or 'library' for non-block assets | Guided sequencing |
| `primaryNeed` | One of the six limiters this concept most directly serves | Self-serve routing |
| `secondaryNeeds` | Other limiters it partly addresses | Self-serve routing |
| `prerequisites` | What must come before it to make sense | Both, sequencing |
| `entryPointEligible` | Can this be someone's first concept, or only mid-sequence | Self-serve routing |
| `layerSet` | Which of the 3 layers exist for this concept | Both, rendering |

**Gating rules:**
1. **Pathway gate** — guided vs self-serve. First fork.
2. **Prerequisite gate** — concept can't be served before its prerequisites, in either pathway. Keeps self-serve from being chaos.
3. **Time eligibility gate (not a route)** — honest opt-out, "we'll be ready when you are." Routes to nothing.
4. **See-through rule** — handled above.

**Beta 2 telemetry to instrument:**
- Layer-choice telemetry per concept (read L2 / listen L2 / skip to L3)
- Audio completion vs text completion rate
- Questionnaire-to-outcome match (where scored vs where they landed)
- Routing distribution (which limiters self-serve members actually land in)
- Per-block load (time-in-block + drop-off, not just per-module)
- See-through signal capture when someone selects "no time"

**ElevenLabs assumption (UNVALIDATED, Beta 2 to prove):**
Hybrid audio model — human intro → ElevenLabs body → optional human close. Ryan has heard the walkthrough; no beta tester has. Promising hunch, not fact.

**How to apply (across all future slices):**
- Every new piece of content gets the metadata schema. The Tool bodies we just shipped need `primaryNeed`, `secondaryNeeds`, `prerequisites`, `entryPointEligible`, `layerSet` fields added — even though only `layerSet` renders in guided pathway today.
- Every teaching concept eventually gets 3 layers. Today's single body becomes Layer 2; add Layer 1 (30-sec) and optional Layer 3 (deep dive). Layer 1 is what the tracker watches for "did they engage."
- Block orientation already exists as `Block.mindset` — split into navigation (always visible, in-app) and teaching (optional depth, possibly audio).
- POWER Compass `role: 'PRIMARY' | 'SECONDARY' | 'MAINTAIN'` per thread per block should drive visual prominence in the Today tab anchors, not equal weight.
- New 6th pattern: when Karen ships it, extend `lib/toolContent/fiveUniversalPatterns.ts` and rename to `universalPatterns.ts`. Karen authors the new pattern.
- The 6-limiter questionnaire + self-serve router are explicitly **out for Beta 2**. Build the metadata schema now; flip routing on later. "Switch, not a rebuild."
- Telemetry needs a simple analytics layer (Supabase event table or PostHog). Out of scope for the visual restoration slice; in scope for the 3-layer migration slice.

**Workouts ≠ teaching for the 3-layer model.** Workouts are already video. No reading to relieve. Don't shoehorn them into the L1/L2/L3 frame.

**Workout content state (Karen 2026-06-16):**
- Apex30 A — done (4 workouts, ~30 min pre-recorded follow-alongs + Ryan-led tutorials)
- Apex30 B — needs filming (workouts 1, 2, 3, 4) + 60-min options
- Apex30 C, D, etc. — over time

**Beta 2 routing foundation landed 2026-06-17:**
- 6-limiter taxonomy in `lib/limiters.ts`.
- ConceptMetadata + LayerSet schema in `lib/conceptMetadata.ts`; LayeredContent in `lib/layeredContent.ts`.
- All 24 tools backfilled with metadata (block, primaryNeed, secondaryNeeds, prerequisites, entryPointEligible) and a derived Layer 1 / Layer 2 (no Layer 3 yet — Karen ships those with the audio pipeline).
- Pathway gate live: `PathwayId = 'guided' | 'self-serve'`, default guided, self-serve routes to `/self-serve-coming-soon` stub.
- Telemetry recorder + hook: `lib/conceptTelemetry.ts`, `hooks/useConceptTelemetry.ts`. Dual-path (AsyncStorage in dev, `concept_events` Supabase table in prod). Block enter/exit events fire from Today.
- Migration 0011 adds `profiles.pathway` + `concept_events` with RLS.
- L2 audio + Karen-authored Layer 3 deep dives are NEXT (separate plan: ElevenLabs pipeline).

Related: [[create-power-program-structure]], [[create-power-frameworks]], [[create-power-progressive-unlock-schedule]], [[program-foundation-landed]], [[video-hosting-youtube]], [[create-power-tone]], [[no-em-dashes]], [[progressive-disclosure-default]].
