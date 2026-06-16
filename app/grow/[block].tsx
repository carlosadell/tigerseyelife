// app/grow/[block].tsx
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BLOCK_IDS,
  sectionsForBlock,
  THREAD_NAMES,
  type BlockId,
  type Section,
} from '../../lib/curriculum';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

const BLOCK_LABEL: Record<BlockId, string> = {
  COMMIT: 'Commit',
  REFINE: 'Refine',
  EVOLVE: 'Evolve',
  ADAPT: 'Adapt',
  THRIVE: 'Thrive',
  EXCEL: 'Excel',
};

export default function BlockSectionListScreen() {
  const params = useLocalSearchParams<{ block?: string }>();
  const blockId = useMemo<BlockId | null>(() => {
    const upper = String(params.block ?? '').toUpperCase();
    return (BLOCK_IDS as readonly string[]).includes(upper) ? (upper as BlockId) : null;
  }, [params.block]);
  const isCompleted = (_slug: string) => false;
  const completedInBlock = (_bId: string) => 0;

  if (!blockId) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
        <View style={styles.frame}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>That block doesn't exist.</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.notFoundBack}>Back</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const sections = sectionsForBlock(blockId);
  const done = completedInBlock(blockId);
  const blockComplete = done >= 6;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={light.text} size={24} />
          </Pressable>
          <Text style={styles.topBarTitle}>{BLOCK_LABEL[blockId]}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerStack}>
            <Text style={styles.kicker}>BLOCK · {blockId}</Text>
            <Text style={styles.title}>{`${BLOCK_LABEL[blockId]} Block`}</Text>
            <Text style={styles.helper}>{`${done} of 6 sections done.`}</Text>
          </View>

          {blockComplete ? (
            <View style={styles.completeBanner}>
              <Text style={styles.completeKicker}>BLOCK COMPLETE</Text>
              <Text style={styles.completeBody}>
                Karen and Ryan are loading the next block. Take a breath.
              </Text>
            </View>
          ) : null}

          <View style={styles.list}>
            {sections.map((section) => (
              <SectionRow
                key={section.slug}
                section={section}
                isDone={isCompleted(section.slug)}
                onPress={() =>
                  router.push(
                    `/grow/${blockId.toLowerCase()}/${section.slug}` as never,
                  )
                }
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type RowProps = {
  section: Section;
  isDone: boolean;
  onPress: () => void;
};

function SectionRow({ section, isDone, onPress }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${section.title}, ${isDone ? 'done' : 'not done'}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View style={styles.row}>
        <View style={styles.rowNum}>
          <Text style={styles.rowNumText}>{String(section.order).padStart(2, '0')}</Text>
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowKicker}>{THREAD_NAMES[section.threadLetter]}</Text>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {section.title}
          </Text>
        </View>
        <View style={styles.rowTrail}>
          {isDone ? (
            <Check color={COLORS.deepGreen} size={20} strokeWidth={2.4} />
          ) : (
            <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backBtn: { height: 32, width: 32 },
  completeBanner: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 22,
    padding: 14,
  },
  completeBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: 4,
  },
  completeKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 16,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  headerStack: { gap: 6 },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  list: {
    marginTop: 22,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  notFoundBack: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  notFoundText: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 14,
  },
  rowBody: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  rowKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  rowNum: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rowNumText: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  rowTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  rowTrail: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  screen: { alignItems: 'center', flex: 1 },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
  },
  topBarTitle: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.2,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
});
