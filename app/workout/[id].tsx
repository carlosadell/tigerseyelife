// app/workout/[id].tsx
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, PlayCircle } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { useThemeColors } from '../../hooks/useTheme';
import { useWorkoutSessions } from '../../hooks/useWorkoutSessions';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { exerciseById } from '../../lib/exerciseLibrary';
import { lastSessionFor } from '../../lib/recentSets';
import { workoutBySlug } from '../../lib/workoutSchedule';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const { sessions } = useWorkoutSessions();

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
        <View style={[styles.tipCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <PlayCircle color={colors.accent} size={18} strokeWidth={1.8} />
          <Text style={[styles.tipText, { color: colors.mutedText }]}>
            Tap any exercise to watch the tutorial and start the workout.
          </Text>
        </View>
        <SectionLabel label="EXERCISES" />
        {workout.exercises.map((entry, index) => {
          const lib = exerciseById(entry.exerciseId);
          const primaries = lib.muscleGroups.filter((m) => m.primary);
          const recent = lastSessionFor(sessions, entry.exerciseId);
          return (
            <Pressable
              key={`${entry.exerciseId}-${index}`}
              accessibilityRole="button"
              onPress={() => router.push(`/exercise/${entry.exerciseId}?workoutSlug=${workout.slug}`)}
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
                {recent ? (
                  <View style={styles.recentRow}>
                    <Text style={[styles.recentLabel, { color: colors.accent }]}>
                      LAST · {recent.relativeDate.toUpperCase()}
                    </Text>
                    <Text style={[styles.recentSummary, { color: colors.text }]}>
                      {recent.summary}
                    </Text>
                  </View>
                ) : null}
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
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
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
    paddingBottom: 40,
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
  headerRow: { paddingHorizontal: SPACING.screenX, paddingTop: 4 },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  number: { alignItems: 'center', borderRadius: 12, height: 24, justifyContent: 'center', width: 24 },
  numberText: { fontFamily: FONTS.sansBold, fontSize: 12 },
  recentLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  recentRow: {
    gap: 3,
    marginTop: 2,
  },
  recentSummary: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  screen: { flex: 1 },
  target: { fontFamily: FONTS.sansMedium, fontSize: 11, letterSpacing: 1.1 },
  tipCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  tipText: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
});
