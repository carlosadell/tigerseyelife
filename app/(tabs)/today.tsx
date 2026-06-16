// app/(tabs)/today.tsx
import { router } from 'expo-router';
import { ArrowRight, Dumbbell } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyActionRow } from '../../components/today/DailyActionRow';
import { DiscussionCard } from '../../components/today/DiscussionCard';
import { PrimaryFocusCard } from '../../components/today/PrimaryFocusCard';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useDailyActions } from '../../hooks/useDailyActions';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { weekFor } from '../../lib/program';
import { workoutsForBlock } from '../../lib/workoutSchedule';

export default function TodayScreen() {
  const colors = useThemeColors();
  const { weekNumber, blockId } = useCurrentWeek();
  const week = weekFor(weekNumber);
  const { todayCompletions, toggleAction } = useDailyActions(weekNumber);

  const totalToday = week.weekAtAGlance.length;
  const doneToday = week.weekAtAGlance.filter((a) => todayCompletions.has(a.id)).length;

  const blockWorkouts = workoutsForBlock(blockId);
  const todayWorkout = blockWorkouts[0];

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>TODAY</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Week {weekNumber} of 12 · {blockId}
            </Text>
          </View>

          <View style={[styles.actionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.actionsHeader}>
              <Text style={[styles.actionsTitle, { color: colors.text }]}>Today's Actions</Text>
              <Text style={[styles.actionsCount, { color: colors.mutedText }]}>
                {doneToday} of {totalToday}
              </Text>
            </View>
            <View style={styles.actionsList}>
              {week.weekAtAGlance.map((action) => (
                <DailyActionRow
                  key={action.id}
                  label={action.label}
                  thread={action.thread}
                  completed={todayCompletions.has(action.id)}
                  onToggle={() => toggleAction(action.id, action.weeklyTarget)}
                />
              ))}
            </View>
          </View>

          <PrimaryFocusCard
            primaryFocus={week.primaryFocus}
            toolSlugs={week.toolSlugs}
            weekNumber={weekNumber}
          />

          {todayWorkout ? (
            <Pressable
              onPress={() => router.push(`/workout/${todayWorkout.slug}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View
                style={[
                  styles.workoutCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.workoutTop}>
                  <Dumbbell color={colors.accent} size={18} strokeWidth={1.8} />
                  <Text style={[styles.workoutKicker, { color: colors.mutedText }]}>
                    {todayWorkout.exercises.length} EXERCISES
                  </Text>
                </View>
                <Text style={[styles.workoutTitle, { color: colors.text }]}>
                  {todayWorkout.title}
                </Text>
                {todayWorkout.helper ? (
                  <Text style={[styles.workoutHelper, { color: colors.mutedText }]} numberOfLines={2}>
                    {todayWorkout.helper}
                  </Text>
                ) : null}
                <View style={styles.workoutCta}>
                  <Text style={[styles.workoutCtaText, { color: COLORS.tangerine }]}>Open</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>
          ) : null}

          <DiscussionCard prompt={week.discussionPrompt} weekNumber={weekNumber} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionsCard: { borderRadius: 14, borderWidth: 1, gap: 12, padding: 14 },
  actionsCount: { fontFamily: FONTS.sansBold, fontSize: 12, letterSpacing: 0.4 },
  actionsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsList: { gap: 8 },
  actionsTitle: { fontFamily: FONTS.sansBold, fontSize: 18 },
  content: { gap: 14, paddingBottom: 128, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  header: { gap: 6 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 2.4 },
  phoneFrame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  screen: { alignItems: 'center', flex: 1 },
  title: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.3, lineHeight: 28 },
  workoutCard: { borderRadius: 14, borderWidth: 1, gap: 8, padding: 14 },
  workoutCta: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 4 },
  workoutCtaText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
  workoutHelper: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18 },
  workoutKicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.4 },
  workoutTitle: { fontFamily: FONTS.sansBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 22 },
  workoutTop: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
