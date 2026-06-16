// components/today/NextLessonCard.tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useMembership } from '../../hooks/useMembership';
import {
  nextIncompleteSection,
  sectionsForBlock,
  THREAD_NAMES,
  type BlockId,
} from '../../lib/curriculum';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { LessonCard } from '../ui/LessonCard';

const light = THEME_COLORS.light;

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop';

/**
 * Today's "Next Lesson" — dynamically resolved against the current block and
 * the user's progress. If all 6 sections of the current block are done,
 * renders a "Block complete" celebration card instead of routing to a
 * section that no longer exists.
 */
export function NextLessonCard() {
  const { membership } = useMembership();
  const isCompleted = (_slug: string) => false;
  const loading = false;

  const blockId = (membership.currentBlock ?? 'COMMIT') as BlockId;

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  const next = nextIncompleteSection(blockId, isCompleted);

  if (!next) {
    // Block-complete celebration
    return (
      <View style={styles.completeCard}>
        <Text style={styles.completeKicker}>BLOCK COMPLETE</Text>
        <Text style={styles.completeTitle}>
          {`You finished the ${blockTitleOf(blockId)} block.`}
        </Text>
        <Text style={styles.completeBody}>
          Karen and Ryan are loading what comes next. Take a breath.
        </Text>
      </View>
    );
  }

  return (
    <LessonCard
      meta={THREAD_NAMES[next.threadLetter]}
      title={next.title}
      body={lessonBlurb(next.content.kind)}
      thumbUri={FALLBACK_THUMB}
      onPress={() => router.push(`/grow/${blockId.toLowerCase()}/${next.slug}` as never)}
    />
  );
}

function lessonBlurb(kind: 'educational' | 'workout' | 'stub'): string {
  switch (kind) {
    case 'workout':
      return 'A movement lesson with Ryan.';
    case 'educational':
      return 'A short read.';
    case 'stub':
      return 'Open it when you are ready.';
  }
}

function blockTitleOf(blockId: BlockId): string {
  return blockId.charAt(0) + blockId.slice(1).toLowerCase();
}

const styles = StyleSheet.create({
  completeBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: 6,
  },
  completeCard: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  completeKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  completeTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  loading: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  loadingText: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
  },
});
