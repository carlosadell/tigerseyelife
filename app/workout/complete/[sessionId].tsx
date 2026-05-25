import { format } from 'date-fns';
import { router } from 'expo-router';
import { Flame } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEngagementDates } from '../../../hooks/useEngagementDates';
import { useStreak } from '../../../hooks/useStreak';
import { useThemeColors } from '../../../hooks/useTheme';
import { completeSession, useWorkoutSessions } from '../../../hooks/useWorkoutSessions';
import { COLORS, FONTS, SPACING } from '../../../lib/brand';
import { calculateVolume } from '../../../lib/workouts';
import { useActiveWorkoutStore } from '../../../stores/activeWorkout';

export default function WorkoutCompleteScreen() {
  const colors = useThemeColors();
  const { saveSession } = useWorkoutSessions();
  const { clearSession, currentSession, currentWorkout } = useActiveWorkoutStore();
  const { days: streakDays } = useStreak();
  const { dates: engagedDates } = useEngagementDates();
  const [effort, setEffort] = useState(7);
  const [notes, setNotes] = useState('');

  const todayKey = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  // Projected streak after save: if today wasn't already engaged, the save will tick it +1.
  const projectedStreak = useMemo(() => {
    const todayEngaged = engagedDates.has(todayKey);
    return todayEngaged ? streakDays : streakDays + 1;
  }, [engagedDates, streakDays, todayKey]);

  if (!currentSession) {
    return (
      <SafeAreaView edges={['top']} style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Workout already saved.</Text>
        <Pressable onPress={() => router.replace('/(tabs)/train')}>
          <Text style={[styles.emptyLink, { color: colors.accent }]}>Back to Train</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const setLogs = currentSession.set_logs;
  const volume = calculateVolume(setLogs);
  const duration = Math.max(1, Math.round((Date.now() - Date.parse(currentSession.started_at)) / 1000));
  const avgRpe = setLogs.length
    ? Math.round(setLogs.reduce((sum, set) => sum + set.rpe, 0) / setLogs.length)
    : 0;

  const save = async () => {
    await saveSession(completeSession(currentSession, setLogs, effort, notes));
    clearSession();
    router.replace('/(tabs)/train');
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroBlock}>
            <Text style={[styles.heroKicker, { color: colors.accent }]}>WORKOUT COMPLETE</Text>
            <Text style={[styles.heroName, { color: colors.text }]}>
              {currentWorkout?.name ?? currentSession.name}
            </Text>
          </View>

          <View style={[styles.volumeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.volumeLabel, { color: colors.mutedText }]}>TOTAL VOLUME</Text>
            <View style={styles.volumeRow}>
              <Text style={[styles.volumeValue, { color: colors.accent }]}>{volume}</Text>
              <Text style={[styles.volumeUnit, { color: colors.mutedText }]}>KG</Text>
            </View>
            <View style={[styles.volumeBar, { backgroundColor: colors.cardAlt }]}>
              <View style={[styles.volumeBarFill, { backgroundColor: colors.accent }]} />
            </View>
          </View>

          <View style={[styles.streakBanner, { backgroundColor: colors.card, borderColor: colors.accent }]}>
            <Flame color={COLORS.tangerine} size={20} strokeWidth={2.2} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.streakValue, { color: colors.text }]}>
                Day {projectedStreak} of your practice streak
              </Text>
              <Text style={[styles.streakHint, { color: colors.mutedText }]}>
                Any engagement keeps it alive — workouts, walks, meals, water, sleep.
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat label="DURATION" value={formatSeconds(duration)} />
            <Stat label="SETS" value={String(setLogs.length)} />
            <Stat label="AVG RPE" value={String(avgRpe)} />
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.mutedText }]}>
              HOW HARD WAS THIS OVERALL?
            </Text>
            <View style={styles.effortRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
                const active = effort === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setEffort(value)}
                    style={[
                      styles.effort,
                      {
                        backgroundColor: active ? colors.accent : colors.cardAlt,
                        borderColor: active ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.effortText,
                        { color: active ? colors.inverseText : colors.mutedText },
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.formLabel, { color: colors.mutedText, marginTop: 16 }]}>
              NOTES FOR NEXT TIME
            </Text>
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="What worked, what hurt, what to tweak next session…"
              placeholderTextColor={colors.mutedText}
              style={[
                styles.notes,
                { backgroundColor: colors.cardAlt, borderColor: colors.border, color: colors.text },
              ]}
              value={notes}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={save}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: colors.accent, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={[styles.primaryText, { color: colors.inverseText }]}>Save & Done</Text>
          </Pressable>

          <Pressable
            disabled
            style={[styles.secondary, { borderColor: colors.border }]}
          >
            <Text style={[styles.secondaryText, { color: colors.mutedText }]}>
              Share with buddy
            </Text>
            <Text style={[styles.secondaryBadge, { color: colors.mutedText }]}>ROUND 5</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedText }]}>{label}</Text>
    </View>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining < 10 ? '0' : ''}${remaining}`;
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  content: {
    gap: 16,
    paddingBottom: 60,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
  effort: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexBasis: '8.4%',
    flexGrow: 1,
    height: 36,
    justifyContent: 'center',
  },
  effortRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 6,
  },
  effortText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  emptyLink: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  emptyTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
  },
  formCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  formLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  heroBlock: {
    gap: 6,
    paddingTop: 4,
  },
  heroKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.6,
  },
  heroName: {
    fontFamily: FONTS.sansBold,
    fontSize: 28,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  notes: {
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 6,
    minHeight: 100,
    padding: 12,
    textAlignVertical: 'top',
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  primary: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 4,
  },
  primaryText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: 0.2,
  },
  screen: {
    flex: 1,
  },
  secondary: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryBadge: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.6,
  },
  secondaryText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
  },
  stat: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    padding: 14,
  },
  statLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.6,
    marginTop: -2,
  },
  statValue: {
    fontFamily: FONTS.diagnostic,
    fontSize: 28,
    letterSpacing: 0.4,
    lineHeight: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  streakBanner: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.4,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  streakHint: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  streakValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    lineHeight: 19,
  },
  volumeBar: {
    borderRadius: 999,
    height: 3,
    marginTop: 10,
    overflow: 'hidden',
    width: '100%',
  },
  volumeBarFill: {
    height: '100%',
    width: '100%',
  },
  volumeCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: 18,
  },
  volumeLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  volumeRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 8,
  },
  volumeUnit: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 1,
  },
  volumeValue: {
    fontFamily: FONTS.diagnostic,
    fontSize: 72,
    letterSpacing: 0.5,
    lineHeight: 72,
  },
});
