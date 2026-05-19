import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
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

  const openCoach = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
      <View style={styles.glow} />
      <Pressable
        accessibilityRole="button"
        onPress={openCoach}
        style={[
          styles.button,
          { backgroundColor: colors.cardAlt, borderColor: colors.accent },
        ]}
      >
        <EyeMark color={colors.accent} size={30} strokeWidth={2.1} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 2,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    shadowColor: COLORS.tigerGold,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  wrap: {
    position: 'absolute',
    right: 20,
  },
});
