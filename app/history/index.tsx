import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Fragment, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TimelineDay, useHistoryTimeline } from '../../hooks/useHistoryTimeline';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';

export default function HistoryTimelineScreen() {
  const colors = useThemeColors();
  const { days, loading } = useHistoryTimeline();

  // First day of each program week gets a divider above it.
  const weekStarts = useMemo(() => {
    const seen = new Set<number>();
    const firstOfWeek = new Set<string>();
    for (const d of days) {
      if (!seen.has(d.weekNumber)) {
        seen.add(d.weekNumber);
        firstOfWeek.add(d.dateKey);
      }
    }
    return firstOfWeek;
  }, [days]);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerKicker, { color: colors.accent }]}>LOOKING BACK</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Your whole program</Text>
          </View>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>Loading…</Text>
            </View>
          ) : days.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.text }]}>Your history starts today.</Text>
              <Text style={[styles.emptyHint, { color: colors.mutedText }]}>
                Every day you show up will show up here, so you can look back and see how far you have
                come.
              </Text>
            </View>
          ) : (
            days.map((day) => (
              <Fragment key={day.dateKey}>
                {weekStarts.has(day.dateKey) ? (
                  <View style={styles.divider}>
                    <Text style={[styles.dividerText, { color: colors.mutedText }]}>
                      {day.weekNumber > 12
                        ? 'CONTINUATION'
                        : `WEEK ${day.weekNumber} · ${day.blockLabel}`}
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  </View>
                ) : null}
                <DayRow day={day} />
              </Fragment>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function DayRow({ day }: { day: TimelineDay }) {
  const colors = useThemeColors();
  const dateObj = parseISO(day.dateKey);
  const weekday = format(dateObj, 'EEE').toUpperCase();
  const monthDay = format(dateObj, 'MMM d');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Day ${day.dayNumber}, ${format(dateObj, 'EEEE MMMM d')}${
        day.engaged ? ', active' : ', quiet day'
      }`}
      onPress={() => router.push(`/history/${day.dateKey}` as never)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: day.isToday ? colors.accent : colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.dayNumberCol}>
        <Text style={[styles.dayKicker, { color: colors.mutedText }]}>DAY</Text>
        <Text
          style={[
            styles.dayNumber,
            { color: day.engaged || day.isToday ? colors.accent : colors.mutedText },
          ]}
        >
          {day.dayNumber}
        </Text>
      </View>

      <View style={styles.rowBody}>
        <Text style={[styles.rowDate, { color: colors.text }]}>
          {weekday} <Text style={{ color: colors.mutedText }}>· {monthDay}</Text>
        </Text>
        <Text style={[styles.rowMeta, { color: colors.mutedText }]}>
          {day.isToday ? 'Today' : day.engaged ? 'Active' : 'Quiet day'}
        </Text>
      </View>

      <View style={styles.rowRight}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: day.engaged ? colors.accent : 'transparent',
              borderColor: day.engaged ? colors.accent : colors.border,
            },
          ]}
        />
        <ChevronRight color={colors.mutedText} size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 6,
  },
  dayKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 8.5,
    letterSpacing: 1.6,
  },
  dayNumber: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  dayNumberCol: {
    alignItems: 'center',
    width: 44,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
    padding: 18,
  },
  emptyHint: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  emptyText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 8,
  },
  headerCenter: {
    flex: 1,
    gap: 2,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 2.2,
  },
  headerTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: 0.4,
  },
  iconButton: {
    height: 32,
    padding: 4,
    width: 32,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  row: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  rowBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  rowDate: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  rowMeta: {
    fontFamily: FONTS.sans,
    fontSize: 12,
  },
  rowRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    borderRadius: 999,
    borderWidth: 1.5,
    height: 10,
    width: 10,
  },
  screen: {
    flex: 1,
  },
});
