// app/workout/[id].tsx
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../hooks/useTheme';
import { useWorkoutSessions } from '../../hooks/useWorkoutSessions';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { exerciseById } from '../../lib/exerciseLibrary';
import { adaptWorkout } from '../../lib/workoutSessionAdapter';
import { isStubWorkout, workoutBySlug } from '../../lib/workoutSchedule';
import type { WorkoutSession } from '../../lib/workouts';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const startSession = useActiveWorkoutStore((state) => state.startSession);
  const { saveSession } = useWorkoutSessions();

  const workout = id ? workoutBySlug(id) : undefined;

  if (!workout) {
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

  if (isStubWorkout(workout)) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.kicker, { color: colors.mutedText }]}>BLOCK · {workout.blockId}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{workout.title}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Karen and Ryan are loading this one. The session shape is being finalized.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const startWorkout = async () => {
    if (!session?.user.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const adapted = adaptWorkout(workout);
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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>
        <Text style={[styles.kicker, { color: colors.accent }]}>BLOCK · {workout.blockId}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{workout.title}</Text>
        {workout.helper ? (
          <Text style={[styles.body, { color: colors.mutedText }]}>{workout.helper}</Text>
        ) : null}
        <SectionLabel label="EXERCISES" />
        {workout.exercises.map((entry, index) => {
          const lib = exerciseById(entry.exerciseId);
          const primaries = lib.muscleGroups.filter((m) => m.primary);
          return (
            <Pressable
              key={`${entry.exerciseId}-${index}`}
              accessibilityRole="button"
              onPress={() => router.push(`/exercise/${entry.exerciseId}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View
                style={[styles.exercise, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.exerciseTop}>
                  <View style={[styles.number, { backgroundColor: colors.cardAlt }]}>
                    <Text style={[styles.numberText, { color: colors.text }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.exerciseName, { color: colors.text }]}>{lib.name}</Text>
                </View>
                <Text style={[styles.target, { color: colors.mutedText }]}>
                  {entry.sets} SETS · {entry.reps} REPS · {entry.restSeconds ?? 60}S REST
                </Text>
                <View style={styles.chips}>
                  {primaries.map((m) => (
                    <Text
                      key={m.name}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.cardAlt, color: colors.text },
                      ]}
                    >
                      {m.name}
                    </Text>
                  ))}
                </View>
                {lib.youtubeVideoId === null ? (
                  <Text style={[styles.placeholder, { color: colors.mutedText }]}>
                    Tutorial video coming soon.
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
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
            <Text style={[styles.startText, { color: '#FFFFFF' }]}>Start workout</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  chip: {
    borderRadius: 999,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  content: {
    gap: 14,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  empty: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenX,
  },
  exercise: { borderRadius: 12, borderWidth: 1, gap: 8, padding: 14 },
  exerciseName: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 15 },
  exerciseTop: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  footer: { left: SPACING.screenX, position: 'absolute', right: SPACING.screenX },
  headerRow: { paddingHorizontal: SPACING.screenX, paddingTop: 4 },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  number: { alignItems: 'center', borderRadius: 12, height: 24, justifyContent: 'center', width: 24 },
  numberText: { fontFamily: FONTS.sansBold, fontSize: 12 },
  placeholder: { fontFamily: FONTS.sans, fontSize: 12.5, fontStyle: 'italic' },
  screen: { flex: 1 },
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
  startText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: 0.2 },
  target: { fontFamily: FONTS.sansMedium, fontSize: 11, letterSpacing: 1.1 },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
});
