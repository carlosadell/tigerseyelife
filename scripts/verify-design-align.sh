#!/usr/bin/env bash
# scripts/verify-design-align.sh
# Design-alignment done gate. Exits 0 only when every check passes. Read-only:
# it never edits the app. Run from anywhere; it cd's to the repo root.
set -u
cd "$(dirname "$0")/.." || exit 2

fail=0
check() { if eval "$2"; then echo "PASS  $1"; else echo "FAIL  $1"; fail=1; fi; }

BLOCK="app/block/[blockId].tsx"
CONCEPT="components/concept/LayeredConceptBody.tsx"
# Split so this script itself is not a match for the key check below.
NEEDLE="EXPO_PUBLIC_ANTHROPIC""_API_KEY"

# 1 — no stock/photographic hero on block detail
check "block hero: no PhotoHeroCard/stock photo" "! grep -qE 'PhotoHeroCard|growHeroPhotoForWeek' \"\$BLOCK\""
# 2 — block NAME is the title; the percentage lives only in the kicker string
check "block header: name is title, % in kicker" "grep -q 'blockTitle.toUpperCase()' \"\$BLOCK\" && grep -q 'CONSISTENCY' \"\$BLOCK\""
# 3 — POWER chips are letter-only (no name/role Text that could ellipsize)
check "compass chips: no ellipsis-able labels" "! grep -qE 'chipName|chipRole' \"\$CONCEPT\" && grep -q 'compassCaption' \"\$CONCEPT\""
# 4 — light-theme WCAG AA
check "light-theme contrast: zero AA failures" "node scripts/contrast-audit.mjs >/dev/null 2>&1"
# 5 — START HERE is one uniform grid, not wrapped mixed pills
check "START HERE: one uniform tool grid" "grep -q 'toolGrid' \"\$BLOCK\" && ! grep -qE 'toolChips|toolChipStar' \"\$BLOCK\""
# 6 — Anthropic key removed from the client bundle / repo
check "no bundled Anthropic key in repo" "! grep -rn \"\$NEEDLE\" . --exclude-dir=node_modules --exclude-dir=.git >/dev/null 2>&1"
# 7 — coach + meal-scan go through the edge proxy, not the API directly
check "coach/mealscan use edge proxy" "grep -q callAnthropic lib/coachAI.ts && grep -q callAnthropic lib/foodVision.ts && ! grep -q api.anthropic.com lib/coachAI.ts && ! grep -q api.anthropic.com lib/foodVision.ts"
# 8 — official brand assets present (drop from Karen's Canva kit). Expected names:
#     assets/brand/official-app-icon.png  and  assets/brand/official-wordmark.png
check "official Canva icon in assets/brand" "[ -f assets/brand/official-app-icon.png ]"
check "official Canva wordmark in assets/brand" "[ -f assets/brand/official-wordmark.png ]"

echo
if [ "$fail" -eq 0 ]; then echo "design-align: ALL CHECKS PASS"; else echo "design-align: FAILURES ABOVE"; fi
exit "$fail"
