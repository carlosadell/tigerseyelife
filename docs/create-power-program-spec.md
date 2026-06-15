# CREATE POWER Program — Source Spec

> **Source:** User-supplied program brief (2026-06-16). This is the source of truth for the program model (12-week structure, P.O.W.E.R. framework, onboarding, schema, frameworks). It originated as an "implementation prompt for any AI assistant," so some sections describe a greenfield rebuild — interpret against the existing app where they conflict.
>
> **Status mapping:** See `CLAUDE.product.md` for the *current member-app* product direction. Where the two diverge, `CLAUDE.product.md` wins for any surface it explicitly covers (Today, Commit anchors, fork verification). Use this doc as the program-level skeleton everywhere else.

---

## 1. Program model

- **12 weeks total**, 6 themed blocks × 2 weeks each.
- Block names (UPPERCASE everywhere): `COMMIT → REFINE → EVOLVE → ADAPT → THRIVE → EXCEL`.
- Each block has **6 curriculum sections** aligned to the **P.O.W.E.R.** framework:
  - **P**atterns
  - **O**wnership
  - **W**isdom (Nutrition + Workouts)
  - **E**nergy
  - **R**esilience
- **36 sections total** (6 blocks × 6 threads).
- Tone: encouraging, positive, journey-based. **No countdowns, deadlines, or time-pressure metrics.**

## 2. Onboarding (4 mandatory sections)

The app is unusable until all four are completed. Responses persist to `profiles`.

### Section 1 — Goals & Motivation
- `age` (number, min 13, max 120)
- `primary_goal` (text area)
- `success_vision` (text area: "What does success look like in 12 weeks?")
- `importance_level` (slider 0–10)
- `confidence_level` (slider 0–10)
- if `confidence_level < 7`: show `confidence_barriers` text area

### Section 2 — Roadblocks
- `obstacles` (multi-select: Time, Motivation, Knowledge, Injury, Cost, Other)
- if "Other": `other_obstacle` text input
- `top_obstacles` (draggable ranking, top 2)
- `obstacle_deep_dive` (text area: "What makes your top obstacle difficult?")

### Section 3 — Context
- `work_situation` (single select: Office, Remote, Shift work, Unemployed, Retired)
- `living_situation` (multi-select: Alone, Partner, Children, Roommates, etc.)
- `past_experience` (text area: "What has worked or not worked before?")

### Section 4 — Habits & Final
- `concerns` (optional text area)
- `needle_mover` (single select: "What single change would help most?")
- if selected, `specific_habits` (text area)
- `success_factor` (single select; "Other" → `other_success_factor`)
- `emotion_response` (single select)
- `coaching_style` (single select):
  - Direct and data-driven
  - Warm and encouraging
  - Balanced (mix of both)
  - Challenging (push and accountability)

### Submit gate
- Review screen with all answers
- On submit: persist to `profiles` AND POST to Make.com webhook (payload shape below)

## 3. Frameworks (must reference verbatim)

### ABC Power Meals — exact wording when referenced
- **A** = **Anchor with Protein** (25–35g)
- **B** = **Balance Your Meal** (carbs, fats, fiber)
- **C** = **Complete with Embellishments** (herbs, spices, sauces)

### TEB Loop
- **T**rigger → **E**motion → **B**ehavior

### 3 Energy Accounts
- FLOWED · UNEVEN · BLOCKED

### Other named patterns to model
- **5 Universal Patterns** (recurring behavioral patterns)
- **Antifragility** — growing stronger from stress
- **Never Miss Twice** — identity-based consistency
- **Progressive Overload** — strength training principle
- **80/20 Flexibility** — nutrition adherence

## 4. Key business logic

- **Current week** = derived from `user_section_progress`, NOT elapsed calendar time.
- **Section completion** calls `complete_section_user` RPC with:
  - `p_block_name` (UPPERCASE)
  - `p_section_name` (exact title)
- **Complete & Next button** activates immediately on load — NO scroll-to-bottom / IntersectionObserver / timer gating. Anti-pattern explicitly called out.
- **Streaks** in `user_streaks`, incremented only for valid daily submissions.
- **Admin status** checked server-side via `has_role(_user_id, 'admin')` or `is_admin()` RPC. Never from client storage.

## 5. Schema (key tables)

### profiles
Adds (beyond current TEL schema): `age`, `primary_goal`, `success_vision`, `importance_level`, `confidence_level`, `confidence_barriers`, `obstacles`, `top_obstacles`, `obstacle_deep_dive`, `work_situation`, `living_situation`, `past_experience`, `concerns`, `needle_mover`, `specific_habits`, `success_factor`, `other_success_factor`, `emotion_response`, `coaching_style`, `onboarding_completed`, `current_block` (UPPERCASE), `current_week`.

(Current TEL `profiles` already has `current_block` from migration 0006; the rest are net-new.)

### user_roles (separate table — never on profiles)
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
```

### has_role security-definer
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
```

### user_section_progress
```sql
CREATE TABLE public.user_section_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  block_name text NOT NULL,
  section_name text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE (user_id, block_name, section_name)
);
```

### Other tables to model
`user_progress` (block/week), `user_streaks`, `user_counters`, `user_achievements`, `daily_interactions`, `weekly_focus`, `coaching_conversations`, `pattern_tracking`.

### RLS pattern
For every new table:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;
GRANT ALL ON public.<table> TO service_role;
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
-- PERMISSIVE policies (not restrictive) so they compose
```
Grants go BEFORE enabling RLS. `anon` grants only if a policy explicitly allows anonymous access.

## 6. Make.com webhook (onboarding completion)

POST append-only JSON. Do not remove/rename existing fields.

```json
{
  "firstName": "<from profiles.full_name split>",
  "lastName": "<from profiles.full_name split>",
  "fullName": "<profiles.full_name>",
  "userEmail": "<profiles.email>",
  "signupDate": "<ISO date>",
  "onboardingStatus": "completed",
  "age": "<profiles.age>",
  "primaryGoal": "<profiles.primary_goal>",
  "successVision": "<profiles.success_vision>",
  "importanceLevel": "<profiles.importance_level>",
  "confidenceLevel": "<profiles.confidence_level>",
  "confidenceBarrier": "<profiles.confidence_barriers>",
  "topObstacles": "<JSON array of top 2>",
  "topObstacle1": "<string>",
  "topObstacle2": "<string>",
  "customObstacle": "<profiles.other_obstacle>",
  "obstacleDeepDive": "<profiles.obstacle_deep_dive>",
  "workSituation": "<profiles.work_situation>",
  "livingWith": "<JSON array>",
  "whatHelped": "<profiles.past_experience>",
  "worries": "<profiles.concerns>",
  "needleMover": "<profiles.needle_mover>",
  "specificHabits": "<profiles.specific_habits>",
  "successFactor": "<profiles.success_factor>",
  "emotionResponse": "<profiles.emotion_response>",
  "coachingStyle": "<profiles.coaching_style>"
}
```

## 7. AI Coach — system prompt constraints

- Warm, direct, evidence-based.
- **Never hallucinate** program specifics (block names, framework definitions, etc.). If uncertain: "I want to make sure I give you accurate information."
- Reference user's onboarding context (goal, obstacles, confidence, `coaching_style`) in every response.
- ABC Power Meals definition must be **exact** when referenced (see §3).
- 3–5 paragraph responses, 1–2 follow-up questions.
- Edge function calls an AI gateway (Lovable AI Gateway in the source brief; we'd plug Anthropic Claude here per existing TEL patterns).

## 8. Admin panel

User list with search/filter; click → profile modal with:
- Full onboarding data (scrollable, flex-1 min-h-0 overflow-y-auto)
- Progress stats, section completion
- Analytics dashboard
- System health check (5-point diagnostic)
- CSV export (flattened profiles + onboarding)
- Admin impersonation (session-scoped, amber banner, clears query cache)
- Create/delete users via service-role edge functions, JWT role verified server-side

## 9. Constraints to honor

- **No scroll-to-bottom / IntersectionObserver / timer for enabling buttons** — buttons active immediately on load.
- **staleTime: 0** for progress/profile React Query keys.
- **Mandatory onboarding** — app unusable until complete.
- **user_roles separate table** — never on profiles.
- **PERMISSIVE RLS policies** — don't write restrictive policies that block composition.
- **Encouraging language only** — no countdowns, deadlines, shaming.
- **Admin modals** = scrollable flex containers (flex-1 min-h-0 overflow-y-auto).
- **Web-to-native parity** if a PWA equivalent exists.

## 10. Tensions with current build (flag for resolution)

| This doc says | Current TEL says | Resolution |
|---|---|---|
| Dark mode primary, Apple-like minimal | `CLAUDE.product.md` + memory: Today/Home light-first, white/gold/tangerine | Light-first wins for Today; older surfaces stay light-locked (Auth/Onboarding); other tabs TBD per surface |
| 4-section onboarding with detailed fields | Current `app/onboarding.tsx` is the existing TEL intake | Big gap — current intake doesn't yet cover age, goals, obstacles, coaching style. Future work. |
| 6 sections per block (P.O.W.E.R. framework) | Current Commit Today has 3 "anchors" (read labels / cut sugar / protein+veg) | Anchors are a Today-screen abstraction; full curriculum sections are the 6-per-block model. Both can coexist — anchors are the daily UI, sections are the program structure. |
| Make.com webhook on onboarding complete | Not wired | Future work — add to onboarding intake completion. |
| `complete_section_user` RPC, UPPERCASE block names | We have `current_block` as text-with-check-constraint UPPERCASE already | Compatible — RPC needs adding alongside curriculum schema. |
| user_roles + has_role function | Not yet added | Future work — comes online when admin panel lands. |
| AI Coach with anti-hallucination + Claude/Lovable AI Gateway | Coach UI is a placeholder bottom-sheet, no LLM wiring | Aligned with `CLAUDE.md` AI coach guardrails. Future work. |
| Frameworks (TEB, ABC, 5 Patterns, 3 Energy Accounts) | Implicit in Commit-block anchor copy | Future work to surface them as curriculum content |
