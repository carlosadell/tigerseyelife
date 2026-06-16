// lib/curriculum.ts
//
// The CREATE POWER curriculum. 36 sections (6 blocks × 6 threads on the
// P.O.W.E.R. framework, with Wisdom split into Nutrition + Workouts).
//
// 2 sections are authored end-to-end in this slice (the two below); the
// other 34 ship as stubs that render a "Karen and Ryan are writing this
// one." placeholder. The renderer flips Complete button copy ("Mark as
// read" vs "Complete and Next") based on whether the section is a stub.
//
// Adding a new lesson shape later = a new arm of LessonContent + a new
// renderer. No data migration required since sections live in this module.

export type BlockId = 'COMMIT' | 'REFINE' | 'EVOLVE' | 'ADAPT' | 'THRIVE' | 'EXCEL';
export const BLOCK_IDS: readonly BlockId[] = ['COMMIT', 'REFINE', 'EVOLVE', 'ADAPT', 'THRIVE', 'EXCEL'];

export type ThreadLetter = 'P' | 'O' | 'W_NUTRITION' | 'W_WORKOUTS' | 'E' | 'R';

export const THREAD_NAMES: Record<ThreadLetter, string> = {
  P: 'Patterns',
  O: 'Ownership',
  W_NUTRITION: 'Wisdom · Nutrition',
  W_WORKOUTS: 'Wisdom · Workouts',
  E: 'Energy',
  R: 'Resilience',
};

// Canonical thread order within each block: 1..6 = P, O, W_NUTRITION,
// W_WORKOUTS, E, R. The two authored sections (W_NUTRITION + W_WORKOUTS)
// land at orders 3 and 4 to match.
export const THREAD_ORDER: readonly ThreadLetter[] = [
  'P', 'O', 'W_NUTRITION', 'W_WORKOUTS', 'E', 'R',
];

// Lesson content discriminated union. New shapes = new arms.
export type EducationalContent = {
  kind: 'educational';
  introParagraph: string;
  keyConcepts: { title: string; body: string }[];
  takeaway: string;
  reflectionPrompt: string;
};

export type WorkoutContent = {
  kind: 'workout';
  // YouTube video ID (unlisted). Extract from the URL's `?v=` param.
  // Hosting decision 2026-06-16: see memory video-hosting-youtube.
  youtubeVideoId: string;
  // Optional YouTube playlist ID for grouped exercise series.
  youtubePlaylistId?: string;
  muscleGroups: { name: string; primary: boolean }[];
  instructions: string[];
  setRepTarget?: string;
};

export type StubContent = {
  kind: 'stub';
};

export type LessonContent = EducationalContent | WorkoutContent | StubContent;

export type Section = {
  blockId: BlockId;
  threadLetter: ThreadLetter;
  order: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
  title: string;
  emoji?: string;
  content: LessonContent;
};

// ──────────────────────────────────────────────────────────────────────────────
// Authored sections (2 in this slice; copy is exact per spec §6)
// ──────────────────────────────────────────────────────────────────────────────

const AUTHORED: Section[] = [
  {
    blockId: 'COMMIT',
    threadLetter: 'W_NUTRITION',
    order: 3,
    slug: 'commit-balanced-plate',
    title: 'Building a Balanced Plate',
    emoji: '🥗',
    content: {
      kind: 'educational',
      introParagraph: 'Before we count anything, we name what a meal even is.',
      keyConcepts: [
        { title: 'A is for Anchor with Protein', body: '25 to 35g per meal.' },
        { title: 'B is for Balance Your Meal', body: 'Carbs, fats, fiber. Round it out.' },
        { title: 'C is for Complete with Embellishments', body: 'Herbs, spices, sauces. The joy belongs.' },
      ],
      takeaway: 'Half your plate, every plate. Under a minute to set up.',
      reflectionPrompt: 'Name one meal this week where you can run ABC start to finish.',
    },
  },
  {
    blockId: 'COMMIT',
    threadLetter: 'W_WORKOUTS',
    order: 4,
    slug: 'commit-hinge-pattern',
    title: 'Hinge Pattern: Deadlift Setup',
    emoji: '🏋',
    content: {
      kind: 'workout',
      youtubeVideoId: 'YdcHrtaXMP4',
      youtubePlaylistId: 'PL4ElELFYWrHe4BizVUi1G-6la_WcXdtB4',
      muscleGroups: [
        { name: 'Posterior chain', primary: true },
        { name: 'Glutes', primary: true },
        { name: 'Hamstrings', primary: false },
        { name: 'Core', primary: false },
      ],
      instructions: [
        'Stand tall with feet hip-width, bar over the middle of your foot.',
        'Push hips back like closing a car door. Knees soft, chest proud.',
        'Drive the floor away, lockout at the top, repeat.',
      ],
      setRepTarget: '3 sets × 8 to 12 reps',
    },
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Stub generation — produces (BLOCK × THREAD) - AUTHORED = 34 stubs
// ──────────────────────────────────────────────────────────────────────────────

function stubSlug(blockId: BlockId, threadLetter: ThreadLetter): string {
  return `${blockId.toLowerCase()}-${threadLetter.toLowerCase()}`;
}

function stubTitle(blockId: BlockId, threadLetter: ThreadLetter): string {
  const block = blockId.charAt(0) + blockId.slice(1).toLowerCase();
  return `${block} · ${THREAD_NAMES[threadLetter]}`;
}

function authoredKey(s: Section): string {
  return `${s.blockId}:${s.threadLetter}`;
}

function buildCurriculum(): Section[] {
  const authoredKeys = new Set(AUTHORED.map(authoredKey));
  const sections: Section[] = [...AUTHORED];

  for (const blockId of BLOCK_IDS) {
    THREAD_ORDER.forEach((threadLetter, idx) => {
      const key = `${blockId}:${threadLetter}`;
      if (authoredKeys.has(key)) return;
      const order = (idx + 1) as Section['order'];
      sections.push({
        blockId,
        threadLetter,
        order,
        slug: stubSlug(blockId, threadLetter),
        title: stubTitle(blockId, threadLetter),
        content: { kind: 'stub' },
      });
    });
  }

  return sections.sort((a, b) => {
    const blockCmp = BLOCK_IDS.indexOf(a.blockId) - BLOCK_IDS.indexOf(b.blockId);
    if (blockCmp !== 0) return blockCmp;
    return a.order - b.order;
  });
}

export const CURRICULUM: readonly Section[] = buildCurriculum();

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

export function sectionsForBlock(blockId: BlockId): Section[] {
  return CURRICULUM.filter((s) => s.blockId === blockId);
}

export function sectionBySlug(slug: string): Section | undefined {
  return CURRICULUM.find((s) => s.slug === slug);
}

export function nextIncompleteSection(
  blockId: BlockId,
  isCompleted: (slug: string) => boolean,
): Section | undefined {
  return sectionsForBlock(blockId).find((s) => !isCompleted(s.slug));
}

export function isStub(section: Section): section is Section & { content: StubContent } {
  return section.content.kind === 'stub';
}
