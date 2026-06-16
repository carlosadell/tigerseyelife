// components/onboarding/IntakeStep.tsx
import { ChevronLeft } from 'lucide-react-native';
import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IntakeProgressDots } from './IntakeProgressDots';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  totalSteps: number;
  stepIndex: number; // 0-indexed
  kicker?: string;
  prompt: string;
  helper?: string;
  children: ReactNode;
  canContinue: boolean;
  ctaLabel?: string;
  onContinue: () => void | Promise<void>;
  onBack?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
  submitting?: boolean;
};

/**
 * Common shell for every intake step. Composes: top bar with back arrow +
 * progress dots; header (kicker + prompt + helper); body slot; footer with
 * primary CTA + optional skip.
 */
export function IntakeStep({
  totalSteps,
  stepIndex,
  kicker,
  prompt,
  helper,
  children,
  canContinue,
  ctaLabel = 'Continue',
  onContinue,
  onBack,
  showSkip,
  onSkip,
  submitting,
}: Props) {
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.frame}>
          <View style={styles.topBar}>
            {onBack ? (
              <Pressable accessibilityLabel="Back" hitSlop={10} onPress={onBack} style={styles.backBtn}>
                <ChevronLeft color={light.text} size={24} />
              </Pressable>
            ) : (
              <View style={styles.backBtn} />
            )}
            <View style={styles.progressWrap}>
              <IntakeProgressDots total={totalSteps} current={stepIndex} />
            </View>
            <View style={styles.backBtn} />
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
              <Text style={styles.prompt}>{prompt}</Text>
              {helper ? <Text style={styles.helper}>{helper}</Text> : null}
            </View>
            <View style={styles.body}>{children}</View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
              disabled={!canContinue || submitting}
              onPress={onContinue}
              style={({ pressed }) => ({
                opacity: pressed
                  ? 0.85
                  : !canContinue || submitting
                    ? 0.4
                    : 1,
              })}
            >
              <View style={styles.cta}>
                <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                  {submitting ? 'Saving...' : ctaLabel}
                </Text>
              </View>
            </Pressable>
            {showSkip ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Skip"
                disabled={submitting}
                onPress={onSkip}
                style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    height: 32,
    width: 32,
  },
  body: {
    gap: 12,
    marginTop: 24,
  },
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
  footer: {
    gap: 4,
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
  },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  progressWrap: {
    flex: 1,
  },
  prompt: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 30,
    marginTop: 6,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  skip: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: SPACING.screenX,
  },
});
