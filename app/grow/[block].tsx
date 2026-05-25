import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, Droplet, Moon, Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LETTER_INK, LETTER_TINT } from '../../components/grow/ActionCard';
import { useThemeColors } from '../../hooks/useTheme';
import { usePowerActionProgress } from '../../hooks/usePowerActionProgress';
import { useTodayEngagement } from '../../hooks/useTodayEngagement';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import {
  PowerFocus,
  PowerLetter,
  POWER_LETTERS,
  getPowerBlock,
} from '../../lib/powerBlocks';

const FOCUS_LABEL: Record<PowerFocus, string> = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  MAINTAIN: 'Maintain',
};

export default function BlockDetailScreen() {
  const { block: blockId } = useLocalSearchParams<{ block: string }>();
  const colors = useThemeColors();
  const block = getPowerBlock(blockId ?? '');
  const { isChecked, summary } = usePowerActionProgress(blockId ?? '');
  const { engagement, waterTarget, toggleSleep, addWater } = useTodayEngagement();

  const todayKey = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const threadProgress = useMemo(() => {
    if (!block) {
      return {} as Record<PowerLetter, { todayDone: number; todayTotal: number; blockPct: number }>;
    }
    const result: Record<PowerLetter, { todayDone: number; todayTotal: number; blockPct: number }> = {
      P: { todayDone: 0, todayTotal: 0, blockPct: 0 },
      O: { todayDone: 0, todayTotal: 0, blockPct: 0 },
      W: { todayDone: 0, todayTotal: 0, blockPct: 0 },
      E: { todayDone: 0, todayTotal: 0, blockPct: 0 },
      R: { todayDone: 0, todayTotal: 0, blockPct: 0 },
    };
    const totals: Record<PowerLetter, { completed: number; target: number }> = {
      P: { completed: 0, target: 0 },
      O: { completed: 0, target: 0 },
      W: { completed: 0, target: 0 },
      E: { completed: 0, target: 0 },
      R: { completed: 0, target: 0 },
    };
    for (const action of block.actions) {
      result[action.letter].todayTotal += 1;
      if (isChecked(action.id, todayKey)) {
        result[action.letter].todayDone += 1;
      }
      const stat = summary.perAction[action.id];
      if (stat) {
        totals[action.letter].completed += stat.completed;
        totals[action.letter].target += stat.target;
      }
    }
    for (const letter of Object.keys(result) as PowerLetter[]) {
      const { completed, target } = totals[letter];
      result[letter].blockPct = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
    }
    return result;
  }, [block, isChecked, summary, todayKey]);

  if (!block) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>Block not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.notFoundLink, { color: colors.accent }]}>Back to Grow</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalPct = summary.blockTarget > 0
    ? Math.min(100, Math.round((summary.blockTotal / summary.blockTarget) * 100))
    : 0;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
          <Text style={[styles.headerKicker, { color: colors.accent }]}>{block.name.toUpperCase()}</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.tagline, { color: colors.text }]}>{block.tagline}</Text>
            <Text style={[styles.helper, { color: colors.mutedText }]}>{block.helper}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>THREADS</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedText }]}>
              Tap a POWER thread to drill in
            </Text>
          </View>

          {(Object.keys(POWER_LETTERS) as PowerLetter[]).map((letter) => (
            <ThreadCard
              key={letter}
              letter={letter}
              name={POWER_LETTERS[letter]}
              compass={block.compass[letter]}
              focus={block.focus[letter]}
              progress={threadProgress[letter]}
              onPress={() =>
                router.push({
                  pathname: '/grow/thread',
                  params: { block: block.id, letter },
                })
              }
            />
          ))}

          <SleepCard logged={engagement.sleep} onToggle={toggleSleep} />
          <HydrationCard
            count={engagement.water}
            target={waterTarget}
            onAdd={addWater}
          />

          <View style={[styles.totals, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardKicker, { color: colors.accent }]}>BLOCK SUMMARY</Text>
            <View style={styles.totalsRow}>
              <View style={styles.totalsItem}>
                <Text style={[styles.totalsValue, { color: colors.text }]}>{summary.blockTotal}</Text>
                <Text style={[styles.totalsLabel, { color: colors.mutedText }]}>Actions completed</Text>
              </View>
              <View style={styles.totalsItem}>
                <Text style={[styles.totalsValue, { color: colors.text }]}>{summary.actionsIncomplete}</Text>
                <Text style={[styles.totalsLabel, { color: colors.mutedText }]}>Incomplete</Text>
              </View>
              <View style={styles.totalsItem}>
                <Text style={[styles.totalsValue, { color: colors.accent }]}>{totalPct}%</Text>
                <Text style={[styles.totalsLabel, { color: colors.mutedText }]}>Block progress</Text>
              </View>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.cardAlt }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.accent, width: `${totalPct}%` },
                ]}
              />
            </View>
            <Text style={[styles.totalsCaption, { color: colors.mutedText }]}>
              Aim for 40–50% consistency. Anything above is bonus.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type ThreadCardProps = {
  letter: PowerLetter;
  name: string;
  compass: string;
  focus: PowerFocus;
  progress: { todayDone: number; todayTotal: number; blockPct: number };
  onPress: () => void;
};

function ThreadCard({ letter, name, compass, focus, progress, onPress }: ThreadCardProps) {
  const colors = useThemeColors();
  const tint = LETTER_TINT[letter];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} thread, ${progress.todayDone} of ${progress.todayTotal} today`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.threadCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.threadBadge, { backgroundColor: tint }]}>
        <Text style={[styles.threadBadgeText, { color: LETTER_INK[letter] }]}>{letter}</Text>
      </View>
      <View style={styles.threadBody}>
        <View style={styles.threadHead}>
          <Text style={[styles.threadName, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.threadFocus, { color: colors.mutedText }]}>
            {FOCUS_LABEL[focus]}
          </Text>
        </View>
        <Text style={[styles.threadCompass, { color: colors.mutedText }]} numberOfLines={1}>
          {compass}
        </Text>
        <View style={styles.threadMetaRow}>
          <Text style={[styles.threadMeta, { color: colors.text }]}>
            <Text style={{ color: tint, fontFamily: FONTS.sansBold }}>
              {progress.todayDone}/{progress.todayTotal}
            </Text>{' '}
            today
          </Text>
          <Text style={[styles.threadMeta, { color: colors.mutedText }]}>
            {progress.blockPct}% block
          </Text>
        </View>
        <View style={[styles.threadTrack, { backgroundColor: colors.cardAlt }]}>
          <View
            style={[
              styles.threadFill,
              { backgroundColor: tint, width: `${progress.blockPct}%` },
            ]}
          />
        </View>
      </View>
      <ChevronRight color={colors.mutedText} size={18} />
    </Pressable>
  );
}

function SleepCard({ logged, onToggle }: { logged: boolean; onToggle: () => void }) {
  const colors = useThemeColors();
  const tint = COLORS.evidenceBlue;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sleep ${logged ? 'logged' : 'not logged'} today`}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.threadCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.threadBadge, { backgroundColor: logged ? tint : colors.cardAlt }]}>
        <Moon color={logged ? '#FFFFFF' : tint} size={14} strokeWidth={2} />
      </View>
      <View style={styles.threadBody}>
        <Text style={[styles.threadName, { color: colors.text }]}>Sleep</Text>
        <Text style={[styles.threadCompass, { color: colors.mutedText }]}>
          {logged
            ? 'Logged today · tap to undo'
            : 'Tap to acknowledge tonight’s rest'}
        </Text>
      </View>
      {logged ? (
        <Text style={[styles.threadStatus, { color: tint }]}>Done</Text>
      ) : (
        <Text style={[styles.threadStatus, { color: colors.mutedText }]}>Tap</Text>
      )}
    </Pressable>
  );
}

function HydrationCard({
  count,
  target,
  onAdd,
}: {
  count: number;
  target: number;
  onAdd: () => void;
}) {
  const colors = useThemeColors();
  const tint = COLORS.evidenceBlue;
  const pct = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Hydration ${count} of ${target} glasses, tap to add one`}
      onPress={onAdd}
      style={({ pressed }) => [
        styles.threadCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.threadBadge, { backgroundColor: count >= target ? tint : colors.cardAlt }]}>
        <Droplet color={count >= target ? '#FFFFFF' : tint} size={14} strokeWidth={2} />
      </View>
      <View style={styles.threadBody}>
        <View style={styles.threadHead}>
          <Text style={[styles.threadName, { color: colors.text }]}>Hydration</Text>
          <Text style={[styles.threadFocus, { color: colors.mutedText }]}>
            {count * 8} oz
          </Text>
        </View>
        <Text style={[styles.threadCompass, { color: colors.mutedText }]}>
          Tap card to log a glass
        </Text>
        <View style={styles.threadMetaRow}>
          <Text style={[styles.threadMeta, { color: colors.text }]}>
            <Text style={{ color: tint, fontFamily: FONTS.sansBold }}>
              {count}/{target}
            </Text>{' '}
            today
          </Text>
          <Text style={[styles.threadMeta, { color: colors.mutedText }]}>
            {pct}% of target
          </Text>
        </View>
        <View style={[styles.threadTrack, { backgroundColor: colors.cardAlt }]}>
          <View style={[styles.threadFill, { backgroundColor: tint, width: `${pct}%` }]} />
        </View>
      </View>
      <Plus color={colors.mutedText} size={18} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  content: {
    gap: 12,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 8,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 2.6,
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  iconButton: {
    height: 32,
    padding: 4,
    width: 32,
  },
  intro: {
    gap: 6,
    paddingTop: 4,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  notFoundLink: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  notFoundText: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  sectionSub: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
  },
  tagline: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  threadBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  threadBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  threadBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  threadCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  threadCompass: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  threadFill: {
    borderRadius: 999,
    height: '100%',
  },
  threadFocus: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  threadHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  threadMeta: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
  },
  threadMetaRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 2,
  },
  threadName: {
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  threadStatus: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  threadTrack: {
    borderRadius: 999,
    height: 4,
    marginTop: 2,
    overflow: 'hidden',
    width: '100%',
  },
  totals: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 6,
    padding: 16,
  },
  totalsCaption: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontStyle: 'italic',
  },
  totalsItem: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 2,
  },
  totalsLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  totalsValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
});
