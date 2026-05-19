import { Text, View } from 'react-native';

import { ChoicePill } from './OnboardingPrimitives';
import { stepStyles } from './OnboardingStepStyles';

type ChipGroupProps = {
  active: string;
  label: string;
  onPress: (value: string) => void;
  values: string[];
};

type TagGroupProps = {
  active: string[];
  label: string;
  maxSelections?: number;
  onPress: (value: string) => void;
  values: string[];
};

export function ChipGroup({ active, label, onPress, values }: ChipGroupProps) {
  return (
    <View style={stepStyles.question}>
      <Text style={stepStyles.cardTitle}>{label}</Text>
      <View style={stepStyles.pillRow}>
        {values.map((value) => (
          <ChoicePill active={active === value} key={value} label={value} onPress={() => onPress(value)} />
        ))}
      </View>
    </View>
  );
}

export function TagGroup({ active, label, maxSelections, onPress, values }: TagGroupProps) {
  return (
    <View style={stepStyles.question}>
      <Text style={stepStyles.cardTitle}>{label}</Text>
      {maxSelections ? (
        <Text style={stepStyles.smallCopy}>
          {active.length}/{maxSelections} selected
        </Text>
      ) : null}
      <View style={stepStyles.pillRow}>
        {values.map((value) => (
          <ChoicePill active={active.includes(value)} key={value} label={value} onPress={() => onPress(value)} />
        ))}
      </View>
    </View>
  );
}
