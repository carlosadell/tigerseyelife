import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActiveSetLogger } from '../../../components/workout/ActiveSetLogger';
import { RestTimerOverlay } from '../../../components/workout/RestTimerOverlay';
import { useThemeColors } from '../../../hooks/useTheme';
import { FONTS, SPACING } from '../../../lib/brand';
import { useActiveWorkoutStore } from '../../../stores/activeWorkout';

export default function ActiveWorkoutScreen() {
  const colors = useThemeColors();
  const store = useActiveWorkoutStore();
  const workout = store.currentWorkout;
  const session = store.currentSession;
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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
          <Text style={[styles.timer, { color: colors.text }]}>{formatSeconds(elapsed)}</Text>
          <Pressable onPress={() => router.replace('/(tabs)/train')}>
            <X color={colors.mutedText} size={24} />
          </Pressable>
        </View>
        <View style={styles.dots}>
          {workout.exercises.map((item, index) => {
            const completed = session.set_logs.filter((set) => set.exercise_id === item.id).length >= item.target_sets;
            const active = index === store.currentExerciseIndex;
            return (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  { backgroundColor: colors.cardAlt },
                  completed && { backgroundColor: colors.success },
                  active && { backgroundColor: colors.accent },
                ]}
              />
            );
          })}
        </View>
        <View style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.kicker, { color: colors.mutedText }]}>
            EXERCISE {store.currentExerciseIndex + 1} OF {workout.exercises.length}
          </Text>
          <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exercise.name}</Text>
          <Text style={[styles.kicker, { color: colors.mutedText }]}>
            {exercise.target_sets} SETS · {exercise.target_reps} REPS · {exercise.rest_seconds}S REST
          </Text>
          {exercise.notes ? <Text style={[styles.notes, { color: colors.mutedText }]}>{exercise.notes}</Text> : null}
        </View>
        <ActiveSetLogger exercise={exercise} />
        <Pressable
          disabled={!allSetsDone}
          onPress={nextExercise}
          style={[styles.primary, { backgroundColor: allSetsDone ? colors.accent : colors.cardAlt }]}
        >
          <Text style={[styles.primaryText, { color: allSetsDone ? colors.inverseText : colors.mutedText }]}>
            {isLastExercise ? 'Finish Workout' : 'Next Exercise →'}
          </Text>
        </Pressable>
      </View>
      {store.restTimer ? <RestTimerOverlay /> : null}
    </SafeAreaView>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining < 10 ? '0' : ''}${remaining}`;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  content: { flex: 1, gap: 16, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  dot: { borderRadius: 4, flex: 1, height: 8 },
  dots: { flexDirection: 'row', gap: 6 },
  exerciseCard: { borderRadius: 22, borderWidth: 1, gap: 8, padding: 20 },
  exerciseTitle: { fontFamily: FONTS.sansBold, fontSize: 24, lineHeight: 29 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  kicker: { fontFamily: FONTS.sansMedium, fontSize: 11, letterSpacing: 1.2 },
  notes: { fontFamily: FONTS.sans, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  primary: { alignItems: 'center', borderRadius: 16, height: 54, justifyContent: 'center' },
  primaryText: { fontFamily: FONTS.sansBold, fontSize: 15 },
  screen: { flex: 1 },
  timer: { fontFamily: FONTS.diagnostic, fontSize: 34 },
  title: { fontFamily: FONTS.sansBold, fontSize: 18 },
});
