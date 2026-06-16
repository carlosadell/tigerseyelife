import type { Tool } from '../tools';

export const abcPowerMealsGuide: Tool = {
  slug: 'abc-power-meals-guide',
  title: 'ABC Power Meals Guide',
  introducedInWeek: 3,
  isStar: false,
  body: {
    kind: 'static-page',
    intro: 'Half your plate, every plate. Under a minute to set up. This is the foundation of how Karen and Ryan teach eating.',
    sections: [
      {
        heading: 'A is for Anchor with Protein',
        body: 'Twenty five to thirty five grams per meal. Eggs, chicken, fish, beef, yogurt, cottage cheese, tofu, beans plus a protein. Anchor lands first on the plate.',
      },
      {
        heading: 'B is for Balance Your Meal',
        body: 'Carbs, fats, fiber. Round it out. Rice and vegetables. Bread and olive oil. Fruit and nut butter. Balance is the rest of the plate after the anchor.',
      },
      {
        heading: 'C is for Complete with Embellishments',
        body: 'Herbs, spices, sauces. The joy belongs. A bland meal is a meal you do not repeat. The embellishment is the difference between sustainable and grim.',
      },
      {
        heading: 'How to use ABC',
        body: 'Build one ABC meal today. Notice how you feel two hours later. Then build the next one. The goal this week is not perfect, it is anchored.',
      },
    ],
  },
};
