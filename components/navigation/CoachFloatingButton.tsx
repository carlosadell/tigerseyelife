import * as Haptics from 'expo-haptics';
import { MessageCircle } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../lib/brand';

type CoachFloatingButtonProps = {
  onPress: () => void;
};

const CIRCLE = 52;

export function CoachFloatingButton({ onPress }: CoachFloatingButtonProps) {
  const { colors, mode } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 2200,
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

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.3] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.34, 0] });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const iconColor = mode === 'dark' ? COLORS.onyx : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open your coach"
      accessibilityHint="Ask your coach about your program, workout, or today"
      onPress={handlePress}
      style={({ pressed }) => [styles.wrap, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}
    >
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
      <View
        style={[
          styles.circle,
          {
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
          },
        ]}
      >
        <MessageCircle color={iconColor} size={22} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    borderRadius: CIRCLE / 2,
    elevation: 6,
    height: CIRCLE,
    justifyContent: 'center',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    width: CIRCLE,
  },
  pulse: {
    borderRadius: CIRCLE / 2,
    borderWidth: 1.4,
    height: CIRCLE,
    position: 'absolute',
    width: CIRCLE,
  },
  wrap: {
    alignItems: 'center',
    height: CIRCLE,
    justifyContent: 'center',
    width: CIRCLE,
  },
});
