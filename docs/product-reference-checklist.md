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

Data captured:
- Big WHY
- Current change goal
- POWER baseline
- Training frequency
- Equipment
- Session duration
- Goals
- Injury/condition considerations
- Sport/activity interests
- Nutrition precision level
- Dietary preferences and avoidances

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
- Local placeholder until real AI wiring

Future gating:
- Membership mode
- CREATE POWER active mode
- CREATE POWER graduate mode

## Suggested Build Order From Here

1. Finish Round 1 verification with Supabase.
2. Build Round 2 onboarding and First Five Minutes.
3. Build Round 3 Train and active workout logger.
4. Build Round 4 Fuel and ABC Power Meal Builder.
5. Build Round 5 Grow dashboard, microlearning, community, and real AI coach.
