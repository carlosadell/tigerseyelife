import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionCard, LETTER_INK, LETTER_TINT } from '../../components/grow/ActionCard';
import { useThemeColors } from '../../hooks/useTheme';
import { usePowerActionProgress } from '../../hooks/usePowerActionProgress';
import { FONTS, SPACING } from '../../lib/brand';
import { POWER_LETTERS, PowerLetter, getPowerBlock } from '../../lib/powerBlocks';

function isPowerLetter(value: string): value is PowerLetter {
  return value === 'P' || value === 'O' || value === 'W' || value === 'E' || value === 'R';
}

export default function ThreadScreen() {
  const params = useLocalSearchParams<{ block: string; letter: string }>();
  const colors = useThemeColors();
  const blockId = params.block ?? '';
  const letterParam = (params.letter ?? '').toUpperCase();
  const letter = isPowerLetter(letterParam) ? letterParam : null;
  const block = getPowerBlock(blockId);
  const { days, week1, week2, isChecked, toggle, summary } = usePowerActionProgress(blockId);

  const todayKey = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  if (!block || !letter) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>Thread not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.notFoundLink, { color: colors.accent }]}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const actions = block.actions.filter((a) => a.letter === letter);
  const tint = LETTER_TINT[letter];
  const compass = block.compass[letter];

  const threadTotals = useMemo(() => {
    let completed = 0;
    let target = 0;
    let todayDone = 0;
    for (const action of actions) {
      const stat = summary.perAction[action.id];
      if (stat) {
        completed += stat.completed;
        target += stat.target;
      }
      if (isChecked(action.id, todayKey)) todayDone += 1;
    }
    const pct = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
    return { completed, target, pct, todayDone, todayTotal: actions.length };
  }, [actions, isChecked, summary, todayKey]);

  // touch days so the hook's window doesn't tree-shake when unused locally
  void days;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={[styles.letterBadge, { backgroundColor: tint }]}>
              <Text style={[styles.letterBadgeText, { color: LETTER_INK[letter] }]}>{letter}</Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {POWER_LETTERS[letter]}
            </Text>
          </View>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.compass, { color: colors.text }]}>{compass}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              {block.name} · {threadTotals.todayDone} of {threadTotals.todayTotal} today ·{' '}
              {threadTotals.pct}% block
            </Text>
          </View>

          {actions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No actions in this thread for {block.name}.
              </Text>
            </View>
          ) : (
            actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                week1={week1}
                week2={week2}
                todayKey={todayKey}
                isChecked={isChecked}
                onToggle={toggle}
                progress={summary.perAction[action.id]}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  compass: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  content: {
    gap: 12,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  emptyText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 8,
  },
  headerCenter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: 0.4,
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
  letterBadge: {
    alignItems: 'center',
    borderRadius: 7,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  letterBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
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
  screen: {
    flex: 1,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
});
