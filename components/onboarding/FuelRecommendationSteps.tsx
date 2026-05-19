import { Text, View } from 'react-native';

import { ChipGroup, TagGroup } from './OnboardingFields';
import { ChoiceCard, OnboardingButton, StepLabel } from './OnboardingPrimitives';
import { stepStyles } from './OnboardingStepStyles';
import {
  onboardingTags,
  SelectedTags,
  TagKey,
  TrainingConfig,
} from './onboardingData';

type FuelStepProps = {
  selectedTags: SelectedTags;
  setTrainingValue: <K extends keyof TrainingConfig>(key: K, value: TrainingConfig[K]) => void;
  toggleTag: (key: TagKey, value: string) => void;
  training: TrainingConfig;
};

export function FuelStep({ selectedTags, setTrainingValue, toggleTag, training }: FuelStepProps) {
  return (
    <View style={stepStyles.step}>
      <StepLabel>Fuel</StepLabel>
      <Text style={stepStyles.title}>How do you want to approach nutrition?</Text>
      {['Hand portions', 'Calories + protein', 'Full macros'].map((value) => (
        <ChoiceCard
          active={training.nutrition === value}
          description={fuelDescription(value)}
          key={value}
          label={value}
          onPress={() => setTrainingValue('nutrition', value)}
        />
      ))}
      <ChipGroup
        active={training.dietary}
        label="How do you eat?"
        onPress={(value) => setTrainingValue('dietary', value)}
        values={['Omnivore', 'Pescatarian', 'Vegetarian', 'Vegan']}
      />
      <TagGroup
        active={selectedTags.avoidances}
        label="Anything to avoid?"
        onPress={(value) => toggleTag('avoidances', value)}
        values={onboardingTags.avoidances}
      />
    </View>
  );
}

export function RecommendationStep({
  onSkip,
  submitting,
}: {
  onSkip: () => void;
  submitting: boolean;
}) {
  return (
    <View style={stepStyles.step}>
      <StepLabel>Assignment</StepLabel>
      <Text style={stepStyles.title}>We will match you with the right program.</Text>
      <View style={stepStyles.infoCard}>
        <Text style={stepStyles.cardTitle}>Your intake goes to Karen and Ryan.</Text>
        <Text style={stepStyles.copy}>
          You will enter the app in an awaiting-assignment state. Once Ryan slots your program,
          Train will unlock your current path, today&apos;s workout, and tutorial support.
        </Text>
      </View>
      <OnboardingButton disabled={submitting} onPress={onSkip} variant="ghost">
        Skip practice for now
      </OnboardingButton>
    </View>
  );
}

function fuelDescription(value: string) {
  if (value === 'Hand portions') return 'ABC Power Meals. No counting.';
  if (value === 'Calories + protein') return 'See the numbers without obsessing.';
  return 'Protein, carbs, fats: the full picture.';
}
