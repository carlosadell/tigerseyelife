// components/tool/StaticPageBody.tsx
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Props = {
  intro?: string;
  sections: { heading: string; body: string }[];
};

export function StaticPageBody({ intro, sections }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}
      {sections.map((s) => (
        <View key={s.heading} style={styles.section}>
          <Text style={[styles.heading, { color: colors.text }]}>{s.heading}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>{s.body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  heading: { fontFamily: FONTS.sansBold, fontSize: 17, letterSpacing: -0.1, marginBottom: 6 },
  intro: { fontFamily: FONTS.sansMedium, fontSize: 16, lineHeight: 23 },
  section: { gap: 4 },
  stack: { gap: 20 },
});
