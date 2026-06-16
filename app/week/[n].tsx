// app/week/[n].tsx
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MessageSquare } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { WEEK_NUMBERS, weekFor } from '../../lib/program';
import { toolBySlug } from '../../lib/tools';
import type { WeekNumber } from '../../lib/program';

export default function WeekArchiveScreen() {
  const { n } = useLocalSearchParams<{ n: string }>();
  const colors = useThemeColors();
  const { weekNumber: currentWeek } = useCurrentWeek();
  const parsed = Number(n);
  const isValid = (WEEK_NUMBERS as readonly number[]).includes(parsed);
  const weekNumber = isValid ? (parsed as WeekNumber) : null;

  if (!weekNumber) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Week not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (weekNumber > currentWeek) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>This week is ahead.</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            You will arrive here when the time is right.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const week = weekFor(weekNumber);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {`Week ${week.weekNumber}`}
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.accent }]}>BLOCK · {week.blockId}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{week.title}</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>{week.primaryFocus}</Text>

        <Text style={[styles.section, { color: colors.text }]}>Slides</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {week.slideNotes.map((note, idx) => (
            <View key={idx} style={styles.slideRow}>
              <Text style={[styles.slideNum, { color: COLORS.tigerGold }]}>
                {String(idx + 1).padStart(2, '0')}
              </Text>
              <Text style={[styles.slideText, { color: colors.text }]}>{note}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Tools</Text>
        {week.toolSlugs.map((slug) => {
          const tool = toolBySlug(slug);
          if (!tool) return null;
          return (
            <Pressable
              key={slug}
              onPress={() => router.push(`/tool/${slug}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
                {tool.isStar ? (
                  <Text style={[styles.starBadge, { color: COLORS.tigerGold }]}>HIGH IMPACT</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}

        <Text style={[styles.section, { color: colors.text }]}>Discussion</Text>
        <View style={[styles.discussionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MessageSquare color={colors.accent} size={18} strokeWidth={1.8} />
          <Text style={[styles.discussionText, { color: colors.text }]}>
            {week.discussionPrompt}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  card: { borderRadius: 12, borderWidth: 1, gap: 12, padding: 14 },
  content: { gap: 14, paddingBottom: 40, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  discussionCard: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  discussionText: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 14, lineHeight: 20 },
  empty: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenX,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  headerTitle: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 17, textAlign: 'center' },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 2.2 },
  screen: { flex: 1 },
  section: { fontFamily: FONTS.sansBold, fontSize: 18, marginTop: 6 },
  slideNum: { fontFamily: FONTS.sansBold, fontSize: 12, minWidth: 24 },
  slideRow: { flexDirection: 'row', gap: 10 },
  slideText: { flex: 1, fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  spacer: { width: 26 },
  starBadge: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.2, lineHeight: 28 },
  toolCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  toolTitle: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 15 },
});
