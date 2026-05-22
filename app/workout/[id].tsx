import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../hooks/useTheme';
import { useWorkout } from '../../hooks/useWorkout';
import { useWorkoutSessions } from '../../hooks/useWorkoutSessions';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { WorkoutExercise, WorkoutSession } from '../../lib/workouts';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { data: workout, isLoading } = useWorkout(id);
  const startSession = useActiveWorkoutStore((state) => state.startSession);
  const { saveSession } = useWorkoutSessions();

  const startWorkout = async () => {
    if (!workout || !session?.user.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const workoutSession: WorkoutSession = {
      id: `local-${Date.now()}`,
      name: workout.name,
      set_logs: [],
      source_id: workout.id,
      source_type: 'library',
      started_at: new Date().toISOString(),
      total_duration_seconds: 0,
      total_volume_kg: 0,
      user_id: session.user.id,
    };
    await saveSession(workoutSession);
    startSession(workout, workoutSession);
    router.push(`/workout/active/${workoutSession.id}`);
  };

  if (isLoading || !workout) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>
        <View style={[styles.cover, { backgroundColor: workout.cover_color }]}>
          <Text style={styles.coverTitle}>{workout.name}</Text>
        </View>
        <View style={styles.stats}>
          <Stat label="DURATION" value={`${workout.duration_minutes} min`} />
          <Stat label="DIFFICULTY" value={workout.difficulty} />
          <Stat label="FOCUS" value={workout.focus_area} />
        </View>
        <Text style={[styles.description, { color: colors.text }]}>{workout.description}</Text>
        <View style={styles.chips}>
          {workout.equipment.map((item) => (
            <Text key={item} style={[styles.chip, { backgroundColor: colors.cardAlt, color: colors.mutedText }]}>
              {item}
            </Text>
          ))}
        </View>
        <SectionLabel label="EXERCISES" />
        {workout.exercises.map((exercise, index) => (
          <ExerciseRow exercise={exercise} index={index} key={exercise.id} />
        ))}
      </ScrollView>
      <View style={[styles.footer, { bottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={startWorkout}
          style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        >
          <View
            style={[
              styles.startButton,
              {
                backgroundColor: COLORS.tangerine,
                shadowColor: COLORS.tangerine,
              },
            ]}
          >
            <Text style={[styles.startText, { color: '#FFFFFF' }]}>Start session</Text>
            <View style={styles.startArrow} pointerEvents="none">
              <ChevronLeft color="#FFFFFF" size={22} strokeWidth={2.6} style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function ExerciseRow({ exercise, index }: { exercise: WorkoutExercise; index: number }) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      onPress={() => setExpanded((current) => !current)}
      style={[styles.exercise, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.exerciseTop}>
        <View style={[styles.number, { backgroundColor: colors.cardAlt }]}>
          <Text style={[styles.numberText, { color: colors.text }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
        {exercise.is_warmup ? (
          <Text style={[styles.warmup, { backgroundColor: colors.success, color: colors.successText }]}>
            WARMUP
          </Text>
        ) : null}
      </View>
      <Text style={[styles.target, { color: colors.mutedText }]}>
        {exercise.target_sets} SETS · {exercise.target_reps} REPS · {exercise.rest_seconds}S REST
      </Text>
      {expanded && exercise.notes ? (
        <Text style={[styles.notes, { color: colors.mutedText }]}>{exercise.notes}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  chip: {
    borderRadius: 999,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: 'capitalize',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  content: {
    gap: 16,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  cover: {
    borderRadius: 14,
    justifyContent: 'flex-end',
    minHeight: 120,
    padding: 18,
  },
  coverTitle: {
    color: COLORS.bone,
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  description: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  exercise: { borderRadius: 12, borderWidth: 1, gap: 8, padding: 14 },
  exerciseName: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 15 },
  exerciseTop: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  footer: { left: SPACING.screenX, position: 'absolute', right: SPACING.screenX },
  notes: { fontFamily: FONTS.sans, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  number: { alignItems: 'center', borderRadius: 12, height: 24, justifyContent: 'center', width: 24 },
  numberText: { fontFamily: FONTS.sansBold, fontSize: 12 },
  screen: { flex: 1 },
  startArrow: { bottom: 0, justifyContent: 'center', position: 'absolute', right: 18, top: 0 },
  startButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 18,
    position: 'relative',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  startText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: 0.2, textAlign: 'center' },
  stat: { borderRadius: 12, borderWidth: 1, flex: 1, gap: 4, padding: 12 },
  statLabel: { fontFamily: FONTS.sansMedium, fontSize: 10, letterSpacing: 1.2 },
  stats: { flexDirection: 'row', gap: 10 },
  statValue: { fontFamily: FONTS.sansMedium, fontSize: 14, textTransform: 'capitalize' },
  target: { fontFamily: FONTS.sansMedium, fontSize: 11, letterSpacing: 1.1 },
  warmup: {
    borderRadius: 999,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
