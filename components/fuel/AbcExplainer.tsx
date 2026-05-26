import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

const STEPS = [
  { letter: 'A', title: 'ANCHOR', tint: COLORS.deepGreen, body: 'Protein, picked first.' },
  { letter: 'B', title: 'BUILD', tint: COLORS.tangerine, body: 'Fiber, carbs, fat — round it out.' },
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
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.ctaText, { color: colors.accent }]}>BUILD A MEAL</Text>
            <ArrowRight color={colors.accent} size={14} strokeWidth={2.4} />
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
    flexDirection: 'row',
    gap: 5,
  },
  ctaText: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  footer: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
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
    flex: 1,
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
