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

## Ryan direction memo — 2026-06-07 (pre-meeting, not yet committed)

Ryan voice-memoed John on 2026-06-07 with product direction, along with 13 screenshots of a competitor app (Jeremy Ethier / Built With Science style) as reference patterns. **John, Ryan, and Carlos meet 2026-06-10 (Wed)** to refine. Everything in this section is **shaping, not shipping** — do not start spec-aligned code work on these themes before that meeting. See memory `[[wednesday-2026-06-10-app-direction-meeting]]`.

Karen responded on 2026-06-08 with a reframing that changes how Ryan's direction lands — see "Karen's response" below. The Ryan-detail subsections that follow still describe Ryan's pitch faithfully; read Karen's response first for the scope it should be evaluated against.

### Karen's response — 2026-06-08 (two-track framing + food-tracking precision levels)

Karen sent John two voice memos on 2026-06-08 in response to Ryan's 2026-06-07 memo. **Captured verbatim below for the Wednesday 2026-06-10 meeting; not yet analyzed or routed into per-feature decisions.** Karen is the source for both.

#### Memo 1 — Two app tracks (Create Power supplement vs general public)

> Hey, John. Glad that was helpful for you. Let's think about this in two separate tracks. Number one is the app that has a function that supports the people in the Create Power program, and the other is a different version of the app that's more for the general public. What Ryan gave you as information is generally good, but I think more relevant to the general-population person who is not in the Create Power program.
>
> Because what we have found in the beta test — and next week is the last of the twelve weeks of the beta test — has rousing success on what people have said in terms of the pacing and the curriculum and the blocks; that this is really working well. So I think what we wanna do with what's working well for the Create Power program is to create an app that is a supplement to the people who are in the Create Power program. And that does have an unlock, obviously, as people are going through that, and they're gonna be paying money to have an app that supports their efforts in the Create Power program. So that's one. And then two is, as I said, with what Ryan had to say, that I think is more for the sort of self-guided experience. That I think is the way in which we should, for sure, do the unlock for people based on what their needs are.

Key claims to carry into the meeting (notes only, not yet adopted):

- **Two apps, not one.** Karen explicitly splits TEL into (a) a Create Power program supplement and (b) a future general-public self-guided app.
- **Beta validates the Create Power pacing/curriculum/blocks.** "Rousing success" on what people said about pacing, curriculum, blocks — the 12-week structure is working. The beta ends "next week" (Karen 2026-06-08; corroborates memory `[[beta-cohort-end-date]]` of 2026-06-21).
- **Both apps have unlock, for different reasons.** The Create Power app unlocks as users progress through the paid program (program-pacing-gated). The general-public app uses Ryan's blocker-diagnostic + unlock (need-gated).
- **Ryan's diagnostic + progressive unlock is for the general-public track.** It does not replace the Create Power program structure. The conflict the earlier section flagged (Ryan's blocker-gated vs the V3 time-gated tab unlock) may dissolve once these are read as two different products, not one.

#### Memo 2 — Three levels of food-tracking precision for Create Power

> So another thing to consider is what we wanna do with the food tracking for the Create Power program. I know that a lot of people are not going to want to do an intimate tracking of all of their foods for all of their meals for all of their days. That's just too intense. That is what happens in the Built With Science app, as you're seeing. I know that there are three sort of levels of precision for how one can track their food.
>
> Number one is just to begin to do a better job of eating less processed food and less added sugar, and then eating to — as we say in the Create Power program too — 80% full. So you're comfortably satiated, but you're not stuffed, and you're not eating to capacity at all on any given day. The second — so that's the ABC Power Meals format. The second level of precision is somebody who's really tracking their macros only for protein and then eyeballing the rest of it, maintaining the plan to have the right volume and amount of food to eat. And one can do that by how they feel as opposed to by having to record all of the data and all of their foods.
>
> And third is at the macros level, and that is what the Built With Science program is all about. So we may have some people that are satisfied with just cleaning up their diet, eating less food in general, and feeling better, and that should be good enough. And that's the ABC Power Meals format. There may be some people who are willing to get a really good idea about what the protein is that they're eating and just track that. And then the last is, as I said, the Built With Science format that I don't think we wanna really focus on for the Create Power program just because it's so many details for all of the other things that we are gonna overwhelm people if they're given the opportunity to track all their macros in addition to doing all of the other things.
>
> So, again, this is another example of what would be different for the two different apps — one for the people in the guided program, Create Power, and one that would be more for the general public when we're ready to have that launched. Hopefully that's helpful, but it also gives you an idea of how we can slim down on the things that people are focusing on and tracking in the Create Power program just so it doesn't feel like it's a major overwhelm.

Key claims to carry into the meeting (notes only, not yet adopted):

- **Three precision levels for food tracking:**
  1. **No tracking — habits only.** "Eat less processed food, less added sugar, eat to 80% full." This is the ABC Power Meals format already in the app.
  2. **Protein-only macro + eyeball the rest.** Track protein grams; intuit volume/satiety for everything else.
  3. **Full macros (protein / carbs / fat / calories).** Built With Science style. Karen names this as out-of-scope for Create Power.
- **Create Power gets levels 1 and 2 only.** Level 3 is explicitly excluded for the Create Power track to avoid overwhelm — "we are gonna overwhelm people if they're given the opportunity to track all their macros in addition to doing all of the other things."
- **Level 3 is the general-public app's territory.** Karen doesn't commit it there either, but frames level 3 as the kind of feature that fits the general-public track, not Create Power.
- **Confirms competitor-pattern routing rule already in this section.** The Built With Science nutrition logger (macro bars, ranges, Consumed/Remaining toggle) explicitly does NOT migrate into Create Power's Fuel surface.

#### What this means for the Wednesday meeting (no decisions yet)

The Wednesday 2026-06-10 conversation now has to disambiguate at least these things before any of the subsections below can be sized:

- Which track is the immediate focus — the Create Power supplement, the general-public app, or both in parallel?
- For Create Power: which of levels 1 and 2 is the default Fuel experience today, and does level 2 (protein-only tracking) need new UI?
- For the general-public app: how far off is it (post-beta-end on 2026-06-21? later in the year?), and does any of the wireframing work for Wednesday's progress demo need to live in *that* app's design rather than touching the Create Power codebase?

Hold all of these as open questions; do not pre-decide.

### Karen's post-demo feedback — 2026-06-11 (program-phase unlock structure)

Karen sent John her post-demo reactions on 2026-06-11. Captured verbatim below, then triaged against shipped code. **Several items directly contradict work shipped to the live Today tab between 2026-06-09 and 2026-06-10 — see "Implementation conflicts" subsection.**

#### Direct asks (verbatim shorthand from Karen's notes)

> - we don't ask people to log their weight
> - we don't ask people to log their meals
>
> Measure out your protein etc. Where you are specifically tracking every meal. It could be helpful with the lessons to have in there.
>
> **CREATE POWER**
>
> Unlock only first 2 weeks for example
>
> 1. **Commit block** only
>    - take a look at your labels
>    - all we do here is reduce your added sugar in 50%
>    - start with protein and vegetables (savory meals)
>
> 2. **Refine Block**
>    - Keep it simple
>    - Logging meals will be only unlocked if they are done with commit which is under Refine Block
>
> **FUEL TAB**
>
> 1. Important is the food quality
>
> **PRIORITY** is aspects of POWER
>
> **OTHER JOURNEY** with the APP or Version of the app outside the people in the CREATE POWER PROGRAM
>
> ASK QUESTIONS TO DETERMINE THE JOURNEY:
>
> - ARE YOU PART OF THE CREATE POWER PROGRAM? (Yes/No)
> - WHAT'S YOUR FRICTION
> - WHAT'S YOUR BIG STOPPING POINT
>
> PATTERNS AND OWNERSHIP SLEEP

#### Triaged read

**On the Create Power Today/Checklist surface:**
- Weigh-in and meal-logging are explicitly OUT as daily prompts. Both shipped to `TodayChecklist` on 2026-06-10 and need to be removed.
- Detailed tracking ("measure out your protein… tracking every meal") belongs in LESSONS / educational content, not as a daily action prompt.

**On the Create Power program-phase unlock structure (NEW, first time named concretely):**
- **Phase 1 — Commit Block.** First ~2 weeks. Focus: read food labels, cut added sugar by 50%, build meals around protein + vegetables (savory). **No meal logging in this phase.**
- **Phase 2 — Refine Block.** Unlocks only after Commit is complete. Meal-logging becomes available here. "Keep it simple."
- Karen's earlier 2026-06-08 statement that "Create Power has an unlock tied to program progression" was abstract; this is the first time she's named the actual blocks and their gating rules.

**On the Fuel tab:**
- Focus is **food quality**, not quantity tracking. ABC Power Meals philosophy reinforced; macro-tracking remains out for Create Power.

**On the general-public / non-Create-Power journey:**
- Karen now names the diagnostic structure for the *other* version of the app: three questions surface what kind of user this is and what they need.
  1. "Are you part of the Create Power program?" (yes/no fork)
  2. "What's your friction?"
  3. "What's your big stopping point?"
- This is consistent with Ryan's 2026-06-07 "what's holding you back" pitch — but explicitly framed for the general-public track, not Create Power. Karen has now endorsed the diagnostic mechanic, just for a different surface than where Ryan originally proposed it.

**Sleep / Patterns / Ownership:**
- Line reads "PATTERNS AND OWNERSHIP SLEEP" — ambiguous. Could mean (a) sleep is one of the patterns users take ownership of, (b) a future "sleep patterns" feature, or (c) a heading for a section Karen didn't expand. Needs clarification next conversation.

#### Implementation conflicts (shipped code that must change)

| Shipped 2026-06-10 | Karen says | Action |
|---|---|---|
| `TodayChecklist` row: **Weigh in** | "we don't ask people to log their weight" | Remove from `components/today/TodayChecklist.tsx` |
| `TodayChecklist` row: **Log your meals** (→ `/(tabs)/fuel`) | "we don't ask people to log their meals" (until Refine Block) | Remove from `TodayChecklist` for Commit-phase users; gate by program phase if Refine ships |
| `TodayChecklist` row: **Nutrition check-in** | Not explicitly addressed | Probably keep, possibly reframe — confirm with Karen |
| Demo "Choose your nutrition style" (Level 1/2/3) on `precision-levels.tsx` | "Important is food quality" + "Measure protein in lessons" | Level 2 (protein tracking) likely shifts to *lessons content* about how-to-eyeball-protein rather than a Fuel mode; the precision-levels demo screen needs Karen's read before any real-product version is built |
| Live Today tab refactor with `ShowMoreToggle` defaulting to `simplified` | Not addressed; reasonable to keep | Hold; revisit once Commit/Refine block content lands |

#### Open follow-ups for Karen (before any real-product build)

1. Confirm Nutrition check-in row stays; if so, what does "check in" mean — read a lesson? rate the day? a label-check toast?
2. Confirm what the Commit Block Today surface should look like instead of the checklist — three lesson rows? a single "today's commit action" card? something else?
3. Confirm whether the program-phase unlock is **calendar-gated** (after 2 weeks Refine opens) or **completion-gated** (after Commit lessons are done) or **manual** (Ryan slots the user).
4. Confirm "PATTERNS AND OWNERSHIP SLEEP" — is sleep tracking on the roadmap, or part of a broader patterns/ownership concept?
5. Confirm whether the "Are you in Create Power?" diagnostic is shipped as part of the Create Power app itself (sign-up gate) or only in the future general-public app.

Hold all of these as open questions; do not pre-decide. **Next ship from Karen's feedback should start by reverting the Weigh in and Log meals rows; everything else needs her input before code touches it.**

### Holistic-system pillars (pre-meeting, 2026-06-07)

Karen's recurring critique, restated by Ryan: opening the app today feels like "the Encyclopedia Britannica with all the information as far as everything goes about everything, and people don't know where to begin." The direction Ryan named:

> "Health is much more than just going to the gym consistently. You can do that, but if you don't make an identity shift, if you don't make a mindset shift, if you don't have systems set in place, then going to the gym might work for a little bit, but then things are gonna fall apart because you don't have the rest of the pieces."

Pillars Ryan named alongside training/nutrition:
- **Mindset** — the cognitive frame the user brings to change.
- **Identity** — who the user believes they are; necessary for change to persist.
- **Systems** — the structures (routines, environment, planning) that make the new behavior happen without willpower.

The proposed framing for the app: lead with the holistic-system concept up front (education, not feature shoveling), then let the user pick **which pillar is their personal blocker** before deeper engagement.

This is **not** the same as the existing four-tab navigation (Today / Train / Fuel / Grow). The relationship between these pillars and the current tabs is one of the open questions for Wed 2026-06-10:
- Does mindset/identity/systems live inside Grow, or does it earn its own surface?
- Does the holistic-system intro replace or precede the current Welcome / Big WHY onboarding?
- How does this interact with the V3 progressive-disclosure tab unlock (Day 1 Today, Day 3 Train, etc.)?

Do not pre-decide these before the meeting.

### Diagnostic onboarding + progressive unlock (pre-meeting, 2026-06-07)

**The diagnostic question.** After teaching the holistic-system concept, ask:

> "What is the main reason you have fallen behind?"

Categories Ryan surfaced in the memo (not exhaustive):
- "I don't know what to do in the gym" — training-knowledge gap.
- "My mindset is out of whack / I don't have the right systems" — mindset/identity/systems gap.
- More categories TBD with Karen + Ryan.

**The unlock mechanic.** Whichever blocker the user picks, **only that section of the app unlocks** for them initially. The other sections stay locked until the user signals readiness ("I've got mindset handled, now I need training") — then the next section unlocks.

Ryan's quote on user-controlled readiness:

> "I'm gonna get these things set in place. Once I'm ready, then I can go, okay. Ready for this. Now I need to know what to do as far as the gym goes. That becomes unlocked for them."

**Two stated benefits — both load-bearing.**

1. **Anti-overwhelm (UX).** User engages with one focused area until they have it. Reduces the "where do I start?" paralysis Karen named.
2. **Anti-scrape-and-cancel (business).** Per Ryan: *"another thing is so that they don't scrape all of our content by unlocking all of our content to them all at once, and then they just sign up for one month and then cancel."* See memory `[[anti-piracy-content-gating-constraint]]` — the business reason is a durable constraint independent of this specific feature.

**Open conflicts to raise in the Wed 2026-06-10 meeting:**

- The V3 progressive-disclosure tab unlock (Day 1 Today, Day 3 Train, Day 5 Fuel, Day 7 Grow — see "Navigation Model" above) is **time-gated**, not **blocker-gated**. Ryan's proposal is the user's choice, not the calendar's. These two unlock models need to be reconciled into one mechanism, not stacked.
- "Pick your blocker, only that section unlocks" needs to be compatible with the deterministic program-assignment key (the 4-axis picker → fixed program). What happens to a user who picks "mindset" as their blocker — does the training program still get assigned but locked, or deferred entirely?
- The AI coach is the only universally-available surface today (floating button on every screen). Does it stay universally available during partial-unlock states, or does the coach also gate by pillar?

### Competitor-app reference patterns (Ryan/Karen flagged 2026-06-07, not committed)

Ryan shared 13 screenshots of a competitor app (Jeremy Ethier's "Built With Science"; cues: "Jeremy AI helpful today?" feedback sheet, photographed-coach avatar, Prep/Nutrition/Training lesson tabs). These are **inspiration patterns** Ryan/Karen will discuss in the Wed 2026-06-10 meeting — none are committed. They are recorded here so the team can point at them by name without recirculating the screenshots.

- **Animated educational onboarding screens.** Phone-hero, daily-checklist visual, holistic-system diagram, education/nutrition/training pillar diagram. Bottom progress bar, mute toggle, close button. Used in the competitor to *teach the holistic-system concept up front* — directly maps to Ryan's framing above.
- **Daily Checklist card on the dashboard.** Three items (Weigh-in with logged value, Nutrition check-in, Log meals), collapsible, "1/3 completed" header. Closest TEL equivalent today is the EngagementOrbit (Workout / Walk / Water / Sleep chips) added in the 2026-05-25 batch.
- **"Next Lesson" card on the dashboard** with thumbnail of the coach. No TEL equivalent today.
- **"Bonus Goal" card** — steps from Apple Health with progress bar + percentage. TEL has no Health-Kit integration today; this is a pattern, not a request.
- **Lessons tab with 4 sub-tabs** (Prep / Nutrition / Training / Saved). Each section: header card with progress, expandable lesson groups ("Getting Started," "The Foundation"), each lesson row shows duration + category + title + save star. Pattern relevant to Grow / microlearning library, not to the current Train tab.
- **Nutrition logger** — Consumed/Remaining segmented toggle on calories, macro bars (protein/carbs/fat with ranges like "119–202g+"), "Full Breakdown" disclosure, meal sections (Breakfast/Lunch/Dinner/Snacks) with empty-state hint, suggested-recipes carousel, persistent search bar with camera button. Visible competitor pattern; TEL Fuel currently uses the ABC Power Meal framework + 1/2/3/S slots + Calories+protein chip — *do not* assume migration toward this competitor's macro-range UI without Karen's explicit call.
- **Progress tab** — 14/30/90 day filter; Weight + Strength % top stats; Weight/Workout/Entries sub-tabs; weekly averages table. Pattern relevant to a future "your trends" surface.
- **Workout schedule** — week strip with rest days as empty rings, "Active Rest Day" hero card with coach photo, day-by-day list including "+ Add Workout" rows for rest days. Pattern Ryan may want for Train's week view.
- **AI coach branded as "Jeremy AI"** with thumbs-up / somewhat / thumbs-down feedback sheet. Pattern reference for a TEL coach feedback loop — note the existing TEL coach guardrails (no recursive deferral; no sentiment-blind affirmation) would shape *what* the feedback sheet captures.

**Routing rule for these patterns:** when Ryan/Karen point at one of these in the meeting and want to act on it, the item moves from this appendix into the relevant feature section (Onboarding, Today, Train, Fuel, Grow, AI Coach) with a real commit decision. Until then they stay here as named references only.
