import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

export function RestTimerOverlay() {
  const colors = useThemeColors();
  const restTimer = useActiveWorkoutStore((state) => state.restTimer);
  const setRestTimer = useActiveWorkoutStore((state) => state.setRestTimer);

  if (!restTimer) return null;

  return (
    <View style={[styles.rest, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.restTime, { color: colors.accent }]}>{restTimer.secondsLeft}</Text>
      <Text style={[styles.kicker, { color: colors.mutedText }]}>REST · NEXT SET IN</Text>
      <Pressable onPress={() => setRestTimer(null)}>
        <Text style={[styles.skip, { color: colors.mutedText }]}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  rest: {
    alignItems: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    bottom: 0,
    gap: 8,
    left: 0,
    padding: 24,
    position: 'absolute',
    right: 0,
  },
  restTime: {
    fontFamily: FONTS.diagnostic,
    fontSize: 80,
    lineHeight: 80,
  },
  skip: {
    fontFamily: FONTS.sansBold,
  },
});
