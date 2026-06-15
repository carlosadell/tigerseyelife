// components/ui/AnchorRow.tsx
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { IconSquare } from './IconSquare';

const light = THEME_COLORS.light;

type AnchorRowProps = {
  Icon: LucideIcon;
  title: string;
  sub?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

const ICON_SIZE = 44;
const HORIZ_PAD = 16;
const ICON_GAP = 14;
const CHEV_RAIL = 36;

/**
 * Tappable card row — IconSquare pinned left, label fills the middle, tangerine
 * chevron pinned right. Both icon and chevron are absolutely positioned so the
 * layout is structurally fixed and never wraps, regardless of Pressable / Yoga
 * flex behavior or screen width.
 */
export function AnchorRow({ Icon, title, sub, onPress, accessibilityLabel }: AnchorRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed && onPress ? 0.7 : 1 }]}
    >
      <View pointerEvents="none" style={styles.iconAbs}>
        <IconSquare Icon={Icon} />
      </View>

      <View style={styles.label}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {sub ? <Text style={styles.sub} numberOfLines={3}>{sub}</Text> : null}
      </View>

      <View pointerEvents="none" style={styles.chevAbs}>
        <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chevAbs: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: CHEV_RAIL,
  },
  iconAbs: {
    left: HORIZ_PAD,
    position: 'absolute',
    top: HORIZ_PAD,
  },
  label: {
    minHeight: ICON_SIZE,
    justifyContent: 'center',
  },
  row: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    paddingBottom: HORIZ_PAD,
    paddingLeft: HORIZ_PAD + ICON_SIZE + ICON_GAP,
    paddingRight: CHEV_RAIL,
    paddingTop: HORIZ_PAD,
    position: 'relative',
  },
  sub: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
});
