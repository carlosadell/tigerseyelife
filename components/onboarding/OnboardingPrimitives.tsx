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
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === 'ghost' ? styles.ghostButton : styles.primaryButton,
        disabled && styles.disabled,
      ]}
    >
      <Text style={variant === 'ghost' ? styles.ghostButtonText : styles.primaryButtonText}>
        {children}
      </Text>
    </Pressable>
  );
}

export function ChoiceCard({ active, description, label, onPress }: ChoiceProps) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}>
      <View style={styles.choiceDot}>{active ? <View style={styles.choiceDotInner} /> : null}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceLabel}>{label}</Text>
        {description ? <Text style={styles.choiceDescription}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

export function ChoicePill({ active, label, onPress }: ChoiceProps) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
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
  return <Text style={styles.stepLabel}>[ {children} ]</Text>;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  choiceActive: {
    borderColor: COLORS.tigerGold,
  },
  choiceDescription: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  choiceDot: {
    alignItems: 'center',
    borderColor: COLORS.tigerGold,
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  choiceDotInner: {
    backgroundColor: COLORS.tigerGold,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  choiceLabel: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.48,
  },
  dot: {
    backgroundColor: light.cardAlt,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: COLORS.tigerGold,
    width: 28,
  },
  dotDone: {
    backgroundColor: COLORS.deepGreen,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: light.border,
    borderWidth: 1,
  },
  ghostButtonText: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
  },
  pill: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pillActive: {
    backgroundColor: COLORS.tigerGold,
    borderColor: COLORS.tigerGold,
  },
  pillText: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  pillTextActive: {
    color: COLORS.onyx,
    fontFamily: FONTS.sansBold,
  },
  primaryButton: {
    backgroundColor: COLORS.tigerGold,
  },
  primaryButtonText: {
    color: COLORS.onyx,
    fontFamily: FONTS.sansBold,
  },
  stepLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.65,
    textTransform: 'uppercase',
  },
});
