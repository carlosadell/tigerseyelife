import { format, isValid, parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Droplet, Dumbbell, Moon, Utensils } from 'lucide-react-native';
import { ReactNode, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LETTER_INK, LETTER_TINT } from '../../components/grow/ActionCard';
import { useHistoryDay } from '../../hooks/useHistoryDay';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';
import { estimateCalories, sumMacros } from '../../lib/meals';

const MOOD_LABEL: Record<'strong' | 'steady' | 'drained', string> = {
  strong: 'Strong',
  steady: 'Steady',
  drained: 'Drained',
};

export default function HistoryDayScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date: string }>();
  const colors = useThemeColors();

  const dateObj = useMemo(() => {
    if (!dateParam) return null;
    const parsed = parseISO(dateParam);
    return isValid(parsed) ? parsed : null;
  }, [dateParam]);

  const { day, loading } = useHistoryDay(dateParam ?? '');

  if (!dateObj || !dateParam) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Date not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.emptyLink, { color: colors.accent }]}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const weekday = format(dateObj, 'EEEE').toUpperCase();
  const monthDay = format(dateObj, 'MMMM d').toUpperCase();

  const totals = day ? sumMacros(day.meals) : null;
  const totalCal = totals ? estimateCalories(totals) : 0;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerKicker, { color: colors.accent }]}>LOOKING BACK</Text>
            <Text style={[styles.headerDate, { color: colors.text }]}>
              {weekday} <Text style={{ color: colors.mutedText }}>· {monthDay}</Text>
            </Text>
          </View>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>Loading…</Text>
            </View>
          ) : !day || !day.hasAnyEngagement ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No activity logged this day.
              </Text>
              <Text style={[styles.emptyHint, { color: colors.mutedText }]}>
                Any engagement, a meal, a walk, a glass of water, would have shown up here.
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.rail, { backgroundColor: colors.accent }]} />
                <View style={styles.summaryBody}>
                  <Text style={[styles.kicker, { color: colors.accent }]}>SIGNALS</Text>
                  <SignalRow
                    icon={<Dumbbell color={colors.accent} size={14} strokeWidth={2} />}
                    label="WORKOUT"
                    value={day.workoutNames.length > 0 ? day.workoutNames.join(' · ') : '…'}
                  />
                  <SignalRow
                    icon={<Moon color={colors.accent} size={14} strokeWidth={2} />}
                    label="SLEEP"
                    value={day.engagement.sleep ? 'Logged' : '…'}
                  />
                  <SignalRow
                    icon={<Droplet color={colors.accent} size={14} strokeWidth={2} />}
                    label="HYDRATION"
                    value={day.engagement.water > 0 ? `${day.engagement.water} glasses` : '…'}
                  />
                  <SignalRow
                    icon={<Utensils color={colors.accent} size={14} strokeWidth={2} />}
                    label="MEALS"
                    value={day.meals.length > 0 ? `${day.meals.length} logged · ${totalCal} cal` : '…'}
                  />
                </View>
              </View>

              {day.entry.mood || day.entry.intention || day.entry.reflection ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>REFLECTION</Text>
                  <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {day.entry.mood ? (
                      <View style={styles.entryBlock}>
                        <Text style={[styles.entryLabel, { color: colors.mutedText }]}>MOOD</Text>
                        <Text style={[styles.entryValue, { color: colors.text }]}>
                          {MOOD_LABEL[day.entry.mood]}
                        </Text>
                      </View>
                    ) : null}
                    {day.entry.intention ? (
                      <View style={styles.entryBlock}>
                        <Text style={[styles.entryLabel, { color: colors.mutedText }]}>INTENTION</Text>
                        <Text style={[styles.entryValue, { color: colors.text }]}>
                          {day.entry.intention}
                        </Text>
                      </View>
                    ) : null}
                    {day.entry.reflection ? (
                      <View style={styles.entryBlock}>
                        <Text style={[styles.entryLabel, { color: colors.mutedText }]}>REFLECTION</Text>
                        <Text style={[styles.entryValue, { color: colors.text }]}>
                          {day.entry.reflection}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {day.meals.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>MEALS</Text>
                  {day.meals.map((meal) => {
                    const cals = estimateCalories(meal.macros);
                    return (
                      <View
                        key={meal.id}
                        style={[styles.mealRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                      >
                        <View style={[styles.slotBadge, { backgroundColor: colors.accent }]}>
                          <Text style={styles.slotBadgeText}>{meal.slot}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>
                            {meal.name}
                          </Text>
                          <Text style={[styles.mealMeta, { color: colors.mutedText }]}>
                            {cals} cal · P {meal.macros.protein}g · F {meal.macros.fat}g · C{' '}
                            {meal.macros.carb}g · Fi {meal.macros.fiber}g
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {day.powerActions.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
                    POWER ACTIONS · {day.powerActions.length} CHECKED
                  </Text>
                  {day.powerActions.map((entry) => (
                    <View
                      key={entry.actionId}
                      style={[styles.powerRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={[styles.letterBadge, { backgroundColor: LETTER_TINT[entry.letter] }]}>
                        <Text style={[styles.letterBadgeText, { color: LETTER_INK[entry.letter] }]}>
                          {entry.letter}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.powerText, { color: colors.text }]}>
                          {entry.description}
                        </Text>
                        <Text style={[styles.powerSub, { color: colors.mutedText }]}>
                          {entry.blockName}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SignalRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const colors = useThemeColors();
  const isEmpty = value === '…';
  return (
    <View style={styles.signalRow}>
      <View style={[styles.signalIcon, { backgroundColor: colors.cardAlt }]}>{icon}</View>
      <Text style={[styles.signalLabel, { color: colors.mutedText }]}>{label}</Text>
      <Text
        style={[
          styles.signalValue,
          { color: isEmpty ? colors.mutedText : colors.text },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 6,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingTop: 40,
  },
  entryBlock: {
    gap: 3,
  },
  entryCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  entryLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.6,
  },
  entryValue: {
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 19,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  emptyHint: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  emptyLink: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
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
  headerDate: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: 0.4,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 2.2,
  },
  iconButton: {
    height: 32,
    padding: 4,
    width: 32,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  letterBadge: {
    alignItems: 'center',
    borderRadius: 7,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  letterBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  mealMeta: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 1,
  },
  mealName: {
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
  },
  mealRow: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  powerRow: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  powerSub: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    marginTop: 1,
  },
  powerText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    lineHeight: 17,
  },
  rail: {
    borderRadius: 999,
    width: 2,
  },
  screen: {
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  signalIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  signalLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
    width: 92,
  },
  signalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  signalValue: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    textAlign: 'right',
  },
  slotBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  slotBadgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  summary: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  summaryBody: {
    flex: 1,
    gap: 12,
  },
});
