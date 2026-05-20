import { router } from 'expo-router';
import { ArrowRight, ChevronLeft, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActiveSetLogger } from '../../../components/workout/ActiveSetLogger';
import { ProgressionTable } from '../../../components/workout/ProgressionTable';
import { RestTimerOverlay } from '../../../components/workout/RestTimerOverlay';
import { useThemeColors } from '../../../hooks/useTheme';
import { useWorkoutSessions } from '../../../hooks/useWorkoutSessions';
import { COLORS, FONTS, SPACING } from '../../../lib/brand';
import { useActiveWorkoutStore } from '../../../stores/activeWorkout';

export default function ActiveWorkoutScreen() {
  const colors = useThemeColors();
  const store = useActiveWorkoutStore();
  const workout = store.currentWorkout;
  const session = store.currentSession;
  const { sessions: history } = useWorkoutSessions();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.started_at) {
        setElapsed(Math.round((Date.now() - Date.parse(session.started_at)) / 1000));
      }
      store.tickRestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.started_at, store]);

  if (!workout || !session) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>No active workout.</Text>
      </SafeAreaView>
    );
  }

  const exercise = workout.exercises[store.currentExerciseIndex];
  const completedCurrent = session.set_logs.filter((set) => set.exercise_id === exercise.id).length;
  const allSetsDone = completedCurrent >= exercise.target_sets;
  const isLastExercise = store.currentExerciseIndex === workout.exercises.length - 1;

  const nextExercise = () => {
    if (isLastExercise) router.replace(`/workout/complete/${session.id}`);
    else store.setCurrentExerciseIndex(store.currentExerciseIndex + 1);
  };

  const todaySetLogs = session.set_logs.filter((log) => log.exercise_id === exercise.id);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
          <View style={styles.timerStack}>
            <Text style={[styles.timer, { color: colors.text }]}>{formatSeconds(elapsed)}</Text>
            <Text style={[styles.timerLabel, { color: colors.mutedText }]}>SESSION TIME</Text>
          </View>
          <Pressable hitSlop={10} onPress={() => router.replace('/(tabs)/train')} style={styles.iconButton}>
            <X color={colors.mutedText} size={22} />
          </Pressable>
        </View>

        <View style={styles.dots}>
          {workout.exercises.map((item, index) => {
            const completed =
              session.set_logs.filter((set) => set.exercise_id === item.id).length >= item.target_sets;
            const active = index === store.currentExerciseIndex;
            return (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  { backgroundColor: completed ? colors.accent : colors.cardAlt },
                  active && !completed && { backgroundColor: colors.action },
                ]}
              />
            );
          })}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.exerciseHeaderRow}>
              <Text style={[styles.kicker, { color: colors.mutedText }]}>
                EXERCISE {store.currentExerciseIndex + 1} OF {workout.exercises.length}
              </Text>
              {exercise.is_warmup ? (
                <Text style={[styles.warmupBadge, { backgroundColor: colors.success, color: COLORS.bone }]}>
                  WARM-UP
                </Text>
              ) : (
                <Text style={[styles.workingBadge, { borderColor: colors.accent, color: colors.accent }]}>
                  WORKING SET
                </Text>
              )}
            </View>
            <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exercise.name}</Text>
            <Text style={[styles.exerciseTarget, { color: colors.mutedText }]}>
              {exercise.target_sets} sets · {exercise.target_reps} reps · {exercise.rest_seconds}s rest
            </Text>
            {exercise.notes ? (
              <Text style={[styles.notes, { color: colors.mutedText }]}>{exercise.notes}</Text>
            ) : null}
          </View>

          <ProgressionTable
            exercise={exercise}
            sessions={history}
            todaySetLogs={todaySetLogs}
            workoutId={workout.id}
          />

          <ActiveSetLogger exercise={exercise} suggestedFromHistory={getSuggestedWeight(history, exercise.id, workout.id)} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            disabled={!allSetsDone}
            onPress={nextExercise}
            style={({ pressed }) => [
              styles.primary,
              {
                backgroundColor: allSetsDone ? colors.action : colors.cardAlt,
                opacity: pressed ? 0.92 : 1,
                shadowColor: allSetsDone ? colors.action : 'transparent',
              },
            ]}
          >
            <Text style={[styles.primaryText, { color: allSetsDone ? COLORS.bone : colors.mutedText }]}>
              {isLastExercise ? 'Finish workout' : 'Next exercise'}
            </Text>
            {allSetsDone ? (
              <View style={styles.primaryArrow} pointerEvents="none">
                <ArrowRight color={COLORS.bone} size={20} strokeWidth={2.2} />
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
      {store.restTimer ? <RestTimerOverlay /> : null}
    </SafeAreaView>
  );
}

function getSuggestedWeight(
  history: ReturnType<typeof useWorkoutSessions>['sessions'],
  exerciseId: string,
  workoutId: string,
) {
  const completedHistorical = history
    .filter((s) => s.completed_at)
    .filter((s) => s.source_id === workoutId)
    .sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at));
  const lastSession = completedHistorical[0];
  if (!lastSession) return null;
  const exerciseLogs = lastSession.set_logs.filter((log) => log.exercise_id === exerciseId);
  if (exerciseLogs.length === 0) return null;
  const heaviest = Math.max(...exerciseLogs.map((log) => log.weight_kg));
  return heaviest > 0 ? heaviest : null;
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining < 10 ? '0' : ''}${remaining}`;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  content: {
    gap: 14,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  dot: {
    borderRadius: 999,
    flex: 1,
    height: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 8,
  },
  exerciseCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  exerciseHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  exerciseTarget: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
    letterSpacing: 0.2,
  },
  exerciseTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  footer: {
    paddingBottom: 16,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  iconButton: {
    padding: 6,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  notes: {
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  primary: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
    position: 'relative',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  primaryArrow: {
    position: 'absolute',
    right: 18,
  },
  primaryText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  screen: { flex: 1 },
  scroll: { flex: 1 },
  timer: {
    fontFamily: FONTS.diagnostic,
    fontSize: 34,
    lineHeight: 36,
  },
  timerLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  timerStack: {
    alignItems: 'center',
    gap: 0,
  },
  title: { fontFamily: FONTS.sansBold, fontSize: 18 },
  warmupBadge: {
    borderRadius: 999,
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  workingBadge: {
    borderRadius: 999,
    borderWidth: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
