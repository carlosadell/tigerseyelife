import { format } from 'date-fns';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import { WorkoutExercise, WorkoutSession, WorkoutSetLog } from '../../lib/workouts';

type Props = {
  exercise: WorkoutExercise;
  sessions: WorkoutSession[];
  workoutId?: string | null;
  todaySetLogs: WorkoutSetLog[];
  maxColumns?: number;
};

type HistoryColumn = {
  key: string;
  label: string;
  sublabel: string;
  setLogs: WorkoutSetLog[];
  isToday: boolean;
};

export function ProgressionTable({
  exercise,
  sessions,
  workoutId,
  todaySetLogs,
  maxColumns = 3,
}: Props) {
  const colors = useThemeColors();
  const isWarmup = exercise.is_warmup;

  const columns = useMemo<HistoryColumn[]>(() => {
    const historical = sessions
      .filter((session) => Boolean(session.completed_at))
      .filter((session) => (workoutId ? session.source_id === workoutId : true))
      .map((session) => ({
        date: new Date(session.started_at),
        setLogs: session.set_logs.filter((log) => log.exercise_id === exercise.id),
      }))
      .filter((entry) => entry.setLogs.length > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const sliced = historical.slice(Math.max(0, historical.length - maxColumns));

    const cols: HistoryColumn[] = sliced.map((entry, index) => ({
      isToday: false,
      key: `hist-${index}-${entry.date.toISOString()}`,
      label: format(entry.date, 'MMM d'),
      setLogs: entry.setLogs,
      sublabel: weekLabel(entry.date, sliced.length - index - 1),
    }));

    cols.push({
      isToday: true,
      key: 'today',
      label: 'TODAY',
      setLogs: todaySetLogs,
      sublabel: format(new Date(), 'MMM d'),
    });

    return cols;
  }, [sessions, workoutId, exercise.id, todaySetLogs, maxColumns]);

  const setNumbers = useMemo(
    () => Array.from({ length: exercise.target_sets }, (_, i) => i + 1),
    [exercise.target_sets],
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Progression</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          {isWarmup
            ? 'Practice cue. No weight tracked.'
            : 'Your last sessions. Choose today’s weight. The app suggests, you decide.'}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.setColumnHeader, { color: colors.mutedText }]}>SET</Text>
          {columns.map((col) => (
            <View key={col.key} style={styles.colHeader}>
              <Text
                style={[
                  styles.colHeaderLabel,
                  { color: col.isToday ? colors.accent : colors.mutedText },
                ]}
              >
                {col.label}
              </Text>
              <Text style={[styles.colHeaderSub, { color: colors.mutedText }]}>{col.sublabel}</Text>
            </View>
          ))}
        </View>

        {setNumbers.map((setNum, idx) => (
          <View
            key={setNum}
            style={[
              styles.row,
              styles.dataRow,
              idx < setNumbers.length - 1 && {
                borderBottomColor: colors.border,
                borderBottomWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <Text style={[styles.setNumber, { color: colors.text }]}>{setNum}</Text>
            {columns.map((col) => (
              <ProgressionCell
                key={col.key}
                isToday={col.isToday}
                isWarmup={isWarmup}
                setNum={setNum}
                setLogs={col.setLogs}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function ProgressionCell({
  isToday,
  isWarmup,
  setNum,
  setLogs,
}: {
  isToday: boolean;
  isWarmup: boolean;
  setNum: number;
  setLogs: WorkoutSetLog[];
}) {
  const colors = useThemeColors();
  const match = setLogs.find((log) => log.set_number === setNum);
  const filled = Boolean(match);

  const baseStyle = [
    styles.cell,
    isToday && {
      backgroundColor: filled ? colors.action : 'transparent',
      borderColor: colors.accent,
      borderWidth: 1.2,
    },
    !isToday && match && { backgroundColor: colors.cardAlt },
  ];

  if (isWarmup) {
    return (
      <View style={baseStyle}>
        <Text
          style={[
            styles.warmupMark,
            { color: filled ? '#FFFFFF' : isToday ? colors.accent : colors.mutedText },
          ]}
        >
          {filled ? '✓' : isToday ? '·' : '✓'}
        </Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={baseStyle}>
        <Text
          style={[
            styles.empty,
            { color: isToday ? colors.accent : colors.mutedText },
          ]}
        >
          {isToday ? '…' : '·'}
        </Text>
      </View>
    );
  }

  return (
    <View style={baseStyle}>
      <Text
        style={[
          styles.cellWeight,
          { color: isToday && filled ? '#FFFFFF' : colors.text },
        ]}
      >
        {match.weight_kg > 0 ? `${formatWeight(match.weight_kg)}kg` : '…'}
      </Text>
      <Text
        style={[
          styles.cellReps,
          { color: isToday && filled ? 'rgba(255,255,255,0.85)' : colors.mutedText },
        ]}
      >
        ×{match.reps}
      </Text>
    </View>
  );
}

function formatWeight(kg: number) {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
}

function weekLabel(date: Date, offsetWeeks: number) {
  if (offsetWeeks === 0) return 'last week';
  if (offsetWeeks === 1) return '2 wks ago';
  return `${offsetWeeks + 1} wks ago`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  cell: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  cellReps: {
    fontFamily: FONTS.sansMedium,
    fontSize: 10.5,
    marginTop: 1,
  },
  cellWeight: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  colHeader: {
    alignItems: 'center',
    flex: 1,
    gap: 1,
  },
  colHeaderLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
  },
  colHeaderSub: {
    fontFamily: FONTS.sans,
    fontSize: 9.5,
  },
  dataRow: {
    paddingVertical: 6,
  },
  empty: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
  },
  header: {
    gap: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  setColumnHeader: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textAlign: 'center',
    width: 24,
  },
  setNumber: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    textAlign: 'center',
    width: 24,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  table: {
    gap: 6,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  warmupMark: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
  },
});
