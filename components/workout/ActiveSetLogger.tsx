import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';
import { WorkoutExercise } from '../../lib/workouts';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

type DraftSet = {
  reps: string;
  kg: string;
  rpe: string;
};

type Props = {
  exercise: WorkoutExercise;
  suggestedFromHistory?: number | null;
};

const emptyDraft = (): DraftSet => ({ kg: '', reps: '', rpe: '7' });

export function ActiveSetLogger({ exercise, suggestedFromHistory }: Props) {
  const colors = useThemeColors();
  const { currentSession, logSet, setRestTimer } = useActiveWorkoutStore();
  const [drafts, setDrafts] = useState<Record<number, DraftSet>>({});
  const logged = currentSession?.set_logs ?? [];

  const updateDraft = (setNumber: number, field: keyof DraftSet, value: string) => {
    setDrafts((current) => ({
      ...current,
      [setNumber]: { ...(current[setNumber] ?? emptyDraft()), [field]: value },
    }));
  };

  const rows = useMemo(
    () => Array.from({ length: exercise.target_sets }, (_, index) => index + 1),
    [exercise.target_sets],
  );

  const completeSet = (setNumber: number) => {
    const draft = drafts[setNumber] ?? { kg: '0', reps: '0', rpe: '7' };
    logSet({
      exercise_id: exercise.id,
      is_warmup: exercise.is_warmup,
      logged_at: new Date().toISOString(),
      reps: Number(draft.reps || 0),
      rpe: Number(draft.rpe || 7),
      set_number: setNumber,
      weight_kg: Number(draft.kg || 0),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (exercise.rest_seconds > 0) {
      setRestTimer({ exerciseId: exercise.id, running: true, secondsLeft: exercise.rest_seconds });
    }
  };

  const applySuggestion = (setNumber: number) => {
    if (suggestedFromHistory == null) return;
    setDrafts((current) => ({
      ...current,
      [setNumber]: {
        kg: String(suggestedFromHistory),
        reps: current[setNumber]?.reps ?? '',
        rpe: current[setNumber]?.rpe ?? '7',
      },
    }));
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
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Log today’s sets</Text>
        {!exercise.is_warmup && suggestedFromHistory != null ? (
          <Text style={[styles.suggestion, { color: colors.mutedText }]}>
            Last time: {formatWeight(suggestedFromHistory)} kg
          </Text>
        ) : null}
      </View>

      <View style={[styles.table, { backgroundColor: colors.cardAlt }]}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, styles.setCol, { color: colors.mutedText }]}>SET</Text>
          {exercise.is_warmup ? (
            <Text style={[styles.colHeader, styles.warmupCol, { color: colors.mutedText }]}>
              CUE
            </Text>
          ) : (
            <>
              <Text style={[styles.colHeader, styles.numCol, { color: colors.mutedText }]}>KG</Text>
              <Text style={[styles.colHeader, styles.numCol, { color: colors.mutedText }]}>REPS</Text>
              <Text style={[styles.colHeader, styles.numCol, { color: colors.mutedText }]}>RPE</Text>
            </>
          )}
          <Text style={[styles.colHeader, styles.checkCol, { color: colors.mutedText }]}>✓</Text>
        </View>

        {rows.map((setNumber) => {
          const isLogged = logged.some(
            (set) => set.exercise_id === exercise.id && set.set_number === setNumber,
          );
          const draft = drafts[setNumber] ?? { kg: '', reps: '', rpe: '7' };

          return (
            <View key={setNumber} style={styles.tableRow}>
              <Text style={[styles.setNumber, { color: colors.text }]}>{setNumber}</Text>

              {exercise.is_warmup ? (
                <Text style={[styles.warmupHint, { color: colors.mutedText }]}>
                  {exercise.target_reps}
                </Text>
              ) : (
                <>
                  <Pressable
                    onLongPress={() => applySuggestion(setNumber)}
                    style={[styles.numCol]}
                  >
                    <TextInput
                      keyboardType="numeric"
                      onChangeText={(value) => updateDraft(setNumber, 'kg', value)}
                      placeholder={suggestedFromHistory != null ? String(formatWeight(suggestedFromHistory)) : '0'}
                      placeholderTextColor={colors.mutedText}
                      style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                      value={draft.kg}
                    />
                  </Pressable>
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={(value) => updateDraft(setNumber, 'reps', value)}
                    placeholder={exercise.target_reps.split('-')[0]}
                    placeholderTextColor={colors.mutedText}
                    style={[styles.input, styles.numCol, { backgroundColor: colors.card, color: colors.text }]}
                    value={draft.reps}
                  />
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={(value) => updateDraft(setNumber, 'rpe', value)}
                    placeholder="7"
                    placeholderTextColor={colors.mutedText}
                    style={[styles.input, styles.numCol, { backgroundColor: colors.card, color: colors.text }]}
                    value={draft.rpe}
                  />
                </>
              )}

              <Pressable
                onPress={() => completeSet(setNumber)}
                style={[
                  styles.check,
                  styles.checkCol,
                  { borderColor: colors.accent },
                  isLogged && { backgroundColor: colors.action, borderColor: colors.action },
                ]}
              >
                <Check color={isLogged ? COLORS.bone : colors.accent} size={16} strokeWidth={2.6} />
              </Pressable>
            </View>
          );
        })}
      </View>

      {!exercise.is_warmup && suggestedFromHistory != null ? (
        <Text style={[styles.footnote, { color: colors.mutedText }]}>
          Long-press the kg field to copy last session’s weight.
        </Text>
      ) : null}
    </View>
  );
}

function formatWeight(kg: number) {
  return Number.isInteger(kg) ? kg : Number(kg.toFixed(1));
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  check: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.4,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  checkCol: {
    width: 44,
  },
  colHeader: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  footnote: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    fontStyle: 'italic',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderRadius: 8,
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    paddingVertical: 8,
    textAlign: 'center',
  },
  numCol: {
    flex: 1,
  },
  setCol: {
    width: 28,
  },
  setNumber: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    textAlign: 'center',
    width: 28,
  },
  suggestion: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11.5,
  },
  table: {
    borderRadius: 10,
    gap: 8,
    padding: 12,
  },
  tableHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tableRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  warmupCol: {
    flex: 3,
  },
  warmupHint: {
    flex: 3,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
