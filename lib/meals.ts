export type MealSlot = '1' | '2' | '3' | 'S';

export const MEAL_SLOTS: { id: MealSlot; label: string; hint: string }[] = [
  { id: '1', label: 'First meal', hint: 'Whenever you break your fast' },
  { id: '2', label: 'Second meal', hint: 'Midday fuel' },
  { id: '3', label: 'Third meal', hint: 'Evening plate' },
  { id: 'S', label: 'Snack', hint: 'Optional · protein-forward' },
];

export type Macros = {
  protein: number;
  fat: number;
  carb: number;
  fiber: number;
};

export type DailyTargets = Macros & {
  calories: number;
};

export const DEFAULT_TARGETS: DailyTargets = {
  calories: 1800,
  protein: 120,
  fat: 70,
  carb: 180,
  fiber: 30,
};

export type LibraryMeal = {
  id: string;
  name: string;
  description: string;
  macros: Macros;
};

export type LoggedMeal = {
  id: string;
  slot: MealSlot;
  name: string;
  macros: Macros;
  logged_at: string;
  source: 'library' | 'custom';
  source_id?: string;
};

export const ZERO_MACROS: Macros = { protein: 0, fat: 0, carb: 0, fiber: 0 };

export function estimateCalories({ protein, fat, carb }: Macros): number {
  return Math.round(protein * 4 + carb * 4 + fat * 9);
}

export function sumMacros(meals: LoggedMeal[]): Macros {
  return meals.reduce(
    (acc, meal) => ({
      protein: acc.protein + meal.macros.protein,
      fat: acc.fat + meal.macros.fat,
      carb: acc.carb + meal.macros.carb,
      fiber: acc.fiber + meal.macros.fiber,
    }),
    { ...ZERO_MACROS },
  );
}
