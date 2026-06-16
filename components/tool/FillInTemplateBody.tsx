// components/tool/FillInTemplateBody.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Props = {
  toolSlug: string;
  intro?: string;
  fields: { id: string; label: string; placeholder?: string }[];
};

export function FillInTemplateBody({ toolSlug, intro, fields }: Props) {
  const colors = useThemeColors();
  const { session } = useAuth();
  const userId = session?.user.id;
  const storageKey = userId ? `tel:tool-fill:${userId}:${toolSlug}` : null;
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!storageKey) return;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) setValues(JSON.parse(raw) as Record<string, string>);
    });
  }, [storageKey]);

  const onChange = async (id: string, text: string) => {
    const next = { ...values, [id]: text };
    setValues(next);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}
      {fields.map((f) => (
        <View key={f.id} style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>{f.label}</Text>
          <TextInput
            multiline
            placeholder={f.placeholder}
            placeholderTextColor={colors.mutedText}
            value={values[f.id] ?? ''}
            onChangeText={(t) => onChange(f.id, t)}
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 72,
    padding: 12,
    textAlignVertical: 'top',
  },
  intro: { fontFamily: FONTS.sansMedium, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: FONTS.sansBold, fontSize: 14, letterSpacing: 0.1 },
  stack: { gap: 16 },
});
