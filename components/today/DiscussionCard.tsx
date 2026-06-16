// components/today/DiscussionCard.tsx
import { router } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type Props = {
  prompt: string;
  weekNumber: number;
};

export function DiscussionCard({ prompt, weekNumber }: Props) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => router.push(`/week/${weekNumber}`)}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <MessageSquare color={COLORS.tigerGold} size={18} strokeWidth={1.8} />
          <Text style={[styles.kicker, { color: colors.mutedText }]}>FROM THE COMMUNITY</Text>
        </View>
        <Text style={[styles.body, { color: colors.text }]} numberOfLines={3}>
          {prompt}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sansMedium, fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 12, borderWidth: 1, gap: 6, padding: 14 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.8 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
