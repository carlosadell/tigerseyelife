// components/today/PrimaryFocusCard.tsx
import { router } from 'expo-router';
import { ArrowRight, BookOpen, Wrench } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type Props = {
  primaryFocus: string;
  toolSlugs: string[];
  weekNumber: number;
};

export function PrimaryFocusCard({ primaryFocus, toolSlugs, weekNumber }: Props) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.kicker, { color: colors.accent }]}>THIS WEEK'S FOCUS</Text>
      <Text style={[styles.body, { color: colors.text }]}>{primaryFocus}</Text>

      <View style={styles.linkRow}>
        <Pressable
          onPress={() => router.push(`/week/${weekNumber}`)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View style={styles.link}>
            <BookOpen color={COLORS.tangerine} size={16} strokeWidth={2} />
            <Text style={[styles.linkText, { color: COLORS.tangerine }]}>Slides</Text>
            <ArrowRight color={COLORS.tangerine} size={14} strokeWidth={2.4} />
          </View>
        </Pressable>

        {toolSlugs.length > 0 ? (
          <Pressable
            onPress={() => router.push(`/tool/${toolSlugs[0]}`)}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={styles.link}>
              <Wrench color={COLORS.tangerine} size={16} strokeWidth={2} />
              <Text style={[styles.linkText, { color: COLORS.tangerine }]}>
                {toolSlugs.length === 1 ? 'Tool' : `Tools (${toolSlugs.length})`}
              </Text>
              <ArrowRight color={COLORS.tangerine} size={14} strokeWidth={2.4} />
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sansBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  card: { borderRadius: 14, borderWidth: 1, gap: 8, padding: 14 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 2 },
  link: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  linkRow: { flexDirection: 'row', gap: 20, marginTop: 4 },
  linkText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
});
