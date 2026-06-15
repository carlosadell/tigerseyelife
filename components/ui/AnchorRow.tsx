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

/**
 * Tappable card row — IconSquare + label + tangerine chevron pinned to the
 * right edge. Chevron is absolutely positioned so it cannot wrap regardless
 * of label length or screen width. The row reserves paddingRight so the
 * label never overlaps the chevron.
 */
export function AnchorRow({ Icon, title, sub, onPress, accessibilityLabel }: AnchorRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed && onPress ? 0.7 : 1 }]}
    >
      <IconSquare Icon={Icon} />
      <View style={styles.label}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {sub ? <Text style={styles.sub} numberOfLines={3}>{sub}</Text> : null}
      </View>
      <View pointerEvents="none" style={styles.chev}>
        <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

const CHEV_RAIL = 38;

const styles = StyleSheet.create({
  chev: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: CHEV_RAIL,
  },
  label: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: CHEV_RAIL,
    paddingTop: 14,
    position: 'relative',
  },
  sub: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    letterSpacing: -0.1,
  },
});
