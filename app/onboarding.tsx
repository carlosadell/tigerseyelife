import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLockup } from '../components/brand/BrandLockup';
import { FirstFiveMinutes } from '../components/onboarding/FirstFiveMinutes';
import { FuelStep, RecommendationStep } from '../components/onboarding/FuelRecommendationSteps';
import { OnboardingButton, ProgressDots } from '../components/onboarding/OnboardingPrimitives';
import {
  PowerStep,
  ProgramPreferenceStep,
  TrainingStep,
  WorkoutSetupStep,
} from '../components/onboarding/PowerTrainingSteps';
import { WelcomeStep, WhyStep } from '../components/onboarding/WelcomeWhySteps';
import {
  Baseline,
  ExperienceLevel,
  SelectedTags,
  TagKey,
  TrainingConfig,
  initialBaseline,
  initialSelectedTags,
  initialTraining,
} from '../components/onboarding/onboardingData';
import { useAuth } from '../hooks/useAuth';
import { OnboardingPayload, useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { COLORS } from '../lib/brand';
import { onboardingStyles as styles } from '../components/onboarding/onboardingScreenStyles';

const totalSteps = 9;

export default function OnboardingScreen() {
  const { loading: authLoading, session, signOut } = useAuth();
  const { completeOnboarding, completed, loading: onboardingLoading } = useOnboardingStatus();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [bigWhy, setBigWhy] = useState('');
  const [changeNow, setChangeNow] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('returning');
  const [baseline, setBaseline] = useState<Baseline>(initialBaseline);
  const [training, setTraining] = useState<TrainingConfig>(initialTraining);
  const [selectedTags, setSelectedTags] = useState<SelectedTags>(initialSelectedTags);

  const progressIndex = Math.min(step, totalSteps - 1);
  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(firstName.trim() && bigWhy.trim());
    return true;
  }, [bigWhy, firstName, step]);

  if (authLoading || onboardingLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.tigerGold} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (completed) return <Redirect href="/(tabs)/today" />;

  const updateBaseline = (key: string, value: string) => {
    setBaseline((current) => ({ ...current, [key]: value }));
  };

  const setTrainingValue = <K extends keyof TrainingConfig>(key: K, value: TrainingConfig[K]) => {
    setTraining((current) => ({ ...current, [key]: value }));
  };

  const toggleTag = (key: TagKey, value: string) => {
    setSelectedTags((current) => {
      const base = current[key];
      const next = base.includes(value) ? base.filter((item) => item !== value) : [...base, value];
      if (key === 'goals') return { ...current, goals: next.slice(-2) };
      return { ...current, [key]: next };
    });
  };

  const submit = async (skippedFirstFive = false) => {
    setSubmitting(true);
    const payload: OnboardingPayload = {
      bigWhy: bigWhy || 'Build strength and energy with intention.',
      changeNow,
      experienceLevel,
      firstName,
      powerBaseline: {
        ...baseline,
        first_five_completed: skippedFirstFive ? 'skipped' : 'completed',
        recommended_program: 'Awaiting Ryan assignment',
      },
      intakeAnswers: {
        practice_baseline: baseline,
        workout_setup: {
          days_per_week: training.days,
          equipment: training.equipment,
          duration: training.duration,
          goals: selectedTags.goals,
          sports_or_activities: selectedTags.sports,
        },
        program_preference: training.livePreference,
        nutrition: {
          approach: training.nutrition,
          dietary_pattern: training.dietary,
          avoidances: selectedTags.avoidances,
        },
        strength_training_experience: training.experience,
      },
    };

    try {
      await completeOnboarding(payload);
      router.replace('/(tabs)/today');
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setStep((current) => Math.min(totalSteps - 1, current + 1));
  const back = () => setStep((current) => Math.max(0, current - 1));

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.topBar}>
          <BrandLockup width={170} />
          <Text onPress={signOut} style={styles.exit}>
            Sign out
          </Text>
        </View>
        <View style={styles.progressRow}>
          <ProgressDots current={progressIndex} total={totalSteps} />
          <Text style={styles.progressText}>
            {progressIndex + 1}/{totalSteps}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>
        {step < totalSteps - 1 ? (
          <View style={styles.footer}>
            {step > 0 ? (
              <OnboardingButton onPress={back} variant="ghost">
                Back
              </OnboardingButton>
            ) : null}
            <View style={{ flex: 1 }}>
              <OnboardingButton disabled={!canContinue || submitting} onPress={next}>
                {step === totalSteps - 2 ? 'Start First Five Minutes' : 'Continue'}
              </OnboardingButton>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  function renderStep() {
    if (step === 0) return <WelcomeStep />;
    if (step === 1) {
      return (
        <WhyStep
          bigWhy={bigWhy}
          changeNow={changeNow}
          firstName={firstName}
          setBigWhy={setBigWhy}
          setChangeNow={setChangeNow}
          setFirstName={setFirstName}
        />
      );
    }
    if (step === 2) return <PowerStep baseline={baseline} updateBaseline={updateBaseline} />;
    if (step === 3) {
      return (
        <TrainingStep
          experienceLevel={experienceLevel}
          selectedTags={selectedTags}
          setExperienceLevel={setExperienceLevel}
          setTrainingValue={setTrainingValue}
          toggleTag={toggleTag}
          training={training}
        />
      );
    }
    if (step === 4) {
      return (
        <WorkoutSetupStep
          experienceLevel={experienceLevel}
          selectedTags={selectedTags}
          setExperienceLevel={setExperienceLevel}
          setTrainingValue={setTrainingValue}
          toggleTag={toggleTag}
          training={training}
        />
      );
    }
    if (step === 5) {
      return <ProgramPreferenceStep setTrainingValue={setTrainingValue} training={training} />;
    }
    if (step === 6) {
      return (
        <FuelStep
          selectedTags={selectedTags}
          setTrainingValue={setTrainingValue}
          toggleTag={toggleTag}
          training={training}
        />
      );
    }
    if (step === 7) return <RecommendationStep onSkip={() => submit(true)} submitting={submitting} />;
    return <FirstFiveMinutes onComplete={() => submit(false)} />;
  }
}
