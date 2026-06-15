// app/non-member-intake.tsx
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../hooks/useAuth';
import {
  useMembership,
  type CoachingStyle,
  type TopObstacle,
} from '../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../lib/brand';

const light = THEME_COLORS.light;

type Step = 0 | 1 | 2;

const OBSTACLE_OPTIONS: { value: TopObstacle; label: string; sub: string }[] = [
  { value: 'time', label: 'Time', sub: 'Hard to carve out the window.' },
  { value: 'motivation', label: 'Motivation', sub: 'Hard to want it on the off days.' },
  { value: 'knowledge', label: "I don't know what to do", sub: 'The plan itself is the obstacle.' },
  { value: 'injury', label: 'Injury / body limits', sub: 'Something physical is in the way.' },
  { value: 'cost', label: 'Cost', sub: 'Budget is the real constraint.' },
  { value: 'other', label: 'Something else', sub: "It doesn't fit the labels above." },
];

const COACHING_OPTIONS: { value: CoachingStyle; label: string; sub: string }[] = [
  { value: 'direct', label: 'Direct, data-driven', sub: 'Tell me what works. Show me the numbers.' },
  { value: 'warm', label: 'Warm + encouraging', sub: 'Meet me where I am. Walk with me.' },
  { value: 'balanced', label: 'Balanced', sub: 'A mix of both, depending on the day.' },
  { value: 'challenging', label: 'Challenge me', sub: 'Push me. Hold me to it.' },
];

/**
 * Ryan's lightweight non-member intake — 3 questions, one per step, to keep it
 * unoverwhelming per the progressive-disclosure principle. Outputs feed
 * the personalized view on /non-member.
 */
export default function NonMemberIntakeScreen() {
  const { session } = useAuth();
  const { recordNonMember } = useMembership();

  const [step, setStep] = useState<Step>(0);
  const [goal, setGoal] = useState('');
  const [obstacle, setObstacle] = useState<TopObstacle | null>(null);
  const [coaching, setCoaching] = useState<CoachingStyle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  const canContinue =
    step === 0 ? goal.trim().length > 2 : step === 1 ? obstacle !== null : coaching !== null;

  const onNext = async () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) { setStep(2); return; }
    if (!obstacle || !coaching) return;
    setSubmitting(true);
    try {
      await recordNonMember({
        goal: goal.trim(),
        topObstacle: obstacle,
        coachingStyle: coaching,
      });
      router.replace('/non-member' as never);
    } finally {
      setSubmitting(false);
    }
  };

  const onBack = () => {
    if (step === 0) {
      router.back();
    } else {
      setStep((step - 1) as Step);
    }
  };

  const total = 3;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.frame}>
          <View style={styles.topBar}>
            <Pressable onPress={onBack} hitSlop={8}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
            <Text style={styles.progress}>{step + 1} of {total}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>TAILOR YOUR PLAN</Text>

            {step === 0 ? (
              <>
                <Text style={styles.headline}>What are you trying to do?</Text>
                <Text style={styles.body}>
                  One sentence is fine. Don't overthink it — we'll go from here.
                </Text>
                <TextInput
                  accessibilityLabel="Your goal"
                  autoCorrect
                  editable={!submitting}
                  multiline
                  onChangeText={setGoal}
                  placeholder="e.g. lose 20 lbs and keep it off"
                  placeholderTextColor={light.mutedText}
                  style={styles.input}
                  value={goal}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Text style={styles.headline}>What gets in the way the most?</Text>
                <Text style={styles.body}>Pick the one that bites you most often.</Text>
                <View style={styles.options}>
                  {OBSTACLE_OPTIONS.map((opt) => {
                    const active = obstacle === opt.value;
                    return (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                        key={opt.value}
                        onPress={() => setObstacle(opt.value)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                      >
                        <View style={[styles.optionCard, active && styles.optionCardActive]}>
                          <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                            {opt.label}
                          </Text>
                          <Text style={styles.optionSub}>{opt.sub}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Text style={styles.headline}>How do you want us to coach you?</Text>
                <Text style={styles.body}>You can change this any time later.</Text>
                <View style={styles.options}>
                  {COACHING_OPTIONS.map((opt) => {
                    const active = coaching === opt.value;
                    return (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                        key={opt.value}
                        onPress={() => setCoaching(opt.value)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                      >
                        <View style={[styles.optionCard, active && styles.optionCardActive]}>
                          <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                            {opt.label}
                          </Text>
                          <Text style={styles.optionSub}>{opt.sub}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              disabled={!canContinue || submitting}
              onPress={onNext}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : (!canContinue || submitting) ? 0.5 : 1 })}
            >
              <View style={styles.cta}>
                <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                  {step < 2 ? 'Continue' : submitting ? 'Saving…' : 'See my plan'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { color: light.mutedText, fontFamily: FONTS.sansMedium, fontSize: 14 },
  body: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
    marginTop: 6,
  },
  content: { paddingBottom: 24, paddingHorizontal: SPACING.screenX, paddingTop: 24 },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: -0.1 },
  footer: { paddingBottom: 12, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  headline: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
    marginTop: 6,
  },
  input: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  optionCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  optionCardActive: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  optionLabel: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  optionLabelActive: {
    color: light.accent,
  },
  optionSub: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  options: {
    marginTop: 4,
  },
  progress: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  screen: { alignItems: 'center', flex: 1 },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: 6,
  },
});
