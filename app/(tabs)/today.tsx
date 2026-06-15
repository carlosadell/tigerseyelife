// app/(tabs)/today.tsx
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommitBlockToday } from '../../components/today/CommitBlockToday';
import { useMembership } from '../../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

/**
 * Block-driven Today. Reads current_block from useMembership and dispatches
 * to the right module set. New blocks layer in as their own components
 * without re-architecting this file.
 *
 * Theme-locked light per spec §5.
 */
export default function TodayScreen() {
  const { membership } = useMembership();
  const block = membership.currentBlock ?? 'COMMIT';

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.scroll}>
          {renderBlock(block)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type Block = NonNullable<ReturnType<typeof useMembership>['membership']['currentBlock']>;

function renderBlock(block: Block) {
  if (block === 'COMMIT') return <CommitBlockToday weekIndex={1} weekLabel="Week 1" />;
  return <BlockPlaceholder block={block} />;
}

function BlockPlaceholder({ block }: { block: string }) {
  return (
    <View style={[styles.placeholderWrap, { paddingHorizontal: SPACING.screenX }]}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderKicker}>BLOCK · {block}</Text>
        <Text style={styles.placeholderTitle}>This block's Today is still being designed.</Text>
        <Text style={styles.placeholderBody}>
          Karen and Ryan haven't named the modules for {block} yet. Today is block-driven, so this slot will swap to a different set of cards. Nothing else changes.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 128, paddingTop: 0 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  placeholder: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  placeholderBody: { color: light.mutedText, fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  placeholderKicker: { color: COLORS.tigerGold, fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 1.4 },
  placeholderTitle: { color: light.text, fontFamily: FONTS.sansBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  placeholderWrap: { marginTop: 24 },
  screen: { alignItems: 'center', flex: 1 },
  scroll: { flex: 1, width: '100%' },
});
