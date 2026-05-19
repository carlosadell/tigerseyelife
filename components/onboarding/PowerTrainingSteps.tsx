import { Text, View } from 'react-native';

import { ChipGroup, TagGroup } from './OnboardingFields';
import { ChoiceCard, ChoicePill, StepLabel } from './OnboardingPrimitives';
import { stepStyles } from './OnboardingStepStyles';
import {
  Baseline,
  ExperienceLevel,
  onboardingTags,
  SelectedTags,
  TagKey,
  TrainingConfig,
  practiceBaselineQuestions,
  strengthExperienceOptions,
} from './onboardingData';

type PowerStepProps = {
  baseline: Baseline;
  updateBaseline: (key: string, value: string) => void;
};

type TrainingStepProps = {
  experienceLevel: ExperienceLevel;
  selectedTags: SelectedTags;
  setExperienceLevel: (value: ExperienceLevel) => void;
  setTrainingValue: <K extends keyof TrainingConfig>(key: K, value: TrainingConfig[K]) => void;
  toggleTag: (key: TagKey, value: string) => void;
  training: TrainingConfig;
};

export function PowerStep({ baseline, updateBaseline }: PowerStepProps) {
  return (
    <View style={stepStyles.step}>
      <StepLabel>Practice Baseline</StepLabel>
      <Text style={stepStyles.title}>Where are you right now?</Text>
      <Text style={stepStyles.copy}>
        These thread names are placeholders while Karen finalizes the framework language.
      </Text>
      {practiceBaselineQuestions.map(([key, label, copy]) => (
        <View key={key} style={stepStyles.question}>
          <Text style={stepStyles.cardTitle}>{label}</Text>
          <Text style={stepStyles.smallCopy}>{copy}</Text>
          <View style={stepStyles.pillRow}>
            {['low', 'sometimes', 'strong'].map((value) => (
              <ChoicePill
                active={baseline[key] === value}
                key={value}
                label={value}
                onPress={() => updateBaseline(key, value)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function TrainingStep(props: TrainingStepProps) {
  return (
    <View style={stepStyles.step}>
      <StepLabel>Strength Experience</StepLabel>
      <Text style={stepStyles.title}>How should Ryan read your training history?</Text>
      <Text style={stepStyles.cardTitle}>Your experience with strength training (choose up to 2)</Text>
      {strengthExperienceOptions.map((option) => (
        <ChoiceCard
          active={props.training.experience.includes(option.value)}
          description={experienceDescription(option.value)}
          key={option.value}
          label={option.label}
          onPress={() => {
            const nextExperience = toggleExperience(props.training.experience, option.value);
            props.setTrainingValue('experience', nextExperience);
            props.setExperienceLevel(mapExperienceLevel(nextExperience));
          }}
        />
      ))}
    </View>
  );
}

export function WorkoutSetupStep(props: TrainingStepProps) {
  return (
    <View style={stepStyles.step}>
      <StepLabel>Workout Setup</StepLabel>
      <Text style={stepStyles.title}>Let's build around your real life.</Text>
      <ChipGroup
        active={props.training.days}
        label="Days per week"
        onPress={(value) => props.setTrainingValue('days', value)}
        values={['3 days', '4 days', '5 days']}
      />
      <ChipGroup
        active={props.training.equipment}
        label="Equipment"
        onPress={(value) => props.setTrainingValue('equipment', value)}
        values={['Home basics', 'Home gym', 'Full gym']}
      />
      <ChipGroup
        active={props.training.duration}
        label="Session length"
        onPress={(value) => props.setTrainingValue('duration', value)}
        values={['30 min', '45 min', '60 min']}
      />
      <TagGroup
        active={props.selectedTags.goals}
        label="What matters most? (pick up to 2)"
        maxSelections={2}
        onPress={(value) => props.toggleTag('goals', value)}
        values={onboardingTags.goals}
      />
      <TagGroup
        active={props.selectedTags.sports}
        label="Training for a specific sport or activity"
        onPress={(value) => props.toggleTag('sports', value)}
        values={onboardingTags.sports}
      />
    </View>
  );
}

export function ProgramPreferenceStep({
  setTrainingValue,
  training,
}: {
  setTrainingValue: <K extends keyof TrainingConfig>(key: K, value: TrainingConfig[K]) => void;
  training: TrainingConfig;
}) {
  return (
    <View style={stepStyles.step}>
      <StepLabel>Program Preference</StepLabel>
      <Text style={stepStyles.title}>Live energy or flexible training?</Text>
      <ChoiceCard
        active={training.livePreference === 'Live group sessions'}
        description="I want the structure and accountability of scheduled live sessions."
        label="Live group sessions"
        onPress={() => setTrainingValue('livePreference', 'Live group sessions')}
      />
      <ChoiceCard
        active={training.livePreference === 'Pre-recorded flexibility'}
        description="I want to train on my own schedule with guided videos."
        label="Pre-recorded flexibility"
        onPress={() => setTrainingValue('livePreference', 'Pre-recorded flexibility')}
      />
      <ChoiceCard
        active={training.livePreference === 'Written + tutorials'}
        description="I prefer written workouts with tutorial support."
        label="Written + tutorials"
        onPress={() => setTrainingValue('livePreference', 'Written + tutorials')}
      />
    </View>
  );
}

function experienceDescription(value: string) {
  if (value === 'novice') return 'You want a clean start and confident fundamentals.';
  if (value === 'rusty') return 'You have trained before, but consistency has been away for a while.';
  if (value === 'designed_program') return 'You already understand structured progressions.';
  if (value === 'gym_app') return 'You have app-guided experience and want stronger coaching context.';
  if (value === 'free_weights_comfortable') return 'You are comfortable with free-weight strength work.';
  return 'You know your way around machines and structured gym equipment.';
}

function toggleExperience(current: string[], value: string) {
  if (current.includes(value)) return current.filter((item) => item !== value);
  return [...current, value].slice(-2);
}

function mapExperienceLevel(values: string[]): ExperienceLevel {
  if (values.includes('designed_program') || values.includes('free_weights_comfortable') || values.includes('machines_comfortable')) {
    return 'advanced';
  }

  if (values.includes('rusty') || values.includes('gym_app')) {
    return 'returning';
  }

  return 'new';
}
