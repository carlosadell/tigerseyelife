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
 * navigate. Used for Commit anchors, fork choices, Nutrition locked-state
 * lesson link, etc.
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
        <Text style={styles.title}>{title}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 14,
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
