import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EyeMark } from '../brand/EyeMark';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS } from '../../lib/brand';

type CoachFloatingButtonProps = {
  onPress: () => void;
};

export function CoachFloatingButton({ onPress }: CoachFloatingButtonProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 1600,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 0,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.55] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.36, 0] });

  const openCoach = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulse,
          { borderColor: colors.accent, opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open your coach"
        onPress={openCoach}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.cardAlt,
            borderColor: colors.accent,
            shadowColor: colors.accent,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <EyeMark color={colors.accent} size={28} strokeWidth={2.1} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1.6,
    height: 56,
    justifyContent: 'center',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    width: 56,
  },
  pulse: {
    borderRadius: 28,
    borderWidth: 1.4,
    height: 56,
    position: 'absolute',
    width: 56,
  },
  wrap: {
    position: 'absolute',
    right: 18,
  },
});
