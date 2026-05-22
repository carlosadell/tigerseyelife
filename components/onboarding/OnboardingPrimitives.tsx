import { ArrowRight } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  onPress: () => void;
};

type ChoiceProps = {
  active?: boolean;
  description?: string;
  label: string;
  onPress: () => void;
};

export function OnboardingButton({
  children,
  disabled,
  onPress,
  variant = 'primary',
}: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.ghostButton,
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.92 },
      ]}
    >
      <Text style={isPrimary ? styles.primaryButtonText : styles.ghostButtonText}>{children}</Text>
      {isPrimary ? (
        <View style={styles.primaryArrow} pointerEvents="none">
          <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function ChoiceCard({ active, description, label, onPress }: ChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        active && styles.choiceActive,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={[styles.choiceDot, active && styles.choiceDotActive]}>
        {active ? <View style={styles.choiceDotInner} /> : null}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.choiceLabel}>{label}</Text>
        {description ? <Text style={styles.choiceDescription}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

export function ChoicePill({ active, label, onPress }: ChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && { opacity: 0.92 },
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < current && styles.dotDone,
            index === current && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

export function StepLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.stepLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
    position: 'relative',
  },
  choice: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  choiceActive: {
    backgroundColor: 'rgba(200,159,77,0.06)',
    borderColor: COLORS.tigerGold,
  },
  choiceDescription: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 3,
  },
  choiceDot: {
    alignItems: 'center',
    borderColor: light.border,
    borderRadius: 9,
    borderWidth: 1.4,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  choiceDotActive: {
    borderColor: COLORS.tigerGold,
  },
  choiceDotInner: {
    backgroundColor: COLORS.tigerGold,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  choiceLabel: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  disabled: {
    opacity: 0.48,
  },
  dot: {
    backgroundColor: light.cardAlt,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: COLORS.tangerine,
    width: 22,
  },
  dotDone: {
    backgroundColor: COLORS.tigerGold,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: light.border,
    borderWidth: 1,
  },
  ghostButtonText: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  pill: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pillActive: {
    backgroundColor: COLORS.tigerGold,
    borderColor: COLORS.tigerGold,
  },
  pillText: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 12.5,
    letterSpacing: 0.2,
  },
  pillTextActive: {
    color: COLORS.onyx,
    fontFamily: FONTS.sansBold,
  },
  primaryArrow: {
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    top: 0,
  },
  primaryButton: {
    backgroundColor: COLORS.tangerine,
    elevation: 4,
    shadowColor: COLORS.tangerine,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  stepLabel: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
});
