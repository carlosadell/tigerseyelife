// app/block/[blockId].tsx
//
// Block orientation. Per the dev brief: "Block orientation splits into
// two: by purpose navigation — how to get the most out of the block
// (always visible, under a minute to scan) — vs. teaching (optional
// depth)." This screen is that split.
//
// The Navigation card stays scannable: consistency target, week count,
// what-to-do list, the 3 highest-impact tools. The Teaching section
// below carries the depth — block mindset, the full POWER Compass
// breakdown, and a per-week summary. Members can orient in under a
// minute without wading through the lesson content.

import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, ChevronLeft, Compass, Sparkles, Target } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionHeader } from '../../components/ui/SectionHeader';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { BLOCK_IDS, THREAD_NAMES, WEEKS, blockFor } from '../../lib/program';
import type { BlockId, ThreadLetter } from '../../lib/program';
import { toolBySlug } from '../../lib/tools';

const light = THEME_COLORS.light;

const COMPASS_ORDER: ThreadLetter[] = ['P', 'O', 'W', 'E', 'R'];

export default function BlockOrientationScreen() {
  const { blockId } = useLocalSearchParams<{ blockId: string }>();
  const { weekNumber: currentWeek } = useCurrentWeek();

  const isValid = (BLOCK_IDS as readonly string[]).includes(blockId ?? '');
  if (!isValid) return <NotFound />;

  const id = blockId as BlockId;
  const block = blockFor(id);
  const blockIndex = BLOCK_IDS.indexOf(id) + 1;
  const blockTitle = `${id.charAt(0)}${id.slice(1).toLowerCase()}`;
  const [startWeek, endWeek] = block.weekRange;
  const weeks = WEEKS.filter((w) => w.blockId === id);

  // Lock state for upcoming blocks. The page itself still renders, but
  // we shift copy from "what to do" to "what's coming."
  const isUpcoming = currentWeek < startWeek;
  const isComplete = currentWeek > endWeek;

  // Union of tool slugs across all weeks in this block, deduped, with
  // high-impact (isStar) tools surfaced first. Capped at 4 to keep the
  // navigation card under-a-minute scannable.
  const featuredTools = useMemo(() => {
    const seen = new Set<string>();
    const slugs: string[] = [];
    for (const w of weeks) {
      for (const slug of w.toolSlugs) {
        if (!seen.has(slug)) {
          seen.add(slug);
          slugs.push(slug);
        }
      }
    }
    const tools = slugs
      .map((slug) => toolBySlug(slug))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .sort((a, b) => Number(b.isStar) - Number(a.isStar));
    return tools.slice(0, 4);
  }, [weeks]);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft color={light.text} size={26} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {blockTitle} Block
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <Text style={styles.heroKicker}>
            {`BLOCK ${blockIndex} OF 6 · WEEKS ${startWeek}–${endWeek} · TARGET: ${block.consistencyTarget} CONSISTENCY`}
          </Text>
          <Text style={styles.heroTitle}>{blockTitle.toUpperCase()}</Text>
          {isUpcoming ? (
            <Text style={styles.heroState}>{`Opens Week ${startWeek}`}</Text>
          ) : isComplete ? (
            <Text style={styles.heroState}>Complete</Text>
          ) : null}
        </View>

        {/* ============= NAVIGATION (always visible, <1 min scan) ============= */}
        <View style={styles.navCard}>
          <View style={styles.navHeader}>
            <View style={styles.navIcon}>
              <Compass color={light.accent} size={16} strokeWidth={2.2} />
            </View>
            <Text style={styles.navKicker}>HOW TO USE THIS BLOCK</Text>
          </View>

          <Text style={styles.navTitle}>
            {isUpcoming
              ? `${endWeek - startWeek + 1} weeks. Opens Week ${startWeek}.`
              : `${endWeek - startWeek + 1} weeks. ${block.consistencyTarget} consistency.`}
          </Text>

          {/* What to do — short, scannable */}
          <View style={styles.checklist}>
            {weeks.map((w, idx) => (
              <View key={w.weekNumber} style={styles.checkRow}>
                <Text style={styles.checkNum}>W{w.weekNumber}</Text>
                <Text style={styles.checkLabel} numberOfLines={2}>
                  {w.primaryFocus}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{weeks.length * 4}</Text>
              <Text style={styles.statLabel}>workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{featuredTools.length}</Text>
              <Text style={styles.statLabel}>key tools</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{primaryThreadCount(block)}</Text>
              <Text style={styles.statLabel}>primary threads</Text>
            </View>
          </View>

          {/* Featured tools — capped at 4, isStar first */}
          {featuredTools.length > 0 ? (
            <>
              <Text style={styles.navSubKicker}>START HERE</Text>
              <View style={styles.toolGrid}>
                {featuredTools.map((tool) => (
                  <Pressable
                    key={tool.slug}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${tool.title}`}
                    disabled={isUpcoming}
                    onPress={() => router.push(`/tool/${tool.slug}` as never)}
                    style={({ pressed }) => [
                      styles.toolCard,
                      pressed && { opacity: 0.7 },
                      isUpcoming && { opacity: 0.55 },
                    ]}
                  >
                    <View style={styles.toolCardIcon}>
                      <Sparkles color={light.accent} size={14} strokeWidth={2.4} />
                    </View>
                    <Text style={styles.toolCardLabel} numberOfLines={2}>
                      {tool.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </View>

        {/* ============= TEACHING (optional depth) ============= */}
        <SectionHeader title="The block, in depth" />

        {/* Block mindset */}
        <View style={styles.mindsetCard}>
          <View style={styles.mindsetRail} />
          <View style={styles.mindsetBody}>
            <Text style={styles.mindsetKicker}>MINDSET</Text>
            <Text style={styles.mindsetText}>{block.mindset}</Text>
          </View>
        </View>

        {/* POWER Compass full breakdown */}
        <View style={styles.compassCard}>
          <View style={styles.compassHead}>
            <Target color={light.accent} size={14} strokeWidth={2.2} />
            <Text style={styles.compassKicker}>POWER COMPASS · {blockTitle.toUpperCase()}</Text>
          </View>
          {COMPASS_ORDER.map((letter) => {
            const entry = block.powerCompass[letter];
            return (
              <View key={letter} style={styles.compassRow}>
                <View
                  style={[
                    styles.compassLetter,
                    entry.role === 'PRIMARY' && styles.compassLetterPrimary,
                    entry.role === 'MAINTAIN' && styles.compassLetterMaintain,
                  ]}
                >
                  <Text
                    style={[
                      styles.compassLetterText,
                      entry.role === 'PRIMARY' && styles.compassLetterTextPrimary,
                      entry.role === 'MAINTAIN' && styles.compassLetterTextMaintain,
                    ]}
                  >
                    {letter}
                  </Text>
                </View>
                <View style={styles.compassBody}>
                  <View style={styles.compassNameRow}>
                    <Text style={styles.compassName}>{THREAD_NAMES[letter]}</Text>
                    <Text
                      style={[
                        styles.compassRole,
                        entry.role === 'PRIMARY' && styles.compassRolePrimary,
                        entry.role === 'MAINTAIN' && styles.compassRoleMaintain,
                      ]}
                    >
                      {entry.role}
                    </Text>
                  </View>
                  <Text style={styles.compassNote} numberOfLines={2}>{entry.note}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Per-week breakdown */}
        <SectionHeader title="Weeks in this block" meta={`${weeks.length} weeks`} />
        <View>
          {weeks.map((week) => {
            const weekUpcoming = week.weekNumber > currentWeek;
            return (
              <Pressable
                key={week.weekNumber}
                accessibilityRole="button"
                accessibilityLabel={`Open week ${week.weekNumber}`}
                disabled={weekUpcoming}
                onPress={() => router.push(`/week/${week.weekNumber}` as never)}
                style={({ pressed }) => ({
                  opacity: pressed && !weekUpcoming ? 0.7 : weekUpcoming ? 0.55 : 1,
                })}
              >
                <View style={[styles.weekRow, weekUpcoming && styles.weekRowUpcoming]}>
                  <Text style={styles.weekRowKicker}>WEEK {week.weekNumber}</Text>
                  <Text style={styles.weekRowTitle} numberOfLines={1}>{week.title}</Text>
                  <Text style={styles.weekRowFocus} numberOfLines={2}>{week.primaryFocus}</Text>
                  {!weekUpcoming ? (
                    <View style={styles.weekRowCta}>
                      <Text style={styles.weekRowCtaLabel}>Open</Text>
                      <ArrowRight color={COLORS.tangerine} size={14} strokeWidth={2.4} />
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function primaryThreadCount(block: ReturnType<typeof blockFor>): number {
  return COMPASS_ORDER.filter((l) => block.powerCompass[l].role === 'PRIMARY').length;
}

function NotFound() {
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
        <Text style={styles.notFoundTitle}>Block not found.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  checkLabel: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  checkNum: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.6,
    width: 28,
  },
  checkRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  checklist: {
    gap: 4,
    marginTop: 6,
  },
  compassBody: { flex: 1, gap: 2 },
  compassCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 10,
    padding: 16,
  },
  compassHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  compassKicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  compassLetter: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  compassLetterMaintain: {
    backgroundColor: 'transparent',
    borderColor: light.border,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  compassLetterPrimary: { backgroundColor: '#F1E6C8' },
  compassLetterText: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  compassLetterTextMaintain: { color: light.mutedText },
  compassLetterTextPrimary: { color: light.accent },
  compassName: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
  },
  compassNameRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compassNote: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  compassRole: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.2,
  },
  compassRoleMaintain: { color: light.mutedText },
  compassRolePrimary: { color: light.accent },
  compassRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    paddingBottom: 64,
    paddingHorizontal: 16,
    paddingTop: 4,
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
  hero: {
    backgroundColor: '#2E2F2F',
    borderColor: 'rgba(200,159,77,0.55)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  heroKicker: {
    color: '#C89F4D',
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: COLORS.bone,
    fontFamily: FONTS.sansBold,
    fontSize: 34,
    letterSpacing: -0.4,
    lineHeight: 38,
    textTransform: 'uppercase',
  },
  heroState: {
    color: 'rgba(245,242,234,0.72)',
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  mindsetBody: { flex: 1, gap: 6 },
  mindsetCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    padding: 16,
  },
  mindsetKicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  mindsetRail: {
    backgroundColor: light.accent,
    borderRadius: 999,
    width: 2,
  },
  mindsetText: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  navCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginTop: 20,
    padding: 18,
  },
  navHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  navIcon: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  navKicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  navSubKicker: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    marginTop: 6,
  },
  navTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  notFoundTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
  },
  screen: { flex: 1 },
  spacer: { width: 26 },
  statCell: { alignItems: 'center', flex: 1 },
  statDivider: {
    backgroundColor: light.border,
    height: 24,
    width: StyleSheet.hairlineWidth,
  },
  statLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 10.5,
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statValue: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  statsRow: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderRadius: 12,
    flexDirection: 'row',
    marginTop: 8,
    paddingVertical: 10,
  },
  toolCard: {
    alignItems: 'flex-start',
    backgroundColor: light.cardAlt,
    borderColor: light.border,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: 8,
    minHeight: 78,
    padding: 12,
  },
  toolCardIcon: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 8,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  toolCardLabel: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 12.5,
    letterSpacing: -0.05,
    lineHeight: 16,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  weekRow: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginBottom: 10,
    padding: 14,
  },
  weekRowCta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  weekRowCtaLabel: {
    color: COLORS.tangerine,
    fontFamily: FONTS.sansBold,
    fontSize: 12.5,
  },
  weekRowFocus: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  weekRowKicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  weekRowTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  weekRowUpcoming: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
});
