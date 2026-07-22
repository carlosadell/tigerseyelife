// app/(tabs)/today.tsx
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TodayHeader } from '../../components/today/TodayHeader';
import { WeekStrip } from '../../components/history/WeekStrip';
import { AnchorRow } from '../../components/ui/AnchorRow';
import { AwarenessCard, type DailyPrompt } from '../../components/ui/AwarenessCard';
import { ProgramHeroCard } from '../../components/ui/ProgramHeroCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { useConceptTelemetry } from '../../hooks/useConceptTelemetry';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useDailyEngagement } from '../../hooks/useDailyEngagement';
import { useMembership } from '../../hooks/useMembership';
import { useProfile } from '../../hooks/useProfile';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { coachStillForWeek } from '../../lib/coachStills';
import type { ConceptScope } from '../../lib/conceptMetadata';
import { getDayPeriod } from '../../lib/greetings';
import { anchorsForWeek, heroHeadlineFor, resolveAnchorIcon } from '../../lib/heroAnchors';
import { weekFor } from '../../lib/program';
import { workoutsForBlock } from '../../lib/workoutSchedule';

const light = THEME_COLORS.light;

export default function TodayScreen() {
  const { isDevSession } = useAuth();
  const { profile } = useProfile();
  const { devReset, devSetWeek } = useMembership();
  const { weekNumber, blockId } = useCurrentWeek();
  const { recordEngagement } = useDailyEngagement();
  const t = useConceptTelemetry();
  const lastBlockRef = useRef<ConceptScope | null>(null);

  useEffect(() => {
    if (!blockId) return;
    if (lastBlockRef.current === blockId) return;
    if (lastBlockRef.current) {
      t.recordBlockExited('today', lastBlockRef.current);
    }
    t.recordBlockEntered('today', blockId);
    lastBlockRef.current = blockId;
  }, [blockId, t]);

  const week = weekFor(weekNumber);
  const headline = heroHeadlineFor(weekNumber);
  const anchors = anchorsForWeek(weekNumber);
  const blockWorkouts = workoutsForBlock(blockId);
  const todayWorkout = blockWorkouts[0];
  const prompt: DailyPrompt = { kind: 'awareness', body: week.discussionPrompt };
  const showDipCallout = blockId === 'COMMIT' && weekNumber === 2;

  const blockTitle = `${blockId.charAt(0)}${blockId.slice(1).toLowerCase()}`;
  const period = getDayPeriod();
  const firstName = profile.firstName?.trim().split(/\s+/)[0] || 'friend';
  const greeting = `${period.charAt(0).toUpperCase()}${period.slice(1)}, ${firstName}.`;

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

        {/* Shared program hero — same frame as Train/Fuel/Grow, but Today's
            title is the personal greeting (natural case) and the subtitle is
            the week's focus. Photo-only: the week strip above is Today's
            progress readout, so no instrument band. */}
        <View style={styles.heroWrap}>
          <ProgramHeroCard
            kicker={`${blockTitle.toUpperCase()} BLOCK · WEEK ${weekNumber}`}
            name={greeting}
            nameTransform="none"
            subtitle={headline}
            photoUri={coachStillForWeek(weekNumber)}
          />
        </View>

        {showDipCallout ? (
          <View style={styles.dipCallout}>
            <Text style={styles.dipKicker}>HEADS UP · WEEK 3 PREVIEW</Text>
            <Text style={styles.dipBody}>
              Motivation often dips in Week 3. Notice it, name it, keep going. Your systems carry you.
            </Text>
          </View>
        ) : null}

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
          <>
            <View style={styles.devWeekCard}>
              <Text style={styles.devKicker}>DEV ONLY · JUMP TO WEEK</Text>
              <View style={styles.devWeekRow}>
                {([1, 3, 5, 7, 9, 11] as const).map((w) => {
                  const isActive = w === weekNumber;
                  return (
                    <Pressable
                      key={w}
                      accessibilityRole="button"
                      accessibilityLabel={`Dev: jump to week ${w}`}
                      onPress={() => devSetWeek(w)}
                      style={({ pressed }) => [
                        styles.devWeekBtn,
                        isActive && styles.devWeekBtnActive,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.devWeekLabel,
                          isActive && styles.devWeekLabelActive,
                        ]}
                      >
                        W{w}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

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
          </>
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
    marginTop: 12,
    padding: 14,
  },
  devWeekBtn: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 10,
    borderWidth: 1,
    flexBasis: 0,
    flexGrow: 1,
    paddingVertical: 9,
  },
  devWeekBtnActive: {
    backgroundColor: COLORS.tangerine,
    borderColor: COLORS.tangerine,
  },
  devWeekCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 10,
    marginTop: 28,
    padding: 14,
  },
  devWeekLabel: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: -0.05,
  },
  devWeekLabelActive: {
    color: '#FFFFFF',
  },
  devWeekRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dipBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    letterSpacing: -0.1,
    lineHeight: 20,
    marginTop: 6,
  },
  dipCallout: {
    backgroundColor: '#F4E9D2',
    borderColor: COLORS.tigerGold,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  dipKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  heroWrap: { marginTop: 20 },
  screen: {
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
