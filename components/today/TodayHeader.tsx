// components/today/TodayHeader.tsx
import { ChevronLeft, ChevronRight, Droplet, User } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { coachStillForToday } from '../../lib/coachStills';
import { FONTS, THEME_COLORS } from '../../lib/brand';
import { useStreak } from '../../hooks/useStreak';

const light = THEME_COLORS.light;

type TodayHeaderProps = {
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onProfilePress?: () => void;
};

/**
 * Top row: gold water-drop streak (left) · "This Week" pill (center) ·
 * coach photo + user circle with notif dot (right).
 *
 * Mirrors the App Store reference structure with every blue swapped for
 * tigerGold and the user avatar collapsed to a Lucide outline (we don't have
 * a user photo asset).
 */
export function TodayHeader({ onPrevWeek, onNextWeek, onProfilePress }: TodayHeaderProps) {
  const { days } = useStreak();
  const coachUri = coachStillForToday();

  return (
    <View style={styles.row}>
      <View style={styles.streak}>
        <Droplet color={light.accent} fill={light.accent} size={14} />
        <Text style={styles.streakValue}>{days}</Text>
      </View>

      <View style={styles.pill}>
        <Pressable accessibilityLabel="Previous week" disabled={!onPrevWeek} hitSlop={8} onPress={onPrevWeek}>
          <ChevronLeft color={light.mutedText} size={14} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.pillLabel}>This Week</Text>
        <Pressable accessibilityLabel="Next week" disabled={!onNextWeek} hitSlop={8} onPress={onNextWeek}>
          <ChevronRight color={light.mutedText} size={14} strokeWidth={2.4} />
        </Pressable>
      </View>

      <Pressable
        accessibilityLabel="Profile"
        onPress={onProfilePress}
        style={({ pressed }) => [styles.avatarRow, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={styles.coach}>
          <Image source={{ uri: coachUri }} style={styles.coachPhoto} />
          <View style={styles.greenDot} />
        </View>
        <View style={styles.user}>
          <User color={light.mutedText} size={14} strokeWidth={2.2} />
          <View style={styles.redDot} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRow: { alignItems: 'center', flexDirection: 'row' },
  coach: { borderRadius: 999, height: 30, overflow: 'hidden', position: 'relative', width: 30 },
  coachPhoto: { height: 30, width: 30 },
  greenDot: {
    backgroundColor: '#2ECC71',
    borderColor: light.background,
    borderRadius: 999,
    borderWidth: 2,
    bottom: -1,
    height: 9,
    position: 'absolute',
    right: -1,
    width: 9,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillLabel: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  redDot: {
    backgroundColor: '#C42626',
    borderColor: light.background,
    borderRadius: 999,
    borderWidth: 2,
    height: 9,
    position: 'absolute',
    right: -1,
    top: -1,
    width: 9,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streak: { alignItems: 'center', flexDirection: 'row', gap: 4, minWidth: 56 },
  streakValue: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
  },
  user: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderColor: light.background,
    borderRadius: 999,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    marginLeft: -8,
    position: 'relative',
    width: 30,
  },
});
