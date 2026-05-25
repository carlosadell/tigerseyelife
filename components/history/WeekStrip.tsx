import { format, subDays } from 'date-fns';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useEngagementDates } from '../../hooks/useEngagementDates';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

/**
 * Last-7-days strip. Each cell shows day letter + date number + an engagement
 * dot. Tap any past day to drill into the history detail screen; tap today
 * is a no-op since you're already here.
 */
export function WeekStrip() {
  const colors = useThemeColors();
  const { dates } = useEngagementDates();

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
  }, []);

  const todayKey = format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.kicker, { color: colors.mutedText }]}>LAST 7 DAYS</Text>
        <Text style={[styles.helper, { color: colors.mutedText }]}>Tap to look back</Text>
      </View>
      <View style={styles.row}>
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const engaged = dates.has(key);
          const isToday = key === todayKey;
          const isFuture = key > todayKey;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`${format(day, 'EEEE MMMM d')}, ${engaged ? 'engaged' : 'no activity'}`}
              disabled={isToday || isFuture}
              hitSlop={6}
              onPress={() => router.push(`/history/${key}`)}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: isToday ? colors.cardAlt : 'transparent',
                  borderColor: isToday ? colors.accent : colors.border,
                  opacity: pressed ? 0.7 : isFuture ? 0.32 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayLetter,
                  { color: isToday ? colors.accent : colors.mutedText },
                ]}
              >
                {format(day, 'EEE').toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  { color: isToday ? colors.accent : colors.text },
                ]}
              >
                {format(day, 'd')}
              </Text>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: engaged ? colors.success : 'transparent',
                    borderColor: engaged ? colors.success : colors.border,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingBottom: 8,
    paddingTop: 8,
  },
  dayLetter: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  dayNumber: {
    fontFamily: FONTS.diagnostic,
    fontSize: 20,
    lineHeight: 22,
  },
  dot: {
    borderRadius: 999,
    borderWidth: 1,
    height: 6,
    marginTop: 1,
    width: 6,
  },
  headerRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 11,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  wrap: {
    gap: 6,
  },
});

