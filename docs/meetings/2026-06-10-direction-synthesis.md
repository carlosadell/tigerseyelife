# Two Tracks, One Principle

**For:** the 2026-06-10 direction meeting (John + Ryan + Carlos).
**Goal of this doc:** propose one mechanism that satisfies both Karen's 2026-06-08 reframing and Ryan's 2026-06-07 pitch, so we walk out aligned instead of trading interpretations.

## TL;DR

Karen and Ryan are saying the same thing from opposite angles. Karen wants *less surface area by default*. Ryan wants *the right surface for the right person*. Both want the user to see less, sooner. The synthesis is one architecture — **progressive disclosure** — that does both, without locking anyone out of anything.

## The shared principle nobody has named out loud

| Voice | Words | Underlying goal |
|---|---|---|
| Karen, 2026-06-08 | "Encyclopedia Britannica… people don't know where to begin." Slim Create Power down. Three nutrition precision levels; Create Power gets 1+2 only. | Hide complexity by default. |
| Ryan, 2026-06-07 | "Health is a holistic system… pick what's holding you back, and only that section unlocks for you initially." | Reveal what's relevant. |

Both end states are the same: **the user sees less than they would in the current app, and what they do see is more likely to be what they need right now.** The disagreement is whether to *hide* by default (Karen) or *reveal* by selection (Ryan). One architecture handles both.

## The unified pattern — three layers, none of them gated

1. **Smart defaults.** Every surface ships in its calmest possible form — fewest chips, fewest tabs visible, fewest options expanded. The "overwhelming" version is a one-tap reveal, not the entry experience. This is Karen's slimming made literal.

2. **User-controlled depth.** Anywhere a user might want more precision, a quiet affordance exists — a per-meal switch on Fuel for "track protein too," a "show all my macros" expander, a "more lessons" link on Today. Nothing is hidden in a menu six levels deep. Nothing is locked behind a gate either. The user controls the depth, surface by surface.

3. **An optional onboarding diagnostic that tunes defaults, never gates content.** Ryan's "what's holding you back?" question becomes a one-time setup step that *picks better defaults for that user*, not a key that unlocks tabs. Pick "I don't know what to do in the gym" → the Train tab opens with the tutorial overlay enabled. Pick "my mindset is out of whack" → Today leads with the daily-reflection card. **No tabs are ever hidden. No content is ever locked.**

This third layer is the move that lets us honor Ryan's pitch inside Create Power without contradicting Karen — because Karen's pushback wasn't to *personalization*, it was to *locked content the user can't access*. **Tuning defaults is not locking.**

## What this means for Create Power, in build-priority order

1. **Level 2 protein-only nutrition as a Fuel mode** with a per-meal switch and a settings default. Concrete win, smallest unit, directly from Karen's memo.
2. **A smart-defaults audit across Today / Train / Fuel / Grow.** Each surface gets a pass for "is the most overwhelming version what loads first?" — and gets pared down where the answer is yes. This is Karen's slimming work in real code.
3. **A one-time onboarding question that sets defaults.** Ryan's diagnostic, repurposed. Not gating; tuning.

## What stays parked for the future general-public app

Per Karen's 2026-06-08 hard lines:

- **Level 3 full-macro tracking.** Out of Create Power. General-public only.
- **Ryan's literal "only one section unlocks" mechanic.** Out of Create Power. General-public only — if at all.
- **Holistic-system as a five-pillar tab structure.** Not Create Power's nav. General-public app design phase.

## Open questions the meeting needs to actually decide

- **Q1.** Does Ryan accept "the diagnostic tunes defaults" as a stand-in for "the diagnostic gates unlocks" in Create Power? Or does he want the harder gating to ship somewhere?
- **Q2.** Does Karen find "smart defaults + opt-in depth" sufficient slimming, or does she want surfaces actively removed (e.g., the Grow tab hidden until X)?
- **Q3.** Is the onboarding-diagnostic shipped in Create Power's onboarding *now*, or deferred to the general-public app?
- **Q4.** What's the general-public app's actual timeline? Karen named no date. If it's 6+ months out, we shouldn't be designing it in parallel — but we should stop merging its ideas into Create Power either way.

## Honest risks to call out in the room

- **Ryan may push back on "tuning, not gating."** The locked-section feel was core to his pitch (and to the anti-scrape/anti-cancel business argument). If he insists on it, that's a real conversation, not a compromise.
- **Karen may find "default-tuning" too clever** — i.e., still feel like the app is doing too much under the hood. Worth asking her directly before assuming she'd accept it.
- **Existing beta users have already developed habits in the current UI.** Any smart-defaults sweep that changes what loads first risks breaking those habits. Roll-out probably needs to be opt-in for existing users, default-on for new users.

## What we want from the meeting

A yes/no on the three-layer pattern as Create Power's anti-overwhelm direction. If yes, we phase the build (Level 2 nutrition first, smart-defaults audit second, diagnostic third). If no, we surface the actual disagreement and reroute.
