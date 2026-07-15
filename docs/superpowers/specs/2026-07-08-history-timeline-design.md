# Looking Back — full-program history timeline

**Date:** 2026-07-08
**Status:** Approved, implementing

## Problem

Members can see the last 7 days via the `WeekStrip` and open a single day's
detail (`app/history/[date].tsx`), but there is no way to view their whole
program history or compare an early day to a later one ("Day #1 vs Day #8").

## Goal (MVP)

A tappable, program-wide day timeline. Every calendar day from Day 1 through
today is listed with its program day number, and tapping a day opens the
existing per-day detail screen. Opening Day 1 and Day 8 back-to-back covers the
compare use case without a dedicated side-by-side view.

## Scope

In:
1. `useHistoryTimeline()` hook — ordered list of program days (Day 1 → today).
2. `app/history/index.tsx` — the timeline screen, reached at `/history`.
3. Extend `useHistoryDay` + `app/history/[date].tsx` to also load and render the
   day's **daily entry** (mood, intention, reflection) — currently missing and
   the richest thing to compare day-over-day.
4. A "Looking Back" entry row on the You tab routing to `/history`.

Deferred (not this build):
- Trends summary (streak / weight / volume charts over time).
- Two-day side-by-side compare picker.
- Body measurements / progress photos (no schema exists).

## Design

### Day-1 anchor
Day 1 = the calendar day of `membership.verifiedAt` (set when a member is
verified into COMMIT / week 1). Fallbacks, in order: earliest engaged date from
`useEngagementDates`, then today. This keeps dev sessions (no `verifiedAt`)
working.

`dayNumber = differenceInCalendarDays(date, startDate) + 1`.
`weekNumber = min(ceil(dayNumber / 7), 12)`; block via `currentBlockFor`. Days
past week 12 label as "CONTINUATION".

### useHistoryTimeline()
Returns `{ days, loading }` where `days` is ascending (Day 1 first), each:
`{ dateKey, dayNumber, weekNumber, blockLabel, engaged, isToday }`.
`engaged` comes from the existing `useEngagementDates` set. Rows are cheap — no
per-day content is loaded until the user taps into the detail screen.

### app/history/index.tsx
- "LOOKING BACK" header + back button, same `phoneFrame` + `useThemeColors` as
  the detail screen.
- Ascending list, Day 1 at top. Non-collapsible week dividers
  ("WEEK 1 · COMMIT") as scan anchors.
- Each row: large Day number, weekday + date, an engaged indicator (gold dot).
  Empty days render faintly ("Quiet day") — never red, matching the WeekStrip's
  no-failure-state rule and the streak definition (any engagement counts; rest
  days don't break anything).
- Engaged rows tap into `/history/[date]`; empty and today's rows still tap
  (detail screen already handles the empty state gracefully).

### Daily-entry extension
`useHistoryDay` gains a dual-path read of `daily_entries` for the given date
(AsyncStorage `tel:daily-entry:{userId}:{date}` in dev / Supabase otherwise),
exposing `{ intention, mood, reflection, movementTags }`. The detail screen adds
a "REFLECTION" section rendering mood, intention, and reflection when present.

### You-tab entry
A `SettingsRow`-style row ("Looking back — your whole program, day by day")
placed above the SETTINGS section, routing to `/history`.

## Non-goals / constraints
- No new Supabase migration (uses existing tables + AsyncStorage).
- Light-first, theme-aware via `useThemeColors` (matches the sibling detail
  screen). No hardcoded hex.
- No em dashes in user-facing copy. No countdowns / deadlines / shaming.
