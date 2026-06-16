// components/tool/ChecklistBody.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type Props = {
  toolSlug: string;
  intro?: string;
  items: { id: string; label: string }[];
};

export function ChecklistBody({ toolSlug, intro, items }: Props) {
  const colors = useThemeColors();
  const { session } = useAuth();
  const userId = session?.user.id;
  const storageKey = userId ? `tel:tool-check:${userId}:${toolSlug}` : null;
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!storageKey) return;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) setChecked(new Set(JSON.parse(raw) as string[]));
    });
  }, [storageKey]);

  const toggle = async (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify([...next]));
  };

  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}
      {items.map((item) => {
        const isChecked = checked.has(item.id);
        return (
          <Pressable
            key={item.id}
            onPress={() => toggle(item.id)}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <View
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.border },
                isChecked && { backgroundColor: '#F4E9D2', borderColor: '#E3CC92' },
              ]}
            >
              <View style={[styles.box, { borderColor: isChecked ? COLORS.tigerGold : colors.border }]}>
                {isChecked ? <Check color={COLORS.tigerGold} size={16} strokeWidth={2.6} /> : null}
              </View>
              <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
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
  intro: { fontFamily: FONTS.sansMedium, fontSize: 16, lineHeight: 23 },
  label: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 15, lineHeight: 21 },
  row: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  stack: { gap: 8 },
});
