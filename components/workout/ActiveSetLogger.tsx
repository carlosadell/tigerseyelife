import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import { WorkoutExercise } from '../../lib/workouts';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

type DraftSet = {
  reps: string;
  kg: string;
  rpe: string;
};

export function ActiveSetLogger({ exercise }: { exercise: WorkoutExercise }) {
  const colors = useThemeColors();
  const { currentSession, logSet, setRestTimer } = useActiveWorkoutStore();
  const [drafts, setDrafts] = useState<Record<number, DraftSet>>({});
  const logged = currentSession?.set_logs ?? [];

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
    setRestTimer({ exerciseId: exercise.id, running: true, secondsLeft: exercise.rest_seconds });
  };

  return (
    <View style={[styles.logTable, { backgroundColor: colors.cardAlt }]}>
      <View style={styles.logHeader}>
        {['SET', 'REPS', 'KG', 'RPE', '✓'].map((label) => (
          <Text key={label} style={[styles.logLabel, { color: colors.mutedText }]}>{label}</Text>
        ))}
      </View>
      {rows.map((setNumber) => {
        const isLogged = logged.some(
          (set) => set.exercise_id === exercise.id && set.set_number === setNumber,
        );
        return (
          <View key={setNumber} style={styles.logRow}>
            <Text style={[styles.setNum, { color: colors.text }]}>{setNumber}</Text>
            {(['reps', 'kg', 'rpe'] as const).map((field) => (
              <TextInput
                key={field}
                keyboardType="numeric"
                onChangeText={(value) =>
                  setDrafts((current) => ({
                    ...current,
                    [setNumber]: {
                      ...{ kg: '', reps: '', rpe: '7' },
                      ...current[setNumber],
                      [field]: value,
                    },
                  }))
                }
                placeholder={field === 'rpe' ? '7' : '0'}
                placeholderTextColor={colors.mutedText}
                style={[styles.logInput, { backgroundColor: colors.card, color: colors.text }]}
                value={drafts[setNumber]?.[field] ?? ''}
              />
            ))}
            <Pressable
              onPress={() => completeSet(setNumber)}
              style={[styles.check, isLogged && { backgroundColor: colors.success }]}
            >
              <Check color={isLogged ? colors.successText : colors.mutedText} size={16} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  check: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logInput: {
    borderRadius: 10,
    fontFamily: FONTS.sansBold,
    padding: 8,
    textAlign: 'center',
    width: 46,
  },
  logLabel: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
  logRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logTable: {
    borderRadius: 18,
    gap: 12,
    padding: 14,
  },
  setNum: {
    fontFamily: FONTS.sansBold,
    width: 24,
  },
});
