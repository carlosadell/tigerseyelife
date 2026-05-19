import { router } from 'expo-router';
import { ArrowRight, Dumbbell } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DiagnosticNumber } from '../brand/DiagnosticNumber';
import { SectionLabel } from '../brand/SectionLabel';
import { useThemeColors } from '../../hooks/useTheme';
import { useWorkoutHistory } from '../../hooks/useWorkoutSessions';
import { FONTS } from '../../lib/brand';
import { WorkoutSession } from '../../lib/workouts';

export function TrainingSummaryCard() {
  const colors = useThemeColors();
  const historyQuery = useWorkoutHistory(3);
  const sessions: WorkoutSession[] = historyQuery.data ?? [];
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekSessions = sessions.filter((session) => {
    const completed = session.completed_at ? Date.parse(session.completed_at) : 0;
    return completed >= weekStart;
  });
  const weeklyVolume = weekSessions.reduce((total, session) => total + session.total_volume_kg, 0);

  return (
    <View style={styles.wrap}>
      <SectionLabel label="TRAINING SIGNALS" />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statsRow}>
          <View style={styles.volume}>
            <Text style={[styles.kicker, { color: colors.mutedText }]}>Weekly volume</Text>
            <View style={styles.numberRow}>
              <DiagnosticNumber size={48} style={{ color: colors.text }}>
                {Math.round(weeklyVolume).toLocaleString()}
              </DiagnosticNumber>
              <Text style={[styles.unit, { color: colors.mutedText }]}>KG</Text>
            </View>
          </View>
          <View style={[styles.sessionPill, { backgroundColor: colors.cardAlt }]}>
            <Text style={[styles.kicker, { color: colors.mutedText }]}>This week</Text>
            <Text style={[styles.sessionCount, { color: colors.text }]}>
              {weekSessions.length} sessions
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {sessions.length ? sessions.map((session) => <HistoryRow key={session.id} session={session} />) : (
          <Text style={[styles.empty, { color: colors.mutedText }]}>
            Complete a workout from Train and it will appear here.
          </Text>
        )}
        <Pressable onPress={() => router.push('/(tabs)/train')} style={styles.action}>
          <Dumbbell color={colors.accent} size={17} />
          <Text style={[styles.actionText, { color: colors.accent }]}>Open Train</Text>
          <ArrowRight color={colors.accent} size={15} />
        </Pressable>
      </View>
    </View>
  );
}

function HistoryRow({ session }: { session: WorkoutSession }) {
  const colors = useThemeColors();
  return (
    <View style={styles.historyRow}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={[styles.historyTitle, { color: colors.text }]}>{session.name}</Text>
        <Text style={[styles.historyMeta, { color: colors.mutedText }]}>
          {formatDuration(session.total_duration_seconds)}
        </Text>
      </View>
      <Text style={[styles.historyVolume, { color: colors.text }]}>
        {Math.round(session.total_volume_kg).toLocaleString()} KG
      </Text>
    </View>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}M ${remaining}S`;
}

const styles = StyleSheet.create({
  action: { alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 2 },
  actionText: { fontFamily: FONTS.sansBold, fontSize: 14 },
  card: { borderRadius: 22, borderWidth: 1, gap: 12, padding: 16 },
  divider: { height: 1 },
  empty: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  historyMeta: { fontFamily: FONTS.sansMedium, fontSize: 11, marginTop: 2, textTransform: 'uppercase' },
  historyRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  historyTitle: { fontFamily: FONTS.sansBold, fontSize: 14 },
  historyVolume: { fontFamily: FONTS.sansBold, fontSize: 13 },
  kicker: { fontFamily: FONTS.sansMedium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  numberRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 6, marginTop: 4 },
  sessionCount: { fontFamily: FONTS.sansBold, fontSize: 15, marginTop: 3, textTransform: 'capitalize' },
  sessionPill: { borderRadius: 18, padding: 12 },
  statsRow: { alignItems: 'stretch', flexDirection: 'row', gap: 12 },
  unit: { fontFamily: FONTS.sansBold, fontSize: 13, marginBottom: 8 },
  volume: { flex: 1, minWidth: 0 },
  wrap: { gap: 12 },
});
