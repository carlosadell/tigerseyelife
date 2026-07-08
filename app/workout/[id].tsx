// app/workout/[id].tsx
//
// Workout detail — under Karen's single-movement model (2026-07-08),
// each workout is ONE primary movement. This screen shows the
// workout's title + block framing, the movement's tutorial video,
// target sets/reps, chronological history, and a Start button that
// launches the active session for that one movement.

import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';

import { ProgressionTable } from '../../components/workout/ProgressionTable';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { useWorkoutSessions } from '../../hooks/useWorkoutSessions';
import { getBlockHelper } from '../../lib/blockContext';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { exerciseById } from '../../lib/exerciseLibrary';
import { lastSessionFor, progressionFor } from '../../lib/recentSets';
import { adaptWorkout } from '../../lib/workoutSessionAdapter';
import { movementFor, workoutBySlug } from '../../lib/workoutSchedule';
import type { WorkoutSession } from '../../lib/workouts';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const startSession = useActiveWorkoutStore((state) => state.startSession);
  const { sessions, saveSession } = useWorkoutSessions();
  const { blockId } = useCurrentWeek();
  const [playerHeight] = useState(220);

  const workout = id ? workoutBySlug(id) : undefined;
  const helper = workout ? getBlockHelper(blockId, workout.slotIndex) : '';
  const movement = workout ? movementFor(workout) : null;
  const exercise = movement ? exerciseById(movement.exerciseId) : null;
  const canStart = Boolean(workout && exercise && session?.user.id);

  const hasHistory = useMemo(() => {
    if (!exercise) return false;
    return sessions.some(
      (s) =>
        Boolean(s.completed_at) &&
        s.set_logs.some((log) => log.exercise_id === exercise.id),
    );
  }, [sessions, exercise]);

  const recent = useMemo(
    () => (exercise ? lastSessionFor(sessions, exercise.id) : null),
    [sessions, exercise],
  );

  const progression = useMemo(
    () => (exercise ? progressionFor(sessions, exercise.id) : null),
    [sessions, exercise],
  );

  const startWorkout = async () => {
    if (!workout || !session?.user.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const adapted = adaptWorkout(workout, helper);
    const workoutSession: WorkoutSession = {
      id: `local-${Date.now()}`,
      name: adapted.name,
      set_logs: [],
      source_id: adapted.id,
      source_type: 'library',
      started_at: new Date().toISOString(),
      total_duration_seconds: 0,
      total_volume_kg: 0,
      user_id: session.user.id,
    };
    await saveSession(workoutSession);
    startSession(adapted, workoutSession);
    router.push(`/workout/active/${workoutSession.id}`);
  };

  if (!workout || !exercise || !movement) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Workout not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, canStart && styles.contentWithCta]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>

        <View style={styles.titleBlock}>
          <Text style={[styles.kicker, { color: colors.accent }]}>BLOCK · {blockId}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{workout.title}</Text>
          <Text style={[styles.movementName, { color: colors.text }]}>{exercise.name}</Text>
          {helper ? (
            <Text style={[styles.body, { color: colors.mutedText }]}>{helper}</Text>
          ) : null}
        </View>

        {exercise.youtubeVideoId ? (
          <View style={styles.videoWrap}>
            <YoutubePlayer height={playerHeight} videoId={exercise.youtubeVideoId} />
          </View>
        ) : (
          <View style={[styles.videoPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.placeholderText, { color: colors.mutedText }]}>
              Tutorial video coming soon.
            </Text>
          </View>
        )}

        <View style={[styles.targetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.targetKicker, { color: colors.mutedText }]}>TARGET FOR TODAY</Text>
          <Text style={[styles.targetLine, { color: colors.text }]}>
            {movement.sets} sets · {movement.reps} reps · {movement.restSeconds ?? 60}s rest
          </Text>
          {recent ? (
            <View style={styles.recentRow}>
              <Text style={[styles.recentLabel, { color: colors.accent }]}>
                LAST · {recent.relativeDate.toUpperCase()}
              </Text>
              <Text style={[styles.recentSummary, { color: colors.text }]}>{recent.summary}</Text>
            </View>
          ) : null}
        </View>

        <View>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your history</Text>
            {progression && progression.trend === 'up' ? (
              <View
                style={[
                  styles.progressionPill,
                  { backgroundColor: '#F4E9D2', borderColor: COLORS.tigerGold },
                ]}
              >
                <TrendingUp color={COLORS.tigerGold} size={12} strokeWidth={2.4} />
                <Text style={[styles.progressionText, { color: COLORS.tigerGold }]}>
                  {progression.label}
                </Text>
              </View>
            ) : null}
          </View>
          {hasHistory ? (
            <View style={styles.historyWrap}>
              <ProgressionTable
                exercise={{
                  id: exercise.id,
                  name: exercise.name,
                  equipment: '',
                  target_sets: movement.sets,
                  target_reps: movement.reps,
                  rest_seconds: movement.restSeconds ?? 60,
                  is_warmup: false,
                }}
                sessions={sessions}
                todaySetLogs={[]}
                showTodayColumn={false}
                maxColumns={6}
              />
            </View>
          ) : (
            <View
              style={[
                styles.historyEmpty,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.historyEmptyText, { color: colors.mutedText }]}>
                No history yet. Your weights and reps will show here after your first session.
              </Text>
            </View>
          )}
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How to do it</Text>
          <View style={[styles.instructionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {exercise.instructions.map((step, idx) => (
              <View key={`${idx}-${step.slice(0, 10)}`} style={styles.instructionRow}>
                <Text style={[styles.instructionNum, { color: COLORS.tigerGold }]}>
                  {String(idx + 1).padStart(2, '0')}
                </Text>
                <Text style={[styles.instructionText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {canStart ? (
        <View style={[styles.ctaFooter, { bottom: insets.bottom + 16 }]}>
          <Pressable
            accessibilityRole="button"
            onPress={startWorkout}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <View
              style={[
                styles.startButton,
                { backgroundColor: COLORS.tangerine, shadowColor: COLORS.tangerine },
              ]}
            >
              <Text style={styles.startText}>Start Workout</Text>
            </View>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  body: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  content: {
    gap: 18,
    paddingBottom: 40,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  contentWithCta: {
    paddingBottom: 120,
  },
  ctaFooter: {
    left: SPACING.screenX,
    position: 'absolute',
    right: SPACING.screenX,
  },
  empty: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenX,
  },
  headerRow: { paddingHorizontal: SPACING.screenX, paddingTop: 4 },
  historyEmpty: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  historyEmptyText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  historyWrap: {
    marginTop: 12,
  },
  instructionNum: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
    minWidth: 26,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  instructionText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  instructionsCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  movementName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 18,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  placeholderText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  progressionPill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressionText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  recentLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  recentRow: {
    gap: 3,
    marginTop: 10,
  },
  recentSummary: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  screen: { flex: 1 },
  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 20,
    letterSpacing: -0.2,
  },
  startButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  startText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  targetCard: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  targetKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  targetLine: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  titleBlock: {
    gap: 2,
  },
  videoPlaceholder: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 220,
    justifyContent: 'center',
  },
  videoWrap: {
    backgroundColor: '#000000',
    borderRadius: 14,
    overflow: 'hidden',
  },
});
