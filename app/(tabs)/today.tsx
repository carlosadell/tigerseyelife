import { format } from 'date-fns';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { CreatePowerHero } from '../../components/today/CreatePowerHero';
import { DailyNudges } from '../../components/today/DailyNudges';
import { EveningReflection } from '../../components/today/EveningReflection';
import { IntentionInput } from '../../components/today/IntentionInput';
import { PersonalizationCard } from '../../components/today/PersonalizationCard';
import { TrainingSummaryCard } from '../../components/today/TrainingSummaryCard';
import {
  EveningCheckInCard,
  NutritionCard,
  UpcomingCard,
  WorkoutCard,
} from '../../components/today/TodayCards';
import { useAuth } from '../../hooks/useAuth';
import { useDailyEntry } from '../../hooks/useDailyEntry';
import { useProfile } from '../../hooks/useProfile';
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
  const subtitle = `${format(new Date(), 'EEEE')} · Week 4 of CREATE POWER`;
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <CreatePowerHero
            firstName={profile.firstName}
            onSignOut={signOut}
            subtitle={subtitle}
          />
          <IntentionInput intention={entry.intention ?? defaultIntention} onSave={saveIntention} />
          <WorkoutCard
            assigned={Boolean(todayWorkout)}
            durationMinutes={todayWorkout?.duration_minutes}
            exerciseCount={todayWorkout?.exercise_count}
            name={todayWorkout?.name}
          />
          <NutritionCard />
          <TrainingSummaryCard />
          <EveningCheckInCard />
          <UpcomingCard />
          <DailyNudges />
          <View style={styles.section}>
            <SectionLabel label="EVENING REFLECTION" />
            <EveningReflection
              mood={entry.mood}
              movementTags={entry.movementTags}
              onMoodPress={saveMood}
              onTagPress={toggleMovementTag}
            />
          </View>
          <PersonalizationCard />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 112,
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
  section: {
    gap: 12,
  },
});
