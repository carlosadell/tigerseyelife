import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

const STEPS = [
  {
    letter: 'A',
    title: 'Anchor',
    tint: COLORS.deepGreen,
    body: 'Pick your protein first, at the right proportion for your day. This is the load-bearing piece of the meal.',
  },
  {
    letter: 'B',
    title: 'Build',
    tint: COLORS.tangerine,
    body: "Layer in fiber, carbs, and fat based on what your energy and body composition actually need.",
  },
  {
    letter: 'C',
    title: 'Complete',
    tint: COLORS.evidenceBlue,
    body: 'Add the thing that makes it feel like a meal you chose — herbs, a sauce, a sprinkle of nuts. Never deprivation.',
  },
];

export function AbcExplainer() {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={expanded ? 'Tap to collapse' : 'Tap to expand'}
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [styles.head, { opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, { color: colors.accent }]}>ABC POWER MEALS</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Anchor · Build · Complete
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedText }]}>
            Karen and Ryan's framework for putting a meal together without counting.
          </Text>
        </View>
        <View style={[styles.chevWrap, { backgroundColor: colors.cardAlt }]}>
          <Chevron color={colors.mutedText} size={18} strokeWidth={2} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {STEPS.map((step) => (
            <View key={step.letter} style={styles.step}>
              <View style={[styles.stepBadge, { backgroundColor: step.tint }]}>
                <Text style={styles.stepBadgeText}>{step.letter}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                <Text style={[styles.stepBody, { color: colors.mutedText }]}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chevWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  step: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  stepBadge: {
    alignItems: 'center',
    borderRadius: 7,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  stepBody: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 1,
  },
  stepTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  tagline: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 4,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: -0.1,
    marginTop: 2,
  },
});
