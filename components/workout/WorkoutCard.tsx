// components/workout/WorkoutCard.tsx
import { ArrowRight, Dumbbell } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type WorkoutCardProps = {
  title: string;
  helper?: string;
  exerciseCount: number;
  onPress: () => void;
};

export function WorkoutCard({ title, helper, exerciseCount, onPress }: WorkoutCardProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1, flex: 1 })}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.iconRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.cardAlt }]}>
            <Dumbbell color={colors.accent} size={18} strokeWidth={1.8} />
          </View>
          <Text style={[styles.count, { color: colors.mutedText }]}>
            {exerciseCount} {exerciseCount === 1 ? 'EXERCISE' : 'EXERCISES'}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {helper ? (
          <Text style={[styles.helper, { color: colors.mutedText }]} numberOfLines={2}>
            {helper}
          </Text>
        ) : null}
        <View style={styles.ctaRow}>
          <Text style={[styles.cta, { color: COLORS.tangerine }]}>Start</Text>
          <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    minHeight: 148,
    padding: 14,
  },
  count: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
  },
  cta: {
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
  ctaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 'auto',
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  iconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
});
