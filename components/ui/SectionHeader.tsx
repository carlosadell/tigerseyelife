// components/ui/SectionHeader.tsx
import { StyleSheet, Text, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type SectionHeaderProps = {
  title: string;
  meta?: string;
};

/**
 * Section divider — bold sentence-case title + optional muted meta on the right.
 * Used across Today and the Nutrition locked state.
 */
export function SectionHeader({ title, meta }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  meta: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
  },
  row: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 32,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
});
