// components/history/WeekStrip.tsx
import { format, subDays } from 'date-fns';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useEngagementDates } from '../../hooks/useEngagementDates';
import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

/**
 * Last-7-days strip. Today's ring is filled gold; other days are outline
 * rings with the day-of-month number. NO failure-state red — skipped days
 * read identically to engaged-but-not-today (mutedText). Past days tap into
 * /history/{date}; today and future are non-interactive.
 */
export function WeekStrip() {
  const { dates } = useEngagementDates();

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
  }, []);

  const todayKey = format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.wrap}>
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const engaged = dates.has(key);
        const isToday = key === todayKey;
        const isFuture = key > todayKey;

        return (
          <Pressable
            key={key}
            accessibilityLabel={`${format(day, 'EEEE MMMM d')}`}
            disabled={isToday || isFuture}
            hitSlop={6}
            onPress={() => router.push(`/history/${key}` as never)}
            style={({ pressed }) => [
              styles.cell,
              { opacity: pressed ? 0.7 : isFuture ? 0.4 : 1 },
            ]}
          >
            <Text style={[styles.dayLetter, { color: isToday ? light.accent : light.mutedText }]}>
              {format(day, 'EEEEE')}
            </Text>
            <View
              style={[
                styles.ring,
                {
                  backgroundColor: isToday ? light.accent : 'transparent',
                  borderColor: isToday ? light.accent : light.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  { color: isToday ? '#FFFFFF' : engaged ? light.text : light.mutedText },
                ]}
              >
                {format(day, 'd')}
              </Text>
            </View>
            <View style={[styles.pulse, { backgroundColor: isToday ? light.accent : 'rgba(11,11,12,0.10)' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const RING = 32;

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    paddingVertical: 4,
  },
  dayLetter: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  dayNumber: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  pulse: {
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  ring: {
    alignItems: 'center',
    borderRadius: RING / 2,
    borderWidth: 2,
    height: RING,
    justifyContent: 'center',
    width: RING,
  },
  wrap: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
});
