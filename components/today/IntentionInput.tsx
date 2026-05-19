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
          shadowColor: colors.glow,
        },
      ]}
    >
      <View style={[styles.accentRail, { backgroundColor: colors.accent }]} />
      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            onChangeText={setDraft}
            onSubmitEditing={save}
            placeholder="Set your one focus for today."
            placeholderTextColor={colors.mutedText}
            returnKeyType="done"
            multiline
            style={{
              backgroundColor: colors.cardAlt,
              borderRadius: 12,
              color: colors.text,
              flex: 1,
              fontFamily: FONTS.sans,
              fontSize: 15,
              lineHeight: 21,
              minHeight: 84,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
            value={draft}
          />
          <Pressable onPress={save} style={styles.saveButton}>
            <Text style={{ color: colors.accent, fontFamily: FONTS.sansBold }}>
              Save
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setEditing(true)} style={styles.saved}>
          <Text style={[styles.label, { color: colors.accent }]}>TODAY'S INTENTION</Text>
          <Text style={[styles.text, { color: colors.text }]}>
            {intention}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  accentRail: {
    borderRadius: 999,
    bottom: 18,
    left: 0,
    position: 'absolute',
    top: 18,
    width: 4,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
    paddingLeft: 22,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  editRow: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 2.1,
  },
  saveButton: {
    justifyContent: 'center',
  },
  saved: {
    gap: 12,
  },
  text: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
  },
});
