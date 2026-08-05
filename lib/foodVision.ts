import { callAnthropic } from './anthropicProxy';
import { Macros } from './meals';

/**
 * Food vision — sends a photo to Claude Haiku 4.5 and returns identified
 * meal name + macros + per-component breakdown.
 *
 * Routes requests through a Supabase Edge Function so the Anthropic API key
 * remains server-side and is never bundled into the app.
 */

export type FoodConfidence = 'low' | 'medium' | 'high';

export type FoodComponent = {
  item: string;
  grams: number;
};

export type FoodVisionResult = {
  name: string;
  components: FoodComponent[];
  macros: Macros;
  confidence: FoodConfidence;
  notes: string;
};

const SYSTEM_PROMPT = `You are a nutrition vision assistant for the Tigers Eye Life app. Identify the food in the user's photo and estimate macronutrients for the serving shown.

GUIDELINES
- Identify each distinct food item visible in the photo
- Estimate portion sizes using visual cues (plate diameter, utensil size, hand if visible, standard restaurant servings)
- Default to typical home or restaurant portions when scale is ambiguous
- Return grams as integers, not decimals
- Be conservative — when uncertain, prefer slightly lower estimates over inflated ones
- Confidence rubric:
  • "low" if the image is blurry, foods are hidden, ingredients look ambiguous, or portions are very hard to judge
  • "medium" for clear photos of common foods where portion estimates are reasonable
  • "high" only when foods are clearly visible AND portion size is obvious (e.g. measuring cup in frame, clear single serving)
- Notes: one short sentence flagging what's most uncertain (e.g. "Sauce amount estimated", "Protein portion could be larger"). Use empty string if nothing to flag.
- For raw ingredients, estimate as raw weight; for prepared meals, estimate as plated weight as served

ABC POWER MEALS FRAMEWORK
Karen and Ryan's framework: meals should anchor with protein, build with fiber/carbs/fat, complete with embellishments. If the meal lacks a clear protein anchor, mention it in notes (e.g. "No protein anchor detected — consider adding eggs, chicken, or yogurt").

If the image does not contain food, return name "Not a food photo", empty components array, all macros at 0, confidence "low", and notes "Photo does not appear to show food."`;

const FOOD_VISION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      description: 'Concise meal name, 3-7 words (e.g. "Grilled chicken with rice and broccoli")',
    },
    components: {
      type: 'array',
      description: 'Each distinct food item with its estimated portion',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          item: {
            type: 'string',
            description: 'Food item with portion estimate (e.g. "Grilled chicken breast, ~5 oz")',
          },
          grams: { type: 'number', description: 'Estimated grams of this component' },
        },
        required: ['item', 'grams'],
      },
    },
    macros: {
      type: 'object',
      additionalProperties: false,
      properties: {
        protein: { type: 'number', description: 'Grams of protein in the serving shown' },
        fat: { type: 'number', description: 'Grams of fat in the serving shown' },
        carb: { type: 'number', description: 'Grams of carbohydrates in the serving shown' },
        fiber: { type: 'number', description: 'Grams of fiber in the serving shown' },
      },
      required: ['protein', 'fat', 'carb', 'fiber'],
    },
    confidence: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      description: 'Confidence in identification and portion estimates',
    },
    notes: {
      type: 'string',
      description: 'One short sentence flagging uncertainty or framework notes. Empty string if nothing to flag.',
    },
  },
  required: ['name', 'components', 'macros', 'confidence', 'notes'],
};

export type MediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

type AnthropicMessagesResponse = {
  content: Array<
    | { type: 'text'; text: string }
    | { type: string; [k: string]: unknown }
  >;
  stop_reason: string;
  usage?: { input_tokens: number; output_tokens: number };
};

type AnthropicErrorResponse = {
  type?: string;
  error?: { type?: string; message?: string };
};

export async function scanFood({
  base64,
  mediaType,
}: {
  base64: string;
  mediaType: MediaType;
}): Promise<FoodVisionResult> {
  const response = await callAnthropic({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: 'Identify the food and estimate macros for the serving shown. Return the structured JSON only.',
          },
        ],
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: FOOD_VISION_SCHEMA },
    },
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const errBody = (await response.json()) as AnthropicErrorResponse;
      if (errBody?.error?.message) detail = errBody.error.message;
    } catch {
      // body wasn't JSON; keep the status line
    }
    throw new Error(`Anthropic API error: ${detail}`);
  }

  const data = (await response.json()) as AnthropicMessagesResponse;
  const textBlock = data.content.find(
    (b): b is { type: 'text'; text: string } => b.type === 'text',
  );
  if (!textBlock) {
    throw new Error('Food vision response missing text content.');
  }
  try {
    return JSON.parse(textBlock.text) as FoodVisionResult;
  } catch {
    throw new Error('Food vision response was not valid JSON.');
  }
}
