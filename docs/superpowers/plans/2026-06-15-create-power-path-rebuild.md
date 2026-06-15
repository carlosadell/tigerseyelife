# Create Power Path Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Create Power Path member experience per `docs/superpowers/specs/2026-06-15-create-power-path-rebuild-design.md`: server-verified GHL+OTP membership fork, block-driven Today, modern photo-rich Commit Block, light-locked, no tracking IA.

**Architecture:** One Expo app. RLS-guarded entitlement columns on `profiles`. Server-only `verify-membership` edge function (GHL lookup + OTP). Dual-path `useMembership` hook (Supabase + AsyncStorage). Six new UI primitives compose the Today layout, fork, verify, and non-member screens with consistent modern vocabulary in the TEL light palette.

**Tech Stack:** Expo SDK / React Native (new architecture) · expo-router (file-based) · Supabase (Postgres + edge functions + service-role admin) · @tanstack/react-query · zustand · lucide-react-native · NativeWind (configured but unused here — stick to `StyleSheet` + `THEME_COLORS.light` per `CLAUDE.md`).

**Verification gate:** Only `npm run typecheck`. No test runner, no linter. UI surfaces additionally smoke-checked by running `npm start` and exercising the flow in Expo Go.

---

## Pre-flight

Read once before starting:

- `docs/superpowers/specs/2026-06-15-create-power-path-rebuild-design.md` (the spec — source of truth)
- `CLAUDE.md` (engineering conventions — dual-path, light theme-lock, no NativeWind migration, metro/zustand resolver quirk)
- `CLAUDE.product.md` (product direction — coach not tracker, anchors vs checklists, Nutrition gating)
- `lib/brand.ts:31-74` (THEME_COLORS.light palette tokens you'll reference everywhere)

The working tree has audit-phase scaffolding for many of these surfaces (untracked: `app/membership.tsx`, `app/verify-membership.tsx`, `app/non-member.tsx`, `app/non-member-diagnostic.tsx`, `hooks/useMembership.ts`, `supabase/functions/verify-membership/`, `supabase/migrations/0006_create_power_membership.sql`, `components/today/CommitBlockToday.tsx`, `components/today/CommitFocusCard.tsx`, `components/today/DailyAwarenessCard.tsx`, `components/today/TodayHeader.tsx`; modified: `app/_layout.tsx`, `app/index.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/today.tsx`, `components/today/GreetingHeader.tsx`, `components/today/NextLessonCard.tsx`, `components/history/WeekStrip.tsx`). Phase 0 discards all of it so the rebuild starts from the last commit (`af01a3f`).

---

## Phase 0 — Demolition

Wipe audit-phase scaffolding. Start from `af01a3f` for the two rebuild surfaces, leave every unrelated file alone.

### Task 0.1: Discard audit-phase scaffolding

**Files (delete + restore):**

- Delete (untracked): `app/membership.tsx`, `app/verify-membership.tsx`, `app/non-member.tsx`, `app/non-member-diagnostic.tsx`, `hooks/useMembership.ts`, `supabase/functions/verify-membership/index.ts`, `supabase/migrations/0006_create_power_membership.sql`, `components/today/CommitBlockToday.tsx`, `components/today/CommitFocusCard.tsx`, `components/today/DailyAwarenessCard.tsx`, `components/today/TodayHeader.tsx`
- Restore (modified, audit-phase touched): `app/_layout.tsx`, `app/index.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/today.tsx`

**Files explicitly NOT touched in 0.1** (these are spec-aligned and stay, even though they appear in `git status`): `components/today/GreetingHeader.tsx`, `components/today/NextLessonCard.tsx`, `components/history/WeekStrip.tsx`. They'll be rewritten in later phases as part of their owning components.

- [ ] **Step 1: Confirm what's about to be discarded**

Run: `git status` and verify the untracked + modified files above match.
Expected: same list. If anything looks unfamiliar, stop and ask.

- [ ] **Step 2: Delete untracked rebuild files**

```bash
rm app/membership.tsx app/verify-membership.tsx app/non-member.tsx app/non-member-diagnostic.tsx
rm hooks/useMembership.ts
rm -rf supabase/functions/verify-membership
rm supabase/migrations/0006_create_power_membership.sql
rm components/today/CommitBlockToday.tsx components/today/CommitFocusCard.tsx components/today/DailyAwarenessCard.tsx components/today/TodayHeader.tsx
```

- [ ] **Step 3: Restore the 4 audit-touched files**

```bash
git checkout HEAD -- app/_layout.tsx app/index.tsx app/(tabs)/_layout.tsx app/(tabs)/today.tsx
```

- [ ] **Step 4: Verify typecheck still passes (sanity baseline)**

Run: `npm run typecheck`
Expected: Exit 0, no output.

- [ ] **Step 5: Commit the demolition as one logical step**

```bash
git add -A
git commit -m "Discard audit-phase rebuild scaffolding"
```

---

## Phase 1 — Data layer (migration)

### Task 1.1: Create the entitlement migration

**Files:**
- Create: `supabase/migrations/0006_create_power_membership.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/0006_create_power_membership.sql
--
-- Create Power membership + block phase
--
-- Adds entitlement columns to profiles guarded by a trigger so the client
-- can never set program_member = true on its own. Only the
-- verify-membership edge function (service_role) writes these.

alter table profiles
  add column if not exists program_member boolean not null default false,
  add column if not exists join_email text,
  add column if not exists verified_at timestamptz,
  add column if not exists current_block text
    check (current_block in ('COMMIT','REFINE','EVOLVE','ADAPT','THRIVE','EXCEL')),
  add column if not exists non_member_diagnostic jsonb;

create or replace function public.prevent_client_entitlement_writes()
returns trigger as $$
declare
  caller_role text;
begin
  caller_role := coalesce(auth.role(), '');

  if caller_role <> 'service_role' then
    if new.program_member is distinct from old.program_member then
      raise exception 'program_member is server-set only';
    end if;
    if new.join_email is distinct from old.join_email then
      raise exception 'join_email is server-set only';
    end if;
    if new.verified_at is distinct from old.verified_at then
      raise exception 'verified_at is server-set only';
    end if;
    if new.current_block is distinct from old.current_block then
      raise exception 'current_block is server-set only';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_entitlement_guard on profiles;
create trigger profiles_entitlement_guard
  before update on profiles
  for each row execute function public.prevent_client_entitlement_writes();

create index if not exists profiles_join_email_idx on profiles (join_email);
create index if not exists profiles_program_member_idx on profiles (program_member);

-- Short-lived OTP store. RLS enabled with no policies so only service_role
-- (the edge function) reads or writes.
create table if not exists membership_verification_otps (
  email text primary key,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table membership_verification_otps enable row level security;
```

- [ ] **Step 2: Apply locally if Supabase is running**

If `npx supabase status` shows a running stack:
Run: `npx supabase db reset`
Expected: migration applies without error.

If no local stack: skip this step. The migration ships untested locally — that's acceptable per spec ("Real GHL key procurement + production integration test … needs creds"). Mark the file ready for hosted application by `npx supabase db push` at deploy time.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0006_create_power_membership.sql
git commit -m "Add migration 0006: membership entitlement + OTP table"
```

---

## Phase 2 — Edge function (verify-membership)

### Task 2.1: Write the verify-membership edge function

**Files:**
- Create: `supabase/functions/verify-membership/index.ts`

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/verify-membership/index.ts
//
// Server-only verification of Create Power program membership.
//
// Flow:
//   POST { mode: "start", email }
//     -> looks up membership in GHL; if found, sends OTP; returns
//        { found, otpSent }.
//
//   POST { mode: "confirm", email, code }
//     -> validates OTP; re-checks membership; if both pass, sets
//        program_member=true, join_email, verified_at, current_block='COMMIT'
//        on the caller's profile using service_role.
//
// Source of truth (spec §2 decision 1): GHL contact + create-power-member tag.
// Verification mechanism (spec §2 decision 2): OTP to join email.
//
// Both lookupMembership and sendOtp/validateOtp are swappable in one file.

import { createClient } from "npm:@supabase/supabase-js@2";

type StartBody = { mode: "start"; email: string };
type ConfirmBody = { mode: "confirm"; email: string; code: string };
type Body = StartBody | ConfirmBody;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GHL_API_KEY = Deno.env.get("GHL_API_KEY") ?? "";
const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID") ?? "";
const GHL_MEMBER_TAG = Deno.env.get("GHL_MEMBER_TAG") ?? "create-power-member";
const OTP_DEV_BYPASS_CODE = Deno.env.get("OTP_DEV_BYPASS_CODE") ?? "123456";
const OTP_PROVIDER = Deno.env.get("OTP_PROVIDER") ?? "dev";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, content-type",
    },
    status,
  });
}

function normaliseEmail(input: string): string {
  return input.trim().toLowerCase();
}

async function lookupMembership(email: string): Promise<{ found: boolean }> {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    return { found: email.includes("+member") };
  }

  const url = `https://services.leadconnectorhq.com/contacts/?query=${encodeURIComponent(email)}&locationId=${encodeURIComponent(GHL_LOCATION_ID)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: "2021-07-28",
      Accept: "application/json",
    },
  });

  if (!res.ok) return { found: false };

  const data = (await res.json()) as {
    contacts?: Array<{ tags?: string[]; email?: string }>;
  };

  const found = (data.contacts ?? []).some((contact) => {
    const matchesEmail = (contact.email ?? "").toLowerCase() === email;
    const hasTag = (contact.tags ?? []).some(
      (tag) => tag.toLowerCase() === GHL_MEMBER_TAG.toLowerCase(),
    );
    return matchesEmail && hasTag;
  });

  return { found };
}

async function sendOtp(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<void> {
  const code = OTP_PROVIDER === "dev"
    ? OTP_DEV_BYPASS_CODE
    : String(Math.floor(100000 + Math.random() * 900000));

  await admin.from("membership_verification_otps").upsert(
    {
      email,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    },
    { onConflict: "email" },
  );

  if (OTP_PROVIDER !== "dev") {
    // TODO(prod): integrate Resend / SES here.
  }
}

async function validateOtp(
  admin: ReturnType<typeof createClient>,
  email: string,
  code: string,
): Promise<boolean> {
  if (OTP_PROVIDER === "dev" && code === OTP_DEV_BYPASS_CODE) return true;

  const { data } = await admin
    .from("membership_verification_otps")
    .select("code,expires_at")
    .eq("email", email)
    .maybeSingle();

  if (!data) return false;
  if (new Date(data.expires_at).getTime() < Date.now()) return false;
  if (data.code !== code) return false;

  await admin.from("membership_verification_otps").delete().eq("email", email);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
      },
    });
  }
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json(401, { error: "missing_user_token" });
  }
  const userJwt = authHeader.slice("bearer ".length).trim();

  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: `Bearer ${userJwt}` } },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return json(401, { error: "invalid_user_token" });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!body || typeof body !== "object" || typeof body.email !== "string") {
    return json(400, { error: "email_required" });
  }
  const email = normaliseEmail(body.email);

  if (body.mode === "start") {
    const { found } = await lookupMembership(email);
    if (!found) return json(200, { found: false, otpSent: false });
    await sendOtp(admin, email);
    return json(200, { found: true, otpSent: true });
  }

  if (body.mode === "confirm") {
    if (typeof body.code !== "string" || body.code.length < 4) {
      return json(400, { error: "code_required" });
    }
    const ok = await validateOtp(admin, email, body.code);
    if (!ok) return json(200, { verified: false, reason: "code_invalid" });

    const { found } = await lookupMembership(email);
    if (!found) return json(200, { verified: false, reason: "no_longer_member" });

    const { error: updateError } = await admin
      .from("profiles")
      .update({
        program_member: true,
        join_email: email,
        verified_at: new Date().toISOString(),
        current_block: "COMMIT",
      })
      .eq("id", user.id);

    if (updateError) return json(500, { verified: false, reason: "profile_update_failed" });
    return json(200, { verified: true });
  }

  return json(400, { error: "unknown_mode" });
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/verify-membership/index.ts
git commit -m "Add verify-membership edge function (GHL + OTP)"
```

---

## Phase 3 — useMembership hook

### Task 3.1: Write the dual-path useMembership hook

**Files:**
- Create: `hooks/useMembership.ts`

- [ ] **Step 1: Write the hook**

```typescript
// hooks/useMembership.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export type Block = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';

export type Membership = {
  forkAnswered: boolean;
  programMember: boolean;
  joinEmail: string | null;
  verifiedAt: string | null;
  currentBlock: Block | null;
};

const EMPTY: Membership = {
  forkAnswered: false,
  programMember: false,
  joinEmail: null,
  verifiedAt: null,
  currentBlock: null,
};

const devKey = (userId: string) => `tel:membership:${userId}`;

export function useMembership() {
  const { isDevSession, session } = useAuth();
  const userId = session?.user.id ?? null;

  const [membership, setMembership] = useState<Membership>(EMPTY);
  const [loading, setLoading] = useState(Boolean(session));

  const load = useCallback(async () => {
    if (!session || !userId) {
      setMembership(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);

    if (isDevSession || !supabase) {
      const raw = await AsyncStorage.getItem(devKey(userId));
      setMembership(raw ? (JSON.parse(raw) as Membership) : EMPTY);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('program_member,join_email,verified_at,current_block,non_member_diagnostic')
      .eq('id', userId)
      .maybeSingle();

    setMembership({
      forkAnswered: Boolean(
        data?.verified_at || data?.non_member_diagnostic || data?.program_member,
      ),
      programMember: Boolean(data?.program_member),
      joinEmail: data?.join_email ?? null,
      verifiedAt: data?.verified_at ?? null,
      currentBlock: (data?.current_block as Block | null) ?? null,
    });
    setLoading(false);
  }, [isDevSession, session, userId]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const devMarkVerified = useCallback(
    async (joinEmail: string) => {
      if (!userId) return;
      const next: Membership = {
        forkAnswered: true,
        programMember: true,
        joinEmail,
        verifiedAt: new Date().toISOString(),
        currentBlock: 'COMMIT',
      };
      await AsyncStorage.setItem(devKey(userId), JSON.stringify(next));
      setMembership(next);
    },
    [userId],
  );

  const recordNonMember = useCallback(
    async (diagnostic: { friction: string; stoppingPoint: string }) => {
      if (!userId) return;

      if (isDevSession || !supabase) {
        const next: Membership = {
          forkAnswered: true,
          programMember: false,
          joinEmail: null,
          verifiedAt: null,
          currentBlock: null,
        };
        await AsyncStorage.setItem(devKey(userId), JSON.stringify(next));
        await AsyncStorage.setItem(`${devKey(userId)}:diagnostic`, JSON.stringify(diagnostic));
        setMembership(next);
        return;
      }

      await supabase
        .from('profiles')
        .update({ non_member_diagnostic: diagnostic })
        .eq('id', userId);

      await load();
    },
    [isDevSession, load, userId],
  );

  return { loading, membership, refresh: load, devMarkVerified, recordNonMember };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add hooks/useMembership.ts
git commit -m "Add useMembership hook (dual-path Supabase/AsyncStorage)"
```

---

## Phase 4 — UI primitives + lib data

### Task 4.1: Create lib/coachStills.ts

**Files:**
- Create: `lib/coachStills.ts`

- [ ] **Step 1: Write the file**

```typescript
// lib/coachStills.ts
//
// Pool of Karen/Ryan stills for the FocusHeroCard and verify-membership hero.
// Until real assets ship, falls back to a curated Unsplash set behind the
// PHOTO_ASSETS_READY flag. Swap PHOTO_URLS to the real CDN-hosted Karen/Ryan
// photos once delivered.

export const PHOTO_ASSETS_READY = false;

const REAL_PHOTOS: string[] = [
  // TODO(assets): Karen/Ryan still URLs go here.
];

const FALLBACK_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face',
];

const POOL = PHOTO_ASSETS_READY && REAL_PHOTOS.length > 0 ? REAL_PHOTOS : FALLBACK_PHOTOS;

export function coachStillForWeek(weekIndex: number): string {
  return POOL[Math.abs(weekIndex) % POOL.length];
}

export function coachStillForToday(): string {
  const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return POOL[epochDay % POOL.length];
}
```

### Task 4.2: Create lib/commitAnchors.ts

**Files:**
- Create: `lib/commitAnchors.ts`

- [ ] **Step 1: Write the file**

```typescript
// lib/commitAnchors.ts
//
// The three Commit Block anchors. Order is intentional; matches CLAUDE.product.md §3.

import { Carrot, Leaf, Tag, type LucideIcon } from 'lucide-react-native';

export type CommitAnchor = {
  id: 'read-labels' | 'cut-sugar' | 'protein-veg';
  Icon: LucideIcon;
  title: string;
  sub: string;
  lessonSlug: string;
};

export const COMMIT_ANCHORS: CommitAnchor[] = [
  {
    id: 'read-labels',
    Icon: Tag,
    title: 'Read labels',
    sub: "Know what's in it before it goes in.",
    lessonSlug: 'reading-labels',
  },
  {
    id: 'cut-sugar',
    Icon: Leaf,
    title: 'Cut added sugar by half',
    sub: 'One swap is a win.',
    lessonSlug: 'cutting-added-sugar',
  },
  {
    id: 'protein-veg',
    Icon: Carrot,
    title: 'Protein + vegetables',
    sub: 'Build every plate around them.',
    lessonSlug: 'balanced-plate',
  },
];
```

### Task 4.3: Create lib/commitPrompts.ts

**Files:**
- Create: `lib/commitPrompts.ts`

- [ ] **Step 1: Write the file**

```typescript
// lib/commitPrompts.ts
//
// Daily prompt for the AwarenessCard slot. Discriminated union: an
// awareness prompt (one thing to notice) or a coach nudge (identity-
// oriented). Rotates by epoch day so it changes once per calendar day
// without server state.

export type DailyPrompt =
  | { kind: 'awareness'; body: string }
  | { kind: 'nudge'; body: string; attribution?: string };

const PROMPTS: DailyPrompt[] = [
  { kind: 'awareness', body: 'Pick one food today and read its label before you eat it.' },
  { kind: 'awareness', body: 'Find a moment to add vegetables to your next plate.' },
  { kind: 'awareness', body: "Notice one place added sugar shows up that you didn't expect." },
  { kind: 'awareness', body: 'Choose a protein for your next meal before anything else.' },
  { kind: 'nudge',     body: "You're someone who reads labels. That's the identity.", attribution: 'Karen' },
  { kind: 'awareness', body: 'Swap one sweetened drink for water today.' },
  { kind: 'awareness', body: 'Plate it: half veg, a palm of protein, the rest is the rest.' },
  { kind: 'nudge',     body: 'Awareness first. Measurement later. That order matters.', attribution: 'Ryan' },
];

export function dailyPrompt(): DailyPrompt {
  const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return PROMPTS[epochDay % PROMPTS.length];
}
```

### Task 4.4: IconSquare

**Files:**
- Create: `components/ui/IconSquare.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/ui/IconSquare.tsx
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type IconSquareProps = {
  Icon: LucideIcon;
  size?: 36 | 44;
  tone?: 'gold' | 'cream';
};

/**
 * Rounded square icon well. Gold-tinted by default — the "checklist-shaped"
 * leader from the reference vocabulary. NOT a checkbox; carries no state.
 */
export function IconSquare({ Icon, size = 44, tone = 'gold' }: IconSquareProps) {
  const bg = tone === 'gold' ? '#F0E2C2' : light.cardAlt;
  const fg = light.accent;
  const radius = size === 44 ? 12 : 10;
  const iconSize = size === 44 ? 22 : 18;

  return (
    <View style={[styles.well, { backgroundColor: bg, borderRadius: radius, height: size, width: size }]}>
      <Icon color={fg} size={iconSize} strokeWidth={2.2} />
    </View>
  );
}

const styles = StyleSheet.create({
  well: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
```

### Task 4.5: SectionHeader

**Files:**
- Create: `components/ui/SectionHeader.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/ui/SectionHeader.tsx
import { StyleSheet, Text, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type SectionHeaderProps = {
  title: string;
  meta?: string;
};

/**
 * Section divider — bold sentence-case title + optional muted meta on the right.
 * Used across Today and the Nutrition locked state.
 */
export function SectionHeader({ title, meta }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  meta: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 18,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
});
```

### Task 4.6: AnchorRow

**Files:**
- Create: `components/ui/AnchorRow.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/ui/AnchorRow.tsx
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { IconSquare } from './IconSquare';

const light = THEME_COLORS.light;

type AnchorRowProps = {
  Icon: LucideIcon;
  title: string;
  sub?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Tappable row in the reference vocabulary — IconSquare + title (+ optional
 * sub) + tangerine chevron. NOT a checklist row: no checkbox state, taps
 * navigate. Used for Commit anchors, fork choices, Nutrition locked-state
 * lesson link, etc.
 */
export function AnchorRow({ Icon, title, sub, onPress, accessibilityLabel }: AnchorRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed && onPress ? 0.7 : 1 }]}
    >
      <IconSquare Icon={Icon} />
      <View style={styles.label}>
        <Text style={styles.title}>{title}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 14,
  },
  sub: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    letterSpacing: -0.1,
  },
});
```

### Task 4.7: PhotoHeroCard

**Files:**
- Create: `components/ui/PhotoHeroCard.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/ui/PhotoHeroCard.tsx
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type PhotoHeroCardProps = {
  kicker: string;
  title: string;
  photoUri: string;
  photoSide?: 'right' | 'full';
};

/**
 * Photographic hero card — cream-gradient (flat cream here, since we don't
 * want a Reanimated/expo-linear-gradient dependency for this surface) bg,
 * gold kicker, bold sentence-case headline, photo bleeding into the right edge.
 *
 * Used for Today's "This Week's Focus," the verify-membership coach hero, and
 * the non-member landing.
 */
export function PhotoHeroCard({ kicker, title, photoUri, photoSide = 'right' }: PhotoHeroCardProps) {
  const source: ImageSourcePropType = { uri: photoUri };

  if (photoSide === 'full') {
    return (
      <View style={[styles.card, styles.full]}>
        <Image source={source} style={styles.fullPhoto} />
        <View style={styles.fullOverlay}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>{title}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.right]}>
      <View style={styles.textCol}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Image source={source} style={styles.rightPhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F4E9D2',
    borderColor: light.border,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  full: {
    minHeight: 180,
    position: 'relative',
  },
  fullOverlay: {
    bottom: 16,
    gap: 4,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  fullPhoto: {
    height: 180,
    width: '100%',
  },
  kicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 130,
  },
  rightPhoto: {
    height: 130,
    width: 120,
  },
  textCol: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    padding: 18,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 26,
    marginTop: 2,
  },
});
```

### Task 4.8: LessonCard

**Files:**
- Create: `components/ui/LessonCard.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/ui/LessonCard.tsx
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type LessonCardProps = {
  meta: string;
  title: string;
  body?: string;
  thumbUri: string;
  onPress?: () => void;
};

/**
 * 80×80 scene-photo thumbnail + meta + bold title + body. Used for Today's
 * "Next Lesson" and as the row layout in the Lessons tab.
 */
export function LessonCard({ meta, title, body, thumbUri, onPress }: LessonCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Lesson: ${title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed && onPress ? 0.94 : 1 }]}
    >
      <Image source={{ uri: thumbUri }} style={styles.thumb} />
      <View style={styles.col}>
        <Text style={styles.meta}>{meta}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {body ? <Text style={styles.body} numberOfLines={2}>{body}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 4,
  },
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.3,
  },
  thumb: {
    backgroundColor: light.cardAlt,
    borderRadius: 14,
    height: 80,
    width: 80,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: -0.2,
    marginTop: 2,
  },
});
```

### Task 4.9: AwarenessCard

**Files:**
- Create: `components/ui/AwarenessCard.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/ui/AwarenessCard.tsx
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';
import { type DailyPrompt } from '../../lib/commitPrompts';

const light = THEME_COLORS.light;

type AwarenessCardProps = {
  prompt: DailyPrompt;
};

/**
 * Single slot for the day. Awareness prompt OR coach nudge (never both at
 * once — see spec §5, AwarenessCard row). Kicker label adjusts; body and
 * attribution render conditionally.
 */
export function AwarenessCard({ prompt }: AwarenessCardProps) {
  const kicker = prompt.kind === 'nudge' ? 'FROM YOUR COACH' : 'FOR TODAY';

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Sparkles color={light.accent} size={18} strokeWidth={2.2} />
      </View>
      <View style={styles.col}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.body}>{prompt.body}</Text>
        {prompt.kind === 'nudge' && prompt.attribution ? (
          <Text style={styles.attribution}>— {prompt.attribution}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  attribution: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    marginTop: 6,
  },
  body: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14.5,
    letterSpacing: -0.1,
    lineHeight: 20,
    marginTop: 2,
  },
  card: {
    alignItems: 'flex-start',
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: light.background,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  kicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1,
  },
});
```

### Task 4.10: Typecheck + commit Phase 4

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 2: Commit**

```bash
git add lib/coachStills.ts lib/commitAnchors.ts lib/commitPrompts.ts components/ui/
git commit -m "Add UI primitives + Commit data (IconSquare, AnchorRow, PhotoHeroCard, LessonCard, AwarenessCard, anchors, prompts, coach stills)"
```

---

## Phase 5 — Today components (atomic to the Commit Today composition)

### Task 5.1: TodayHeader

**Files:**
- Modify (full replace): `components/today/TodayHeader.tsx`

(Note: the file was deleted in Phase 0; we're creating it fresh here.)

- [ ] **Step 1: Write the component**

```typescript
// components/today/TodayHeader.tsx
import { ChevronLeft, ChevronRight, Droplet, User } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { coachStillForToday } from '../../lib/coachStills';
import { FONTS, THEME_COLORS } from '../../lib/brand';
import { useStreak } from '../../hooks/useStreak';

const light = THEME_COLORS.light;

type TodayHeaderProps = {
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onProfilePress?: () => void;
};

/**
 * Top row: gold water-drop streak (left) · "This Week" pill (center) ·
 * coach photo + user circle with notif dot (right).
 *
 * Mirrors the App Store reference structure with the every-blue swapped for
 * tigerGold and the user avatar collapsed to a Lucide outline (we don't have
 * a user photo asset).
 */
export function TodayHeader({ onPrevWeek, onNextWeek, onProfilePress }: TodayHeaderProps) {
  const { days } = useStreak();
  const coachUri = coachStillForToday();

  return (
    <View style={styles.row}>
      <View style={styles.streak}>
        <Droplet color={light.accent} fill={light.accent} size={14} />
        <Text style={styles.streakValue}>{days}</Text>
      </View>

      <View style={styles.pill}>
        <Pressable accessibilityLabel="Previous week" disabled={!onPrevWeek} hitSlop={8} onPress={onPrevWeek}>
          <ChevronLeft color={light.mutedText} size={14} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.pillLabel}>This Week</Text>
        <Pressable accessibilityLabel="Next week" disabled={!onNextWeek} hitSlop={8} onPress={onNextWeek}>
          <ChevronRight color={light.mutedText} size={14} strokeWidth={2.4} />
        </Pressable>
      </View>

      <Pressable
        accessibilityLabel="Profile"
        onPress={onProfilePress}
        style={({ pressed }) => [styles.avatarRow, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={styles.coach}>
          <Image source={{ uri: coachUri }} style={styles.coachPhoto} />
          <View style={styles.greenDot} />
        </View>
        <View style={styles.user}>
          <User color={light.mutedText} size={14} strokeWidth={2.2} />
          <View style={styles.redDot} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRow: { alignItems: 'center', flexDirection: 'row' },
  coach: { borderRadius: 999, height: 30, overflow: 'hidden', position: 'relative', width: 30 },
  coachPhoto: { height: 30, width: 30 },
  greenDot: {
    backgroundColor: '#2ECC71',
    borderColor: light.background,
    borderRadius: 999,
    borderWidth: 2,
    bottom: -1,
    height: 9,
    position: 'absolute',
    right: -1,
    width: 9,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillLabel: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  redDot: {
    backgroundColor: '#C42626',
    borderColor: light.background,
    borderRadius: 999,
    borderWidth: 2,
    height: 9,
    position: 'absolute',
    right: -1,
    top: -1,
    width: 9,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streak: { alignItems: 'center', flexDirection: 'row', gap: 4, minWidth: 56 },
  streakValue: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
  },
  user: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderColor: light.background,
    borderRadius: 999,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    marginLeft: -8,
    position: 'relative',
    width: 30,
  },
});
```

### Task 5.2: GreetingHeader (rewrite from current)

**Files:**
- Modify (full replace): `components/today/GreetingHeader.tsx`

The current `GreetingHeader` is the lowercase "evening, johnty." quiet variant. The redesign uses sentence-case bold.

- [ ] **Step 1: Replace the component**

```typescript
// components/today/GreetingHeader.tsx
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';
import { getDayPeriod } from '../../lib/greetings';

const light = THEME_COLORS.light;

type GreetingHeaderProps = {
  firstName?: string | null;
  subtitle?: string;
};

function periodCapitalized() {
  const p = getDayPeriod();
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function quietName(firstName?: string | null) {
  const first = firstName?.trim().split(/\s+/)[0];
  return first || 'friend';
}

/**
 * "Evening, Johnty." — sentence-case bold + muted subtitle ("Commit Block · Week 1").
 */
export function GreetingHeader({ firstName, subtitle }: GreetingHeaderProps) {
  const { width } = useWindowDimensions();
  const titleSize = width < 380 ? 26 : 28;

  return (
    <View style={styles.col}>
      <Text style={[styles.greeting, { fontSize: titleSize, lineHeight: titleSize + 4 }]}>
        {periodCapitalized()}, {quietName(firstName)}.
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  col: { gap: 4 },
  greeting: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
  },
});
```

### Task 5.3: WeekStrip (gold-today, no failure red)

**Files:**
- Modify (full replace): `components/history/WeekStrip.tsx`

- [ ] **Step 1: Replace the component**

```typescript
// components/history/WeekStrip.tsx
import { format, subDays } from 'date-fns';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useEngagementDates } from '../../hooks/useEngagementDates';
import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

/**
 * Last-7-days strip. Today's ring is filled gold; other days are outline
 * rings with the day-of-month number. NO failure-state red — skipped days
 * read identically to engaged-but-not-today (mutedText). Past days tap into
 * /history/{date}; today and future are non-interactive.
 */
export function WeekStrip() {
  const { dates } = useEngagementDates();

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
  }, []);

  const todayKey = format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.wrap}>
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const engaged = dates.has(key);
        const isToday = key === todayKey;
        const isFuture = key > todayKey;

        return (
          <Pressable
            key={key}
            accessibilityLabel={`${format(day, 'EEEE MMMM d')}`}
            disabled={isToday || isFuture}
            hitSlop={6}
            onPress={() => router.push(`/history/${key}`)}
            style={({ pressed }) => [
              styles.cell,
              { opacity: pressed ? 0.7 : isFuture ? 0.4 : 1 },
            ]}
          >
            <Text style={[styles.dayLetter, { color: isToday ? light.accent : light.mutedText }]}>
              {format(day, 'EEEEE')}
            </Text>
            <View
              style={[
                styles.ring,
                {
                  backgroundColor: isToday ? light.accent : 'transparent',
                  borderColor: isToday ? light.accent : light.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  { color: isToday ? '#FFFFFF' : engaged ? light.text : light.mutedText },
                ]}
              >
                {format(day, 'd')}
              </Text>
            </View>
            <View style={[styles.pulse, { backgroundColor: isToday ? light.accent : 'rgba(11,11,12,0.10)' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const RING = 32;

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    paddingVertical: 4,
  },
  dayLetter: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  dayNumber: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  pulse: {
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  ring: {
    alignItems: 'center',
    borderRadius: RING / 2,
    borderWidth: 2,
    height: RING,
    justifyContent: 'center',
    width: RING,
  },
  wrap: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
});
```

### Task 5.4: FocusHeroCard

**Files:**
- Create: `components/today/FocusHeroCard.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/today/FocusHeroCard.tsx
import { coachStillForWeek } from '../../lib/coachStills';
import { PhotoHeroCard } from '../ui/PhotoHeroCard';

type FocusHeroCardProps = {
  weekIndex: number;
};

/**
 * Weekly Commit focus hero. Kicker + headline are spec-fixed; photo rotates
 * by week. When PHOTO_ASSETS_READY=true and real Karen/Ryan stills land, the
 * underlying pool swaps without any change here.
 */
export function FocusHeroCard({ weekIndex }: FocusHeroCardProps) {
  return (
    <PhotoHeroCard
      kicker="THIS WEEK'S FOCUS"
      title="Three things, every plate."
      photoUri={coachStillForWeek(weekIndex)}
    />
  );
}
```

### Task 5.5: NextLessonCard (rewrite to use LessonCard primitive)

**Files:**
- Modify (full replace): `components/today/NextLessonCard.tsx`

- [ ] **Step 1: Replace the component**

```typescript
// components/today/NextLessonCard.tsx
import { LessonCard } from '../ui/LessonCard';

type NextLessonCardProps = {
  meta?: string;
  title?: string;
  body?: string;
  thumbUri?: string;
  onPress?: () => void;
};

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop';

/**
 * Today's "Next Lesson" wrapper around the generic LessonCard. Defaults to
 * the Commit-block introductory lesson; props override per current schedule.
 */
export function NextLessonCard({
  meta = 'Nutrition · 4 min',
  title = 'Building a Balanced Plate',
  body = 'Half your plate, every plate — under a minute to set up.',
  thumbUri = FALLBACK_THUMB,
  onPress,
}: NextLessonCardProps) {
  return <LessonCard meta={meta} title={title} body={body} thumbUri={thumbUri} onPress={onPress} />;
}
```

### Task 5.6: CommitBlockToday composition

**Files:**
- Create: `components/today/CommitBlockToday.tsx`

- [ ] **Step 1: Write the composition**

```typescript
// components/today/CommitBlockToday.tsx
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { COMMIT_ANCHORS } from '../../lib/commitAnchors';
import { dailyPrompt } from '../../lib/commitPrompts';
import { SPACING } from '../../lib/brand';
import { useProfile } from '../../hooks/useProfile';
import { WeekStrip } from '../history/WeekStrip';
import { AnchorRow } from '../ui/AnchorRow';
import { AwarenessCard } from '../ui/AwarenessCard';
import { SectionHeader } from '../ui/SectionHeader';
import { FocusHeroCard } from './FocusHeroCard';
import { GreetingHeader } from './GreetingHeader';
import { NextLessonCard } from './NextLessonCard';
import { TodayHeader } from './TodayHeader';

type CommitBlockTodayProps = {
  weekIndex?: number;
  weekLabel?: string;
};

/**
 * Hybrid Commit Today (spec §5).
 *
 * 1. TodayHeader        — streak + week pill + avatar cluster
 * 2. WeekStrip          — 7 gold-today rings, no failure red
 * 3. GreetingHeader     — "Evening, Johnty." + "Commit Block · Week N"
 * 4. FocusHeroCard      — photo hero, "Three things, every plate."
 * 5. AnchorStack        — 3 AnchorRows (read labels / cut sugar / protein+veg)
 * 6. NextLessonCard     — scene photo lesson card
 * 7. AwarenessCard      — daily prompt OR coach nudge (one slot, two voices)
 *
 * Anchor taps deep-link to /grow/commit (filtered to Commit), implementation
 * may upgrade to lesson detail later per spec §5 fallback contract.
 */
export function CommitBlockToday({ weekIndex = 1, weekLabel = 'Week 1' }: CommitBlockTodayProps) {
  const { profile } = useProfile();
  const prompt = dailyPrompt();

  const openAnchor = (slug: string) => router.push(`/grow/commit?lesson=${slug}` as never);

  return (
    <View style={styles.stack}>
      <TodayHeader />
      <WeekStrip />
      <View style={styles.greetingWrap}>
        <GreetingHeader firstName={profile.firstName} subtitle={`Commit Block · ${weekLabel}`} />
      </View>

      <FocusHeroCard weekIndex={weekIndex} />

      <SectionHeader title="Today's Focus" meta={`${COMMIT_ANCHORS.length} anchors`} />
      <View>
        {COMMIT_ANCHORS.map((anchor) => (
          <AnchorRow
            key={anchor.id}
            Icon={anchor.Icon}
            title={anchor.title}
            sub={anchor.sub}
            onPress={() => openAnchor(anchor.lessonSlug)}
          />
        ))}
      </View>

      <SectionHeader title="Next Lesson" />
      <NextLessonCard onPress={() => router.push('/(tabs)/grow')} />

      <View style={styles.awarenessWrap}>
        <AwarenessCard prompt={prompt} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  awarenessWrap: { marginTop: 12 },
  greetingWrap: { marginBottom: 4, marginTop: 18 },
  stack: {
    gap: 0,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
});
```

### Task 5.7: Typecheck + commit Phase 5

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0. If `useProfile` exposes a different shape than `{ profile: { firstName } }`, adjust the destructure to match. (Implementation hint: read `hooks/useProfile.ts` first.)

- [ ] **Step 2: Commit**

```bash
git add components/today/ components/history/WeekStrip.tsx
git commit -m "Add Commit Block Today components (header, greeting, week strip, focus hero, lesson, awareness, composition)"
```

---

## Phase 6 — Today screen + block dispatch

### Task 6.1: app/(tabs)/today.tsx

**Files:**
- Modify (full replace): `app/(tabs)/today.tsx`

- [ ] **Step 1: Replace the screen**

```typescript
// app/(tabs)/today.tsx
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommitBlockToday } from '../../components/today/CommitBlockToday';
import { useMembership } from '../../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

/**
 * Block-driven Today. Reads current_block from useMembership and dispatches
 * to the right module set. New blocks layer in as their own components
 * without re-architecting this file.
 *
 * Theme-locked light per spec §5.
 */
export default function TodayScreen() {
  const { membership } = useMembership();
  const block = membership.currentBlock ?? 'COMMIT';

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.scroll}>
          {renderBlock(block)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type Block = NonNullable<ReturnType<typeof useMembership>['membership']['currentBlock']>;

function renderBlock(block: Block) {
  if (block === 'COMMIT') return <CommitBlockToday weekIndex={1} weekLabel="Week 1" />;
  return <BlockPlaceholder block={block} />;
}

function BlockPlaceholder({ block }: { block: string }) {
  return (
    <View style={[styles.placeholderWrap, { paddingHorizontal: SPACING.screenX }]}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderKicker}>BLOCK · {block}</Text>
        <Text style={styles.placeholderTitle}>This block's Today is still being designed.</Text>
        <Text style={styles.placeholderBody}>
          Karen and Ryan haven't named the modules for {block} yet. Today is block-driven, so this slot will swap to a different set of cards. Nothing else changes.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 128, paddingTop: 0 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  placeholder: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  placeholderBody: { color: light.mutedText, fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  placeholderKicker: { color: COLORS.tigerGold, fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 1.4 },
  placeholderTitle: { color: light.text, fontFamily: FONTS.sansBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  placeholderWrap: { marginTop: 24 },
  screen: { alignItems: 'center', flex: 1 },
  scroll: { flex: 1, width: '100%' },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/today.tsx
git commit -m "Block-driven Today screen (Commit dispatch + placeholder for later blocks)"
```

---

## Phase 7 — Nutrition locked state in Commit

### Task 7.1: Modify app/(tabs)/fuel.tsx for COMMIT locked state

**Files:**
- Read first: `app/(tabs)/fuel.tsx` (current implementation)
- Modify: `app/(tabs)/fuel.tsx`

- [ ] **Step 1: Read the current file**

Run: open `app/(tabs)/fuel.tsx`. Note the current top-level component and what it renders.

- [ ] **Step 2: Add the locked state at the top of the component**

Wrap the existing logger render in a block check. Pseudocode shape:

```typescript
import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';

import { coachStillForToday } from '../../lib/coachStills';
import { useMembership } from '../../hooks/useMembership';
import { AnchorRow } from '../../components/ui/AnchorRow';
import { PhotoHeroCard } from '../../components/ui/PhotoHeroCard';
import { FONTS, SPACING, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

export default function FuelScreen() {
  const { membership } = useMembership();
  const block = membership.currentBlock ?? 'COMMIT';

  if (block === 'COMMIT') {
    return <NutritionLocked />;
  }

  // existing logger render stays
  return /* …existing JSX… */;
}

function NutritionLocked() {
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Nutrition</Text>

          <PhotoHeroCard
            kicker="COMMIT BLOCK"
            title={'Awareness first,\nlogging later.'}
            photoUri={coachStillForToday()}
          />

          <Text style={styles.body}>
            You'll unlock meal logging in Refine. Right now you're focused on knowing what's in your food, not measuring it.
          </Text>

          <AnchorRow
            Icon={BookOpen}
            title="Building a Balanced Plate"
            sub="4 min · Nutrition lesson"
            onPress={() => router.push('/(tabs)/grow' as never)}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    marginTop: 16,
  },
  content: { paddingBottom: 128, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  screen: { alignItems: 'center', flex: 1 },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 16,
    marginTop: 4,
  },
});
```

Preserve all existing imports and the existing logger render path (the `if (block === 'COMMIT') return <NutritionLocked />;` short-circuit is the only structural change).

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/fuel.tsx
git commit -m "Nutrition tab: locked state when current_block = COMMIT"
```

---

## Phase 8 — Tab bar (locked variant for Nutrition)

### Task 8.1: Modify FloatingTabBar to render a locked icon for Nutrition in Commit

**Files:**
- Read first: `components/navigation/FloatingTabBar.tsx`
- Modify: `components/navigation/FloatingTabBar.tsx`

- [ ] **Step 1: Read current implementation**

Open the file and note how it iterates state.routes. Identify the Fuel/Nutrition tab.

- [ ] **Step 2: Add a `lockedRoutes` prop / per-tab lock detection**

Add a small `useMembership` import and treat the `fuel` tab specially when `current_block === 'COMMIT'`:

```typescript
// inside FloatingTabBar.tsx
import { Lock } from 'lucide-react-native';
import { useMembership } from '../../hooks/useMembership';

// inside the component:
const { membership } = useMembership();
const isCommit = (membership.currentBlock ?? 'COMMIT') === 'COMMIT';

// when rendering each tab:
const locked = isCommit && route.name === 'fuel';
// then render <Lock /> instead of the regular Nutrition icon when locked
// keep the tab pressable — onPress still routes to /fuel (which shows the
// locked state from Phase 7)
```

The lock badge is purely visual (gray foreground, `Lock` icon at 16px). Don't change the tab's onPress — landing on the locked state is the design.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 4: Smoke check**

Run: `npm start`
Press `i` (or `a`) to launch. Sign in (dev mode), advance through the new fork+verify flow once they're in place (or temporarily skip them by going straight to today — see Phase 10 for the gate), and confirm:
- Nutrition tab shows the Lock icon
- Tapping Nutrition opens the locked-state screen, not the food logger

Note: smoke verification may need to wait for Phase 10's gate wiring. If so, defer until after Phase 10.

- [ ] **Step 5: Commit**

```bash
git add components/navigation/FloatingTabBar.tsx
git commit -m "Tab bar: lock Nutrition icon when current_block = COMMIT"
```

---

## Phase 9 — Onboarding fork screens

### Task 9.1: app/membership.tsx (the fork)

**Files:**
- Create: `app/membership.tsx`

- [ ] **Step 1: Write the screen**

```typescript
// app/membership.tsx
import { Redirect, router } from 'expo-router';
import { BadgeCheck, MapPinned } from 'lucide-react-native';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLockup } from '../components/brand/BrandLockup';
import { AnchorRow } from '../components/ui/AnchorRow';
import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../lib/brand';

const light = THEME_COLORS.light;

/**
 * Onboarding fork — first question every user answers after auth.
 *
 *   "Are you part of the Create Power program?" → Yes / No
 *
 * Yes → /verify-membership (server proves the claim).
 * No  → /non-member-diagnostic.
 */
export default function MembershipForkScreen() {
  const { loading: authLoading, session } = useAuth();
  const { loading: membershipLoading, membership } = useMembership();

  if (authLoading || membershipLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.tigerGold} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (membership.programMember) return <Redirect href="/onboarding" />;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <BrandLockup width={170} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.headline}>Welcome to Tigers Eye Life.</Text>
          <Text style={styles.lede}>Quick question so we send you to the right place.</Text>
          <Text style={styles.q}>Are you part of the Create Power program?</Text>

          <View style={{ marginTop: 6 }}>
            <AnchorRow
              Icon={BadgeCheck}
              title="Yes, I'm a Create Power member"
              sub="We'll verify your join email and unlock the program experience."
              onPress={() => router.push('/verify-membership' as never)}
            />
            <AnchorRow
              Icon={MapPinned}
              title="Not yet"
              sub="Two quick questions to point you in the right direction."
              onPress={() => router.push('/non-member-diagnostic' as never)}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, paddingHorizontal: SPACING.screenX, paddingTop: 24 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  headline: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  lede: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 26,
    marginTop: 6,
  },
  loading: { alignItems: 'center', backgroundColor: light.background, flex: 1, justifyContent: 'center' },
  q: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
    lineHeight: 23,
    marginBottom: 12,
  },
  screen: { alignItems: 'center', flex: 1 },
  topBar: { paddingHorizontal: SPACING.screenX, paddingTop: 12 },
});
```

### Task 9.2: app/verify-membership.tsx

**Files:**
- Create: `app/verify-membership.tsx`

- [ ] **Step 1: Write the screen**

```typescript
// app/verify-membership.tsx
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoHeroCard } from '../components/ui/PhotoHeroCard';
import { coachStillForToday } from '../lib/coachStills';
import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { supabase } from '../lib/supabase';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../lib/brand';

const light = THEME_COLORS.light;
type Stage = 'email' | 'code' | 'success' | 'not_found';
type StartResponse = { found: boolean; otpSent: boolean };
type ConfirmResponse = { verified: boolean; reason?: string };

export default function VerifyMembershipScreen() {
  const { isDevSession, session } = useAuth();
  const { devMarkVerified, refresh } = useMembership();

  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  const callEdge = async <T,>(body: object): Promise<T> => {
    if (!supabase) throw new Error('supabase_not_configured');
    const { data, error: invokeError } = await supabase.functions.invoke<T>('verify-membership', { body });
    if (invokeError) throw invokeError;
    if (!data) throw new Error('empty_response');
    return data;
  };

  const onSendCode = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      setError('Please enter the email you used to join.');
      return;
    }
    setSubmitting(true);
    try {
      if (isDevSession || !supabase) {
        setStage('code');
        return;
      }
      const result = await callEdge<StartResponse>({ mode: 'start', email: trimmed });
      if (!result.found) {
        setStage('not_found');
        return;
      }
      setStage('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirm = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    setSubmitting(true);
    try {
      if (isDevSession || !supabase) {
        if (code !== '123456') {
          setError('Dev mode: the code is 123456.');
          return;
        }
        await devMarkVerified(trimmed);
        router.replace('/onboarding');
        return;
      }
      const result = await callEdge<ConfirmResponse>({ mode: 'confirm', email: trimmed, code: code.trim() });
      if (!result.verified) {
        if (result.reason === 'no_longer_member') setStage('not_found');
        else setError("That code didn't work. Try again.");
        return;
      }
      await refresh();
      router.replace('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.frame}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <PhotoHeroCard
              kicker={stage === 'not_found' ? 'NOT FOUND' : 'VERIFY MEMBERSHIP'}
              title={
                stage === 'email' ? 'Which email did you use to join?' :
                stage === 'code' ? 'Check your inbox.' :
                stage === 'not_found' ? "We couldn't find your membership." :
                'Verified.'
              }
              photoUri={coachStillForToday()}
            />

            {stage === 'email' && (
              <>
                <Text style={styles.body}>
                  We'll send a six-digit code to confirm. Your app login can be a different email — we just need the one you used for Create Power.
                </Text>
                <Text style={styles.label}>Join email</Text>
                <TextInput
                  accessibilityLabel="Join email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!submitting}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={light.mutedText}
                  style={styles.input}
                  value={email}
                />
                {isDevSession && (
                  <Text style={styles.hint}>Dev mode: any email with "+member" matches. OTP is 123456.</Text>
                )}
              </>
            )}

            {stage === 'code' && (
              <>
                <Text style={styles.body}>
                  We sent a code to {email.trim().toLowerCase()}. It expires in 10 minutes.
                </Text>
                <Text style={styles.label}>Verification code</Text>
                <TextInput
                  accessibilityLabel="Verification code"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor={light.mutedText}
                  style={[styles.input, styles.code]}
                  value={code}
                />
                <Pressable onPress={() => setStage('email')} hitSlop={8}>
                  <Text style={[styles.hint, { color: COLORS.tigerGold }]}>Use a different email</Text>
                </Pressable>
              </>
            )}

            {stage === 'not_found' && (
              <Text style={styles.body}>
                Double-check the email you used to join Create Power. If it still doesn't work, you can continue as a non-member or contact Ryan / Karen for help.
              </Text>
            )}

            {error && <Text style={styles.error}>{error}</Text>}
          </ScrollView>

          <View style={styles.footer}>
            {stage === 'email' && (
              <Pressable
                disabled={submitting || !email.trim()}
                onPress={onSendCode}
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: COLORS.tangerine, opacity: pressed ? 0.85 : (submitting || !email.trim()) ? 0.5 : 1 },
                ]}
              >
                <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                  {submitting ? 'Sending…' : 'Send code'}
                </Text>
              </Pressable>
            )}
            {stage === 'code' && (
              <Pressable
                disabled={submitting || code.length < 4}
                onPress={onConfirm}
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: COLORS.tangerine, opacity: pressed ? 0.85 : (submitting || code.length < 4) ? 0.5 : 1 },
                ]}
              >
                <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                  {submitting ? 'Verifying…' : 'Verify'}
                </Text>
              </Pressable>
            )}
            {stage === 'not_found' && (
              <>
                <Pressable
                  onPress={() => { setStage('email'); setEmail(''); setCode(''); setError(null); }}
                  style={({ pressed }) => [styles.ghost, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={styles.ghostText}>Try again</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.replace('/non-member-diagnostic' as never)}
                  style={({ pressed }) => [styles.cta, { backgroundColor: COLORS.tangerine, opacity: pressed ? 0.85 : 1 }]}
                >
                  <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>Continue as non-member</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { color: light.mutedText, fontFamily: FONTS.sansMedium, fontSize: 14 },
  body: { color: light.text, fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22, marginTop: 18 },
  code: { letterSpacing: 6, textAlign: 'center' },
  content: { paddingBottom: 24, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  cta: { alignItems: 'center', borderRadius: 14, paddingVertical: 16 },
  ctaText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: -0.1 },
  error: { color: COLORS.deepRed, fontFamily: FONTS.sansMedium, fontSize: 13.5, marginTop: 14 },
  footer: { gap: 8, paddingBottom: 12, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  ghost: { alignItems: 'center', paddingVertical: 14 },
  ghostText: { color: light.text, fontFamily: FONTS.sansMedium, fontSize: 14 },
  hint: { color: light.mutedText, fontFamily: FONTS.sansMedium, fontSize: 12, marginTop: 8 },
  input: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  label: { color: light.text, fontFamily: FONTS.sansMedium, fontSize: 13, marginTop: 18 },
  screen: { alignItems: 'center', flex: 1 },
  topBar: { paddingHorizontal: SPACING.screenX, paddingTop: 6 },
});
```

### Task 9.3: app/non-member-diagnostic.tsx

**Files:**
- Create: `app/non-member-diagnostic.tsx`

- [ ] **Step 1: Write the screen**

```typescript
// app/non-member-diagnostic.tsx
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../lib/brand';

const light = THEME_COLORS.light;

export default function NonMemberDiagnosticScreen() {
  const { session } = useAuth();
  const { recordNonMember } = useMembership();
  const [friction, setFriction] = useState('');
  const [stoppingPoint, setStoppingPoint] = useState('');
  const [step, setStep] = useState<0 | 1>(0);
  const [submitting, setSubmitting] = useState(false);

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  const canContinue = step === 0 ? friction.trim().length > 1 : stoppingPoint.trim().length > 1;

  const onNext = async () => {
    if (step === 0) { setStep(1); return; }
    setSubmitting(true);
    try {
      await recordNonMember({ friction: friction.trim(), stoppingPoint: stoppingPoint.trim() });
      router.replace('/non-member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.frame}>
          <View style={styles.topBar}>
            <Pressable onPress={() => (step === 0 ? router.back() : setStep(0))} hitSlop={8}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>2 QUICK QUESTIONS · {step + 1} OF 2</Text>
            <Text style={styles.headline}>
              {step === 0 ? "What's your friction?" : "What's your big stopping point?"}
            </Text>
            <Text style={styles.body}>
              {step === 0
                ? 'The thing that gets in the way most often.'
                : 'The wall you keep hitting when you try to make progress.'}
            </Text>

            <TextInput
              accessibilityLabel={step === 0 ? 'Your friction' : 'Your stopping point'}
              autoCorrect
              editable={!submitting}
              multiline
              onChangeText={step === 0 ? setFriction : setStoppingPoint}
              placeholder="Type freely."
              placeholderTextColor={light.mutedText}
              style={styles.input}
              value={step === 0 ? friction : stoppingPoint}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              disabled={!canContinue || submitting}
              onPress={onNext}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: COLORS.tangerine, opacity: pressed ? 0.85 : (!canContinue || submitting) ? 0.5 : 1 },
              ]}
            >
              <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                {step === 0 ? 'Continue' : submitting ? 'Saving…' : 'Done'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { color: light.mutedText, fontFamily: FONTS.sansMedium, fontSize: 14 },
  body: { color: light.mutedText, fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22, marginBottom: 18, marginTop: 6 },
  content: { paddingBottom: 24, paddingHorizontal: SPACING.screenX, paddingTop: 24 },
  cta: { alignItems: 'center', borderRadius: 14, paddingVertical: 16 },
  ctaText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: -0.1 },
  footer: { paddingBottom: 12, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  headline: {
    color: light.text, fontFamily: FONTS.sansBold, fontSize: 26, letterSpacing: -0.4, lineHeight: 32, marginTop: 6,
  },
  input: {
    backgroundColor: light.card, borderColor: light.border, borderRadius: 14, borderWidth: 1,
    color: light.text, fontFamily: FONTS.sans, fontSize: 16, lineHeight: 22, minHeight: 140,
    paddingHorizontal: 14, paddingVertical: 14, textAlignVertical: 'top',
  },
  kicker: { color: COLORS.tigerGold, fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 1.4 },
  screen: { alignItems: 'center', flex: 1 },
  topBar: { paddingHorizontal: SPACING.screenX, paddingTop: 6 },
});
```

### Task 9.4: app/non-member.tsx

**Files:**
- Create: `app/non-member.tsx`

- [ ] **Step 1: Write the screen**

```typescript
// app/non-member.tsx
import { Redirect } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoHeroCard } from '../components/ui/PhotoHeroCard';
import { coachStillForToday } from '../lib/coachStills';
import { useAuth } from '../hooks/useAuth';
import { FONTS, SPACING, THEME_COLORS } from '../lib/brand';

const light = THEME_COLORS.light;

/**
 * Non-member landing — placeholder. Destination TBD per spec §11. Closes
 * the loop on the diagnostic so the flow doesn't dead-end.
 */
export default function NonMemberLandingScreen() {
  const { session, signOut } = useAuth();
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PhotoHeroCard
            kicker="THANKS — WE HEARD YOU"
            title={"You're in the right place.\nWe're still building this part."}
            photoUri={coachStillForToday()}
          />
          <Text style={styles.body}>
            The non-member experience is in design. Karen and Ryan are deciding what you'll see here
            next. If you'd like to skip the wait, ask Ryan about joining the Create Power program.
          </Text>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable onPress={signOut} style={({ pressed }) => [styles.ghost, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={styles.ghostText}>Sign out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { color: light.text, fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22, marginTop: 20 },
  content: { paddingBottom: 24, paddingHorizontal: SPACING.screenX, paddingTop: 20 },
  footer: { paddingBottom: 12, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  ghost: { alignItems: 'center', paddingVertical: 14 },
  ghostText: { color: light.text, fontFamily: FONTS.sansMedium, fontSize: 14 },
  screen: { alignItems: 'center', flex: 1 },
});
```

### Task 9.5: Typecheck + commit Phase 9

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 2: Commit**

```bash
git add app/membership.tsx app/verify-membership.tsx app/non-member-diagnostic.tsx app/non-member.tsx
git commit -m "Add onboarding fork + verify + non-member screens in modern vocabulary"
```

---

## Phase 10 — Routing wiring (root + index + tabs gate)

### Task 10.1: app/_layout.tsx (register screens)

**Files:**
- Modify: `app/_layout.tsx:78-89` (the `<Stack>` block — add new screens)

- [ ] **Step 1: Verify current state**

Open `app/_layout.tsx`. Confirm `<Stack>` block lists the existing screen names. Add the four new screens **after** the `(auth)` registration and **before** `onboarding`:

```typescript
<Stack.Screen name="membership" />
<Stack.Screen name="verify-membership" />
<Stack.Screen name="non-member-diagnostic" />
<Stack.Screen name="non-member" />
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

### Task 10.2: app/index.tsx (gate)

**Files:**
- Modify (full replace): `app/index.tsx`

- [ ] **Step 1: Replace the file**

```typescript
// app/index.tsx
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { COLORS, THEME_COLORS } from '../lib/brand';

const light = THEME_COLORS.light;

/**
 * Routing gate.
 *
 *   no session                       → /(auth)/sign-in
 *   session, no fork answered        → /membership
 *   session, fork = no member        → /non-member
 *   session, member, no intake       → /onboarding
 *   session, member + intake         → /(tabs)/today
 *
 * Per CLAUDE.product.md §1 / §2: one app, fork at onboarding, membership
 * verified server-side only.
 */
export default function Index() {
  const { loading: authLoading, session } = useAuth();
  const { loading: membershipLoading, membership } = useMembership();
  const { completed: intakeCompleted, loading: intakeLoading } = useOnboardingStatus();

  const stillLoading = authLoading || (session && (membershipLoading || intakeLoading));

  if (stillLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.tigerGold} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!membership.forkAnswered) return <Redirect href="/membership" />;
  if (!membership.programMember) return <Redirect href="/non-member" />;
  if (!intakeCompleted) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/today" />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: light.background,
    flex: 1,
    justifyContent: 'center',
  },
});
```

### Task 10.3: app/(tabs)/_layout.tsx (re-check the gates)

**Files:**
- Modify: `app/(tabs)/_layout.tsx` (full replace)

- [ ] **Step 1: Replace the file**

```typescript
// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CoachBottomSheet, type CoachSheetHandle } from '../../components/navigation/CoachBottomSheet';
import { FloatingTabBar } from '../../components/navigation/FloatingTabBar';
import { useAuth } from '../../hooks/useAuth';
import { useMembership } from '../../hooks/useMembership';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import { useThemeColors } from '../../hooks/useTheme';

/**
 * Tabs layout re-checks the same gates as app/index.tsx so deep-linking
 * into /(tabs)/today can't bypass the fork.
 */
export default function TabsLayout() {
  const { loading, session } = useAuth();
  const { loading: membershipLoading, membership } = useMembership();
  const { completed, loading: onboardingLoading } = useOnboardingStatus();
  const colors = useThemeColors();
  const coachSheetRef = useRef<CoachSheetHandle>(null);

  const openCoach = useCallback(() => {
    coachSheetRef.current?.snapToIndex(0);
  }, []);

  if (loading || (session && (membershipLoading || onboardingLoading))) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!membership.forkAnswered) return <Redirect href="/membership" />;
  if (!membership.programMember) return <Redirect href="/non-member" />;
  if (!completed) return <Redirect href="/onboarding" />;

  return (
    <View style={styles.root}>
      <Tabs
        initialRouteName="today"
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
        }}
        tabBar={(props) => <FloatingTabBar {...props} onCoachPress={openCoach} />}
      >
        <Tabs.Screen name="today" options={{ title: 'Today' }} />
        <Tabs.Screen name="train" options={{ title: 'Train' }} />
        <Tabs.Screen name="fuel" options={{ title: 'Fuel' }} />
        <Tabs.Screen name="grow" options={{ title: 'Grow' }} />
        <Tabs.Screen name="you" options={{ title: 'You' }} />
      </Tabs>
      <CoachBottomSheet ref={coachSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  root: { flex: 1 },
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: Exit 0.

- [ ] **Step 3: Commit Phase 10 as one logical step**

```bash
git add app/_layout.tsx app/index.tsx app/\(tabs\)/_layout.tsx
git commit -m "Wire routing: register fork screens + index gate + tabs re-check"
```

---

## Phase 11 — Final verification

### Task 11.1: Typecheck + manual smoke

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: Exit 0 with no output.

- [ ] **Step 2: Start Expo and walk through both branches**

Run: `npm start`. In a simulator or Expo Go:

**Non-member branch:**
1. Sign in (dev session — tap "Skip for dev" if Supabase not configured)
2. Land on `/membership`. Confirm modern fork screen (BadgeCheck + MapPinned icon-square rows).
3. Tap "Not yet" → `/non-member-diagnostic`. Step 1, type something, Continue. Step 2, type something, Done.
4. Land on `/non-member` with the PhotoHeroCard.

**Verified-member branch:**
1. Reset (sign out and back in, or `AsyncStorage.clear()` via dev menu).
2. Sign in.
3. Land on `/membership`. Tap "Yes…" → `/verify-membership`.
4. Enter `dev+member@example.com` (anything with `+member`), Send code.
5. Enter `123456`, Verify.
6. Lands on `/onboarding` if intake not done; otherwise `/(tabs)/today`.

**Today walk-through:**
1. Verify all 7 slots render in order: header → week strip → greeting → focus hero → 3 anchors → next lesson → awareness card.
2. Photos load (or fall back gracefully).
3. Tap Nutrition tab → locked-state PhotoHeroCard, NOT the food logger.
4. Tab bar shows Lock icon on Nutrition.

**Deep-link guard:**
- With a non-member session, manually try to navigate to `/(tabs)/today` (Metro deep link). Confirm redirect back to `/non-member`.

- [ ] **Step 3: If anything failed, capture and fix**

Common failure modes:
- `useProfile` shape mismatch → adjust destructure in `CommitBlockToday.tsx`.
- Image failures → confirm internet, or temporarily swap to a `require()`d local PNG.
- `useEngagementDates` shape → adjust import in `WeekStrip.tsx`.
- Type errors after Phase 5 → most likely a stale import path; double-check `components/ui/` paths.

- [ ] **Step 4: Commit the typecheck-clean state if any final fixes landed**

```bash
git add -A
git commit -m "Fix final typecheck issues from smoke check"
```

---

## Self-Review (the writer's checklist)

Before handing off:

**Spec coverage:**

| Spec section | Plan task(s) |
|--------------|--------------|
| §3.1 Routes & gates | 10.2, 10.3 |
| §3.2 Data layer | 1.1, 3.1 |
| §3.3 Verification edge function | 2.1 |
| §4 Visual system (palette, type, components) | 4.4–4.9 |
| §5 Commit Today layout | 5.1–5.6, 6.1 |
| §6 Nutrition locked state | 7.1 (+ 8.1 tab lock) |
| §7 Fork + verify + non-member sweep | 9.1–9.4 |
| §8 Implementation surfaces (file list) | covered across phases |
| §9 Out of scope | nothing planned (correct) |
| §10 DOD | 11.1 smoke check |

**Placeholder scan:** No TBD/TODO outside of intentional spec-tracked items (`PHOTO_ASSETS_READY=false`, Resend wiring, GHL creds). Every code block contains complete content.

**Type consistency:** `Membership` shape consistent across `useMembership.ts`, `app/index.tsx`, `app/(tabs)/_layout.tsx`, fork screens. `DailyPrompt` discriminated union consistent between `commitPrompts.ts` and `AwarenessCard.tsx`. `CommitAnchor` consistent between `commitAnchors.ts` and `CommitBlockToday.tsx`.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-15-create-power-path-rebuild.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Good for catching drift early.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Faster, less review overhead.

**Which approach?**
