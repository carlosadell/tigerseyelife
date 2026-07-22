import type { Tool, ToolBody } from '../tools';

// Karen and Ryan's protein reference. Two views toggled at the top of the
// screen: Quick (food + serving + protein, with carbs added for dairy and
// plant) and Macros (cal/protein/carbs/fat across the same foods). Values
// are USDA FoodData Central, rounded to the nearest whole gram.

const body: ToolBody = {
  kind: 'reference-tables',
  intro:
    'Every food your plan calls for, with the numbers that matter. Protein first, then the full macro picture. Use it to build plates and hit your targets.',
  views: [
    {
      id: 'quick',
      label: 'Quick Reference',
      description: 'Protein and carbs at a glance. Start here when you are building a plate.',
      sections: [
        {
          label: 'Animal Proteins',
          subtitle: 'Meats, seafood, eggs, and more',
          tables: [
            {
              label: 'Meats · 3 oz cooked',
              headers: ['Food', 'Serving', 'Protein (g)'],
              rows: [
                ['Ground beef 80/20', '3 oz', '23'],
                ['Ground beef 93/7', '3 oz', '22'],
                ['Ribeye steak', '3 oz', '23'],
                ['Sirloin steak', '3 oz', '23'],
                ['Chicken breast, skinless', '3 oz', '26'],
                ['Chicken thigh, skinless', '3 oz', '21'],
                ['Turkey breast, skinless', '3 oz', '26'],
                ['Ground turkey 93/7', '3 oz', '23'],
                ['Ground chicken', '3 oz', '20'],
                ['Pork tenderloin', '3 oz', '24'],
                ['Pork chop, bone-in', '3 oz', '24'],
                ['Bacon, pork', '3 slices', '9'],
              ],
            },
            {
              label: 'Bone Broth',
              headers: ['Food', 'Serving', 'Protein (g)'],
              rows: [
                ['Bone broth, liquid', '1 cup (240 ml)', '9–10'],
                ['Bone broth powder', '1 scoop (10 g)', '9'],
              ],
            },
            {
              label: 'Seafood · 3 oz cooked',
              headers: ['Food', 'Serving', 'Protein (g)'],
              rows: [
                ['Salmon, wild-caught', '3 oz', '22'],
                ['Tuna, canned in water', '3 oz', '17'],
                ['Cod, Atlantic', '3 oz', '15'],
                ['Tilapia', '3 oz', '22'],
                ['Shrimp', '3 oz', '20'],
                ['Sardines, canned in water', '3 oz', '20'],
                ['Halibut', '3 oz', '23'],
                ['Crab, canned', '3 oz', '15'],
              ],
            },
            {
              label: 'Eggs',
              headers: ['Food', 'Serving', 'Protein (g)'],
              rows: [
                ['Whole egg, large', '1 egg', '6'],
                ['Egg whites', '3 whites', '11'],
              ],
            },
            {
              label: 'Whey Protein · per scoop',
              headers: ['Food', 'Serving', 'Protein (g)'],
              rows: [
                ['Whey protein concentrate', '1 scoop (30 g)', '23–25'],
                ['Whey protein isolate', '1 scoop (30 g)', '25–27'],
              ],
            },
          ],
        },
        {
          label: 'Dairy Proteins',
          subtitle: 'Protein and carbs per serving',
          tables: [
            {
              label: 'Milk · ½ cup',
              headers: ['Food', 'Serving', 'Protein (g)', 'Carbs (g)'],
              rows: [
                ['Nonfat (skim) milk', '½ cup', '4', '6'],
                ['2% reduced-fat milk', '½ cup', '4', '6'],
                ['Whole milk (3.25%)', '½ cup', '4', '6'],
              ],
            },
            {
              label: 'Greek Yogurt · ½ cup',
              headers: ['Food', 'Serving', 'Protein (g)', 'Carbs (g)'],
              rows: [
                ['Non-fat Greek yogurt', '½ cup', '12', '4'],
                ['2% Greek yogurt', '½ cup', '12', '4'],
                ['Whole milk Greek yogurt', '½ cup', '10', '5'],
              ],
            },
            {
              label: 'Cottage Cheese · ½ cup',
              headers: ['Food', 'Serving', 'Protein (g)', 'Carbs (g)'],
              rows: [
                ['Non-fat cottage cheese', '½ cup', '14', '6'],
                ['2% cottage cheese', '½ cup', '13', '5'],
                ['Whole milk cottage cheese (4%)', '½ cup', '12', '5'],
              ],
            },
            {
              label: 'Kefir · ½ cup',
              headers: ['Food', 'Serving', 'Protein (g)', 'Carbs (g)'],
              rows: [
                ['Non-fat kefir', '½ cup', '5', '6'],
                ['Whole milk kefir', '½ cup', '4', '6'],
              ],
            },
          ],
        },
        {
          label: 'Cheese and Plant Proteins',
          subtitle: 'Protein and carbs per serving',
          tables: [
            {
              label: 'Cheese · 1 oz',
              headers: ['Food', 'Serving', 'Protein (g)', 'Carbs (g)'],
              rows: [
                ['Cheddar', '1 oz', '7', '<1'],
                ['Parmesan (grated)', '1 oz', '11', '1'],
                ['Mozzarella, part-skim', '1 oz', '7', '1'],
              ],
            },
            {
              label: 'Soy Products',
              headers: ['Food', 'Serving', 'Protein (g)', 'Carbs (g)'],
              rows: [
                ['Silken tofu', '3 oz', '4', '1'],
                ['Firm tofu', '3 oz', '8', '2'],
                ['Extra firm tofu', '3 oz', '9', '1'],
                ['Tempeh', '3 oz', '17', '9'],
                ['Edamame, shelled', '½ cup', '9', '7'],
                ['Soy milk, unsweetened', '½ cup', '4', '2'],
              ],
            },
            {
              label: 'Legumes · ½ cup cooked',
              headers: ['Food', 'Serving', 'Protein (g)', 'Carbs (g)'],
              rows: [
                ['Green lentils, boiled', '½ cup', '9', '20'],
                ['Red lentils, boiled', '½ cup', '9', '20'],
                ['Chickpeas, boiled', '½ cup', '7', '23'],
                ['Black beans, boiled', '½ cup', '8', '20'],
                ['Kidney beans, boiled', '½ cup', '8', '20'],
                ['Pinto beans, boiled', '½ cup', '8', '22'],
                ['Split peas, yellow, boiled', '½ cup', '8', '21'],
                ['Navy beans, boiled', '½ cup', '8', '24'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'macros',
      label: 'Complete Macros',
      description: 'The full picture for every food. Same foods as Quick Reference, with each macro spelled out.',
      sections: [
        {
          label: 'Meats and Seafood',
          subtitle: 'Calories, protein, carbs, fat per serving',
          tables: [
            {
              label: 'Meats · 3 oz cooked',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Ground beef 80/20', '3 oz', '231', '23', '0', '15'],
                ['Ground beef 93/7', '3 oz', '155', '22', '0', '7'],
                ['Ribeye steak', '3 oz', '188', '23', '0', '11'],
                ['Sirloin steak', '3 oz', '207', '23', '0', '12'],
                ['Chicken breast, skinless', '3 oz', '128', '26', '0', '3'],
                ['Chicken thigh, skinless', '3 oz', '152', '21', '0', '7'],
                ['Turkey breast, skinless', '3 oz', '125', '26', '0', '2'],
                ['Ground turkey 93/7', '3 oz', '172', '23', '0', '9'],
                ['Ground chicken', '3 oz', '161', '20', '0', '9'],
                ['Pork tenderloin', '3 oz', '139', '24', '0', '4'],
                ['Pork chop, bone-in', '3 oz', '202', '24', '0', '11'],
                ['Bacon, pork', '3 slices', '130', '9', '0', '10'],
              ],
            },
            {
              label: 'Seafood · 3 oz cooked',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Salmon, wild-caught', '3 oz', '155', '22', '0', '7'],
                ['Tuna, canned in water', '3 oz', '77', '17', '0', '1'],
                ['Cod, Atlantic', '3 oz', '70', '15', '0', '1'],
                ['Tilapia', '3 oz', '109', '22', '0', '2'],
                ['Shrimp', '3 oz', '84', '20', '<1', '1'],
                ['Sardines, canned in water', '3 oz', '100', '20', '0', '3'],
                ['Halibut', '3 oz', '119', '23', '0', '3'],
                ['Crab, canned', '3 oz', '71', '15', '0', '1'],
              ],
            },
          ],
        },
        {
          label: 'Eggs, Protein, and Milk',
          subtitle: 'Calories, protein, carbs, fat per serving',
          tables: [
            {
              label: 'Eggs',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Whole egg, large', '1 egg', '72', '6', '<1', '5'],
                ['Egg whites', '3 whites', '51', '11', '1', '<1'],
              ],
            },
            {
              label: 'Whey Protein · per scoop',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Whey protein concentrate', '1 scoop (30 g)', '110', '23–25', '2–3', '2'],
                ['Whey protein isolate', '1 scoop (30 g)', '108', '25–27', '1', '<1'],
              ],
            },
            {
              label: 'Bone Broth',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Bone broth, liquid', '1 cup (240 ml)', '40–50', '9–10', '1', '1'],
                ['Bone broth powder', '1 scoop (10 g)', '38–40', '9', '0', '<1'],
              ],
            },
            {
              label: 'Milk · ½ cup',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Nonfat (skim) milk', '½ cup', '42', '4', '6', '<1'],
                ['2% reduced-fat milk', '½ cup', '61', '4', '6', '2'],
                ['Whole milk (3.25%)', '½ cup', '73', '4', '6', '4'],
              ],
            },
          ],
        },
        {
          label: 'Cultured Dairy and Cheese',
          subtitle: 'Calories, protein, carbs, fat per serving',
          tables: [
            {
              label: 'Greek Yogurt · ½ cup',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Non-fat Greek yogurt', '½ cup', '70', '12', '4', '<1'],
                ['2% Greek yogurt', '½ cup', '90', '12', '4', '3'],
                ['Whole milk Greek yogurt', '½ cup', '110', '10', '5', '5'],
              ],
            },
            {
              label: 'Cottage Cheese · ½ cup',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Non-fat cottage cheese', '½ cup', '80', '14', '6', '1'],
                ['2% cottage cheese', '½ cup', '102', '13', '5', '3'],
                ['Whole milk cottage cheese (4%)', '½ cup', '111', '12', '5', '5'],
              ],
            },
            {
              label: 'Kefir · ½ cup',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Non-fat kefir', '½ cup', '43', '5', '6', '<1'],
                ['Whole milk kefir', '½ cup', '77', '4', '6', '4'],
              ],
            },
            {
              label: 'Cheese · 1 oz',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Cheddar', '1 oz', '114', '7', '<1', '9'],
                ['Parmesan (grated)', '1 oz', '118', '11', '1', '8'],
                ['Mozzarella, part-skim', '1 oz', '72', '7', '1', '5'],
              ],
            },
          ],
        },
        {
          label: 'Soy and Legumes',
          subtitle: 'Calories, protein, carbs, fat per serving',
          tables: [
            {
              label: 'Soy Products',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Silken tofu', '3 oz', '35', '4', '1', '2'],
                ['Firm tofu', '3 oz', '70', '8', '2', '4'],
                ['Extra firm tofu', '3 oz', '70', '9', '1', '5'],
                ['Tempeh', '3 oz', '163', '17', '9', '9'],
                ['Edamame, shelled', '½ cup', '94', '9', '7', '4'],
                ['Soy milk, unsweetened', '½ cup', '40', '4', '2', '2'],
              ],
            },
            {
              label: 'Legumes · ½ cup cooked',
              headers: ['Food', 'Serving', 'Cal', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
              rows: [
                ['Green lentils, boiled', '½ cup', '115', '9', '20', '<1'],
                ['Red lentils, boiled', '½ cup', '110', '9', '20', '<1'],
                ['Chickpeas, boiled', '½ cup', '134', '7', '23', '2'],
                ['Black beans, boiled', '½ cup', '114', '8', '20', '1'],
                ['Kidney beans, boiled', '½ cup', '113', '8', '20', '<1'],
                ['Pinto beans, boiled', '½ cup', '122', '8', '22', '1'],
                ['Split peas, yellow, boiled', '½ cup', '116', '8', '22', '1'],
                ['Navy beans, boiled', '½ cup', '127', '8', '24', '1'],
              ],
            },
          ],
        },
      ],
    },
  ],
  footnote:
    'Source: USDA FoodData Central, SR Legacy and Foundation datasets. Values rounded to the nearest whole gram. Whey protein and bone broth are category averages. Individual products vary, so always check your own label.',
};

export const proteinReferenceGuide: Tool = {
  slug: 'protein-reference-guide',
  title: 'Protein Reference Guide',
  introducedInWeek: 3,
  isStar: false,
  metadata: {
    block: 'REFINE',
    primaryNeed: 'knowledge',
    secondaryNeeds: ['systems'],
    prerequisites: ['abc-power-meals-guide'],
    entryPointEligible: true,
  },
  layerSet: { layer1: true, layer2: true, layer3: false },
  layered: {
    layer1: {
      wordCount: 35,
      body: 'Build every plate around one protein. Hit about 30 g, and the rest takes care of itself. Aim for 0.7 to 1 gram of protein per pound of ideal body weight, spread across the day.',
    },
    layer2: {
      kind: 'text-only',
      body,
    },
  },
  body,
};
