// app/(tabs)/today.tsx
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocusHeroCard } from '../../components/today/FocusHeroCard';
import { GreetingHeader } from '../../components/today/GreetingHeader';
import { TodayHeader } from '../../components/today/TodayHeader';
import { WeekStrip } from '../../components/history/WeekStrip';
import { AnchorRow } from '../../components/ui/AnchorRow';
import { AwarenessCard, type DailyPrompt } from '../../components/ui/AwarenessCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useDailyEngagement } from '../../hooks/useDailyEngagement';
import { useMembership } from '../../hooks/useMembership';
import { useProfile } from '../../hooks/useProfile';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { anchorsForWeek, heroHeadlineFor, resolveAnchorIcon } from '../../lib/heroAnchors';
import { weekFor } from '../../lib/program';
import { workoutsForBlock } from '../../lib/workoutSchedule';

const light = THEME_COLORS.light;

export default function TodayScreen() {
  const { isDevSession } = useAuth();
  const { profile } = useProfile();
  const { devReset } = useMembership();
  const { weekNumber, blockId } = useCurrentWeek();
  const { recordEngagement } = useDailyEngagement();

  const week = weekFor(weekNumber);
  const headline = heroHeadlineFor(weekNumber);
  const anchors = anchorsForWeek(weekNumber);
  const blockWorkouts = workoutsForBlock(blockId);
  const todayWorkout = blockWorkouts[0];
  const prompt: DailyPrompt = { kind: 'awareness', body: week.discussionPrompt };

  const blockTitle = `${blockId.charAt(0)}${blockId.slice(1).toLowerCase()}`;

  const openAnchor = async (anchorId: string, route: string) => {
    await recordEngagement(anchorId);
    router.push(route);
  };

  const onStartOver = async () => {
    await devReset();
    router.replace('/membership');
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TodayHeader />
        <WeekStrip />

        <View style={styles.greetingWrap}>
          <GreetingHeader
            firstName={profile.firstName}
            subtitle={`${blockTitle} Block · Week ${weekNumber}`}
          />
        </View>

        <FocusHeroCard weekIndex={weekNumber} headline={headline} />

        <SectionHeader title="Today's Focus" meta={`${anchors.length} anchors`} />
        <View>
          {anchors.map((anchor) => {
            const Icon = resolveAnchorIcon(anchor.icon);
            return (
              <AnchorRow
                key={anchor.id}
                Icon={Icon}
                title={anchor.title}
                sub={anchor.helper}
                onPress={() => openAnchor(anchor.id, anchor.conceptRoute)}
              />
            );
          })}
        </View>

        {todayWorkout ? (
          <>
            <SectionHeader title="Today's Workout" />
            <Pressable
              onPress={() => router.push(`/workout/${todayWorkout.slug}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View style={styles.workoutCard}>
                <Text style={styles.workoutKicker}>
                  {todayWorkout.exercises.length} EXERCISES
                </Text>
                <Text style={styles.workoutTitle}>{todayWorkout.title}</Text>
                {todayWorkout.helper ? (
                  <Text style={styles.workoutHelper} numberOfLines={2}>
                    {todayWorkout.helper}
                  </Text>
                ) : null}
                <Text style={styles.workoutCta}>Open</Text>
              </View>
            </Pressable>
          </>
        ) : null}

        <View style={styles.awarenessWrap}>
          <AwarenessCard prompt={prompt} />
        </View>

        {isDevSession ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dev: start over"
            onPress={onStartOver}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View style={styles.devReset}>
              <Text style={styles.devKicker}>DEV ONLY</Text>
              <Text style={styles.devBody}>Start over from the fork</Text>
            </View>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  awarenessWrap: { marginTop: 22 },
  content: {
    paddingBottom: 128,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  devBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    letterSpacing: -0.1,
    marginTop: 4,
  },
  devKicker: {
    color: COLORS.tangerine,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  devReset: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginTop: 28,
    padding: 14,
  },
  greetingWrap: { marginBottom: 18, marginTop: 28 },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  workoutCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  workoutCta: {
    color: COLORS.tangerine,
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
    marginTop: 6,
  },
  workoutHelper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  workoutKicker: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  workoutTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
});
