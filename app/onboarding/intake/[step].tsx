// app/onboarding/intake/[step].tsx
//
// Dynamic stepper. Resolves the slug param against the registry, picks the
// matching field component, validates the values for that step before
// continuing.

import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Controller, useFormContext } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import { ChipMultiSelect } from "../../../components/onboarding/ChipMultiSelect";
import { IntakeStep } from "../../../components/onboarding/IntakeStep";
import { SingleSelectStack } from "../../../components/onboarding/SingleSelectStack";
import { SliderField } from "../../../components/onboarding/SliderField";
import { TextAreaField } from "../../../components/onboarding/TextAreaField";
import { FONTS, THEME_COLORS } from "../../../lib/brand";
import {
  STEPS,
  TOTAL_STEPS,
  nextSlug,
  prevSlug,
  stepBySlug,
  stepIndexFromSlug,
  type StepSlug,
} from "../../../lib/onboardingSteps";
import type { Obstacle, PartialIntake } from "../../../lib/onboardingSchema";

const light = THEME_COLORS.light;

const OBSTACLE_OPTIONS: readonly { value: Obstacle; label: string }[] = [
  { value: "time", label: "Time" },
  { value: "motivation", label: "Motivation" },
  { value: "knowledge", label: "Knowledge" },
  { value: "injury", label: "Injury" },
  { value: "cost", label: "Cost" },
  { value: "other", label: "Other" },
];

const WORK_OPTIONS = [
  { value: "office", label: "Office" },
  { value: "remote", label: "Remote" },
  { value: "shift", label: "Shift work" },
  { value: "unemployed", label: "Between jobs" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
] as const;

const LIVING_OPTIONS = [
  { value: "alone", label: "Alone" },
  { value: "partner", label: "Partner" },
  { value: "children", label: "Children" },
  { value: "roommates", label: "Roommates" },
  { value: "family", label: "Other family" },
] as const;

const COACHING_OPTIONS = [
  {
    value: "direct",
    label: "Direct, data-driven",
    description: "Tell me what works. Show the numbers.",
  },
  {
    value: "warm",
    label: "Warm and encouraging",
    description: "Meet me where I am.",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "A mix of both, depending on the day.",
  },
  {
    value: "challenging",
    label: "Challenge me",
    description: "Push me. Hold me to it.",
  },
] as const;

export default function IntakeStepScreen() {
  const params = useLocalSearchParams<{ step?: string }>();
  const slug = String(params.step ?? "");
  const def = stepBySlug(slug);
  const { control, watch, setValue } = useFormContext<PartialIntake>();
  const values = watch();

  if (!def) {
    return <Redirect href={`/onboarding/intake/${STEPS[0].slug}` as never} />;
  }

  const stepIndex = stepIndexFromSlug(def.slug);
  const back = prevSlug(def.slug, values);
  const onBack = back
    ? () => router.replace(`/onboarding/intake/${back}` as never)
    : undefined;

  const goNext = () => {
    const next = nextSlug(def.slug, values);
    if (next === "review") {
      router.replace("/onboarding/intake/review" as never);
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
    >
      <StepBody
        slug={slug as StepSlug}
        control={control}
        values={values}
        setValue={setValue}
      />
    </IntakeStep>
  );
}

function computeCanContinue(slug: StepSlug, v: PartialIntake): boolean {
  switch (slug) {
    case "age":
      return typeof v.age === "number" && v.age >= 13 && v.age <= 120;
    case "goals":
      return (
        (v.primary_goal ?? "").trim().length > 2 &&
        (v.success_vision ?? "").trim().length > 2
      );
    case "readiness":
      return (
        typeof v.importance_level === "number" &&
        typeof v.confidence_level === "number"
      );
    case "obstacles":
      return (v.obstacles ?? []).length > 0;
    case "context":
      return (
        typeof v.work_situation === "string" &&
        (v.living_situation ?? []).length > 0
      );
    case "coaching-style":
      return typeof v.coaching_style === "string";
  }
}

type BodyProps = {
  slug: StepSlug;
  control: ReturnType<typeof useFormContext<PartialIntake>>["control"];
  values: PartialIntake;
  setValue: ReturnType<typeof useFormContext<PartialIntake>>["setValue"];
};

function StepBody({ slug, control, values, setValue }: BodyProps) {
  switch (slug) {
    case "age":
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

    case "goals":
      return (
        <View style={styles.stack}>
          <View>
            <Text style={styles.subPrompt}>Your main goal</Text>
            <Controller
              control={control}
              name="primary_goal"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="What do you want to change?"
                  minHeight={88}
                  numberOfLines={3}
                  maxLength={240}
                />
              )}
            />
          </View>
          <View>
            <Text style={styles.subPrompt}>Success after 12 weeks</Text>
            <Controller
              control={control}
              name="success_vision"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="What would be noticeably different?"
                  minHeight={88}
                  numberOfLines={3}
                  maxLength={300}
                />
              )}
            />
          </View>
        </View>
      );

    case "readiness":
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
          {(values.confidence_level ?? 10) < 7 ? (
            <View>
              <Text style={styles.subPrompt}>
                What makes confidence hard? (optional)
              </Text>
              <Controller
                control={control}
                name="confidence_barriers"
                render={({ field }) => (
                  <TextAreaField
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="A short note helps us adapt the plan."
                    minHeight={80}
                    numberOfLines={3}
                    maxLength={240}
                  />
                )}
              />
            </View>
          ) : null}
        </View>
      );

    case "obstacles":
      return (
        <View style={styles.stack}>
          <Controller
            control={control}
            name="obstacles"
            render={({ field }) => (
              <ChipMultiSelect
                options={OBSTACLE_OPTIONS}
                value={(field.value ?? []) as Obstacle[]}
                maxSelections={2}
                onChange={(next) => {
                  field.onChange(next);
                  setValue("top_obstacles", next);
                  if (!next.includes("other")) setValue("other_obstacle", "");
                }}
                otherValue={"other"}
                otherText={values.other_obstacle ?? ""}
                onOtherTextChange={(v) => setValue("other_obstacle", v)}
              />
            )}
          />
          <View>
            <Text style={styles.subPrompt}>
              What makes the biggest one hard? (optional)
            </Text>
            <Controller
              control={control}
              name="obstacle_deep_dive"
              render={({ field }) => (
                <TextAreaField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Add context if you want to."
                  minHeight={80}
                  numberOfLines={3}
                  maxLength={240}
                />
              )}
            />
          </View>
        </View>
      );

    case "context":
      return (
        <View style={styles.stack}>
          <View>
            <Text style={styles.subPrompt}>Work</Text>
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
          </View>
          <View>
            <Text style={styles.subPrompt}>Home</Text>
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
          </View>
        </View>
      );

    case "coaching-style":
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
});
