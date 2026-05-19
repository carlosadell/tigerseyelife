import { format } from 'date-fns';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreatePowerHero } from '../../components/today/CreatePowerHero';
import { IntentionInput } from '../../components/today/IntentionInput';
import { NutritionCard, WorkoutCard } from '../../components/today/TodayCards';
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
  const { entry, saveIntention } = useDailyEntry();
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
          <CreatePowerHero
            firstName={profile.firstName}
            onSignOut={signOut}
            subtitle={subtitle}
          />
          <View style={styles.stack}>
            <IntentionInput intention={entry.intention ?? defaultIntention} onSave={saveIntention} />
            <WorkoutCard
              assigned={Boolean(todayWorkout)}
              durationMinutes={todayWorkout?.duration_minutes}
              exerciseCount={todayWorkout?.exercise_count}
              name={todayWorkout?.name}
            />
            <NutritionCard />
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
