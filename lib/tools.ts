// lib/tools.ts
//
// Tool registry. Each Tool is a one page native screen drawn from Karen's
// canonical curriculum map descriptions. Bodies live in lib/toolContent/.

import type { WeekNumber } from './program';

export type ToolSlug =
  | 'initial-questionnaire'
  | 'habits-over-checklists'
  | 'five-universal-patterns'
  | 'nutrition-track-chooser'
  | 'movement-breaks-menu'
  | 'sleep-environment-checklist'
  | 'kitchen-reset-guide'
  | 'abc-power-meals-guide'
  | 'pause-practice-guide'
  | 'wind-down-routine-builder'
  | 'teb-loop-guide'
  | 'meal-prep-system-guide'
  | 'social-situations-playbook'
  | 'movement-snacks-menu'
  | 'box-breathing-guide'
  | 'non-food-stress-relief-menu'
  | 'bare-minimum-protocol-builder'
  | 'automaticity-audit'
  | 'stress-signal-identifier'
  | 'energy-orchestra-planner'
  | 'my-system-documentation'
  | 'pattern-maintenance-system'
  | 'transformation-summary'
  | 'whats-next-guide';

export type ToolBody =
  | { kind: 'static-page'; intro?: string; sections: { heading: string; body: string }[] }
  | { kind: 'checklist'; intro?: string; items: { id: string; label: string }[] }
  | { kind: 'menu-list'; intro?: string; items: { title: string; body: string }[] }
  | { kind: 'fill-in-template'; intro?: string; fields: { id: string; label: string; placeholder?: string }[] };

export type Tool = {
  slug: ToolSlug;
  title: string;
  introducedInWeek: WeekNumber | 0;
  isStar: boolean;
  body: ToolBody;
};

import { initialQuestionnaire } from './toolContent/initialQuestionnaire';
import { habitsOverChecklists } from './toolContent/habitsOverChecklists';
import { fiveUniversalPatterns } from './toolContent/fiveUniversalPatterns';
import { nutritionTrackChooser } from './toolContent/nutritionTrackChooser';
import { movementBreaksMenu } from './toolContent/movementBreaksMenu';
import { sleepEnvironmentChecklist } from './toolContent/sleepEnvironmentChecklist';
import { kitchenResetGuide } from './toolContent/kitchenResetGuide';
import { abcPowerMealsGuide } from './toolContent/abcPowerMealsGuide';
import { pausePracticeGuide } from './toolContent/pausePracticeGuide';
import { windDownRoutineBuilder } from './toolContent/windDownRoutineBuilder';
import { tebLoopGuide } from './toolContent/tebLoopGuide';
import { mealPrepSystemGuide } from './toolContent/mealPrepSystemGuide';
import { socialSituationsPlaybook } from './toolContent/socialSituationsPlaybook';
import { movementSnacksMenu } from './toolContent/movementSnacksMenu';
import { boxBreathingGuide } from './toolContent/boxBreathingGuide';
import { nonFoodStressReliefMenu } from './toolContent/nonFoodStressReliefMenu';

export const TOOLS: Partial<Record<ToolSlug, Tool>> = {
  'initial-questionnaire': initialQuestionnaire,
  'habits-over-checklists': habitsOverChecklists,
  'five-universal-patterns': fiveUniversalPatterns,
  'nutrition-track-chooser': nutritionTrackChooser,
  'movement-breaks-menu': movementBreaksMenu,
  'sleep-environment-checklist': sleepEnvironmentChecklist,
  'kitchen-reset-guide': kitchenResetGuide,
  'abc-power-meals-guide': abcPowerMealsGuide,
  'pause-practice-guide': pausePracticeGuide,
  'wind-down-routine-builder': windDownRoutineBuilder,
  'teb-loop-guide': tebLoopGuide,
  'meal-prep-system-guide': mealPrepSystemGuide,
  'social-situations-playbook': socialSituationsPlaybook,
  'movement-snacks-menu': movementSnacksMenu,
  'box-breathing-guide': boxBreathingGuide,
  'non-food-stress-relief-menu': nonFoodStressReliefMenu,
};

export function toolBySlug(slug: string): Tool | undefined {
  return slug in TOOLS ? TOOLS[slug as ToolSlug] : undefined;
}

export function toolsForWeek(week: WeekNumber): Tool[] {
  return Object.values(TOOLS).filter((t): t is Tool => Boolean(t) && t.introducedInWeek === week);
}
