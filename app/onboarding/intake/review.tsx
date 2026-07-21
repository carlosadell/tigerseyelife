// app/onboarding/intake/review.tsx
//
// All §3.2 answers laid out as ReviewCards. Tap any card → routes back to
// that step with the value preserved (form state lives in the FormProvider
// upstream). The submit CTA validates via the composed Zod schema and
// dispatches via useOnboardingIntake.

import { router } from 'expo-router';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewCard } from '../../../components/onboarding/ReviewCard';
import { useOnboardingIntake } from '../../../hooks/useOnboardingIntake';
import {
  COLORS,
  FONTS,
  SPACING,
  THEME_COLORS,
  ctaTextOnTangerine,
} from '../../../lib/brand';
import {
  intakeSchema,
  type Intake,
  type PartialIntake,
} from '../../../lib/onboardingSchema';

const light = THEME_COLORS.light;

const LABELS: Record<keyof Intake, string> = {
  age: 'AGE',
  training_location: 'WHERE YOU TRAIN',
  training_duration: 'SESSION LENGTH',
  training_format: 'SESSION FORMAT',
  primary_goal: 'YOUR GOAL',
  success_vision: 'SUCCESS IN 12 WEEKS',
  importance_level: 'HOW IMPORTANT',
  confidence_level: 'HOW CONFIDENT',
  confidence_barriers: 'WHAT MAKES CONFIDENCE HARD',
  obstacles: 'ROADBLOCKS',
  other_obstacle: 'OTHER ROADBLOCK',
  top_obstacles: 'TOP TWO',
  obstacle_deep_dive: 'WHY IT IS HARD',
  work_situation: 'WORK',
  living_situation: 'LIVING WITH',
  past_experience: 'WHAT YOU HAVE TRIED',
  concerns: 'CONCERNS',
  needle_mover: 'NEEDLE MOVER',
  specific_habits: 'SPECIFIC HABITS',
  success_factor: 'SUCCESS FACTOR',
  other_success_factor: 'OTHER SUCCESS FACTOR',
  emotion_response: 'WHEN THINGS SLIP',
  coaching_style: 'COACHING STYLE',
};

const FIELD_TO_STEP: Partial<Record<keyof Intake, string>> = {
  age: 'age',
  training_location: 'training-location',
  training_duration: 'training-duration',
  training_format: 'training-format',
  primary_goal: 'primary-goal',
  success_vision: 'success-vision',
  importance_level: 'importance-confidence',
  confidence_level: 'importance-confidence',
  confidence_barriers: 'confidence-barriers',
  obstacles: 'obstacles',
  other_obstacle: 'obstacles',
  top_obstacles: 'top-obstacles',
  obstacle_deep_dive: 'obstacle-deep-dive',
  work_situation: 'work-situation',
  living_situation: 'living-situation',
  past_experience: 'past-experience',
  coaching_style: 'coaching-style',
  needle_mover: 'final-prompts',
  success_factor: 'final-prompts',
  emotion_response: 'final-prompts',
};

// Friendly labels for the Apex slotting answers so the review reads as prose
// rather than raw enum values.
const TRAINING_DISPLAY: Partial<Record<keyof Intake, Record<string, string>>> = {
  training_location: { home: 'Home gym', commercial: 'Commercial gym' },
  training_duration: { '30': '30 minutes', '60': '60 minutes' },
  training_format: { live: 'Live group strength', prerecorded: 'Pre-recorded (Apex60)' },
};

function display(field: keyof Intake, value: PartialIntake[keyof PartialIntake]): string {
  if (value === undefined || value === null) return '';
  const overrides = TRAINING_DISPLAY[field];
  if (overrides) {
    const key = String(value);
    if (overrides[key]) return overrides[key];
  }
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  return String(value);
}

export default function ReviewScreen() {
  const { getValues } = useFormContext<PartialIntake>();
  const { submit, submitting, error } = useOnboardingIntake();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const values = getValues();

  const onEdit = (field: keyof Intake) => {
    const stepSlug = FIELD_TO_STEP[field];
    if (stepSlug) router.replace(`/onboarding/intake/${stepSlug}` as never);
  };

  const onSubmit = async () => {
    setSubmitError(null);

    const parsed = intakeSchema.safeParse(values);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setSubmitError(`Please complete: ${firstIssue.path.join('.')}`);
      return;
    }

    const result = await submit(parsed.data);
    if (!result.ok) {
      setSubmitError(`Could not save. ${result.reason}`);
      return;
    }

    router.replace('/(tabs)/today' as never);
  };

  // Order matches the spec's logical group.
  const fieldsToReview: (keyof Intake)[] = [
    'age',
    'training_location',
    'training_duration',
    'training_format',
    'primary_goal',
    'success_vision',
    'importance_level',
    'confidence_level',
    'confidence_barriers',
    'obstacles',
    'top_obstacles',
    'obstacle_deep_dive',
    'work_situation',
    'living_situation',
    'past_experience',
    'coaching_style',
    'needle_mover',
    'success_factor',
    'emotion_response',
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>REVIEW</Text>
            <Text style={styles.title}>Make sure this is true.</Text>
            <Text style={styles.helper}>Tap any answer to change it before we send you in.</Text>
          </View>

          <View style={styles.list}>
            {fieldsToReview.map((field) => {
              const v = values[field];
              if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) {
                // Skip fields the user hasn't filled (e.g., optional past_experience,
                // skipped confidence_barriers).
                return null;
              }
              return (
                <ReviewCard
                  key={field}
                  label={LABELS[field]}
                  value={display(field, v)}
                  onEdit={() => onEdit(field)}
                />
              );
            })}
          </View>

          {submitError ?? error ? (
            <Text style={styles.error}>{submitError ?? error}</Text>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit"
            disabled={submitting}
            onPress={onSubmit}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : submitting ? 0.5 : 1 })}
          >
            <View style={styles.cta}>
              <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                {submitting ? 'Saving...' : 'Looks right, let us go'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 18,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaText: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: -0.1,
  },
  error: {
    color: COLORS.deepRed,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
    marginTop: 16,
  },
  footer: {
    paddingBottom: 12,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  header: {
    gap: 6,
    marginBottom: 22,
  },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  list: {},
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
});
