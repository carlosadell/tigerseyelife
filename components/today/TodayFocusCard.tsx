import { ChevronRight, Target } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Focus = {
  kicker: string;
  title: string;
  description: string;
};

const COMMIT_BLOCK_FOCUSES: Focus[] = [
  {
    kicker: 'COMMIT BLOCK',
    title: 'Read one food label today',
    description: 'Pick anything you ate. Check the added sugar.',
  },
  {
    kicker: 'COMMIT BLOCK',
    title: 'Protein + vegetables, every meal',
    description: 'Savory meals lead with protein and veggies. Build around that.',
  },
  {
    kicker: 'COMMIT BLOCK',
    title: 'Cut your added sugar by half',
    description: 'Pick one sweetened drink or snack you have most days. Skip it today.',
  },
];

type TodayFocusCardProps = {
  onPress?: () => void;
};

export function TodayFocusCard({ onPress }: TodayFocusCardProps) {
  const colors = useThemeColors();

  const focus = useMemo(() => {
    const day = new Date().getDate();
    return COMMIT_BLOCK_FOCUSES[day % COMMIT_BLOCK_FOCUSES.length];
  }, []);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={focus.title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && onPress ? { opacity: 0.92 } : null,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWell, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <Target color={colors.accent} size={20} strokeWidth={2.2} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.kicker, { color: colors.mutedText }]}>{focus.kicker}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{focus.title}</Text>
          <Text style={[styles.description, { color: colors.mutedText }]}>{focus.description}</Text>
        </View>
        {onPress ? <ChevronRight color={colors.accent} size={20} strokeWidth={2.4} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  description: {
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 18,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: -0.1,
    lineHeight: 22,
  },
});
