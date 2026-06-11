import { format } from 'date-fns';
import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeekStrip } from '../../components/history/WeekStrip';
import { CreatePowerHero } from '../../components/today/CreatePowerHero';
import { DailyAdviceCarousel } from '../../components/today/DailyAdviceCarousel';
import { EveningReflection } from '../../components/today/EveningReflection';
import { GreetingHeader } from '../../components/today/GreetingHeader';
import { IntentionInput } from '../../components/today/IntentionInput';
import { NextLessonCard } from '../../components/today/NextLessonCard';
import { QuickAddBar } from '../../components/today/QuickAddBar';
import { ShowMoreToggle } from '../../components/today/ShowMoreToggle';
import { NutritionCard, WorkoutCard } from '../../components/today/TodayCards';
import { TodayFocusCard } from '../../components/today/TodayFocusCard';
import { useAuth } from '../../hooks/useAuth';
import { useDailyEntry } from '../../hooks/useDailyEntry';
import { useProfile } from '../../hooks/useProfile';
import { useStreak } from '../../hooks/useStreak';
import { useThemeColors } from '../../hooks/useTheme';
import { useAssignedProgram } from '../../hooks/useAssignedProgram';
import { SPACING } from '../../lib/brand';

const defaultIntention =
  'Before reaching for food after 7pm tonight, pause for 3 seconds and ask: Am I hungry, or is something else going on?';

export default function TodayScreen() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { todayWorkout } = useAssignedProgram();
  const { entry, saveIntention, saveMood, toggleMovementTag } = useDailyEntry();
  const { days: streakDays } = useStreak();
  const subtitle = `${format(new Date(), 'EEEE').toUpperCase()} · WEEK 4 OF CREATE POWER`;
  const colors = useThemeColors();

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={styles.stack}>
            <WeekStrip />
            <GreetingHeader firstName={profile.firstName} subtitle={subtitle} />
            <TodayFocusCard onPress={() => router.push('/(tabs)/grow')} />
            <NextLessonCard onPress={() => router.push('/(tabs)/grow')} />
            <ShowMoreToggle>
              <CreatePowerHero
                firstName={profile.firstName}
                onSignOut={signOut}
                streakDays={streakDays}
                subtitle={subtitle}
              />
              <QuickAddBar />
              <DailyAdviceCarousel />
              <IntentionInput intention={entry.intention ?? defaultIntention} onSave={saveIntention} />
              <WorkoutCard
                assigned={Boolean(todayWorkout)}
                durationMinutes={todayWorkout?.duration_minutes}
                exerciseCount={todayWorkout?.exercise_count}
                name={todayWorkout?.name}
              />
              <NutritionCard />
              <EveningReflection
                mood={entry.mood}
                movementTags={entry.movementTags ?? []}
                onMoodPress={saveMood}
                onTagPress={toggleMovementTag}
              />
            </ShowMoreToggle>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 0,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  phoneFrame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  stack: {
    gap: 14,
    marginTop: 24,
  },
});
