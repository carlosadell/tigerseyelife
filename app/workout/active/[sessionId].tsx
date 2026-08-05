import { router } from 'expo-router';
import { CheckCircle2, ChevronLeft, Timer } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActiveSetLogger } from '../../../components/workout/ActiveSetLogger';
import { RestTimerOverlay } from '../../../components/workout/RestTimerOverlay';
import { useThemeColors } from '../../../hooks/useTheme';
import { useWorkoutSessions } from '../../../hooks/useWorkoutSessions';
import { FONTS, SPACING } from '../../../lib/brand';
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

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.target_sets, 0);
  const doneSets = Math.min(session.set_logs.length, totalSets);
  const progress = totalSets > 0 ? doneSets / totalSets : 0;

  const finish = () => router.replace(`/workout/complete/${session.id}`);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        {/* Header — back · workout identity · Finish */}
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.text} size={26} />
          </Pressable>
          <View style={styles.identity}>
            <Text style={[styles.kicker, { color: colors.mutedText }]}>TODAY'S WORKOUT</Text>
            <Text style={[styles.wName, { color: colors.text }]} numberOfLines={1}>
              {workout.name}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Finish workout"
            hitSlop={8}
            onPress={finish}
            style={({ pressed }) => [
              styles.finish,
              { borderColor: colors.action },
              pressed && { opacity: 0.7 },
            ]}
          >
            <CheckCircle2 color={colors.action} size={16} strokeWidth={2.4} />
            <Text style={[styles.finishText, { color: colors.action }]}>Finish</Text>
          </Pressable>
        </View>

        {/* Timer + progress */}
        <View style={styles.meta}>
          <View style={styles.timerRow}>
            <Timer color={colors.accent} size={15} strokeWidth={2.2} />
            <Text style={[styles.timer, { color: colors.accent }]}>{formatSeconds(elapsed)}</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.cardAlt }]}>
            <View
              style={[styles.fill, { backgroundColor: colors.accent, width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={[styles.count, { color: colors.mutedText }]}>
            {doneSets}/{totalSets}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          {workout.exercises.map((exercise) => (
            <ActiveSetLogger
              key={exercise.id}
              exercise={exercise}
              suggestedFromHistory={getSuggestedWeight(history, exercise.id, workout.id)}
            />
          ))}
        </ScrollView>
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
    paddingTop: 8,
  },
  count: { fontFamily: FONTS.sansBold, fontSize: 12.5, minWidth: 34, textAlign: 'right' },
  fill: { borderRadius: 999, height: '100%' },
  finish: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.4,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  finishText: { fontFamily: FONTS.sansBold, fontSize: 14 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  iconButton: { padding: 2 },
  identity: { flex: 1, minWidth: 0 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 1.4 },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 12,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  screen: { flex: 1 },
  scroll: { flex: 1 },
  timer: { fontFamily: FONTS.diagnostic, fontSize: 22, lineHeight: 24 },
  timerRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  title: { fontFamily: FONTS.sansBold, fontSize: 18 },
  track: { borderRadius: 999, flex: 1, height: 6, overflow: 'hidden' },
  wName: { fontFamily: FONTS.sansBold, fontSize: 20, letterSpacing: -0.3, marginTop: 1 },
});
