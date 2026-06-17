// app/(tabs)/grow.tsx
//
// Grow surfaces the 12-week program as 6 blocks. Each block carries its
// current status (complete / active / locked) and routes to the first week
// of that block. The 3-layer content model lives one level deeper — at the
// concept/lesson screens that open from a week.

import { ArrowRight, Lock, Sprout } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoHeroCard } from '../../components/ui/PhotoHeroCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { FONTS, THEME_COLORS } from '../../lib/brand';
import { growHeroPhotoForWeek } from '../../lib/heroPhotos';
import { BLOCKS, BLOCK_IDS, blockFor } from '../../lib/program';
import type { Block, WeekNumber } from '../../lib/program';

const light = THEME_COLORS.light;

type BlockStatus = 'complete' | 'active' | 'locked';

function statusFor(block: Block, currentWeek: WeekNumber): BlockStatus {
  const [start, end] = block.weekRange;
  if (currentWeek > end) return 'complete';
  if (currentWeek >= start) return 'active';
  return 'locked';
}

function progressFor(block: Block, currentWeek: WeekNumber): number {
  const [start, end] = block.weekRange;
  const total = end - start + 1;
  if (currentWeek < start) return 0;
  if (currentWeek > end) return 1;
  return Math.min(1, (currentWeek - start + 1) / total);
}

function shortHelper(block: Block): string {
  return block.mindset.split(/(?<=[.!?])\s+/)[0] ?? block.mindset;
}

function statusLabel(status: BlockStatus, block: Block): string {
  switch (status) {
    case 'complete': return 'Done';
    case 'active':   return 'Active';
    case 'locked':   return `Opens W${block.weekRange[0]}`;
  }
}

export default function GrowScreen() {
  const { weekNumber, blockId } = useCurrentWeek();
  const currentBlock = blockFor(blockId);
  const blockTitle = `${blockId.charAt(0)}${blockId.slice(1).toLowerCase()}`;
  const completed = BLOCKS.filter((b) => statusFor(b, weekNumber) === 'complete').length;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Program identity bar */}
        <View style={styles.programBar}>
          <View style={styles.programIcon}>
            <Sprout color={light.accent} size={16} strokeWidth={2.2} />
          </View>
          <View style={styles.programText}>
            <Text style={styles.programKicker}>
              {blockTitle} Block · Week {weekNumber}
            </Text>
            <Text style={styles.programTitle} numberOfLines={1}>
              CREATE POWER · 6 blocks · 12 weeks
            </Text>
          </View>
        </View>

        <View style={styles.heroWrap}>
          <PhotoHeroCard
            kicker={`YOU ARE HERE · BLOCK ${BLOCK_IDS.indexOf(blockId) + 1} OF 6`}
            title={currentBlock.consistencyTarget}
            photoUri={growHeroPhotoForWeek(weekNumber)}
            photoSide="full"
          />
        </View>

        <SectionHeader
          title="The 6 blocks"
          meta={`${completed} of ${BLOCKS.length} done`}
        />

        <View>
          {BLOCKS.map((block, idx) => {
            const status = statusFor(block, weekNumber);
            const isActive = status === 'active';
            const isLocked = status === 'locked';
            const progress = progressFor(block, weekNumber);
            const letter = block.blockId.charAt(0);
            const blockName = `${block.blockId.charAt(0)}${block.blockId.slice(1).toLowerCase()}`;

            return (
              <Pressable
                key={block.blockId}
                accessibilityRole="button"
                accessibilityLabel={`Open ${blockName} block`}
                disabled={isLocked}
                onPress={() => router.push(`/block/${block.blockId}` as never)}
                style={({ pressed }) => ({
                  opacity: pressed && !isLocked ? 0.7 : isLocked ? 0.55 : 1,
                })}
              >
                <View style={[styles.row, isActive && styles.rowActive, isLocked && styles.rowLocked]}>
                  <View style={[styles.tile, isActive && styles.tileActive]}>
                    <Text style={styles.tileIdx}>{String(idx + 1).padStart(2, '0')}</Text>
                    {isLocked ? (
                      <Lock color={light.mutedText} size={18} strokeWidth={2.2} />
                    ) : (
                      <Text style={[styles.tileLetter, isActive && styles.tileLetterActive]}>
                        {letter}
                      </Text>
                    )}
                  </View>

                  <View style={styles.body}>
                    <Text style={[styles.title, isLocked && styles.titleLocked]} numberOfLines={1}>
                      {blockName}
                    </Text>
                    <Text style={styles.helper} numberOfLines={2}>
                      {shortHelper(block)}
                    </Text>
                    <View style={styles.trackWrap}>
                      <View style={[styles.track, isLocked && styles.trackLocked]}>
                        <View
                          style={[
                            styles.fill,
                            { width: `${progress * 100}%` },
                            status === 'complete' && styles.fillDone,
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.right}>
                    <Text style={[styles.badge, isActive && styles.badgeActive]}>
                      {statusLabel(status, block)}
                    </Text>
                    {!isLocked ? (
                      <ArrowRight color={light.mutedText} size={14} strokeWidth={2.2} />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.footnote}>
          The program runs on a fixed spine — every block opens on its own week,
          not before. {currentBlock.consistencyTarget}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  badgeActive: { color: light.accent },
  body: { flex: 1, gap: 4 },
  content: {
    paddingBottom: 128,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  fill: {
    backgroundColor: light.accent,
    borderRadius: 999,
    height: '100%',
  },
  fillDone: { backgroundColor: light.success },
  footnote: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 24,
  },
  heroWrap: { marginTop: 20 },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  programBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
    paddingVertical: 8,
  },
  programIcon: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  programKicker: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    letterSpacing: -0.05,
  },
  programText: { flex: 1, minWidth: 0 },
  programTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  right: { alignItems: 'flex-end', gap: 6, marginLeft: 8 },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowActive: {
    borderColor: light.accent,
    shadowColor: light.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  rowLocked: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  screen: { flex: 1 },
  tile: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    width: 48,
  },
  tileActive: { backgroundColor: '#F4E9D2' },
  tileIdx: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    left: 5,
    letterSpacing: 0.5,
    opacity: 0.65,
    position: 'absolute',
    top: 2,
  },
  tileLetter: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 20,
    letterSpacing: -0.5,
    opacity: 0.7,
  },
  tileLetterActive: { opacity: 1 },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: -0.1,
  },
  titleLocked: { color: light.mutedText },
  track: {
    backgroundColor: light.cardAlt,
    borderRadius: 999,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  trackLocked: { opacity: 0.5 },
  trackWrap: { marginTop: 6 },
});
