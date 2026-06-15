// app/non-member-diagnostic.tsx
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
import { useMembership } from '../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../lib/brand';

const light = THEME_COLORS.light;

export default function NonMemberDiagnosticScreen() {
  const { session } = useAuth();
  const { recordNonMember } = useMembership();
  const [friction, setFriction] = useState('');
  const [stoppingPoint, setStoppingPoint] = useState('');
  const [step, setStep] = useState<0 | 1>(0);
  const [submitting, setSubmitting] = useState(false);

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  const canContinue = step === 0 ? friction.trim().length > 1 : stoppingPoint.trim().length > 1;

  const onNext = async () => {
    if (step === 0) { setStep(1); return; }
    setSubmitting(true);
    try {
      await recordNonMember({ friction: friction.trim(), stoppingPoint: stoppingPoint.trim() });
      router.replace('/non-member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.frame}>
          <View style={styles.topBar}>
            <Pressable onPress={() => (step === 0 ? router.back() : setStep(0))} hitSlop={8}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>2 QUICK QUESTIONS · {step + 1} OF 2</Text>
            <Text style={styles.headline}>
              {step === 0 ? "What's your friction?" : "What's your big stopping point?"}
            </Text>
            <Text style={styles.body}>
              {step === 0
                ? 'The thing that gets in the way most often.'
                : 'The wall you keep hitting when you try to make progress.'}
            </Text>

            <TextInput
              accessibilityLabel={step === 0 ? 'Your friction' : 'Your stopping point'}
              autoCorrect
              editable={!submitting}
              multiline
              onChangeText={step === 0 ? setFriction : setStoppingPoint}
              placeholder="Type freely."
              placeholderTextColor={light.mutedText}
              style={styles.input}
              value={step === 0 ? friction : stoppingPoint}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              disabled={!canContinue || submitting}
              onPress={onNext}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: COLORS.tangerine, opacity: pressed ? 0.85 : (!canContinue || submitting) ? 0.5 : 1 },
              ]}
            >
              <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                {step === 0 ? 'Continue' : submitting ? 'Saving…' : 'Done'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { color: light.mutedText, fontFamily: FONTS.sansMedium, fontSize: 14 },
  body: { color: light.mutedText, fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22, marginBottom: 18, marginTop: 6 },
  content: { paddingBottom: 24, paddingHorizontal: SPACING.screenX, paddingTop: 24 },
  cta: { alignItems: 'center', borderRadius: 14, paddingVertical: 16 },
  ctaText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: -0.1 },
  footer: { paddingBottom: 12, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  headline: {
    color: light.text, fontFamily: FONTS.sansBold, fontSize: 26, letterSpacing: -0.4, lineHeight: 32, marginTop: 6,
  },
  input: {
    backgroundColor: light.card, borderColor: light.border, borderRadius: 14, borderWidth: 1,
    color: light.text, fontFamily: FONTS.sans, fontSize: 16, lineHeight: 22, minHeight: 140,
    paddingHorizontal: 14, paddingVertical: 14, textAlignVertical: 'top',
  },
  kicker: { color: COLORS.tigerGold, fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 1.4 },
  screen: { alignItems: 'center', flex: 1 },
  topBar: { paddingHorizontal: SPACING.screenX, paddingTop: 6 },
});
