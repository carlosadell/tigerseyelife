# AI Coach LLM Wiring

**Date:** 2026-07-08
**Status:** Design — not yet approved for build
**Owner:** TBD (spec author: Claude assist; Carlos to review)
**Driver:** John set the goal to "build the remaining what's not there yet" on 2026-07-08. The AI Coach is one of three items on that list; unlike the L2 YouTube variant (small, shipped in same session) and the membership roster (mostly ops), the Coach is a multi-session effort with real product design decisions embedded. This spec captures the shape so it can be executed in a subsequent focused session with proper review checkpoints.

## Background

Today, `app/coach.tsx` and `components/navigation/CoachBottomSheet.tsx` render a chat UI, but there is no LLM behind it. No API client, no system prompt, no `coach_messages` reads or writes. Members who tap the coach get a static UI that does not respond meaningfully.

Two hard guardrails from Karen's beta testing must be honored when the wiring lands:

- **No recursive deferral.** Never tell a user to look something up themselves after they accepted help. If they said "yes explain it," the coach explains it.
- **No sentiment-blind affirmation.** Parse "this sounds like a lot" as overwhelm, not enthusiasm. The coach reads the actual emotional signal, not the surface valence.

Two more guardrails from the source spec ([docs/create-power-program-spec.md](../../create-power-program-spec.md) §7):

- **No hallucination of program specifics.** Never invent block names, framework definitions, week numbers, or workouts. On uncertainty: "I want to make sure I give you accurate information."
- **Reference the user's onboarding context in every response.** Coaching style, primary goal, top obstacles, confidence level.

And one framework-level constraint (memory: `create_power_frameworks`):

- **ABC Power Meals must be quoted verbatim** when referenced: **A** = Anchor with Protein (25–35g), **B** = Balance Your Meal (carbs, fats, fiber), **C** = Complete with Embellishments.

## Continuation-membership constraint

Per memory `continuation_program_is_the_retention_arc`: coach persistence is **program-agnostic**. The coach's accumulated knowledge of the member is a first-class retention asset for the eventual continuation membership. A member who finishes CREATE POWER should hand off to the continuation with a coach that already knows them.

**Implication:** all coach-side persistence keys off `user_id`, never `user_id × program_id`. Observations, preferences, obstacles, wins, energy patterns — all survive the week-12 transition.

## Design

### Data model

Three new tables (or the equivalent in existing tables):

**`coach_messages`** — the chat transcript.
- `id` uuid PK
- `user_id` uuid FK → auth.users
- `role` text CHECK (`role` IN ('user','assistant','system'))
- `content` text
- `session_id` uuid nullable — groups multi-turn conversations. Null for a rolling single-thread; set when we introduce named sessions later.
- `created_at` timestamptz
- RLS: user reads/writes only their own; service_role writes assistant messages.

**`coach_observations`** — LLM-inferred insights about the member. Program-agnostic.
- `id` uuid PK
- `user_id` uuid FK → auth.users
- `category` text (see enumeration below)
- `body` text — the observation itself, in the coach's voice ("She said Tuesdays are hardest — protect Tuesday.")
- `source_message_id` uuid nullable — the user message that triggered the observation
- `created_at` timestamptz
- RLS: user reads only their own; service_role writes.

Observation categories (initial, extensible): `obstacle`, `win`, `energy_pattern`, `pattern_relapse`, `preference`, `context`. Karen owns final taxonomy — treat these as placeholder until she signs off.

**`coach_context_snapshot`** — optional, materialized view or table. Rolls up onboarding data + recent daily actions + recent workouts + recent observations into a single prompt-ready blob. Optional because we can compute this on demand for phase 1 and only materialize if latency demands it.

### Edge function shape

Server-only. All Anthropic API calls happen in Supabase edge functions with the API key as an env var. Never call from the client.

**`supabase/functions/coach-chat/index.ts`**
- POST `{ userId, message, sessionId? }`
- Server actions:
  1. Load user context: `profiles` row, `user_daily_actions` last 7 days, `workout_sessions` last 3 completed, `coach_observations` last 20 by `created_at desc`, current week/block from `useCurrentWeek` logic ported to server.
  2. Assemble system prompt (see below).
  3. Call Anthropic `messages.create` with `stream: true` — use prompt caching on the system prompt + user context blob (both stable for the duration of a session).
  4. Stream assistant tokens back to client.
  5. After stream completes, write the user message + full assistant message to `coach_messages`.
  6. In a follow-up call (or the same turn's second Anthropic call), extract structured observations from the exchange and write to `coach_observations`.

Model selection: default to `claude-sonnet-5` for latency + cost balance. Escalate to `claude-opus-4-8` for the observation-extraction pass if quality demands it.

Prompt caching: system prompt + framework definitions + user profile snapshot are cache breakpoints (see the `claude-api` skill's guidance). Expect ~85-95% cache hit rate on multi-turn conversations.

### System prompt structure

Assembled from three tiers:

1. **Persona and guardrails** (stable across all users):
   - Warm, direct, evidence-based tone
   - The four hard guardrails above (no recursive deferral, no sentiment-blind affirmation, no hallucination, ABC verbatim)
   - Response shape: 3–5 paragraphs, 1–2 follow-up questions
   - Reference user context in every response

2. **Framework definitions** (stable across all users, per `create_power_frameworks` memory):
   - ABC Power Meals verbatim
   - TEB Loop (Trigger → Emotion → Behavior)
   - 3 Energy Accounts (FLOWED, UNEVEN, BLOCKED)
   - 5 Universal Patterns (Karen owns wording)

3. **User context** (per-user, cache-broken on profile changes):
   - Name, coaching_style, primary_goal, top_obstacles, confidence_level, work_situation, past_experience
   - Current block, current week, current daily actions
   - Recent workout sessions with lb-formatted highlights (uses `formatWeight` from `lib/units.ts`)
   - Last N `coach_observations`

Karen owns final wording. Draft in code; iterate with her via a review flow.

### Client integration

- **`hooks/useCoachChat.ts`** (new) — thin wrapper around a fetch to `/coach-chat`. Returns { sendMessage, messages, isStreaming, error }. Uses React Query or a bespoke store — TBD in implementation.
- **`app/coach.tsx`** — replace placeholder logic with `useCoachChat`.
- **`components/navigation/CoachBottomSheet.tsx`** — same; consume the hook, render streaming assistant messages.
- Streaming render: use `useState` on a running assistant message string; append tokens as they arrive.

### Rollout phases

**Phase 1 — Basic chat.**
- `coach_messages` table + RLS
- Edge function with static system prompt + user profile context
- Client wiring + streaming render
- Manual guardrail tests (see verification)

**Phase 2 — Observations.**
- `coach_observations` table + RLS
- Post-conversation extraction call
- Observations fed into subsequent turns' context

**Phase 3 — Rich context.**
- Recent workouts, daily actions, block/week progression added to prompt
- Optional `coach_context_snapshot` materialization if latency requires

Ship phases independently. Phase 1 is genuinely usable on its own.

## Verification

**Guardrail smoke tests** (manual, run before each phase ships):

- Recursive deferral: "Yes, explain ABC to me" → coach must explain ABC verbatim, not say "you can find that in your Foundations tab."
- Sentiment-blind affirmation: "This sounds like a lot" → coach must respond to overwhelm, not enthusiasm.
- Hallucination: ask about a week or framework that doesn't exist → coach must say "I want to make sure I give you accurate information" and not fabricate.
- ABC verbatim: any mention of protein or meal balance → ABC quoted exactly.
- Onboarding reference: check every reply references at least one onboarding datum.

**Continuation constraint check:** verify no schema key uses `program_id`. Query `information_schema.columns` for coach tables and confirm.

**Type coverage:** `npm run typecheck` clean on all new hooks + client code.

## Out of scope for this spec

- Prod OTP delivery on membership verification (separate punchlist)
- Karen's final tone / voice review of the system prompt (she owns that pass)
- Streaming UI polish (loading skeletons, typing indicator styling, etc.)
- Multi-session named-conversation UI (single rolling thread is fine for phase 1)
- Cost dashboards / usage metering
- Free-tier limits for pre-paid trial users
- Voice input / voice output
- Image attachments

## Risk

Real. This is the largest single spec in the current work queue. Risks:

- **System prompt drift.** Guardrails erode if Karen doesn't tone-review each iteration. Mitigation: bake the four hard guardrails into a test suite of prompts + expected shapes.
- **Latency.** Anthropic + Supabase edge + client streaming can compound. Prompt caching brings this back to acceptable. Watch first-token latency.
- **Observation quality.** LLM-extracted observations may hallucinate patterns. Mitigation: keep observations conservative in phase 2, review sample outputs with Karen before rolling into phase 3 context.
- **Cost.** Every message hits the API. With prompt caching well-configured, expect $0.01–$0.05 per multi-turn conversation on Sonnet. Watch monthly totals as active members grow.

## Follow-ups

- Rename `Layer2ListenStart` telemetry to `Layer2MediaStart` when video variant lands in the wild (deferred from L2 YouTube shipment)
- OTP prod delivery integration (Resend / SES) — see membership roster punchlist
- Coach message search / export for members
