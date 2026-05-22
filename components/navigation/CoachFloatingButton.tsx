import * as Haptics from 'expo-haptics';
import { MessageCircle } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../lib/brand';

type CoachFloatingButtonProps = {
  onPress: () => void;
};

const SIZE = 52;

export function CoachFloatingButton({ onPress }: CoachFloatingButtonProps) {
  const insets = useSafeAreaInsets();
  const { colors, mode } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 1800,
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

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.22] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0] });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const iconFill = mode === 'dark' ? COLORS.onyx : '#FFFFFF';

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 108 }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulse,
          {
            borderColor: colors.accent,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open your coach"
        accessibilityHint="Ask your coach anything about your program, workout, or today"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.accent,
            shadowColor: COLORS.onyx,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}
      >
        <MessageCircle color={iconFill} size={22} strokeWidth={2.2} />
        <View style={[styles.statusDot, { backgroundColor: colors.success, borderColor: colors.accent }]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: SIZE / 2,
    elevation: 6,
    height: SIZE,
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    width: SIZE,
  },
  pulse: {
    borderRadius: SIZE / 2,
    borderWidth: 1.4,
    bottom: 0,
    height: SIZE,
    position: 'absolute',
    right: 0,
    width: SIZE,
  },
  statusDot: {
    borderRadius: 5,
    borderWidth: 1.4,
    bottom: 2,
    height: 10,
    position: 'absolute',
    right: 2,
    width: 10,
  },
  wrap: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 18,
  },
});
