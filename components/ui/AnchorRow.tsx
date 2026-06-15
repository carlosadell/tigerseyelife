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
 * Tappable row in the reference vocabulary — IconSquare + title (+ optional
 * sub) + tangerine chevron. NOT a checklist row: no checkbox state, taps
 * navigate.
 *
 * Layout is explicit (no `gap`) so it stays a single horizontal row across
 * all RN versions and on narrow screens: IconSquare is fixed-width, label
 * flex-grows + shrinks, chevron is fixed-width on the right. Title/sub are
 * line-clamped so long copy doesn't push the chevron off the row.
 */
export function AnchorRow({ Icon, title, sub, onPress, accessibilityLabel }: AnchorRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed && onPress ? 0.7 : 1 }]}
    >
      <View style={styles.iconCol}>
        <IconSquare Icon={Icon} />
      </View>
      <View style={styles.label}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {sub ? <Text style={styles.sub} numberOfLines={3}>{sub}</Text> : null}
      </View>
      <View style={styles.chevCol}>
        <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chevCol: {
    alignItems: 'center',
    flexShrink: 0,
    height: 24,
    justifyContent: 'center',
    marginLeft: 10,
    width: 24,
  },
  iconCol: {
    flexShrink: 0,
    marginRight: 12,
  },
  label: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    width: '100%',
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
