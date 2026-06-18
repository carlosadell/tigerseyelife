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

export function formatWeight(kg: number): string {
  const lb = kgToLb(kg);
  const rounded = Math.round(lb * 10) / 10;
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${display}lb`;
}
