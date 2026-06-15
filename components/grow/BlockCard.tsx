// components/grow/BlockCard.tsx
import { ChevronRight, Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BLOCK_IDS, type BlockId } from '../../lib/curriculum';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

const BLOCK_LABEL: Record<BlockId, string> = {
  COMMIT: 'Commit',
  REFINE: 'Refine',
  EVOLVE: 'Evolve',
  ADAPT: 'Adapt',
  THRIVE: 'Thrive',
  EXCEL: 'Excel',
};

const BLOCK_HELPER: Record<BlockId, string> = {
  COMMIT: 'Two weeks of small, repeatable wins.',
  REFINE: 'Sharpen the patterns that stuck.',
  EVOLVE: 'Layer in deeper habits.',
  ADAPT: 'Make it work when life gets hard.',
  THRIVE: 'Find what makes it sustainable.',
  EXCEL: 'Own the identity, keep the engine running.',
};

type BlockStatus = 'done' | 'current' | 'locked';

function statusFor(blockId: BlockId, currentBlock: BlockId | null): BlockStatus {
  if (!currentBlock) return blockId === 'COMMIT' ? 'current' : 'locked';
  const blockIdx = BLOCK_IDS.indexOf(blockId);
  const currentIdx = BLOCK_IDS.indexOf(currentBlock);
  if (blockIdx < currentIdx) return 'done';
  if (blockIdx === currentIdx) return 'current';
  return 'locked';
}

type Props = {
  blockId: BlockId;
  currentBlock: BlockId | null;
  doneCount: number;
  onPress: () => void;
};

export function BlockCard({ blockId, currentBlock, doneCount, onPress }: Props) {
  const status = statusFor(blockId, currentBlock);
  const isCurrent = status === 'current';
  const isLocked = status === 'locked';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Block ${BLOCK_LABEL[blockId]}, ${status}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View style={[styles.card, isCurrent && styles.cardCurrent, isLocked && styles.cardLocked]}>
        <View style={styles.left}>
          <Text style={[styles.kicker, isCurrent && styles.kickerCurrent]}>BLOCK · {blockId}</Text>
          <Text style={[styles.title, isLocked && styles.titleLocked]}>{BLOCK_LABEL[blockId]}</Text>
          <Text style={[styles.helper, isLocked && styles.helperLocked]} numberOfLines={2}>
            {BLOCK_HELPER[blockId]}
          </Text>
        </View>
        <View style={styles.right}>
          <View style={[styles.chip, isCurrent && styles.chipCurrent]}>
            <Text style={[styles.chipText, isCurrent && styles.chipTextCurrent]}>
              {doneCount} / 6
            </Text>
          </View>
          <View style={styles.trail}>
            {isLocked ? (
              <Lock color={light.mutedText} size={18} strokeWidth={2} />
            ) : (
              <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 16,
  },
  cardCurrent: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  cardLocked: {
    opacity: 0.55,
  },
  chip: {
    backgroundColor: light.cardAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipCurrent: {
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  chipTextCurrent: {
    color: light.accent,
  },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  helperLocked: {
    color: light.mutedText,
  },
  kicker: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
  },
  kickerCurrent: {
    color: light.accent,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  titleLocked: {
    color: light.text,
  },
  trail: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
});
