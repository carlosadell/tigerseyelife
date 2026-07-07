// lib/units.ts
//
// Display-side weight conversion. Storage stays kg (see schema in
// lib/workouts.ts: WorkoutSetLog.weight_kg). Beta cohort coaches and
// members work in lbs per Karen's worked examples, so progression UI
// shows lbs while the database stays SI.

const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function formatWeight(kg: number): string {
  const rounded = roundedLb(kg);
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${display}lb`;
}

// Returns just the numeric lb value formatted as a clean string —
// used to seed a numeric text input where the "lb" suffix is
// provided by a separate column header. Same rounding rules as
// formatWeight so what you see matches what you'd log.
export function toLbInputValue(kg: number): string {
  const rounded = roundedLb(kg);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function roundedLb(kg: number): number {
  return Math.round(kgToLb(kg) * 10) / 10;
}
