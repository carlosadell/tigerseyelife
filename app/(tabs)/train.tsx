// app/(tabs)/train.tsx
import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WorkoutCard } from '../../components/workout/WorkoutCard';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';
import { blockFor } from '../../lib/program';
import { workoutsForBlock } from '../../lib/workoutSchedule';

export default function TrainScreen() {
  const colors = useThemeColors();
  const { weekNumber, blockId } = useCurrentWeek();
  const workouts = workoutsForBlock(blockId);
  const block = blockFor(blockId);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>
              WEEK {weekNumber} · {blockId}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Workouts</Text>
            <Text style={[styles.helper, { color: colors.mutedText }]} numberOfLines={3}>
              {block.mindset}
            </Text>
          </View>

          <View style={styles.grid}>
            {workouts.map((workout) => (
              <View key={workout.slug} style={styles.cell}>
                <WorkoutCard
                  title={workout.title}
                  helper={workout.helper}
                  exerciseCount={workout.exercises.length}
                  onPress={() => router.push(`/workout/${workout.slug}`)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cell: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  content: {
    gap: 18,
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  header: {
    gap: 8,
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  phoneFrame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
});
