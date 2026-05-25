import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';
import { PowerAction, PowerLetter } from '../../lib/powerBlocks';

export const LETTER_TINT: Record<PowerLetter, string> = {
  P: COLORS.tigerGold,
  O: COLORS.evidenceBlue,
  W: COLORS.tangerine,
  E: COLORS.electricYellow,
  R: COLORS.deepGreen,
};

export const LETTER_INK: Record<PowerLetter, string> = {
  P: '#FFFFFF',
  O: '#FFFFFF',
  W: '#FFFFFF',
  E: COLORS.onyx,
  R: '#FFFFFF',
};

const DAY_LABELS = ['M', 'T', 'W', 'TH', 'F', 'S', 'S'];

type ActionCardProps = {
  action: PowerAction;
  week1: Date[];
  week2: Date[];
  todayKey: string;
  isChecked: (actionId: string, dateKey: string) => boolean;
  onToggle: (actionId: string, dateKey: string) => void;
  progress?: { completed: number; target: number; percentage: number };
};

export function ActionCard({
  action,
  week1,
  week2,
  todayKey,
  isChecked,
  onToggle,
  progress,
}: ActionCardProps) {
  const colors = useThemeColors();
  const tint = LETTER_TINT[action.letter];
  const completed = progress?.completed ?? 0;
  const target = progress?.target ?? action.weekly_target * 2;
  const percentage = progress?.percentage ?? 0;

  return (
    <View style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.actionHeader}>
        <View style={[styles.letterBadge, { backgroundColor: tint }]}>
          <Text style={[styles.letterBadgeText, { color: LETTER_INK[action.letter] }]}>{action.letter}</Text>
        </View>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{action.description}</Text>
      </View>

      <WeekRow
        actionId={action.id}
        days={week1}
        label="WK 1"
        todayKey={todayKey}
        isChecked={isChecked}
        onToggle={onToggle}
      />
      <WeekRow
        actionId={action.id}
        days={week2}
        label="WK 2"
        todayKey={todayKey}
        isChecked={isChecked}
        onToggle={onToggle}
      />

      <View style={styles.actionFooter}>
        <Text style={[styles.actionMeta, { color: colors.mutedText }]}>
          {completed}/{target} · {percentage}%
        </Text>
        <View style={[styles.progressTrackSm, { backgroundColor: colors.cardAlt }]}>
          <View
            style={[
              styles.progressFillSm,
              { backgroundColor: tint, width: `${percentage}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

type WeekRowProps = {
  actionId: string;
  days: Date[];
  label: string;
  todayKey: string;
  isChecked: (actionId: string, dateKey: string) => boolean;
  onToggle: (actionId: string, dateKey: string) => void;
};

function WeekRow({ actionId, days, label, todayKey, isChecked, onToggle }: WeekRowProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.weekRow}>
      <Text style={[styles.weekLabel, { color: colors.mutedText }]}>{label}</Text>
      <View style={styles.weekCells}>
        {days.map((day, index) => {
          const key = format(day, 'yyyy-MM-dd');
          const checked = isChecked(actionId, key);
          const isFuture = key > todayKey;
          const isToday = key === todayKey;

          return (
            <Pressable
              key={key}
              disabled={isFuture}
              hitSlop={4}
              onPress={() => {
                if (isFuture) return;
                Haptics.selectionAsync();
                onToggle(actionId, key);
              }}
              style={[
                styles.dayCell,
                {
                  backgroundColor: checked ? colors.accent : 'transparent',
                  borderColor: isToday ? colors.action : colors.border,
                  opacity: isFuture ? 0.32 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayLetter,
                  {
                    color: checked
                      ? '#FFFFFF'
                      : isToday
                      ? colors.action
                      : colors.mutedText,
                  },
                ]}
              >
                {DAY_LABELS[index]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  actionFooter: {
    gap: 6,
    paddingTop: 2,
  },
  actionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  actionMeta: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11.5,
    letterSpacing: 0.4,
  },
  actionTitle: {
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
    lineHeight: 19,
  },
  dayCell: {
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    height: 36,
    justifyContent: 'center',
  },
  dayLetter: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  letterBadge: {
    alignItems: 'center',
    borderRadius: 6,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  letterBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.5,
  },
  progressFillSm: {
    borderRadius: 999,
    height: '100%',
  },
  progressTrackSm: {
    borderRadius: 999,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  weekCells: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  weekLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
    width: 30,
  },
  weekRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
