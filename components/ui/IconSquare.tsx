// components/ui/IconSquare.tsx
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type IconSquareProps = {
  Icon: LucideIcon;
  size?: 36 | 44;
  tone?: 'gold' | 'cream';
};

/**
 * Rounded square icon well. Gold-tinted by default — the "checklist-shaped"
 * leader from the reference vocabulary. NOT a checkbox; carries no state.
 */
export function IconSquare({ Icon, size = 44, tone = 'gold' }: IconSquareProps) {
  const bg = tone === 'gold' ? '#F0E2C2' : light.cardAlt;
  const fg = light.accent;
  const radius = size === 44 ? 12 : 10;
  const iconSize = size === 44 ? 22 : 18;

  return (
    <View style={[styles.well, { backgroundColor: bg, borderRadius: radius, height: size, width: size }]}>
      <Icon color={fg} size={iconSize} strokeWidth={2.2} />
    </View>
  );
}

const styles = StyleSheet.create({
  well: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
