// app/onboarding/intake/[step].tsx
//
// Dynamic stepper. Resolves the slug param against the registry, picks the
// matching field component, validates the values for that step before
// continuing.

import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { ChipMultiSelect } from '../../../components/onboarding/ChipMultiSelect';
import { IntakeStep } from '../../../components/onboarding/IntakeStep';
import { SingleSelectStack } from '../../../components/onboarding/SingleSelectStack';
import { SliderField } from '../../../components/onboarding/SliderField';
import { TapToRank } from '../../../components/onboarding/TapToRank';
import { TextAreaField } from '../../../components/onboarding/TextAreaField';
import { FONTS, THEME_COLORS } from '../../../lib/brand';
import {
  STEPS,
  TOTAL_STEPS,
  nextSlug,
  prevSlug,
  stepBySlug,
  stepIndexFromSlug,
  type StepSlug,
} from '../../../lib/onboardingSteps';
import type { Obstacle, PartialIntake } from '../../../lib/onboardingSchema';

const light = THEME_COLORS.light;

const OBSTACLE_OPTIONS: readonly { value: Obstacle; label: string }[] = [
  { value: 'time', label: 'Time' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'injury', label: 'Injury' },
  { value: 'cost', label: 'Cost' },
  { value: 'other', label: 'Other' },
];

const WORK_OPTIONS = [
  { value: 'office', label: 'Office' },
  { value: 'remote', label: 'Remote' },
  { value: 'shift', label: 'Shift work' },
  { value: 'unemployed', label: 'Between jobs' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
] as const;

const LIVING_OPTIONS = [
  { value: 'alone', label: 'Alone' },
  { value: 'partner', label: 'Partner' },
  { value: 'children', label: 'Children' },
  { value: 'roommates', label: 'Roommates' },
  { value: 'family', label: 'Other family' },
] as const;

const COACHING_OPTIONS = [
  { value: 'direct', label: 'Direct, data-driven', description: 'Tell me what works. Show the numbers.' },
  { value: 'warm', label: 'Warm and encouraging', description: 'Meet me where I am.' },
  { value: 'balanced', label: 'Balanced', description: 'A mix of both, depending on the day.' },
  { value: 'challenging', label: 'Challenge me', description: 'Push me. Hold me to it.' },
] as const;

export default function IntakeStepScreen() {
  const params = useLocalSearchParams<{ step?: string }>();
  const slug = String(params.step ?? '');
  const def = stepBySlug(slug);
  const { control, watch, setValue } = useFormContext<PartialIntake>();
  const values = watch();

  if (!def) {
    return <Redirect href={`/onboarding/intake/${STEPS[0].slug}` as never} />;
  }

  // Skip if this step's predicate says so (e.g., entered via back button after
  // confidence_level rose above 7).
  if (def.skipIf?.(values)) {
    const next = nextSlug(def.slug, values);
    const target = next === 'review' ? '/onboarding/intake/review' : `/onboarding/intake/${next}`;
    return <Redirect href={target as never} />;
  }

  const stepIndex = stepIndexFromSlug(def.slug);
  const back = prevSlug(def.slug, values);
  const onBack = back ? () => router.replace(`/onboarding/intake/${back}` as never) : undefined;

  const goNext = () => {
    const next = nextSlug(def.slug, values);
    if (next === 'review') {
      router.replace('/onboarding/intake/review' as never);
    } else {
      router.replace(`/onboarding/intake/${next}` as never);
    }
  };

  // Per-step canContinue logic.
  const canContinue = computeCanContinue(slug as StepSlug, values);

  return (
    <IntakeStep
      totalSteps={TOTAL_STEPS}
      stepIndex={stepIndex}
      kicker={def.kicker}
      prompt={def.prompt}
      helper={def.helper}
      canContinue={canContinue}
      onContinue={goNext}
      onBack={onBack}
      showSkip={slug === 'past-experience'}
      onSkip={slug === 'past-experience' ? goNext : undefined}
    >
      <StepBody slug={slug as StepSlug} control={control} values={values} setValue={setValue} />
    </IntakeStep>
  );
}

function computeCanContinue(slug: StepSlug, v: PartialIntake): boolean {
  switch (slug) {
    case 'welcome':                return true;
    case 'age':                    return typeof v.age === 'number' && v.age >= 13 && v.age <= 120;
    case 'primary-goal':           return (v.primary_goal ?? '').trim().length > 2;
    case 'success-vision':         return (v.success_vision ?? '').trim().length > 2;
    case 'importance-confidence':  return typeof v.importance_level === 'number' && typeof v.confidence_level === 'number';
    case 'confidence-barriers':    return (v.confidence_barriers ?? '').trim().length > 1;
    case 'obstacles':              return (v.obstacles ?? []).length > 0;
    case 'top-obstacles':          return (v.top_obstacles ?? []).length === Math.min(2, (v.obstacles ?? []).length);
    case 'obstacle-deep-dive':     return (v.obstacle_deep_dive ?? '').trim().length > 2;
    case 'work-situation':         return typeof v.work_situation === 'string';
    case 'living-situation':       return (v.living_situation ?? []).length > 0;
    case 'past-experience':        return true; // optional + skip-able
    case 'coaching-style':         return typeof v.coaching_style === 'string';
    case 'final-prompts':          return (v.needle_mover ?? '').trim().length > 1 && (v.success_factor ?? '').trim().length > 1 && (v.emotion_response ?? '').trim().length > 1;
  }
}

type BodyProps = {
  slug: StepSlug;
  control: ReturnType<typeof useFormContext<PartialIntake>>['control'];
  values: PartialIntake;
  setValue: ReturnType<typeof useFormContext<PartialIntake>>['setValue'];
};

function StepBody({ slug, control, values, setValue }: BodyProps) {
  switch (slug) {
    case 'welcome':
      return (
        <View>
          <Text style={styles.welcomeBody}>
            We will ask about your goal, what gets in the way, and how you want us to coach you.
            Nothing is locked in. You can edit any answer on the review screen before we begin.
          </Text>
        </View>
      );

    case 'age':
      return (
        <Controller
          control={control}
          name="age"
          render={({ field }) => (
            <SliderField
              label="Age"
              value={field.value}
              onChange={field.onChange}
              min={13}
              max={120}
              step={1}
            />
          )}
        />
      );

    case 'primary-goal':
      return (
        <Controller
          control={control}
          name="primary_goal"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="e.g. lose 20 lbs and keep it off"
              maxLength={240}
            />
          )}
        />
      );

    case 'success-vision':
      return (
        <Controller
          control={control}
          name="success_vision"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Paint the picture."
              maxLength={400}
            />
          )}
        />
      );

    case 'importance-confidence':
      return (
        <View style={styles.stack}>
          <Controller
            control={control}
            name="importance_level"
            render={({ field }) => (
              <SliderField
                label="How important is this?"
                value={field.value}
                onChange={field.onChange}
                helperLow="Not at all"
                helperHigh="Absolutely"
              />
            )}
          />
          <Controller
            control={control}
            name="confidence_level"
            render={({ field }) => (
              <SliderField
                label="How confident do you feel?"
                value={field.value}
                onChange={field.onChange}
                helperLow="Not at all"
                helperHigh="Very"
              />
            )}
          />
        </View>
      );

    case 'confidence-barriers':
      return (
        <Controller
          control={control}
          name="confidence_barriers"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="What gets in the way of feeling sure?"
              maxLength={300}
            />
          )}
        />
      );

    case 'obstacles':
      return (
        <Controller
          control={control}
          name="obstacles"
          render={({ field }) => (
            <ChipMultiSelect
              options={OBSTACLE_OPTIONS}
              value={(field.value ?? []) as Obstacle[]}
              onChange={(next) => {
                field.onChange(next);
                // Also prune top_obstacles to those still selected.
                const prunedRanking = (values.top_obstacles ?? []).filter((v) => next.includes(v as Obstacle));
                setValue('top_obstacles', prunedRanking);
                if (!next.includes('other')) setValue('other_obstacle', '');
              }}
              otherValue={'other'}
              otherText={values.other_obstacle ?? ''}
              onOtherTextChange={(v) => setValue('other_obstacle', v)}
            />
          )}
        />
      );

    case 'top-obstacles':
      return (
        <Controller
          control={control}
          name="top_obstacles"
          render={({ field }) => (
            <TapToRank
              items={(values.obstacles ?? []).map((v) => {
                const found = OBSTACLE_OPTIONS.find((o) => o.value === v);
                return { value: v, label: found?.label ?? v };
              })}
              ranking={(field.value ?? []) as string[]}
              onChange={field.onChange}
              maxRanks={2}
            />
          )}
        />
      );

    case 'obstacle-deep-dive':
      return (
        <Controller
          control={control}
          name="obstacle_deep_dive"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="What makes it stick around?"
              maxLength={400}
            />
          )}
        />
      );

    case 'work-situation':
      return (
        <Controller
          control={control}
          name="work_situation"
          render={({ field }) => (
            <SingleSelectStack
              options={WORK_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      );

    case 'living-situation':
      return (
        <Controller
          control={control}
          name="living_situation"
          render={({ field }) => (
            <ChipMultiSelect
              options={LIVING_OPTIONS}
              value={(field.value ?? []) as string[]}
              onChange={field.onChange}
              otherValue={null}
            />
          )}
        />
      );

    case 'past-experience':
      return (
        <Controller
          control={control}
          name="past_experience"
          render={({ field }) => (
            <TextAreaField
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="What helped or hurt?"
              maxLength={400}
            />
          )}
        />
      );

    case 'coaching-style':
      return (
        <Controller
          control={control}
          name="coaching_style"
          render={({ field }) => (
            <SingleSelectStack
              options={COACHING_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      );

    case 'final-prompts':
      return (
        <View style={styles.stack}>
          <View>
            <Text style={styles.subPrompt}>What single change would help most?</Text>
            <Controller
              control={control}
              name="needle_mover"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="One change."
                  numberOfLines={3}
                  minHeight={80}
                  maxLength={200}
                />
              )}
            />
          </View>
          <View>
            <Text style={styles.subPrompt}>What must change for you to succeed?</Text>
            <Controller
              control={control}
              name="success_factor"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="One factor."
                  numberOfLines={3}
                  minHeight={80}
                  maxLength={200}
                />
              )}
            />
          </View>
          <View>
            <Text style={styles.subPrompt}>How do you typically respond to setbacks?</Text>
            <Controller
              control={control}
              name="emotion_response"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Be honest."
                  numberOfLines={3}
                  minHeight={80}
                  maxLength={200}
                />
              )}
            />
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  subPrompt: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    marginBottom: 8,
  },
  welcomeBody: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
  },
});
