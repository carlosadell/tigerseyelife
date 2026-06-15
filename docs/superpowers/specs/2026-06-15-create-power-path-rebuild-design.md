# Create Power Path Rebuild — Design

**Date:** 2026-06-15
**Owner:** John (vuzzdotio@gmail.com)
**Source of truth (product):** `CLAUDE.product.md` (companion to repo `CLAUDE.md`)
**Source of truth (engineering):** repo `CLAUDE.md`

## 1. Purpose

Rebuild the Create Power Path member experience around the spec in `CLAUDE.product.md`, replacing the audit-passing-but-stylistically-AI-feeling interim with a modern, photo-rich, coach-voiced design. Two surfaces are in scope:

1. **Onboarding fork + membership verification** — one app, gated entry into either the paid Create Power experience or a non-member placeholder.
2. **Block-driven Today/Home for the Commit Block** — a coach in your pocket, not a tracking dashboard.

Everything else (Workout, Progress, AI coach wiring, Refine+ Today layouts) stays out of scope. The block dispatch leaves a slot for those to land later without re-architecture.

## 2. Locked decisions (from this session)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Membership source of truth | GoHighLevel (contact + `create-power-member` tag, queried server-side) |
| 2 | Verification mechanism | OTP to the join email (6-digit, 10-min expiry); plain email match remains a one-file swap |
| 3 | Visual direction | Modern fitness-app vocabulary (matching the App Store reference style), TEL light palette, gold replaces every reference blue, no tracking IA |
| 4 | Commit Today layout | Hybrid: D's stack + E's photo focus hero (week strip + greeting + photo hero + 3 anchors + lesson + awareness) |
| 5 | Photo asset strategy | Mixed — Karen/Ryan coach stills for hero, scene/food photography for lesson thumbs; Unsplash placeholders behind `PHOTO_ASSETS_READY` flag |
| 6 | Nutrition tab in Commit | Keep the tab, render a locked-state coach-voiced empty screen; swaps to logger when `current_block ≥ REFINE` |
| 7 | Vocabulary scope | Full sweep — fork, verify, non-member-diagnostic, non-member landing all adopt the new modern vocabulary |

## 3. Architecture

### 3.1 Routes & gates

All routing decisions live in `app/index.tsx` and are **re-checked** in `app/(tabs)/_layout.tsx` so deep-linking can't bypass the fork.

```
no session                                  → /(auth)/sign-in
session, no fork answered                   → /membership            (Yes/No question)
session, fork answered = "no"               → /non-member            (placeholder)
session, fork = "yes", verified, no intake  → /onboarding            (existing intake)
session, member, intake done                → /(tabs)/today          (block-driven Today)
```

`profile.forkAnswered` is derived: any of `verified_at | non_member_diagnostic | program_member` set ⇒ true.

### 3.2 Data layer

#### `profiles` table — new columns (migration 0006)

| Column | Type | Notes |
|--------|------|-------|
| `program_member` | `boolean not null default false` | Server-set only |
| `join_email` | `text` | The email the user used to join Create Power (may differ from app login) |
| `verified_at` | `timestamptz` | When verification succeeded |
| `current_block` | enum text (`COMMIT \| REFINE \| EVOLVE \| ADAPT \| THRIVE \| EXCEL`) | Set to `COMMIT` on verify |
| `non_member_diagnostic` | `jsonb` | `{friction, stoppingPoint}` from No-branch diagnostic; client-writable |

#### Entitlement guard trigger

`profiles_entitlement_guard` (BEFORE UPDATE) raises if `auth.role() <> 'service_role'` and any of `program_member | join_email | verified_at | current_block` change. `non_member_diagnostic` is **not** guarded — clients can write it for the No-branch flow.

#### `membership_verification_otps` table

```sql
email text primary key,
code text not null,
expires_at timestamptz not null,
created_at timestamptz default now()
```

RLS enabled with **no policies** — only `service_role` (the edge function) reads/writes.

#### `useMembership` hook (dual-path)

- **Supabase mode**: reads from `profiles` (the 5 columns above + derives `forkAnswered`).
- **Dev mode** (no Supabase config or `isDevSession`): mirrors `Membership` shape in AsyncStorage under `tel:membership:<userId>`. Exposes `devMarkVerified(email)` for the verify screen's dev path.
- Exposes `recordNonMember({friction, stoppingPoint})` — the **only** entitlement-adjacent client write (writes to `non_member_diagnostic`, not the guarded columns).

### 3.3 Verification — `supabase/functions/verify-membership/index.ts`

Two-mode endpoint, JWT-authenticated (callers must pass user bearer token; service-role client is internal only):

#### Mode `"start"` — `{email}`
1. Normalize email (`trim().toLowerCase()`)
2. `lookupMembership(email)` → GHL contact search
3. If not found → `{found: false, otpSent: false}`
4. If found → `sendOtp(email)` → upsert into `membership_verification_otps` with 10-min expiry; dispatch via configured `OTP_PROVIDER`
5. Return `{found: true, otpSent: true}`

#### Mode `"confirm"` — `{email, code}`
1. `validateOtp(email, code)` → false ⇒ `{verified: false, reason: 'code_invalid'}`
2. Re-`lookupMembership(email)` → defends against tag revocation during the OTP window; false ⇒ `{verified: false, reason: 'no_longer_member'}`
3. Service-role `update` on `profiles` for the caller's user ID: `program_member=true, join_email=email, verified_at=now, current_block='COMMIT'`
4. Return `{verified: true}`

#### Swappable interfaces

```ts
lookupMembership(email): {found: boolean}
sendOtp(email): void          // dev provider returns OTP_DEV_BYPASS_CODE
validateOtp(email, code): boolean
```

Swapping GHL → Stripe / Supabase membership table = replace `lookupMembership`. Swapping OTP → plain email match = collapse `confirm` into `start` and skip `validateOtp`. Both are one-file changes by design.

#### Env vars

| Var | Purpose |
|-----|---------|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Edge function infrastructure |
| `GHL_API_KEY`, `GHL_LOCATION_ID`, `GHL_MEMBER_TAG` | Membership lookup (defaults: `create-power-member` tag) |
| `OTP_PROVIDER` | `dev` (bypass `OTP_DEV_BYPASS_CODE`) \| `resend` (TODO) |
| `OTP_DEV_BYPASS_CODE` | Default `123456` for dev mode |

## 4. Visual system

### 4.1 Palette (from `lib/brand.ts` light theme)

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#FBF8F1` (bone) | App background |
| `--card` | `#FFFFFF` | Surface cards |
| `--cream` | `#F2EDE3` | Soft surfaces (icon square bg in muted contexts) |
| `--text` | `#141416` | Primary text |
| `--muted` | `#5F6670` | Secondary text |
| `--border` | `rgba(11,11,12,0.08)` | Hairline borders |
| `--gold` | `#A87414` | Primary accent (replaces every blue in the references) |
| `--gold-square` | `#F0E2C2` | Gold-tinted icon-square fill |
| `--gold-soft` | `#F4E9D2` | FOR TODAY callout background |
| `--tangerine` | `#FF914D` | CTA / chevron-forward / lesson-arrow |

No `text-white` or `bg-[#...]` literals — pull from `THEME_COLORS.light` only.

### 4.2 Typography

- Inter 400 / 500 / 700 / 800
- Sentence-case bold for headings (no lowercase greetings, no Georgia, no all-caps title shouting)
- Letter-spacing tight (-0.2 to -0.6) on large titles
- VT323 retained for other diagnostic surfaces; **not used** in Commit Today

### 4.3 Component vocabulary (the rebuilt design language)

#### `IconSquare` — 44×44 rounded-12, gold-tinted bg, gold Lucide icon
The "checklist-shaped" anchor row leader, also reused in lesson cards and Nutrition empty state.

#### `SectionHeader` — 17px bold + optional muted meta on right
e.g. `Today's Focus    3 anchors`

#### `AnchorRow` — IconSquare + label/sub stack + tangerine chevron
Used for Commit anchors and for the fork screen's Yes/No choices. **Carries no state**.

#### `PhotoHeroCard` — cream-gradient bg, kicker + bold headline + photo on the right
Used for Today's "This Week's Focus," for the verify-membership coach hero, and for the non-member landing.

#### `LessonCard` — 80×80 scene-photo thumb + meta + bold title + body
Both Today's "Next Lesson" and the Lessons tab list rows.

#### `AwarenessCard` — gold-tint card, sparkle icon, FOR TODAY kicker + body
Single instance on Today.

#### `TabBar` — 4 active + 1 locked variant
Lessons / Today / Workout / Progress / Nutrition. Nutrition shows a lock icon when `current_block = 'COMMIT'`. Active = `--gold`.

### 4.4 Photo strategy

- **Coach hero pool** — 4–8 Karen/Ryan stills, rotated by week or pinned per block. Asset list defined in `lib/coachStills.ts`. Until real assets land, behind `PHOTO_ASSETS_READY=false` we use a curated Unsplash fallback set.
- **Lesson thumbs** — scene/food photography, assigned per lesson row in the `lessons` schema (`thumbnail_url`). For Commit's 3 lessons (Reading Labels / Cutting Added Sugar / Building a Balanced Plate) we ship initial scene photography.
- All photos go through `expo-image` with `transition` and a `placeholder` (low-res blur hash) so first paint isn't blank.

## 5. Today — Commit Block (hybrid layout)

`app/(tabs)/today.tsx` keeps the `renderBlock(block)` dispatch. For `block === 'COMMIT'`, render `<CommitBlockToday />`:

| # | Component | Notes |
|---|-----------|-------|
| 1 | `TodayHeader` | water-drop streak (gold), week pill, avatar cluster (coach photo + user notif circle) |
| 2 | `WeekStrip` | 7 rings; today highlighted gold; engagement = filled ring; **no failure-state red days** |
| 3 | `GreetingHeader` | "Evening, Johnty." sentence-case bold + "Commit Block · Week N" subtitle |
| 4 | `FocusHeroCard` | PhotoHeroCard with kicker `THIS WEEK'S FOCUS`, headline `Three things, every plate.`, Karen/Ryan still on right |
| 5 | `AnchorStack` | 3 AnchorRows: Read labels / Cut added sugar by half / Protein + vegetables — chevron deep-links to that lesson |
| 6 | `NextLessonCard` | LessonCard with scene-photo thumb, meta, bold title, body |
| 7 | `AwarenessCard` | Daily-rotating prompt OR optional coach nudge (FOR TODAY kicker); same component, content shape is a discriminated union |

Per CLAUDE.product.md §4, slot 7 covers both the "one daily intention / awareness prompt" and the "optional gentle coach nudge." `lib/commitPrompts.ts` returns either a `{kind: 'awareness', body}` or `{kind: 'nudge', body, attribution?}` for the day. AwarenessCard renders the body and adjusts kicker/affordance accordingly. No two-card stack — one slot, two voices, never both at once.

Theme-locked light. No `useThemeColors()` here — direct `THEME_COLORS.light` references (matches Auth/Onboarding pattern in `CLAUDE.md`).

**Anchor deep-link rule (default):** each anchor row's `onPress` routes to the matching Commit lesson detail. The current app's grow route shape is `app/grow/[block].tsx` — the implementation chooses between (a) adding a nested `[lesson]` segment or (b) opening lesson detail as a modal pushed from the grow tab, then deep-links accordingly. Until lesson detail is wired or slugs are confirmed, all three anchors fall back to `/(tabs)/grow` filtered to Commit. The fallback is the design contract; the route specifics are an implementation detail.

## 6. Nutrition — locked state in Commit

`app/(tabs)/fuel.tsx` reads `current_block`. When `COMMIT`:

```
┌────────────────────────────────────────────┐
│ Nutrition                                  │
│                                            │
│ ┌─ PhotoHeroCard ─────────────────────┐   │
│ │ COMMIT BLOCK                         │   │
│ │ Awareness first,        [coach photo]│   │
│ │ logging later.                       │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ You'll unlock meal logging in Refine.      │
│ Right now you're focused on knowing what's │
│ in your food, not measuring it.            │
│                                            │
│ ┌─ AnchorRow ────────────────────────┐    │
│ │ [📖] Building a Balanced Plate · 4m│    │
│ └─────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

When `current_block` reaches `REFINE`, this screen is replaced by the meal logger (existing surface, out of scope for this rebuild).

## 7. Fork + verify + non-member — modern sweep

### `/membership` (the fork)
- Sentence-case bold "Are you part of the Create Power program?"
- Two AnchorRows (gold IconSquare + label + sub + chevron) instead of the existing `ChoiceCard`:
  - `[badge icon]` "Yes, I'm a Create Power member" → `/verify-membership`
  - `[map icon]` "Not yet" → `/non-member-diagnostic`
- Ghost link at bottom: "Use a different account" → re-auth

### `/verify-membership`
- PhotoHeroCard at top: coach still + kicker `VERIFY MEMBERSHIP` + headline (stage-dependent)
- Modern email input (rounded-12, large hit target, floating-style label feeling)
- OTP step: single 6-digit `TextInput` with letter-spacing 6, center-aligned, monospace
- Tangerine CTA pill (`Send code` → `Verify`)
- Error display in muted-red below the input
- Not-found state: same hero, swap copy + secondary action ("Continue as non-member")

### `/non-member-diagnostic`
- Two-step flow, step indicator kicker `2 QUICK QUESTIONS · 1 OF 2`
- Sentence-case bold question
- Single multiline `TextInput` styled to match the rest of the vocabulary
- Continue / Done tangerine CTA

### `/non-member`
- Small PhotoHeroCard (Karen/Ryan still + kicker `THANKS — WE HEARD YOU`)
- Sentence-case bold "You're in the right place. We're still building this part."
- Body explaining the destination is in design
- Ghost "Sign out" link

## 8. Implementation surfaces

### Files we own this rebuild

**Routes / screens**
- `app/index.tsx` — gate (delete old logic, write fresh against the new useMembership shape)
- `app/(tabs)/_layout.tsx` — gate re-check + tab bar wiring
- `app/(tabs)/today.tsx` — block dispatch
- `app/(tabs)/fuel.tsx` — Nutrition locked state when `block === 'COMMIT'`
- `app/membership.tsx` — fork
- `app/verify-membership.tsx` — verify flow
- `app/non-member-diagnostic.tsx` — diagnostic
- `app/non-member.tsx` — placeholder landing
- `app/_layout.tsx` — register screen names + entry redirect

**Hooks**
- `hooks/useMembership.ts` — dual-path Supabase/AsyncStorage with the shape above

**Components — new design vocabulary**
- `components/ui/IconSquare.tsx`
- `components/ui/SectionHeader.tsx`
- `components/ui/AnchorRow.tsx`
- `components/ui/PhotoHeroCard.tsx`
- `components/ui/LessonCard.tsx`
- `components/ui/AwarenessCard.tsx`
- `components/today/CommitBlockToday.tsx` — composes the layout above
- `components/today/TodayHeader.tsx` — streak + week pill + avatar cluster
- `components/today/GreetingHeader.tsx` — sentence-case bold greeting + subtitle
- `components/history/WeekStrip.tsx` — gold-today rings, no failure red
- `components/navigation/FloatingTabBar.tsx` — locked-tab variant

**Library**
- `lib/coachStills.ts` — pool of Karen/Ryan still URLs (placeholder Unsplash fallback)
- `lib/commitAnchors.ts` — the 3 anchor entries (icon, title, sub, lesson slug)
- `lib/commitPrompts.ts` — daily awareness prompts (rotated by epoch day)

**Edge function + migration**
- `supabase/functions/verify-membership/index.ts` (rewrite to the spec shape)
- `supabase/migrations/0006_create_power_membership.sql` (entitlement columns + trigger + OTP table)

### Files we touch but don't own

- `lib/brand.ts` — light theme tokens already exist; no edits unless adding a missing token.

### Files we leave alone

- Workout, Progress, AI Coach surfaces
- Onboarding intake flow (existing `/onboarding`)
- Auth screens

## 9. Out of scope (explicit)

- Refine / Evolve / Adapt / Thrive / Excel Today layouts (block dispatch ready, modules will be designed when Karen/Ryan name them)
- Workout tab redesign
- Progress tab redesign
- AI Coach LLM wiring (placeholder bottom sheet stays as-is)
- Real GHL API key procurement + production integration test (the function shape is ready; needs creds and a manual smoke test)
- OTP provider wiring (Resend / SES); dev bypass works for development
- Diagnostic destination beyond the `/non-member` placeholder (Karen/Ryan to define)
- Lesson schema additions (if Commit-anchor lesson slugs don't exist in the lessons table yet, deep-links fall back to `/(tabs)/grow` filtered to Commit; spec wiring is a separate task)

## 10. Definition of done

- [ ] Verified Commit member and non-member see clearly different post-onboarding flows
- [ ] Commit Today matches the Hybrid mockup (D + E synthesis); zero logging prompts; no calorie/macro/TDEE/weight widgets
- [ ] Nutrition tab in Commit renders the locked-state PhotoHeroCard + copy + lesson AnchorRow, not the food log
- [ ] All fork/verify/non-member screens use the modern vocabulary (IconSquare, AnchorRow, PhotoHeroCard, sentence-case bold)
- [ ] `program_member`, `join_email`, `verified_at`, `current_block` cannot be set from a non-service-role client (trigger raises; verified with a deny-case test)
- [ ] `app/(tabs)/_layout.tsx` re-checks the fork + membership gates so deep-linking can't bypass
- [ ] Block dispatch (`renderBlock(block)`) extensible to Refine without re-architecture
- [ ] Photo assets resolve through `expo-image` with blur-hash placeholders; `PHOTO_ASSETS_READY=false` falls back to Unsplash stills
- [ ] `npm run typecheck` clean
- [ ] No raw hex / `text-white` literals introduced — all colors come from `THEME_COLORS.light`

## 11. Open product items (not blockers — defaults noted)

| Item | Default for implementation | Owner |
|------|---------------------------|-------|
| Commit anchor → lesson slugs | Fall back to `/(tabs)/grow` filtered to Commit if slug missing | Karen/Ryan to confirm slugs |
| Nutrition locked-state copy | "Awareness first, logging later." + body above | Karen voice review |
| Coach hero still pool | Unsplash placeholders until `PHOTO_ASSETS_READY=true` | Karen/Ryan to deliver |
| Non-member landing destination | Placeholder card with `TBD` flag | Karen/Ryan to define |
| GHL API creds + tag exact spelling | `create-power-member` (default) — needs verification | John + Ryan |
| OTP provider | Dev bypass (`123456`) until production launch | Engineering |
