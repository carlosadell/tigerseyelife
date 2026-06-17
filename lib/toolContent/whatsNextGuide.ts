import type { Tool } from '../tools';

export const whatsNextGuide: Tool = {
  slug: 'whats-next-guide',
  title: "What's Next Guide",
  introducedInWeek: 12,
  isStar: false,
  metadata: {
    block: 'EXCEL',
    primaryNeed: 'identity',
    secondaryNeeds: ['systems'],
    prerequisites: [],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 38,
      body: 'Three paths from here. Stay in the membership for ongoing community and accountability. Move to GST for small group strength training. Or return for a second round of CREATE POWER with systems already built. Notice what you need and choose from that.',
    },
    layer2: {
      kind: 'text-only',
      body: {
        kind: 'static-page',
        intro: 'Three paths from here. Pick what fits.',
        sections: [
          {
            heading: 'The membership',
            body: 'Stay in The Surge. Daily intentionality, workouts, nutrition, the coach. Your pod stays. Your systems stay. You stay accountable without starting over.',
          },
          {
            heading: 'Group Strength Training',
            body: 'GST is the small group strength training program. Invite only. If this is the next move for you, Karen and Ryan will tell you.',
          },
          {
            heading: 'CREATE POWER again',
            body: 'A second cohort, deeper. Same twelve weeks, but you bring the systems you built this round. Returning rate.',
          },
          {
            heading: 'How to decide',
            body: 'Notice what you need. If you need community and consistency, stay in the membership. If you want a strength focused small group, look at GST. If you want another round at the structure, do CREATE POWER again.',
          },
          {
            heading: 'You are now the expert on you',
            body: 'No one knows your patterns, your food, your movement, your recovery better than you do. Whatever you choose next, trust that.',
          },
        ],
      },
    },
  },
  body: {
    kind: 'static-page',
    intro: 'Three paths from here. Pick what fits.',
    sections: [
      {
        heading: 'The membership',
        body: 'Stay in The Surge. Daily intentionality, workouts, nutrition, the coach. Your pod stays. Your systems stay. You stay accountable without starting over.',
      },
      {
        heading: 'Group Strength Training',
        body: 'GST is the small group strength training program. Invite only. If this is the next move for you, Karen and Ryan will tell you.',
      },
      {
        heading: 'CREATE POWER again',
        body: 'A second cohort, deeper. Same twelve weeks, but you bring the systems you built this round. Returning rate.',
      },
      {
        heading: 'How to decide',
        body: 'Notice what you need. If you need community and consistency, stay in the membership. If you want a strength focused small group, look at GST. If you want another round at the structure, do CREATE POWER again.',
      },
      {
        heading: 'You are now the expert on you',
        body: 'No one knows your patterns, your food, your movement, your recovery better than you do. Whatever you choose next, trust that.',
      },
    ],
  },
};
