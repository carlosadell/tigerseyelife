import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '../../../hooks/useTheme';
import { completeSession, useWorkoutSessions } from '../../../hooks/useWorkoutSessions';
import { calculateVolume } from '../../../lib/workouts';
import { FONTS, SPACING } from '../../../lib/brand';
import { useActiveWorkoutStore } from '../../../stores/activeWorkout';

export default function WorkoutCompleteScreen() {
  const colors = useThemeColors();
  const { saveSession } = useWorkoutSessions();
  const { clearSession, currentSession } = useActiveWorkoutStore();
  const [effort, setEffort] = useState(7);
  const [notes, setNotes] = useState('');

  if (!currentSession) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Workout already saved.</Text>
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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.kicker, { color: colors.accent }]}>[ WORKOUT COMPLETE ]</Text>
        <Text style={[styles.volume, { color: colors.text }]}>{volume}</Text>
        <Text style={[styles.kicker, { color: colors.mutedText }]}>KG TOTAL VOLUME</Text>
        <View style={styles.stats}>
          <Stat label="DURATION" value={formatSeconds(duration)} />
          <Stat label="SETS" value={String(setLogs.length)} />
          <Stat label="AVG RPE" value={String(avgRpe)} />
        </View>
        <Text style={[styles.prompt, { color: colors.text }]}>How hard was this overall?</Text>
        <View style={styles.effortRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <Pressable
              key={value}
              onPress={() => setEffort(value)}
              style={[
                styles.effort,
                { backgroundColor: effort === value ? colors.accent : colors.cardAlt },
              ]}
            >
              <Text style={{ color: effort === value ? colors.inverseText : colors.mutedText }}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Any notes for next time?"
          placeholderTextColor={colors.mutedText}
          style={[styles.notes, { backgroundColor: colors.card, color: colors.text }]}
          value={notes}
        />
        <Pressable onPress={save} style={[styles.primary, { backgroundColor: colors.accent }]}>
          <Text style={[styles.primaryText, { color: colors.inverseText }]}>Save & Done</Text>
        </Pressable>
        <Pressable style={[styles.secondary, { borderColor: colors.border }]}>
          <Text style={[styles.secondaryText, { color: colors.mutedText }]}>Share with buddy [ ROUND 5 ]</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.stat, { backgroundColor: colors.card }]}>
      <Text style={[styles.statLabel, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining < 10 ? '0' : ''}${remaining}`;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  content: { flex: 1, gap: 16, padding: SPACING.screenX },
  effort: { alignItems: 'center', borderRadius: 14, height: 30, justifyContent: 'center', width: 30 },
  effortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kicker: { fontFamily: FONTS.sansMedium, fontSize: 12, letterSpacing: 1.4 },
  notes: { borderRadius: 16, fontFamily: FONTS.sans, minHeight: 110, padding: 14, textAlignVertical: 'top' },
  primary: { alignItems: 'center', borderRadius: 16, height: 54, justifyContent: 'center' },
  primaryText: { fontFamily: FONTS.sansBold, fontSize: 16 },
  prompt: { fontFamily: FONTS.sansBold, fontSize: 17 },
  screen: { flex: 1 },
  secondary: { alignItems: 'center', borderRadius: 16, borderWidth: 1, height: 52, justifyContent: 'center' },
  secondaryText: { fontFamily: FONTS.sansBold },
  stat: { borderRadius: 16, flex: 1, gap: 4, padding: 12 },
  statLabel: { fontFamily: FONTS.sansMedium, fontSize: 10, letterSpacing: 1 },
  stats: { flexDirection: 'row', gap: 10 },
  statValue: { fontFamily: FONTS.sansBold, fontSize: 16 },
  title: { fontFamily: FONTS.sansBold, fontSize: 18 },
  volume: { fontFamily: FONTS.diagnostic, fontSize: 86, lineHeight: 86 },
});
