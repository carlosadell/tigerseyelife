import type { Tool } from '../tools';

export const tebLoopGuide: Tool = {
  slug: 'teb-loop-guide',
  title: 'TEB Loop Guide',
  introducedInWeek: 5,
  isStar: true,
  metadata: {
    block: 'EVOLVE',
    primaryNeed: 'identity',
    secondaryNeeds: ['resilience'],
    prerequisites: ['five-universal-patterns'],
    entryPointEligible: false,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 38,
      body: 'Thinking, Emotion, Behavior. A trigger fires a thought. The thought creates an emotion. The emotion drives the action. Most people skip the thought and let the emotion drive. Break the loop at the thinking step and the pattern stops running you.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'static-page',
        intro: 'Thinking, Emotion, Behavior. When you let thinking drive, you choose. When you let emotion drive, the pattern wins.',
        sections: [
          {
            heading: 'How the loop runs',
            body: 'A trigger lands. You have a thought about it. That thought creates an emotion. The emotion drives the behavior. Most people skip the thought step and let the emotion drive directly.',
          },
          {
            heading: 'Where the loop breaks',
            body: 'You break the loop at the thinking step. Catch the thought. Ask: is this true? Is this useful? What is the bigger picture here?',
          },
          {
            heading: 'Example: the late night snack',
            body: 'Trigger: tired at nine pm. Thought: I deserve this. Emotion: relief on the way. Behavior: the snack. Reframe at the thought: I deserve real rest, not sugar that wakes me at three am.',
          },
          {
            heading: 'Example: the skipped workout',
            body: 'Trigger: hard day at work. Thought: I cannot today. Emotion: defeat. Behavior: skip. Reframe at the thought: a twenty minute walk is still a workout, and it is what I do.',
          },
          {
            heading: 'The practice',
            body: 'Use TEB once a day this week. Pick one moment. Notice the trigger, the thought, the emotion, the behavior. Then ask: what would change if I changed the thought?',
          },
        ],
      },
    },
  },
  body: {
    kind: 'static-page',
    intro: 'Thinking, Emotion, Behavior. When you let thinking drive, you choose. When you let emotion drive, the pattern wins.',
    sections: [
      {
        heading: 'How the loop runs',
        body: 'A trigger lands. You have a thought about it. That thought creates an emotion. The emotion drives the behavior. Most people skip the thought step and let the emotion drive directly.',
      },
      {
        heading: 'Where the loop breaks',
        body: 'You break the loop at the thinking step. Catch the thought. Ask: is this true? Is this useful? What is the bigger picture here?',
      },
      {
        heading: 'Example: the late night snack',
        body: 'Trigger: tired at nine pm. Thought: I deserve this. Emotion: relief on the way. Behavior: the snack. Reframe at the thought: I deserve real rest, not sugar that wakes me at three am.',
      },
      {
        heading: 'Example: the skipped workout',
        body: 'Trigger: hard day at work. Thought: I cannot today. Emotion: defeat. Behavior: skip. Reframe at the thought: a twenty minute walk is still a workout, and it is what I do.',
      },
      {
        heading: 'The practice',
        body: 'Use TEB once a day this week. Pick one moment. Notice the trigger, the thought, the emotion, the behavior. Then ask: what would change if I changed the thought?',
      },
    ],
  },
};
