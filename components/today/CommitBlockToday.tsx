// components/today/CommitBlockToday.tsx
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COMMIT_ANCHORS } from '../../lib/commitAnchors';
import { dailyPrompt } from '../../lib/commitPrompts';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';
import { useAuth } from '../../hooks/useAuth';
import { useMembership } from '../../hooks/useMembership';
import { useProfile } from '../../hooks/useProfile';
import { WeekStrip } from '../history/WeekStrip';
import { AnchorRow } from '../ui/AnchorRow';
import { AwarenessCard } from '../ui/AwarenessCard';
import { SectionHeader } from '../ui/SectionHeader';
import { FocusHeroCard } from './FocusHeroCard';
import { GreetingHeader } from './GreetingHeader';
import { NextLessonCard } from './NextLessonCard';
import { TodayHeader } from './TodayHeader';

const light = THEME_COLORS.light;

type CommitBlockTodayProps = {
  weekIndex?: number;
  weekLabel?: string;
};

/**
 * Hybrid Commit Today (spec §5).
 *
 * 1. TodayHeader        — streak + week pill + avatar cluster
 * 2. WeekStrip          — 7 gold-today rings, no failure red
 * 3. GreetingHeader     — "Evening, Johnty." + "Commit Block · Week N"
 * 4. FocusHeroCard      — photo hero, "Three things, every plate."
 * 5. AnchorStack        — 3 AnchorRows (read labels / cut sugar / protein+veg)
 * 6. NextLessonCard     — scene photo lesson card
 * 7. AwarenessCard      — daily prompt OR coach nudge (one slot, two voices)
 *
 * Plus, in dev sessions only: a dashed "Start over" card at the bottom that
 * wipes membership state and routes back to /membership — for smoke-testing
 * the fork without sign-out gymnastics.
 */
export function CommitBlockToday({ weekIndex = 1, weekLabel = 'Week 1' }: CommitBlockTodayProps) {
  const { isDevSession } = useAuth();
  const { profile } = useProfile();
  const { devReset } = useMembership();
  const prompt = dailyPrompt();

  const openAnchor = (slug: string) => router.push(`/grow/commit?lesson=${slug}` as never);

  const onStartOver = async () => {
    await devReset();
    router.replace('/membership' as never);
  };

  return (
    <View style={styles.stack}>
      <TodayHeader />
      <WeekStrip />
      <View style={styles.greetingWrap}>
        <GreetingHeader firstName={profile.firstName} subtitle={`Commit Block · ${weekLabel}`} />
      </View>

      <FocusHeroCard weekIndex={weekIndex} />

      <SectionHeader title="Today's Focus" meta={`${COMMIT_ANCHORS.length} anchors`} />
      <View>
        {COMMIT_ANCHORS.map((anchor) => (
          <AnchorRow
            key={anchor.id}
            Icon={anchor.Icon}
            title={anchor.title}
            sub={anchor.sub}
            onPress={() => openAnchor(anchor.lessonSlug)}
          />
        ))}
      </View>

      <SectionHeader title="Next Lesson" />
      <NextLessonCard onPress={() => router.push('/(tabs)/grow' as never)} />

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
            <Text style={styles.devBody}>↺  Start over from the fork</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  awarenessWrap: { marginTop: 22 },
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
  stack: {
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
});
