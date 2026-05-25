# Tigers Eye Life Product Reference Checklist

Source references:
- `Tigers Eye Life - Session Handoff Document`
- `e7d82d99-706c-4207-bbe7-55c53d5be7f3.zip`

This file is a functional checklist only. It is not a visual design guide.

## Product Spine

Tigers Eye Life is a daily intentionality engine for accomplished professionals 45+.
It is not a generic tracker. The app reads the body's check-engine-light signals and helps Karen, Ryan, and the AI coach guide the client toward better daily decisions.

Core philosophy:
- Build capability, not compliance.
- Teach users to read their body through data.
- Strength training is the foundation, but all movement counts.
- Ask before telling.
- Never use guilt.
- Progressive overload applies to the whole life system, not just workouts.

## Navigation Model

Core app navigation:
- Today
- Train
- Fuel
- Grow
- Floating AI Coach available from every main screen

Progressive disclosure from the V3 reference:
- Day 1: Today
- Day 3: Train
- Day 5: Fuel
- Day 7: Grow

Round 1 currently keeps all tabs visible for review, with non-Today surfaces scoped as placeholders until their rounds.

## Current Round 1 Must-Haves

Built / in progress:
- Auth shell with dev skip
- Supabase client and migration
- Today screen
- Daily intention
- Mood selection
- Movement tags with custom local tag input
- Recent sessions placeholder
- Custom floating tab bar
- Floating coach bottom sheet
- Profile-backed first name greeting

Still to verify before Round 1 ship:
- Supabase local or hosted migration applied
- Real sign-in/sign-up against Supabase keys
- Daily entries persist for real Supabase users
- Coach bottom sheet behavior on iPhone via Expo Go
- Safe-area spacing on notched iPhones

## Functional Reference From Old Prototype

### Onboarding

Screens:
- Welcome
- Big WHY capture
- POWER self-assessment
- Workout setup
- Nutrition approach
- Dietary preferences
- Program recommendation
- First Five Minutes

Interactions:
- Step-by-step navigation
- Back navigation
- Single-select option cards
- Single-select pill groups
- Multi-select tags
- Skip onboarding into app

Program-assignment key (the 4-axis picker):

These four axes form a deterministic key into a fixed program. Same key → same 4-workout program, every time, per cohort. No randomness, no model-generated assignment. This is the contract `program_slotting_rules` is being built to honor.

1. **Duration** — 30 or 60 min (single-select). 45 min is removed from the eventual picker.
2. **Format** — pre-recorded / live / just-the-workout (no recording).
3. **Equipment + location** — basic at-home (dumbbells + bands) / home gym (barbell + plates) / commercial gym.
4. **Skill level** — multi-select, all that apply:
   - Novice
   - Intermediate
   - Familiar/comfortable with barbell, dumbbell, and plates
   - Familiar/comfortable with commercial gym equipment
   - (Retired: "pick two" model; "done training a while ago"; "currently in a program".)

Ancillary fields captured but NOT part of the assignment key:
- Big WHY
- Current change goal
- POWER baseline
- Training frequency (days/week)
- Goals (e.g. strength, bone density, energy, mobility, balance, body composition)
- Injury/condition considerations
- Sport/activity interests
- Nutrition precision level
- Dietary pattern and avoidances

### First Five Minutes

Reference flow:
- Ryan guided video placeholder
- Four movements:
  - Air squat
  - Wall push-up
  - Standing row
  - Hip hinge
- 60-second box breath timer:
  - In 4
  - Hold 4
  - Out 4
  - Hold 4
- Completion state before entering the app

### Today

Reference content:
- Greeting
- Program/week context
- Practice streak
- This week's POWER focus
- Today's intention
- Today's workout card
- Buddy/near-peer win
- Nutrition status
- Evening check-in
- Upcoming coaching call
- Daily nudges
- Optional health context card

Round 1 Today intentionally emphasizes:
- Diagnostic stats
- Coach speech
- Intention
- Evening reflection
- Movement tags
- Recent sessions

### Train

Reference surfaces:
- Active program card
- Weekly schedule
- Strength trend summary
- Coached workout sessions
- Exercise library
- Active workout logger

Critical workout requirement:
- Carol-style progression table appears above the set logger.
- Full historical data is visible before choosing today's weight.
- Warm-up sets and working sets are visually distinct.
- User decides the weight; app suggests, but does not command.

Program shape:
- A program is exactly **four workouts** (Workout 1, 2, 3, 4). The user's assigned key (from the onboarding picker) unlocks one such program and they cycle through W1 → W4 in order across sessions.
- New cohorts get the same program for the same picker key — this is not regenerated or personalized further. Mobility/balance modalities (below) are layered on top, not substituted in.

Per-workout video asset bundle (each `program_workout` carries all three):
- One **warm-up tutorial recording** — pre-recorded Zoom, scoped to that workout. Distinct from per-exercise tutorials.
- An **exercise-tutorial playlist scoped to the workout's 4 exercises**. Never the full library. Surfacing unrelated exercises forces the user to filter and is a known anti-pattern Karen has called out.
- The **full-session Zoom recording** at the chosen duration (30 or 60 min), in **two view variants**: group view (multiple participants in frame) and speaker-only view (Ryan only). The user picks the view at watch time.

Logging shape (matches the worksheet Karen and Ryan use):
- Each historical column for an exercise = one date, holding weight + reps.
- When the user logs a set, the app writes into the **rightmost empty column** for that exercise — never overwrites, never re-sorts.

Modality roadmap:
- Mobility and balance are coming as **separate pre-recorded modalities**, sold as **upchargeable add-ons** on top of strength training. Pricing tiers TBD; possible packaging includes strength-only, strength + balance, strength + balance + mobility, or a single bundled tier.
- Strength remains the foundation. The roadmap should not allow buying mobility/balance without strength.

### Fuel

Reference surfaces:
- Today meal status
- ABC Power Meal logging
- Meal builder
- Saved meals
- Nutrition learning modules

Nutrition precision levels:
- Hand portions and ABC Power Meals
- Calorie awareness and protein focus
- Full macro tracking

### Grow

Reference surfaces:
- Big WHY
- POWER dashboard
- Movement richness
- Insight cards
- Coach preferences
- Microlearning library
- Achievements and community later

POWER threads:
- Patterns
- Ownership
- Wisdom
- Energy
- Resilience

### AI Coach

Reference behavior:
- Floating access from main screens
- Quick prompts
- Chat thread
- Local placeholder until real AI wiring (no LLM wired today)

Future gating:
- Membership mode
- CREATE POWER active mode
- CREATE POWER graduate mode

Behavior guardrails (from beta testing, May 2026):

- **No recursive deferral.** If the coach offers "want me to help you find this?" and the user accepts, it MUST take a next step — pull from program materials, microlearning, or a curated escalation. It must never bounce the user back with "great, you go look for it" after they have explicitly asked for help. Beta tester hit this asking *"what is a growth response?"* in Patterns→Adapt.
- **Parse sentiment before affirming.** Treat phrases like *"this sounds like a lot,"* *"I'm not sure,"* *"this feels overwhelming,"* or *"this is too much"* as signals to **simplify or check in**, not as enthusiasm. Cheerleading a request for less is a tone-deaf failure. Beta tester hit this in Ownership when the coach replied *"That's fantastic to hear!"* to *"this sounds like a lot."*

What works (preserve in tuning):

- **Concrete reframes.** "Balance your plate with protein and healthy fats." "I'm discovering new ways to remind myself of my eating priorities."
- **Tactical bare-minimum protocols** with categories (hydration / movement / mindfulness), examples, and a follow-up question ("which one do you want to start with?").
- **Factual definitions with variations.** Box breathing was answered crisply with the In-4 / Hold-4 / Out-4 / Hold-4 pattern, plus offered 4-7-8, diaphragmatic, and alternate-nostril variations on follow-up.
- **Specific applications beat conceptual questions.** Tester's own observation: the coach does well with concrete applications and factual content; it struggles with vague conceptual questions. System-prompt design should encode the failure modes above without sacrificing the specificity strength.

## Suggested Build Order From Here

1. Finish Round 1 verification with Supabase.
2. Build Round 2 onboarding and First Five Minutes.
3. Build Round 3 Train and active workout logger.
4. Build Round 4 Fuel and ABC Power Meal Builder.
5. Build Round 5 Grow dashboard, microlearning, community, and real AI coach.

Timeline note: the beta cohort wraps Sun **2026-06-21**. Mon **2026-06-22** is **not** a hard launch date — Karen has explicitly relaxed it (Loom, 2026-05-19). Clients who continue past the beta can keep working their current program and practicing commit/refine-block skills during any gap, so schedule fluidly and prioritize doing it right.

## Karen feedback intake — 2026-05-25

Karen sent 11 numbered comments + a Loom walkthrough referencing the current RN app and an MyNetDiary screenshot for data-density inspiration. Items landed in code are tracked in commit history; items that need spec-level alignment are listed below.

### Deferred for product discussion

**1. Mid-program precision-level switching (Karen #6).**
A member who starts the 12 weeks on "Hand portions" may decide partway through they want "Calorie aware" or "Full macros." Today the precision toggle in [app/(tabs)/fuel.tsx](app/(tabs)/fuel.tsx) is local UI state — no migration of meal history, no data-shape change. Open question: can a member switch precision mid-program without losing logged history, and what does the transition look like? Also redefine **"Calorie aware"** — Karen clarified this is really "protein tracking + calories," not "calories alone." Update the chip label or its tooltip when this lands.

**2. MyNetDiary-style compact home + drill-in for action tracking (Karen #8).**
Karen shared MyNetDiary screenshots showing a compact home (single streak circle + summary numbers) with deep drill-in screens per category (per-meal entry with nutrient breakdown, etc.). She's flagging that the current POWER-blocks UI in [app/grow/[block].tsx](app/grow/[block].tsx) — long rows of checkboxes per action — may feel visually cluttered as the block count grows. Possible direction: collapse each thread (P/O/W/E/R, plus Sleep and Hydration) into a single tappable card on the home that drills into a detail screen for that day's actions. Needs a design exploration before any code work.

**3. Workout-done acknowledgment that feeds the streak (Karen #9 + Loom).**
The workout completion screen at [app/workout/complete/[sessionId].tsx](app/workout/complete/[sessionId].tsx) lets a member save volume/effort/notes, but it's unclear whether that save writes a streak-eligible engagement event. Verify the wire-up. Also: members on a 2-workouts-per-week program must not lose their streak on the 5 non-training days — engagement (any logged event) must count, not workout completion specifically. See memory `streak-definition` for the rule.

**4. POWER thread bar calculation (Karen #10).**
The bars in the Lifetime POWER threads card on [app/(tabs)/you.tsx](app/(tabs)/you.tsx) are currently hardcoded (P=72%, O=48%, W=81%, E=60%, R=55%). Karen is asking: when these go dynamic, what drives the percentage? Best guess from her Loom: the number of completed actions across the rows in each block, but she wants explicit alignment before we wire it. Defer until she confirms the formula.

**5. AI coach quick-action buttons (Karen #11).**
The current Coach sheet ([components/navigation/CoachBottomSheet.tsx](components/navigation/CoachBottomSheet.tsx)) shows quick-prompt chips like "walk me through the exercises" and "why this workout." Karen wants Ryan's input on whether "walk me through the exercises" should bounce the user back to the workout tutorial section rather than start a chat. Longer-term she suspects the quick-actions section could disappear entirely as members' needs from the coach diversify. Hold the current chips until Ryan weighs in.

**6. Terminology nit: "Novice" / "Rusty Novice".**
Karen flagged in her Loom that "Rusty Novice" feels imprecise — it currently covers both "never trained" and "trained before, fell off." Not a hard rule, but a better split (or a different overall label) is wanted. Touches [app/(tabs)/train.tsx:326](app/(tabs)/train.tsx) and [app/(tabs)/you.tsx:274](app/(tabs)/you.tsx) display strings, plus the underlying skill_level enum from intake. Defer until Karen proposes the replacement language.

**7. Diamond logo as corner brand mark.**
Karen wants the EyeMark diamond ([components/brand/EyeMark.tsx](components/brand/EyeMark.tsx)) to appear as a small corner mark wherever there's currently a "Tigers Eye Life" text logo placeholder. Verify where the brand mark should persist (header? launch screen? both?) before placing it.

### Landed in code on 2026-05-25

- Workouts renamed to **Workout 1/2/3/4** across seed data and UI (Karen #2).
- Meal slots changed from A/B/C (Morning/Midday/Evening) to **1/2/3/S (First meal/Second meal/Third meal/Snack)** in Fuel (Karen #4).
- Macro toggles changed from Protein/Plant/Smart carb to **Protein/Fat/Carbs/Fiber**; snapshot grid updated to match (Karen #5).
- Content attributions on Grow, onboarding placeholder, and coach reply updated from "Karen" to **"Karen and Ryan"** (Karen #7).
- **Streak (#9) wired up.** New [hooks/useStreak.ts](hooks/useStreak.ts) computes consecutive engagement days from workouts + daily entries + POWER actions + new engagement scope; writers invalidate the streak query so it ticks up immediately; hardcoded 23-day value removed from [components/today/CreatePowerHero.tsx](components/today/CreatePowerHero.tsx) and [hooks/useCoachContext.ts](hooks/useCoachContext.ts).
- **Precision chip (#6 partial) renamed** "Calorie aware" → **"Calories + protein"** in [app/(tabs)/fuel.tsx](app/(tabs)/fuel.tsx). Mid-program precision *switching* architecture still deferred; the chip itself is now clearer.
- **Skill terminology** updated in [app/(tabs)/train.tsx](app/(tabs)/train.tsx) and [app/(tabs)/you.tsx](app/(tabs)/you.tsx) — "Novice"/"rusty" raw labels replaced with "New to strength" / "Returning" / "Using a gym app" / "In a program" / "Free weights" / "Gym machines."
- **POWER thread bars (#10) dynamic.** [app/(tabs)/you.tsx](app/(tabs)/you.tsx) no longer hardcodes P=72/O=48/W=81/E=60/R=55. A new local `usePowerThreadProgress()` aggregator sums completed/target across all five blocks per letter and computes the percentage live.
- **Coach quick-prompt routing (#11 partial).** "Walk me through the exercises" followup replaced with **"Open tutorials for today"** in [lib/coachKnowledge.ts](lib/coachKnowledge.ts); [components/navigation/CoachBottomSheet.tsx](components/navigation/CoachBottomSheet.tsx) intercepts that label and routes to `/(tabs)/train` instead of generating a chat reply. The broader "should the section have buttons at all" question still defers to Ryan.
- **Orbital engagement on Today (#8 adapted).** New [components/today/EngagementOrbit.tsx](components/today/EngagementOrbit.tsx) renders four tappable chips under the streak ring (Workout / Walk / Water / Sleep). Each tap toggles or increments through [hooks/useTodayEngagement.ts](hooks/useTodayEngagement.ts), persists to `tel:engagement:<userId>:<date>`, and invalidates the streak query so the ring updates live. A "Log something else" CTA opens [components/today/QuickAddSheet.tsx](components/today/QuickAddSheet.tsx) for tagging other movement (pickleball, yoga, etc.) and resetting water. Adapted from MyNetDiary's compact-home pattern using TEL brand chrome (no calorie budgets, no nutrient pies).

### Still deferred

- **Precision-level mid-program switching architecture** (#6) — chip label is fixed, but persisting the precision choice across sessions and migrating logged data when a member switches still needs product alignment.
- **AI coach "Why this workout?" followup** (#11) — Karen wanted Ryan's input on whether to keep this chip at all; left in place pending his answer.
- **Diamond logo as a universal corner mark** — EyeMark already shows on the Today hero next to the wordmark; whether to repeat it across every tab header still needs a brand call.
