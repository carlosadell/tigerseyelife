import type { Tool } from '../tools';

export const socialSituationsPlaybook: Tool = {
  slug: 'social-situations-playbook',
  title: 'Social Situations Playbook',
  introducedInWeek: 6,
  isStar: false,
  metadata: {
    block: 'EVOLVE',
    primaryNeed: 'identity',
    secondaryNeeds: ['resilience'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 37,
      body: 'Seven scripts and moves for situations that used to derail you. Restaurants, buffets, the drink offer, the food pusher. Pick one to try this week. Having a plan before you walk in is what makes the difference.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'menu-list',
        intro: 'Scripts and moves for situations that used to derail you. Pick one to try this week.',
        items: [
          { title: 'Restaurant arrival', body: 'Read the menu before you go. Decide on an anchor protein and one balance side. Order first so you do not drift.' },
          { title: 'Buffet or party', body: 'Walk the whole table once before you take a plate. Pick the anchor and two sides. Sit far from the table.' },
          { title: "The pusher", body: 'You: Thanks, I am good. They: Just a little. You: I really am good. Repeat without explaining.' },
          { title: 'The drink offer', body: 'Have a non alcohol drink in your hand from the start. Sparkling water with lime looks like a cocktail.' },
          { title: "Dinner at a friend's", body: 'Eat a small anchor before you go (eggs, yogurt, jerky). You are not hungry walking in, which makes choices easier.' },
          { title: 'Coworker treats at work', body: 'See it, name it, walk away. The cookies will be there tomorrow. They will not call out to you if you do not stand near them.' },
          { title: "The well meaning comment", body: 'Are you really not having any? Reframe in your head: this is them, not me. Say: yes, really, thanks for thinking of me.' },
        ],
      },
    },
  },
  body: {
    kind: 'menu-list',
    intro: 'Scripts and moves for situations that used to derail you. Pick one to try this week.',
    items: [
      { title: 'Restaurant arrival', body: 'Read the menu before you go. Decide on an anchor protein and one balance side. Order first so you do not drift.' },
      { title: 'Buffet or party', body: 'Walk the whole table once before you take a plate. Pick the anchor and two sides. Sit far from the table.' },
      { title: "The pusher", body: 'You: Thanks, I am good. They: Just a little. You: I really am good. Repeat without explaining.' },
      { title: 'The drink offer', body: 'Have a non alcohol drink in your hand from the start. Sparkling water with lime looks like a cocktail.' },
      { title: "Dinner at a friend's", body: 'Eat a small anchor before you go (eggs, yogurt, jerky). You are not hungry walking in, which makes choices easier.' },
      { title: 'Coworker treats at work', body: 'See it, name it, walk away. The cookies will be there tomorrow. They will not call out to you if you do not stand near them.' },
      { title: "The well meaning comment", body: 'Are you really not having any? Reframe in your head: this is them, not me. Say: yes, really, thanks for thinking of me.' },
    ],
  },
};
