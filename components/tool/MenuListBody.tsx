// components/tool/MenuListBody.tsx
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Props = {
  intro?: string;
  items: { title: string; body: string }[];
};

export function MenuListBody({ intro, items }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}
      {items.map((item) => (
        <View key={item.title} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>{item.body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 12, borderWidth: 1, gap: 4, padding: 14 },
  intro: { fontFamily: FONTS.sansMedium, fontSize: 16, lineHeight: 23 },
  stack: { gap: 10 },
  title: { fontFamily: FONTS.sansBold, fontSize: 15 },
});
