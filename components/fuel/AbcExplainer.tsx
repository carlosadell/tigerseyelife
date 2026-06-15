import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, ctaTextOnTangerine } from '../../lib/brand';


const STEPS = [
  { letter: 'A', title: 'ANCHOR', tint: COLORS.deepGreen, body: 'Protein, picked first.' },
  { letter: 'B', title: 'BUILD', tint: COLORS.tangerine, body: 'Fiber, carbs, fat. Round it out.' },
  { letter: 'C', title: 'COMPLETE', tint: COLORS.evidenceBlue, body: 'Herbs, sauce, the joy. Never deprivation.' },
];

type AbcExplainerProps = {
  libraryMealsLogged: number;
  totalMealsLogged: number;
  onBuildPress?: () => void;
};

export function AbcExplainer({
  libraryMealsLogged,
  totalMealsLogged,
  onBuildPress,
}: AbcExplainerProps) {
  const colors = useThemeColors();
  const { mode } = useTheme();
  const ctaText = ctaTextOnTangerine(mode);
  const statusLine = formatStatusLine(libraryMealsLogged, totalMealsLogged);
  const allFramework = totalMealsLogged > 0 && libraryMealsLogged === totalMealsLogged;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <Text style={[styles.kicker, { color: colors.accent }]}>ABC POWER MEALS</Text>
        <Text style={[styles.attribution, { color: colors.mutedText }]}>KAREN + RYAN</Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step) => (
          <View key={step.letter} style={styles.step}>
            <View style={[styles.badge, { backgroundColor: step.tint }]}>
              <Text style={styles.badgeText}>{step.letter}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.stepLine, { color: colors.mutedText }]}>{step.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text
          style={[
            styles.status,
            { color: allFramework ? colors.accent : colors.mutedText },
          ]}
        >
          {statusLine}
        </Text>
        {onBuildPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Build a meal"
            onPress={onBuildPress}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <View
              style={[
                styles.cta,
                {
                  backgroundColor: COLORS.tangerine,
                  shadowColor: COLORS.tangerine,
                },
              ]}
            >
              <Text style={[styles.ctaText, { color: ctaText }]}>BUILD A MEAL</Text>
              <View style={styles.ctaArrow} pointerEvents="none">
                <ArrowRight color={ctaText} size={18} strokeWidth={2.6} />
              </View>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function formatStatusLine(library: number, total: number): string {
  if (total === 0) return 'NO MEALS LOGGED TODAY';
  if (library === total) {
    return total === 1
      ? '1 MEAL · BUILT WITH FRAMEWORK ✓'
      : `ALL ${total} MEALS · BUILT WITH FRAMEWORK ✓`;
  }
  return `${library} OF ${total} MEALS · BUILT WITH FRAMEWORK`;
}

const styles = StyleSheet.create({
  attribution: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.6,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 7,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cta: {
    alignItems: 'center',
    borderRadius: 10,
    elevation: 4,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 50,
    paddingHorizontal: 18,
    position: 'relative',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  ctaArrow: {
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    top: 0,
  },
  ctaText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
  },
  head: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  status: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  step: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  stepBody: {
    flex: 1,
    minWidth: 0,
  },
  stepLine: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 1,
  },
  stepTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  steps: {
    gap: 10,
  },
});
