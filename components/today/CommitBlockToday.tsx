// components/today/CommitBlockToday.tsx
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { COMMIT_ANCHORS } from '../../lib/commitAnchors';
import { dailyPrompt } from '../../lib/commitPrompts';
import { SPACING } from '../../lib/brand';
import { useProfile } from '../../hooks/useProfile';
import { WeekStrip } from '../history/WeekStrip';
import { AnchorRow } from '../ui/AnchorRow';
import { AwarenessCard } from '../ui/AwarenessCard';
import { SectionHeader } from '../ui/SectionHeader';
import { FocusHeroCard } from './FocusHeroCard';
import { GreetingHeader } from './GreetingHeader';
import { NextLessonCard } from './NextLessonCard';
import { TodayHeader } from './TodayHeader';

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
 */
export function CommitBlockToday({ weekIndex = 1, weekLabel = 'Week 1' }: CommitBlockTodayProps) {
  const { profile } = useProfile();
  const prompt = dailyPrompt();

  const openAnchor = (slug: string) => router.push(`/grow/commit?lesson=${slug}` as never);

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
    </View>
  );
}

const styles = StyleSheet.create({
  awarenessWrap: { marginTop: 12 },
  greetingWrap: { marginBottom: 4, marginTop: 18 },
  stack: {
    gap: 0,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
});
