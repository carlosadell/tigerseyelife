// app/goals/edit.tsx
//
// Add or edit a custom goal. Mirrors the "My Goals" section in Karen's
// tracker — metric goals carry baseline + target numbers (lose 10 lbs;
// 60-sec sit-to-stands baseline 15 → goal 23), identity goals are a
// single narrative line, intentions are a single process line.

import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCustomGoals } from '../../hooks/useCustomGoals';
import type { CustomGoal, CustomGoalKind } from '../../hooks/useCustomGoals';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

const KIND_OPTIONS: { value: CustomGoalKind; label: string; helper: string }[] = [
  { value: 'metric',    label: 'Metric',    helper: 'A number you want to move — weight, reps, time.' },
  { value: 'identity',  label: 'Identity',  helper: 'Who you want to become. "I am someone who…"' },
  { value: 'intention', label: 'Intention', helper: 'How you want to show up. "Be more intentional about evenings."' },
];

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { goals, upsert, remove } = useCustomGoals();
  const existing = id ? goals.find((g) => g.id === id) : undefined;
  const isEdit = !!existing;

  const [kind, setKind] = useState<CustomGoalKind>(existing?.kind ?? 'metric');
  const [label, setLabel] = useState(existing?.label ?? '');
  const [baseline, setBaseline] = useState(existing?.baseline ?? '');
  const [target, setTarget] = useState(existing?.target ?? '');
  const [unit, setUnit] = useState(existing?.unit ?? '');
  const [note, setNote] = useState(existing?.note ?? '');

  // Hydrate once `existing` resolves (the goals hook is async).
  useEffect(() => {
    if (existing) {
      setKind(existing.kind);
      setLabel(existing.label);
      setBaseline(existing.baseline ?? '');
      setTarget(existing.target ?? '');
      setUnit(existing.unit ?? '');
      setNote(existing.note ?? '');
    }
  }, [existing]);

  const canSave = label.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    const payload: Omit<CustomGoal, 'id' | 'createdAt'> & { id?: string } = {
      id: existing?.id,
      kind,
      label: label.trim(),
      baseline: kind === 'metric' ? baseline.trim() || undefined : undefined,
      target:   kind === 'metric' ? target.trim() || undefined : undefined,
      unit:     kind === 'metric' ? unit.trim() || undefined : undefined,
      note: note.trim() || undefined,
    };
    await upsert(payload);
    router.back();
  };

  const onDelete = async () => {
    if (!existing) return;
    await remove(existing.id);
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft color={light.text} size={26} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit goal' : 'New goal'}</Text>
        {isEdit ? (
          <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel="Delete goal">
            <Trash2 color={light.danger} size={20} strokeWidth={2.2} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>KIND</Text>
          <View style={styles.kindRow}>
            {KIND_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setKind(opt.value)}
                style={[styles.kindChip, kind === opt.value && styles.kindChipActive]}
              >
                <Text style={[styles.kindLabel, kind === opt.value && styles.kindLabelActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.kindHelper}>
            {KIND_OPTIONS.find((o) => o.value === kind)?.helper}
          </Text>

          <Text style={styles.fieldLabel}>GOAL</Text>
          <TextInput
            placeholder={
              kind === 'metric'
                ? 'e.g. Lose 10 lbs, 4-mile walk, 60-sec sit-to-stands'
                : kind === 'identity'
                  ? 'e.g. I am someone who walks every day'
                  : 'e.g. Be more intentional about evenings'
            }
            placeholderTextColor={light.mutedText}
            style={styles.input}
            value={label}
            onChangeText={setLabel}
          />

          {kind === 'metric' ? (
            <>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>BASELINE</Text>
                  <TextInput
                    placeholder="e.g. 15"
                    placeholderTextColor={light.mutedText}
                    style={styles.input}
                    value={baseline}
                    onChangeText={setBaseline}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>TARGET</Text>
                  <TextInput
                    placeholder="e.g. 23"
                    placeholderTextColor={light.mutedText}
                    style={styles.input}
                    value={target}
                    onChangeText={setTarget}
                  />
                </View>
              </View>
              <Text style={styles.fieldLabel}>UNIT (OPTIONAL)</Text>
              <TextInput
                placeholder="reps, kg, lbs, miles, sec"
                placeholderTextColor={light.mutedText}
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
              />
            </>
          ) : null}

          <Text style={styles.fieldLabel}>NOTE (OPTIONAL)</Text>
          <TextInput
            multiline
            placeholder="Any context that helps you remember why this matters."
            placeholderTextColor={light.mutedText}
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
          />

          <Pressable
            disabled={!canSave}
            onPress={onSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { opacity: !canSave ? 0.4 : pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.saveLabel}>{isEdit ? 'Save goal' : 'Add goal'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingBottom: 64,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  fieldLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
    marginTop: 14,
  },
  flex: { flex: 1 },
  halfField: { flex: 1 },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  headerTitle: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 12,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 14.5,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  kindChip: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  kindChipActive: {
    backgroundColor: '#F1E6C8',
    borderColor: 'transparent',
  },
  kindHelper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 6,
  },
  kindLabel: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    textAlign: 'center',
  },
  kindLabelActive: { color: light.accent },
  kindRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  noteInput: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  saveBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 999,
    marginTop: 24,
    paddingVertical: 14,
  },
  saveLabel: {
    color: light.inverseText,
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
  },
  screen: { flex: 1 },
  spacer: { width: 26 },
});
