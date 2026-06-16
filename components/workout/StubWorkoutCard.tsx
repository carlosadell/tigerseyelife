// components/workout/StubWorkoutCard.tsx
import { Lock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type StubWorkoutCardProps = {
  title: string;
};

export function StubWorkoutCard({ title }: StubWorkoutCardProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.iconRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.cardAlt }]}>
          <Lock color={colors.mutedText} size={16} strokeWidth={1.8} />
        </View>
        <Text style={[styles.badge, { color: colors.mutedText }]}>COMING SOON</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.helper, { color: colors.mutedText }]}>
        Karen and Ryan are loading this one.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    minHeight: 148,
    opacity: 0.78,
    padding: 14,
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
