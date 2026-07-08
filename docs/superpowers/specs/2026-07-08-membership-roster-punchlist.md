# Membership Roster — Wiring Punchlist

**Date:** 2026-07-08
**Status:** Punchlist (ops + engineering)
**Owner:** Ops (env vars, GHL config); Carlos (prod OTP delivery)
**Driver:** From John's 2026-07-08 goal-set, one of the three "not there yet" items for shipping to Karen was "real paid-member roster wiring on `verify-membership`." This document captures what's actually there, what's missing, and who owns each item.

## What's actually built

The `verify-membership` edge function at [supabase/functions/verify-membership/index.ts](../../../supabase/functions/verify-membership/index.ts) already implements the full member-verification flow:

1. **Source of truth:** GoHighLevel (GHL) contact list, filtered by a member tag.
2. **Mechanism:** OTP to the member's join email.
3. **Flow:**
   - POST `{ mode: "start", email }` → looks up GHL contact by email + `create-power-member` tag → if found, generates OTP → returns `{ found, otpSent }`.
   - POST `{ mode: "confirm", email, code }` → validates OTP against `membership_verification_otps` table → re-checks membership → if both pass, sets `program_member=true`, `join_email`, `verified_at`, `current_block='COMMIT'` on the caller's profile.
4. **Dev fallback:** if GHL env vars are missing, function heuristic-matches on `email.includes("+member")` (e.g. `jane+member@example.com` counts as a member).

## What's missing to actually work in prod

Three items. Two are ops decisions, one is engineering.

### 1. Set Supabase edge function env vars in prod — **OPS**

The function reads these env vars via `Deno.env.get(...)`. If unset, it falls back to the dev heuristic and no real GHL lookup happens.

Required in Supabase dashboard (Project → Edge Functions → verify-membership → Secrets):

| Env var | What it holds | Where to get it |
|---|---|---|
| `GHL_API_KEY` | GHL Private Integration key with `contacts.readonly` scope | GHL Settings → Private Integrations |
| `GHL_LOCATION_ID` | GHL sub-account ID for the CREATE POWER location | GHL sub-account URL |
| `GHL_MEMBER_TAG` | Tag name that identifies paid members. Defaults to `create-power-member` if unset. | Karen's decision — confirm the tag she applies to paid members |
| `OTP_PROVIDER` | `"dev"` or `"prod"`. Currently defaults to `"dev"` which uses a hardcoded bypass code. | Ops — set to `"prod"` when item #3 lands. |
| `OTP_DEV_BYPASS_CODE` | Dev-only bypass code. Currently defaults to `123456`. | Leave default; irrelevant once `OTP_PROVIDER=prod`. |

Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-provided by Supabase edge functions, no manual set needed.

### 2. Confirm GHL tag configuration — **KAREN**

Karen (or whoever owns her GHL) needs to:

1. Confirm the tag name applied to paid CREATE POWER members. Default expected value: `create-power-member`. If it's something else (e.g. `Create Power Member`, `CP Beta`, etc.), set `GHL_MEMBER_TAG` env var to match.
2. Confirm every paid member has the tag applied. Audit query: in GHL, filter contacts by tag; count should match Stripe / whatever payment source's paid subscriber count.
3. Establish the process for future member additions — is the tag applied automatically by a Zap / GHL automation on payment, or does Karen (or an ops person) tag them manually? Manual tagging works but is fragile.

### 3. Prod OTP delivery — **ENGINEERING**

Currently, `sendOtp` in the edge function writes the OTP to `membership_verification_otps` but only *sends* it when `OTP_PROVIDER === "dev"` (which just uses the hardcoded bypass). There's a `TODO(prod): integrate Resend / SES here.` comment at the send step.

To ship real OTP delivery:

1. Pick a transactional email provider. Recommended: **Resend** (Resend has an official Supabase edge function example; API is minimal, pricing is fair, deliverability is reasonable for OTP).
2. Add `RESEND_API_KEY` to edge function secrets.
3. In `verify-membership/index.ts`, replace the `TODO(prod)` block with a `fetch("https://api.resend.com/emails", ...)` call sending the 6-digit code from a verified sender.
4. Set the sender to something recognizable (e.g. `hello@tigerseyelife.com` or `karen@…`).
5. Design the OTP email body — brand-appropriate, no marketing junk, just the code and a short note. Karen may want a specific wording.

Effort: ~1 hour including Resend account setup + one round of testing.

## What's NOT in scope for this punchlist

- Coach LLM wiring — separate spec ([2026-07-08-ai-coach-llm-wiring-design.md](2026-07-08-ai-coach-llm-wiring-design.md)).
- Onboarding intake polish.
- Post-verification profile hydration (already handled — the edge function sets `program_member=true` etc.).
- A member "portal" for managing their own account (not asked for).

## Order of operations

For an actual member to log in on day one:

1. Karen confirms GHL tag setup (#2) — same day if she's around.
2. Ops sets env vars in Supabase (#1) — 10 minutes.
3. Engineering ships prod OTP delivery (#3) — 1 hour.
4. Set `OTP_PROVIDER=prod` env var — 1 minute.
5. Smoke test: create a test contact in GHL with the tag, sign in on the app with that email, receive OTP, verify.

None of this is engineering-blocked. All three items can proceed today with an hour of coordinated work.
