import type { Tool } from '../tools';

export const pausePracticeGuide: Tool = {
  slug: 'pause-practice-guide',
  title: 'Pause Practice Guide',
  introducedInWeek: 4,
  isStar: false,
  metadata: {
    block: 'REFINE',
    primaryNeed: 'resilience',
    secondaryNeeds: ['identity'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 38,
      body: 'Three words: Notice. Pause. Observe. A trigger lands. You name it. You wait ten seconds. You watch what wants to happen before you decide anything. You cannot change a pattern you cannot see. The pause creates the seeing.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'static-page',
        intro: 'Three words. Notice. Pause. Observe. This is the practice that creates space before you react.',
        sections: [
          {
            heading: 'Notice',
            body: 'A trigger lands. The thought, the feeling, the urge. Say to yourself, this is a trigger. Naming it is the whole first move.',
          },
          {
            heading: 'Pause',
            body: 'Do nothing for ten seconds. Not nothing forever. Ten seconds. Long enough for the wave to crest.',
          },
          {
            heading: 'Observe',
            body: "Watch what wants to happen. Watch what your body is asking for. You are not deciding yet. You are seeing.",
          },
          {
            heading: 'When to use it',
            body: 'Right before you reach for the snack. Right before you fire off the reply. Right before you skip the workout. This is not about willpower. It is about giving yourself one beat of awareness.',
          },
          {
            heading: 'Why it matters',
            body: 'You cannot change a pattern you cannot see. The pause creates the seeing. Once you see it, you have choices you did not have before.',
          },
        ],
      },
    },
  },
  body: {
    kind: 'static-page',
    intro: 'Three words. Notice. Pause. Observe. This is the practice that creates space before you react.',
    sections: [
      {
        heading: 'Notice',
        body: 'A trigger lands. The thought, the feeling, the urge. Say to yourself, this is a trigger. Naming it is the whole first move.',
      },
      {
        heading: 'Pause',
        body: 'Do nothing for ten seconds. Not nothing forever. Ten seconds. Long enough for the wave to crest.',
      },
      {
        heading: 'Observe',
        body: "Watch what wants to happen. Watch what your body is asking for. You are not deciding yet. You are seeing.",
      },
      {
        heading: 'When to use it',
        body: 'Right before you reach for the snack. Right before you fire off the reply. Right before you skip the workout. This is not about willpower. It is about giving yourself one beat of awareness.',
      },
      {
        heading: 'Why it matters',
        body: 'You cannot change a pattern you cannot see. The pause creates the seeing. Once you see it, you have choices you did not have before.',
      },
    ],
  },
};
