// components/ui/AnchorRow.tsx
import { type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type AnchorRowProps = {
  Icon: LucideIcon;
  title: string;
  sub?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Tappable card row — icon left, label right. Pressable does ONLY tap
 * handling; an inner View holds the flex row layout so style application
 * issues with Pressable can't break it. No chevron — the whole card is the
 * button.
 */
export function AnchorRow({ Icon, title, sub, onPress, accessibilityLabel }: AnchorRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed && onPress ? 0.7 : 1 })}
    >
      <View style={styles.row}>
        <View style={styles.iconSquare}>
          <Icon color={light.accent} size={22} strokeWidth={2.2} />
        </View>
        <View style={styles.label}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {sub ? <Text style={styles.sub} numberOfLines={3}>{sub}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconSquare: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    marginRight: 14,
    width: 44,
  },
  label: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
