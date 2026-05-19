import { Text, TextInput, useWindowDimensions, View } from 'react-native';

import { EyeMark } from '../brand/EyeMark';
import { StepLabel } from './OnboardingPrimitives';
import { stepStyles } from './OnboardingStepStyles';
import { COLORS } from '../../lib/brand';

type WhyStepProps = {
  bigWhy: string;
  changeNow: string;
  firstName: string;
  setBigWhy: (value: string) => void;
  setChangeNow: (value: string) => void;
  setFirstName: (value: string) => void;
};

export function WelcomeStep() {
  const { width } = useWindowDimensions();
  const compact = width < 430;

  return (
    <View style={stepStyles.step}>
      <View style={[stepStyles.hero, !compact && stepStyles.heroWide]}>
        <View style={[stepStyles.eyeStage, compact && stepStyles.heroCompactMascot]}>
          <EyeMark color={COLORS.tigerGold} size={72} strokeWidth={1.9} />
        </View>
        <View>
          <StepLabel>Welcome</StepLabel>
          <Text style={stepStyles.title}>Stronger by Design.</Text>
          <Text style={stepStyles.copy}>
            We will tune the app to your why, your training reality, and the way you want to be
            coached.
          </Text>
        </View>
      </View>
      <View style={stepStyles.infoCard}>
        <Text style={stepStyles.cardTitle}>This is not a generic tracker.</Text>
        <Text style={stepStyles.copy}>
          TEL helps surface the signals Karen and Ryan use to guide better daily decisions.
        </Text>
      </View>
    </View>
  );
}

export function WhyStep(props: WhyStepProps) {
  return (
    <View style={stepStyles.step}>
      <StepLabel>Big Why</StepLabel>
      <Text style={stepStyles.title}>What are you building toward?</Text>
      <TextInput
        onChangeText={props.setFirstName}
        placeholder="First name"
        placeholderTextColor={COLORS.steel}
        style={stepStyles.input}
        value={props.firstName}
      />
      <TextInput
        multiline
        onChangeText={props.setBigWhy}
        placeholder="The strongest future I am building is..."
        placeholderTextColor={COLORS.steel}
        style={[stepStyles.input, stepStyles.textArea]}
        value={props.bigWhy}
      />
      <TextInput
        multiline
        onChangeText={props.setChangeNow}
        placeholder="What I want to change right now is..."
        placeholderTextColor={COLORS.steel}
        style={[stepStyles.input, stepStyles.textArea]}
        value={props.changeNow}
      />
    </View>
  );
}
