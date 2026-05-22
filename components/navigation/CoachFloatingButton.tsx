import * as Haptics from 'expo-haptics';
import { MessageCircle } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type CoachFloatingButtonProps = {
  onPress: () => void;
};

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

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.18] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0] });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const fill = mode === 'dark' ? '#1A1A1C' : '#FFFFFF';
  const dotColor = colors.success;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 104 }]}>
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
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: fill,
            borderColor: colors.accent,
            shadowColor: COLORS.onyx,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        <View style={[styles.iconWell, { backgroundColor: colors.accent }]}>
          <MessageCircle color={fill} size={18} strokeWidth={2.4} />
        </View>
        <View style={styles.copy}>
          <View style={styles.copyRow}>
            <Text style={[styles.title, { color: colors.text }]}>Coach</Text>
            <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
          </View>
          <Text style={[styles.helper, { color: colors.mutedText }]}>Ask me anything</Text>
        </View>
      </Pressable>
    </View>
  );
}

const BUTTON_HEIGHT = 56;

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: BUTTON_HEIGHT / 2,
    borderWidth: 1.4,
    elevation: 6,
    flexDirection: 'row',
    gap: 10,
    height: BUTTON_HEIGHT,
    paddingHorizontal: 8,
    paddingRight: 16,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  copy: {
    gap: 1,
  },
  copyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 10.5,
    letterSpacing: 0.1,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pulse: {
    borderRadius: BUTTON_HEIGHT / 2,
    borderWidth: 1.4,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    marginTop: 1,
    width: 6,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  wrap: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 16,
  },
});
