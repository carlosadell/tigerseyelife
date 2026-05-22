import * as Haptics from 'expo-haptics';
import { MessageCircle } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type CoachFloatingButtonProps = {
  onPress: () => void;
};

const CIRCLE = 48;

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

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.28] });
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
      <View style={styles.circleStack}>
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
          <MessageCircle color={iconColor} size={20} strokeWidth={2.2} />
          <View style={[styles.statusDot, { backgroundColor: colors.success, borderColor: colors.accent }]} />
        </View>
      </View>
      <Text style={[styles.label, { color: colors.accent }]}>Coach</Text>
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
    position: 'relative',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    width: CIRCLE,
  },
  circleStack: {
    alignItems: 'center',
    height: CIRCLE,
    justifyContent: 'center',
    width: CIRCLE,
  },
  label: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  pulse: {
    borderRadius: CIRCLE / 2,
    borderWidth: 1.4,
    height: CIRCLE,
    position: 'absolute',
    width: CIRCLE,
  },
  statusDot: {
    borderRadius: 4,
    borderWidth: 1.2,
    bottom: 2,
    height: 8,
    position: 'absolute',
    right: 2,
    width: 8,
  },
  wrap: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    width: 56,
  },
});
