// components/today/DailyActionRow.tsx
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';
import type { ThreadLetter } from '../../lib/program';

type Props = {
  label: string;
  thread: ThreadLetter;
  completed: boolean;
  onToggle: () => void;
};

export function DailyActionRow({ label, thread, completed, onToggle }: Props) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onToggle} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <View
        style={[
          styles.row,
          { backgroundColor: colors.card, borderColor: colors.border },
          completed && { backgroundColor: '#F4E9D2', borderColor: '#E3CC92' },
        ]}
      >
        <View style={[styles.box, { borderColor: completed ? COLORS.tigerGold : colors.border }]}>
          {completed ? <Check color={COLORS.tigerGold} size={16} strokeWidth={2.6} /> : null}
        </View>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.thread, { color: COLORS.tigerGold }]}>{thread}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1.6,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  label: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 15, lineHeight: 21 },
  row: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  thread: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 1.2 },
});
