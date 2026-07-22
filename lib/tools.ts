// lib/tools.ts
//
// Tool registry. Each Tool is a one page native screen drawn from Karen's
// canonical curriculum map descriptions. Bodies live in lib/toolContent/.

import type { WeekNumber } from './program';
import type { ConceptMetadata, LayerSet } from './conceptMetadata';
import type { LayeredContent } from './layeredContent';

export type ToolSlug =
  | 'initial-questionnaire'
  | 'habits-over-checklists'
  | 'five-universal-patterns'
  | 'nutrition-track-chooser'
  | 'movement-breaks-menu'
  | 'sleep-environment-checklist'
  | 'kitchen-reset-guide'
  | 'abc-power-meals-guide'
  | 'protein-reference-guide'
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

// Reference table types — for lookup-style content (food/macro guides)
// where the teaching is in the data itself, not in prose. Each view is a
// scoped collection (e.g. Quick Reference vs Complete Macros) toggled at
// the top of the screen.
export type ReferenceTable = {
  label: string;
  headers: string[];
  rows: string[][];
};

export type ReferenceSection = {
  label: string;
  subtitle?: string;
  tables: ReferenceTable[];
};

export type ReferenceView = {
  id: string;
  label: string;
  description?: string;
  sections: ReferenceSection[];
};

export type ToolBody =
  | { kind: 'static-page'; intro?: string; sections: { heading: string; body: string }[] }
  | { kind: 'checklist'; intro?: string; items: { id: string; label: string }[] }
  | { kind: 'menu-list'; intro?: string; items: { title: string; body: string }[] }
  | { kind: 'fill-in-template'; intro?: string; fields: { id: string; label: string; placeholder?: string }[] }
  | { kind: 'reference-tables'; intro?: string; views: ReferenceView[]; footnote?: string };

export type Tool = {
  slug: ToolSlug;
  title: string;
  introducedInWeek: WeekNumber | 0;
  isStar: boolean;
  metadata: ConceptMetadata;
  layerSet: LayerSet;
  layered: LayeredContent;
  // @deprecated kept for back-compat during migration; equals layered.layer2.body
  // when layer2 is present, otherwise mirrors the static body.
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
import { proteinReferenceGuide } from './toolContent/proteinReferenceGuide';
import { pausePracticeGuide } from './toolContent/pausePracticeGuide';
import { windDownRoutineBuilder } from './toolContent/windDownRoutineBuilder';
import { tebLoopGuide } from './toolContent/tebLoopGuide';
import { mealPrepSystemGuide } from './toolContent/mealPrepSystemGuide';
import { socialSituationsPlaybook } from './toolContent/socialSituationsPlaybook';
import { movementSnacksMenu } from './toolContent/movementSnacksMenu';
import { boxBreathingGuide } from './toolContent/boxBreathingGuide';
import { nonFoodStressReliefMenu } from './toolContent/nonFoodStressReliefMenu';
import { bareMinimumProtocolBuilder } from './toolContent/bareMinimumProtocolBuilder';
import { automaticityAudit } from './toolContent/automaticityAudit';
import { stressSignalIdentifier } from './toolContent/stressSignalIdentifier';
import { energyOrchestraPlanner } from './toolContent/energyOrchestraPlanner';
import { mySystemDocumentation } from './toolContent/mySystemDocumentation';
import { patternMaintenanceSystem } from './toolContent/patternMaintenanceSystem';
import { transformationSummary } from './toolContent/transformationSummary';
import { whatsNextGuide } from './toolContent/whatsNextGuide';

export const TOOLS: Record<ToolSlug, Tool> = {
  'initial-questionnaire': initialQuestionnaire,
  'habits-over-checklists': habitsOverChecklists,
  'five-universal-patterns': fiveUniversalPatterns,
  'nutrition-track-chooser': nutritionTrackChooser,
  'movement-breaks-menu': movementBreaksMenu,
  'sleep-environment-checklist': sleepEnvironmentChecklist,
  'kitchen-reset-guide': kitchenResetGuide,
  'abc-power-meals-guide': abcPowerMealsGuide,
  'protein-reference-guide': proteinReferenceGuide,
  'pause-practice-guide': pausePracticeGuide,
  'wind-down-routine-builder': windDownRoutineBuilder,
  'teb-loop-guide': tebLoopGuide,
  'meal-prep-system-guide': mealPrepSystemGuide,
  'social-situations-playbook': socialSituationsPlaybook,
  'movement-snacks-menu': movementSnacksMenu,
  'box-breathing-guide': boxBreathingGuide,
  'non-food-stress-relief-menu': nonFoodStressReliefMenu,
  'bare-minimum-protocol-builder': bareMinimumProtocolBuilder,
  'automaticity-audit': automaticityAudit,
  'stress-signal-identifier': stressSignalIdentifier,
  'energy-orchestra-planner': energyOrchestraPlanner,
  'my-system-documentation': mySystemDocumentation,
  'pattern-maintenance-system': patternMaintenanceSystem,
  'transformation-summary': transformationSummary,
  'whats-next-guide': whatsNextGuide,
};

export function toolBySlug(slug: string): Tool | undefined {
  return slug in TOOLS ? TOOLS[slug as ToolSlug] : undefined;
}

export function toolsForWeek(week: WeekNumber): Tool[] {
  return Object.values(TOOLS).filter((t) => t.introducedInWeek === week);
}

// Dev-only Layer 1 length audit. Per the brief, Layer 1 must read in
// ~30 seconds — sixty words is the cap. We run this at module load in
// dev so the warning surfaces immediately when a content edit drifts
// past the limit. Stripped from prod builds via __DEV__.
import { validateLayered } from './layeredContent';

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const warnings = Object.values(TOOLS).flatMap((tool) =>
    validateLayered(tool.slug, tool.layered),
  );
  for (const w of warnings) {
    // eslint-disable-next-line no-console
    console.warn(`[tool:${w.conceptSlug}] ${w.kind}: ${w.message}`);
  }
}
