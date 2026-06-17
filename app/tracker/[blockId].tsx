// app/tracker/[blockId].tsx
//
// Karen's Actions Tracker, in the app. The data model has been here all
// along (usePowerActionProgress) — this screen is the missing view.
// Mirrors the per-block grid from her spreadsheet: each action gets a
// row, with a 14-dot strip showing daily completion across the block's
// two weeks, a progress bar against the block target (weekly_target × 2),
// and per-week totals at the bottom.
//
// Tapping a dot toggles completion for that day — same toggle that
// usePowerActionProgress exposes, so anything logged here also flows
// into the You-tab POWER thread aggregation and the Today engagement
// surfaces.

import { format, isFuture } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionHeader } from '../../components/ui/SectionHeader';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { usePowerActionProgress } from '../../hooks/usePowerActionProgress';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { blockFor } from '../../lib/program';
import type { BlockId } from '../../lib/program';
import { POWER_LETTERS } from '../../lib/powerBlocks';
import type { PowerAction, PowerLetter } from '../../lib/powerBlocks';

const light = THEME_COLORS.light;

// Lower-case block IDs match what lib/powerBlocks.ts uses; the program
// module uses upper-case. We accept either in the URL and normalize.
const PROGRAM_BLOCK_IDS: BlockId[] = ['COMMIT', 'REFINE', 'EVOLVE', 'ADAPT', 'THRIVE', 'EXCEL'];

function programBlockId(slug: string): BlockId | null {
  const upper = slug.toUpperCase() as BlockId;
  return PROGRAM_BLOCK_IDS.includes(upper) ? upper : null;
}

const LETTER_TINT: Record<PowerLetter, string> = {
  P: COLORS.tigerGold,
  O: COLORS.evidenceBlue,
  W: COLORS.tangerine,
  E: COLORS.electricYellow,
  R: COLORS.deepGreen,
};

export default function BlockTrackerScreen() {
  const { blockId: raw } = useLocalSearchParams<{ blockId: string }>();
  const blockSlug = (raw ?? '').toLowerCase();
  const programId = programBlockId(blockSlug);
  const { weekNumber } = useCurrentWeek();
  const { block, days, week1, week2, summary, isChecked, toggle, loading } =
    usePowerActionProgress(blockSlug);

  // Notes are intentionally local-only for now. The brief calls out
  // capturing per-day observations the way Karen does in her spreadsheet
  // — a free-form journal is a reasonable v1 before we design a
  // structured per-action note model. AsyncStorage-backed at the hook
  // level can come next.
  const [notes, setNotes] = useState('');

  if (!programId || !block) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={light.text} size={26} />
          </Pressable>
          <View style={styles.spacer} />
          <View style={styles.spacer} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.notFound}>
            {loading ? 'Loading tracker…' : 'No tracker for this block yet.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const programBlock = blockFor(programId);
  const blockTitle = `${programId.charAt(0)}${programId.slice(1).toLowerCase()}`;
  const overallPct =
    summary.blockTarget > 0
      ? Math.round((summary.blockTotal / summary.blockTarget) * 100)
      : 0;

  const week1Pct = pctForDays(week1, summary.perDay, block.actions.length);
  const week2Pct = pctForDays(week2, summary.perDay, block.actions.length);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft color={light.text} size={26} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {blockTitle} Tracker
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Block summary — consistency target + current % */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHead}>
            <Text style={styles.summaryKicker}>BLOCK TARGET</Text>
            <Text style={styles.summaryRange}>Weeks {programBlock.weekRange[0]}–{programBlock.weekRange[1]}</Text>
          </View>
          <Text style={styles.summaryTarget}>{programBlock.consistencyTarget} consistency</Text>

          <View style={styles.bigStatRow}>
            <View style={styles.bigStatCell}>
              <Text style={styles.bigStatValue}>{overallPct}%</Text>
              <Text style={styles.bigStatLabel}>overall</Text>
            </View>
            <View style={styles.bigStatDivider} />
            <View style={styles.bigStatCell}>
              <Text style={styles.bigStatValue}>{summary.blockTotal}</Text>
              <Text style={styles.bigStatLabel}>completed</Text>
            </View>
            <View style={styles.bigStatDivider} />
            <View style={styles.bigStatCell}>
              <Text style={styles.bigStatValue}>{summary.blockTarget}</Text>
              <Text style={styles.bigStatLabel}>target</Text>
            </View>
          </View>

          <View style={styles.weekStatRow}>
            <View style={styles.weekStatCell}>
              <Text style={styles.weekStatLabel}>Week 1</Text>
              <Text style={styles.weekStatValue}>{week1Pct}%</Text>
            </View>
            <View style={styles.weekStatCell}>
              <Text style={styles.weekStatLabel}>Week 2</Text>
              <Text style={styles.weekStatValue}>{week2Pct}%</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Actions" meta={`${block.actions.length} this block`} />

        <View style={styles.actionsList}>
          {block.actions.map((action) => (
            <ActionRow
              key={action.id}
              action={action}
              days={days}
              isChecked={isChecked}
              toggle={toggle}
              perAction={summary.perAction[action.id]}
            />
          ))}
        </View>

        <SectionHeader title="Pattern observations" meta="optional" />
        <View style={styles.notesWrap}>
          <TextInput
            multiline
            placeholder="What did you notice this week? Patterns, energy shifts, what got in the way, what helped."
            placeholderTextColor={light.mutedText}
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
          />
          <Text style={styles.notesHint}>
            Free-form, just like Karen's tracker. Your notes stay on this device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionRow({
  action,
  days,
  isChecked,
  toggle,
  perAction,
}: {
  action: PowerAction;
  days: Date[];
  isChecked: (actionId: string, dateKey: string) => boolean;
  toggle: (actionId: string, dateKey: string) => Promise<void>;
  perAction?: { completed: number; target: number; percentage: number };
}) {
  const tint = LETTER_TINT[action.letter];
  const completed = perAction?.completed ?? 0;
  const target = perAction?.target ?? action.weekly_target * 2;
  const pct = perAction?.percentage ?? 0;

  return (
    <View style={styles.actionCard}>
      <View style={styles.actionHead}>
        <View style={[styles.letterPill, { backgroundColor: tint }]}>
          <Text style={styles.letterPillText}>{action.letter}</Text>
        </View>
        <View style={styles.actionTextWrap}>
          <Text style={styles.actionDesc} numberOfLines={2}>
            {action.description}
          </Text>
          <Text style={styles.actionMeta}>
            <Text style={styles.actionMetaStrong}>{completed}</Text>
            {' / '}
            {target} · {pct}%
          </Text>
        </View>
      </View>

      <View style={styles.dotsRow}>
        {days.map((day, idx) => {
          const key = format(day, 'yyyy-MM-dd');
          const checked = isChecked(action.id, key);
          const future = isFuture(day);
          const isWeekBreak = idx === 7;
          return (
            <View key={key} style={[styles.dotWrap, isWeekBreak && styles.dotWrapBreak]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Toggle ${action.description} for ${format(day, 'EEE MMM d')}`}
                disabled={future}
                hitSlop={4}
                onPress={() => toggle(action.id, key)}
                style={[
                  styles.dot,
                  checked && styles.dotChecked,
                  checked && { backgroundColor: tint, borderColor: tint },
                  future && styles.dotFuture,
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.progressBarWrap}>
        <View style={[styles.progressFill, { backgroundColor: tint, width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function pctForDays(
  days: Date[],
  perDay: Record<string, { completed: number; incomplete: number }>,
  actionsCount: number,
): number {
  if (actionsCount === 0 || days.length === 0) return 0;
  let completed = 0;
  for (const day of days) {
    const key = format(day, 'yyyy-MM-dd');
    completed += perDay[key]?.completed ?? 0;
  }
  const target = actionsCount * days.length;
  return target > 0 ? Math.round((completed / target) * 100) : 0;
}

// Suppress unused warnings for symbols we'll surface in later expansions.
void POWER_LETTERS;
void weekNumberHint;
function weekNumberHint(week: ReturnType<typeof useCurrentWeek>['weekNumber']) {
  return week;
}

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
    padding: 14,
  },
  actionDesc: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: -0.05,
    lineHeight: 19,
  },
  actionHead: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  actionMeta: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 11.5,
    marginTop: 2,
  },
  actionMetaStrong: { color: light.text, fontFamily: FONTS.sansBold },
  actionTextWrap: { flex: 1 },
  actionsList: { marginBottom: 12 },
  bigStatCell: { alignItems: 'center', flex: 1 },
  bigStatDivider: {
    backgroundColor: light.border,
    height: 26,
    width: StyleSheet.hairlineWidth,
  },
  bigStatLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 10.5,
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  bigStatRow: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderRadius: 12,
    flexDirection: 'row',
    marginTop: 12,
    paddingVertical: 12,
  },
  bigStatValue: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  content: {
    paddingBottom: 60,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  dot: {
    backgroundColor: 'transparent',
    borderColor: light.border,
    borderRadius: 7,
    borderWidth: 1.4,
    height: 14,
    width: 14,
  },
  dotChecked: {
    borderWidth: 0,
  },
  dotFuture: {
    borderStyle: 'dashed',
    opacity: 0.4,
  },
  dotWrap: {
    paddingHorizontal: 2,
  },
  dotWrapBreak: {
    marginLeft: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
  },
  empty: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  headerTitle: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    textAlign: 'center',
  },
  letterPill: {
    alignItems: 'center',
    borderRadius: 6,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  letterPillText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  notFound: { color: light.text, fontFamily: FONTS.sansBold, fontSize: 17 },
  notesHint: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
    marginTop: 8,
  },
  notesInput: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 120,
    padding: 14,
    textAlignVertical: 'top',
  },
  notesWrap: { marginBottom: 16 },
  progressBarWrap: {
    backgroundColor: light.cardAlt,
    borderRadius: 999,
    height: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  screen: { flex: 1 },
  spacer: { width: 26 },
  summaryCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    padding: 16,
  },
  summaryHead: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryKicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  summaryRange: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
  },
  summaryTarget: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    marginTop: 6,
  },
  weekStatCell: {
    alignItems: 'center',
    flex: 1,
  },
  weekStatLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  weekStatRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  weekStatValue: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.3,
    marginTop: 4,
  },
});
