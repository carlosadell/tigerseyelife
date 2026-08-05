import * as Haptics from 'expo-haptics';
import { Check, Dumbbell, Plus, Timer } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';
import { formatWeight, lbToKg, toLbInputValue } from '../../lib/units';
import { WorkoutExercise } from '../../lib/workouts';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

// Draft.lb is what the user types — pounds. Storage stays kg
// (WorkoutSetLog.weight_kg schema) so we convert at logSet time.
type DraftSet = { reps: string; lb: string; rpe: string };

type Props = {
  exercise: WorkoutExercise;
  // Suggested weight is kg (from historical set logs); the UI converts to lb.
  suggestedFromHistory?: number | null;
};

const emptyDraft = (): DraftSet => ({ lb: '', reps: '', rpe: '7' });

function fmtRest(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function ActiveSetLogger({ exercise, suggestedFromHistory }: Props) {
  const colors = useThemeColors();
  const { currentSession, logSet, setRestTimer } = useActiveWorkoutStore();
  const [drafts, setDrafts] = useState<Record<number, DraftSet>>({});
  const [extraSets, setExtraSets] = useState(0);
  const logged = currentSession?.set_logs ?? [];

  const updateDraft = (setNumber: number, field: keyof DraftSet, value: string) => {
    setDrafts((current) => ({
      ...current,
      [setNumber]: { ...(current[setNumber] ?? emptyDraft()), [field]: value },
    }));
  };

  const rows = useMemo(
    () => Array.from({ length: exercise.target_sets + extraSets }, (_, i) => i + 1),
    [exercise.target_sets, extraSets],
  );

  const completeSet = (setNumber: number) => {
    const draft = drafts[setNumber] ?? { lb: '0', reps: '0', rpe: '7' };
    logSet({
      exercise_id: exercise.id,
      is_warmup: exercise.is_warmup,
      logged_at: new Date().toISOString(),
      reps: Number(draft.reps || 0),
      rpe: Number(draft.rpe || 7),
      set_number: setNumber,
      weight_kg: lbToKg(Number(draft.lb || 0)),
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
        lb: toLbInputValue(suggestedFromHistory),
        reps: current[setNumber]?.reps ?? '',
        rpe: current[setNumber]?.rpe ?? '7',
      },
    }));
  };

  const prevLabel =
    suggestedFromHistory != null
      ? `${toLbInputValue(suggestedFromHistory)} x ${exercise.target_reps.split('-')[0]}`
      : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Exercise header */}
      <View style={styles.exHeader}>
        <View style={styles.exIcon}>
          <Dumbbell color={colors.accent} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.exText}>
          <Text style={[styles.exName, { color: colors.text }]} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={[styles.exReps, { color: colors.mutedText }]}>
            {exercise.target_reps} reps{exercise.is_warmup ? ' · warm-up' : ''}
          </Text>
        </View>
      </View>

      {/* Table header */}
      <View style={styles.tHead}>
        <Text style={[styles.hCell, styles.setCol, { color: colors.mutedText }]}>SET</Text>
        <Text style={[styles.hCell, styles.prevCol, { color: colors.mutedText }]}>PREVIOUS</Text>
        <Text style={[styles.hCell, styles.numCol, { color: colors.mutedText }]}>LBS</Text>
        <Text style={[styles.hCell, styles.numCol, { color: colors.mutedText }]}>REPS</Text>
        <Text style={[styles.hCell, styles.effCol, { color: colors.mutedText }]}>EFFORT</Text>
      </View>

      {rows.map((setNumber) => {
        const isLogged = logged.some(
          (s) => s.exercise_id === exercise.id && s.set_number === setNumber,
        );
        const draft = drafts[setNumber] ?? { lb: '', reps: '', rpe: '7' };
        const zebra = setNumber % 2 === 0;

        return (
          <View
            key={setNumber}
            style={[styles.row, zebra && { backgroundColor: colors.cardAlt }]}
          >
            <View style={styles.setCol}>
              <View style={[styles.setTile, { borderColor: colors.border }]}>
                <Text style={[styles.setNum, { color: colors.text }]}>{setNumber}</Text>
              </View>
            </View>

            <View style={styles.prevCol}>
              {prevLabel ? (
                <View style={styles.prevInner}>
                  <Text style={[styles.prevText, { color: colors.mutedText }]}>{prevLabel}</Text>
                  <View style={[styles.prevDot, { backgroundColor: colors.accent }]} />
                </View>
              ) : (
                <Text style={[styles.prevText, { color: colors.mutedText }]}>-</Text>
              )}
            </View>

            <Pressable style={styles.numCol} onLongPress={() => applySuggestion(setNumber)}>
              <TextInput
                keyboardType="numeric"
                onChangeText={(v) => updateDraft(setNumber, 'lb', v)}
                placeholder={suggestedFromHistory != null ? toLbInputValue(suggestedFromHistory) : '0'}
                placeholderTextColor={colors.mutedText}
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={draft.lb}
              />
            </Pressable>

            <View style={styles.numCol}>
              <TextInput
                keyboardType="numeric"
                onChangeText={(v) => updateDraft(setNumber, 'reps', v)}
                placeholder={exercise.target_reps.split('-')[0]}
                placeholderTextColor={colors.mutedText}
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={draft.reps}
              />
            </View>

            <View style={styles.effCol}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Complete set ${setNumber}`}
                onPress={() => completeSet(setNumber)}
                style={[
                  styles.effCircle,
                  { borderColor: colors.border },
                  isLogged && { backgroundColor: colors.action, borderColor: colors.action },
                ]}
              >
                {isLogged ? <Check color={COLORS.bone} size={16} strokeWidth={3} /> : null}
              </Pressable>
            </View>
          </View>
        );
      })}

      {/* Rest + Add set */}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            setRestTimer({ exerciseId: exercise.id, running: true, secondsLeft: exercise.rest_seconds })
          }
          style={[styles.actionBtn, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
        >
          <Timer color={colors.text} size={15} strokeWidth={2.2} />
          <Text style={[styles.actionText, { color: colors.text }]}>
            Rest: {fmtRest(exercise.rest_seconds)}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setExtraSets((n) => n + 1)}
          style={[styles.actionBtn, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
        >
          <Plus color={colors.action} size={15} strokeWidth={2.6} />
          <Text style={[styles.actionText, { color: colors.text }]}>Add Set</Text>
        </Pressable>
      </View>

      {!exercise.is_warmup && suggestedFromHistory != null ? (
        <Text style={[styles.footnote, { color: colors.mutedText }]}>
          Last time {formatWeight(suggestedFromHistory)}. Long-press the LBS field to copy it.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  effCircle: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.6,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  effCol: { alignItems: 'center', width: 60 },
  exHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 14 },
  exIcon: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  exName: { fontFamily: FONTS.sansBold, fontSize: 17, letterSpacing: -0.2 },
  exReps: { fontFamily: FONTS.sansMedium, fontSize: 12.5, marginTop: 1 },
  exText: { flex: 1, minWidth: 0 },
  footnote: { fontFamily: FONTS.sans, fontSize: 11.5, fontStyle: 'italic', marginTop: 10 },
  hCell: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 1.2, textAlign: 'center' },
  input: {
    borderRadius: 8,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    paddingVertical: 9,
    textAlign: 'center',
  },
  numCol: { flex: 1 },
  prevCol: { flex: 1.4 },
  prevDot: { borderRadius: 999, height: 6, width: 6 },
  prevInner: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center' },
  prevText: { fontFamily: FONTS.sansMedium, fontSize: 12.5, textAlign: 'center' },
  row: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  setCol: { alignItems: 'center', width: 40 },
  setNum: { fontFamily: FONTS.sansBold, fontSize: 14 },
  setTile: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  tHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
});
