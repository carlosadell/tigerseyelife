// app/(tabs)/grow.tsx
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { WEEKS } from '../../lib/program';

export default function GrowScreen() {
  const colors = useThemeColors();
  const { weekNumber } = useCurrentWeek();

  const thisWeek = WEEKS.find((w) => w.weekNumber === weekNumber);
  const pastWeeks = WEEKS.filter((w) => w.weekNumber < weekNumber);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>GROW</Text>
            <Text style={[styles.title, { color: colors.text }]}>Your program library</Text>
          </View>

          {thisWeek ? (
            <View>
              <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>THIS WEEK</Text>
              <Pressable
                onPress={() => router.push(`/week/${thisWeek.weekNumber}`)}
                style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
              >
                <View style={[styles.bigCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.weekKicker, { color: colors.accent }]}>
                    WEEK {thisWeek.weekNumber} · {thisWeek.blockId}
                  </Text>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{thisWeek.title}</Text>
                  <Text style={[styles.cardBody, { color: colors.mutedText }]}>{thisWeek.primaryFocus}</Text>
                  <View style={styles.cardCta}>
                    <Text style={[styles.cardCtaText, { color: COLORS.tangerine }]}>Open</Text>
                    <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                  </View>
                </View>
              </Pressable>
            </View>
          ) : null}

          {pastWeeks.length > 0 ? (
            <View>
              <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>PAST WEEKS</Text>
              <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {pastWeeks.map((week, idx) => (
                  <Pressable
                    key={week.weekNumber}
                    onPress={() => router.push(`/week/${week.weekNumber}`)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
                  >
                    <View
                      style={[
                        styles.pastRow,
                        idx < pastWeeks.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                      ]}
                    >
                      <View style={styles.pastCopy}>
                        <Text style={[styles.pastWeekLabel, { color: colors.mutedText }]}>
                          WEEK {week.weekNumber} · {week.blockId}
                        </Text>
                        <Text style={[styles.pastTitle, { color: colors.text }]} numberOfLines={1}>
                          {week.title}
                        </Text>
                      </View>
                      <ArrowRight color={colors.mutedText} size={16} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bigCard: { borderRadius: 14, borderWidth: 1, gap: 8, marginTop: 8, padding: 14 },
  cardBody: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  cardCta: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 4 },
  cardCtaText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
  cardTitle: { fontFamily: FONTS.sansBold, fontSize: 20, letterSpacing: -0.2, lineHeight: 26 },
  content: { gap: 18, paddingBottom: 128, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  header: { gap: 6 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 2.4 },
  listCard: { borderRadius: 12, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  pastCopy: { flex: 1, gap: 3 },
  pastRow: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 14 },
  pastTitle: { fontFamily: FONTS.sansBold, fontSize: 15 },
  pastWeekLabel: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.6 },
  phoneFrame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  screen: { alignItems: 'center', flex: 1 },
  sectionLabel: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 2.2, paddingHorizontal: 4 },
  title: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.3, lineHeight: 28 },
  weekKicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.8 },
});
