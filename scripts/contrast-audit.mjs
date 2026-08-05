// scripts/contrast-audit.mjs
// WCAG AA audit of the light-theme text/background token pairs used across
// Commit Block, 5 Universal Patterns, and block/week detail. Body/large text
// threshold 4.5:1. colors.action (tangerine) is an intentional accent used as
// a button FILL with #FFFFFF text (compliant that way) and is out of scope here.
const FG = { text: '#141416', mutedText: '#52585F', accent: '#6E4C12' };
const BG = { background: '#FBF8F1', card: '#FFFFFF', cardAlt: '#F2EDE3', paleGold: '#F1E6C8' };

function lum(hex) {
  const n = hex.replace('#', '');
  const chan = [0, 2, 4]
    .map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
}
function ratio(a, b) {
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = [
  ['text', 'background'], ['text', 'card'], ['text', 'cardAlt'],
  ['mutedText', 'background'], ['mutedText', 'card'], ['mutedText', 'cardAlt'],
  ['accent', 'background'], ['accent', 'card'], ['accent', 'cardAlt'], ['accent', 'paleGold'],
];

let fails = 0;
for (const [fg, bg] of pairs) {
  const r = ratio(FG[fg], BG[bg]);
  const ok = r >= 4.5;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${fg} on ${bg}  ${r.toFixed(2)}:1`);
}
console.log(fails === 0 ? '\nAA: all light-theme pairs pass' : `\nAA: ${fails} failure(s)`);
process.exit(fails === 0 ? 0 : 1);
