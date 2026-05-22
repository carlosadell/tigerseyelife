import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '../../hooks/useTheme';
import { usePowerActionProgress } from '../../hooks/usePowerActionProgress';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import {
  PowerAction,
  PowerFocus,
  PowerLetter,
  POWER_LETTERS,
  getPowerBlock,
} from '../../lib/powerBlocks';

const FOCUS_LABEL: Record<PowerFocus, string> = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  MAINTAIN: 'Maintain',
};

const LETTER_TINT: Record<PowerLetter, string> = {
  P: COLORS.tigerGold,
  O: COLORS.evidenceBlue,
  W: COLORS.tangerine,
  E: COLORS.electricYellow,
  R: COLORS.deepGreen,
};

// Each letter badge gets a contrast-optimized text color. Yellow needs dark
// ink for readability; everything else uses pure white.
const LETTER_INK: Record<PowerLetter, string> = {
  P: '#FFFFFF',
  O: '#FFFFFF',
  W: '#FFFFFF',
  E: COLORS.onyx,
  R: '#FFFFFF',
};

const DAY_LABELS = ['M', 'T', 'W', 'TH', 'F', 'S', 'S'];

export default function BlockDetailScreen() {
  const { block: blockId } = useLocalSearchParams<{ block: string }>();
  const colors = useThemeColors();
  const block = getPowerBlock(blockId ?? '');
  const { days, week1, week2, isChecked, toggle, summary } = usePowerActionProgress(blockId ?? '');

  if (!block) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>Block not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.notFoundLink, { color: colors.accent }]}>Back to Grow</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const totalPct = summary.blockTarget > 0
    ? Math.min(100, Math.round((summary.blockTotal / summary.blockTarget) * 100))
    : 0;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
          <Text style={[styles.headerKicker, { color: colors.accent }]}>{block.name.toUpperCase()}</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.tagline, { color: colors.text }]}>{block.tagline}</Text>
            <Text style={[styles.helper, { color: colors.mutedText }]}>{block.helper}</Text>
          </View>

          <View style={[styles.compass, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.rail, { backgroundColor: colors.accent }]} />
            <View style={styles.compassBody}>
              <Text style={[styles.cardKicker, { color: colors.accent }]}>POWER COMPASS</Text>
              {(Object.keys(POWER_LETTERS) as PowerLetter[]).map((letter) => (
                <View key={letter} style={styles.compassRow}>
                  <View style={[styles.letterBadge, { backgroundColor: LETTER_TINT[letter] }]}>
                    <Text style={[styles.letterBadgeText, { color: LETTER_INK[letter] }]}>{letter}</Text>
                  </View>
                  <Text style={[styles.compassHint, { color: colors.text }]} numberOfLines={2}>
                    {block.compass[letter]}
                  </Text>
                  <Text style={[styles.compassFocus, { color: colors.mutedText }]}>
                    {FOCUS_LABEL[block.focus[letter]]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>ACTIONS</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedText }]}>
              Tap any day to toggle
            </Text>
          </View>

          {block.actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              week1={week1}
              week2={week2}
              todayKey={todayKey}
              isChecked={isChecked}
              onToggle={toggle}
              progress={summary.perAction[action.id]}
            />
          ))}

          <View style={[styles.totals, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardKicker, { color: colors.accent }]}>BLOCK SUMMARY</Text>
            <View style={styles.totalsRow}>
              <View style={styles.totalsItem}>
                <Text style={[styles.totalsValue, { color: colors.text }]}>{summary.blockTotal}</Text>
                <Text style={[styles.totalsLabel, { color: colors.mutedText }]}>Actions completed</Text>
              </View>
              <View style={styles.totalsItem}>
                <Text style={[styles.totalsValue, { color: colors.text }]}>{summary.actionsIncomplete}</Text>
                <Text style={[styles.totalsLabel, { color: colors.mutedText }]}>Incomplete</Text>
              </View>
              <View style={styles.totalsItem}>
                <Text style={[styles.totalsValue, { color: colors.accent }]}>{totalPct}%</Text>
                <Text style={[styles.totalsLabel, { color: colors.mutedText }]}>Block progress</Text>
              </View>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.cardAlt }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.accent, width: `${totalPct}%` },
                ]}
              />
            </View>
            <Text style={[styles.totalsCaption, { color: colors.mutedText }]}>
              Aim for 40–50% consistency. Anything above is bonus.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type ActionCardProps = {
  action: PowerAction;
  week1: Date[];
  week2: Date[];
  todayKey: string;
  isChecked: (actionId: string, dateKey: string) => boolean;
  onToggle: (actionId: string, dateKey: string) => void;
  progress?: { completed: number; target: number; percentage: number };
};

function ActionCard({
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
  cardKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  compass: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
    padding: 14,
  },
  compassBody: {
    flex: 1,
    gap: 10,
  },
  compassFocus: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  compassHint: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
    lineHeight: 17,
  },
  compassRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  content: {
    gap: 14,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 8,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 2.6,
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  iconButton: {
    height: 32,
    padding: 4,
    width: 32,
  },
  intro: {
    gap: 6,
    paddingTop: 4,
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
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  notFoundLink: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  notFoundText: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  progressFillSm: {
    borderRadius: 999,
    height: '100%',
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressTrackSm: {
    borderRadius: 999,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  rail: {
    borderRadius: 999,
    width: 2,
  },
  screen: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  sectionSub: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
  },
  tagline: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  totals: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 6,
    padding: 16,
  },
  totalsCaption: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontStyle: 'italic',
  },
  totalsItem: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 2,
  },
  totalsLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  totalsValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.3,
    lineHeight: 26,
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
