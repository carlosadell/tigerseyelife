import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type IntentionInputProps = {
  intention?: string | null;
  onSave: (value: string) => void | Promise<void>;
};

export function IntentionInput({ intention, onSave }: IntentionInputProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState(intention ?? '');
  const [editing, setEditing] = useState(!intention);

  const save = async () => {
    const nextValue = draft.trim();
    if (!nextValue) return;
    await onSave(nextValue);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.rail, { backgroundColor: colors.accent }]} />
      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.accent }]}>TODAY'S INTENTION</Text>
        {editing ? (
          <View style={styles.editStack}>
            <TextInput
              autoFocus
              multiline
              onChangeText={setDraft}
              onSubmitEditing={save}
              placeholder="Set your one focus for today."
              placeholderTextColor={colors.mutedText}
              returnKeyType="done"
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardAlt,
                  color: colors.text,
                },
              ]}
              value={draft}
            />
            <Pressable hitSlop={8} onPress={save} style={styles.saveButton}>
              <Text style={{ color: colors.accent, fontFamily: FONTS.sansBold, letterSpacing: 0.4 }}>
                Save
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <Text style={[styles.text, { color: colors.text }]}>{intention}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  editStack: {
    gap: 10,
  },
  input: {
    borderRadius: 10,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 96,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  rail: {
    borderRadius: 999,
    width: 2,
  },
  saveButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  text: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
  },
});
