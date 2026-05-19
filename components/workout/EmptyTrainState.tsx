import { Dumbbell, Search } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

export function EmptyTrainState({ body, button, title }: { body: string; button: string; title: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Dumbbell color={colors.accent} size={24} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.mutedText }]}>{body}</Text>
      <Pressable style={[styles.emptyButton, { backgroundColor: colors.cardAlt }]}>
        <Search color={colors.accent} size={16} />
        <Text style={[styles.emptyButtonText, { color: colors.accent }]}>{button}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBody: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  emptyButton: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 11 },
  emptyButtonText: { fontFamily: FONTS.sansBold, fontSize: 13 },
  emptyCard: { alignItems: 'center', borderRadius: 22, borderWidth: 1, gap: 10, padding: 20 },
  emptyTitle: { fontFamily: FONTS.sansBold, fontSize: 18 },
});
