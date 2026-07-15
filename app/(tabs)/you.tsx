import { router } from 'expo-router';
import {
  ArrowRight,
  Bell,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  History,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Target,
  User,
  UserCircle2,
} from 'lucide-react-native';
import { ReactNode, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle } from '../../components/brand/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useCustomGoals } from '../../hooks/useCustomGoals';
import type { CustomGoal } from '../../hooks/useCustomGoals';
import { usePowerActionProgress } from '../../hooks/usePowerActionProgress';
import { useProfile } from '../../hooks/useProfile';
import { useTheme, useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { POWER_LETTERS, PowerLetter } from '../../lib/powerBlocks';
import { blockFor } from '../../lib/program';

const LETTER_TINT: Record<PowerLetter, string> = {
  P: COLORS.tigerGold,
  O: COLORS.evidenceBlue,
  W: COLORS.tangerine,
  E: COLORS.electricYellow,
  R: COLORS.deepGreen,
};

export default function YouScreen() {
  const colors = useThemeColors();
  const { mode } = useTheme();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const powerProgress = usePowerThreadProgress();
  const { weekNumber, blockId } = useCurrentWeek();
  const { goals: customGoals } = useCustomGoals();

  // Current block's action progress, for the Block Progress card.
  // usePowerActionProgress uses lowercase block slugs.
  const blockSlug = blockId.toLowerCase();
  const currentBlockProgress = usePowerActionProgress(blockSlug);
  const programBlock = blockFor(blockId);

  const firstName = profile.firstName ?? 'Friend';
  const intake = readIntake(profile.intakeAnswers);
  const blockTitle = `${blockId.charAt(0)}${blockId.slice(1).toLowerCase()}`;

  const blockPct =
    currentBlockProgress.summary.blockTarget > 0
      ? Math.round(
          (currentBlockProgress.summary.blockTotal /
            currentBlockProgress.summary.blockTarget) *
            100,
        )
      : 0;

  const stats = [
    { label: 'Streak', value: '23', sub: 'days' },
    { label: 'Week', value: String(weekNumber), sub: 'of 12' },
    { label: 'Workouts', value: '12', sub: 'completed' },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Program identity bar — matches Train and Fuel */}
          <View style={styles.programBar}>
            <View style={[styles.programIcon, { backgroundColor: colors.cardAlt }]}>
              <UserCircle2 color={colors.accent} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.programText}>
              <Text style={[styles.programKicker, { color: colors.mutedText }]}>
                {blockTitle} Block · Week {weekNumber}
              </Text>
              <Text style={[styles.programTitle, { color: colors.text }]} numberOfLines={1}>
                {firstName} · {mode === 'dark' ? 'Dark' : 'Light'} theme
              </Text>
            </View>
          </View>

          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.cardAlt, borderColor: colors.accent }]}>
              <User color={colors.accent} size={26} strokeWidth={1.8} />
            </View>
            <View style={styles.profileCopy}>
              <Text style={[styles.profileName, { color: colors.text }]}>{firstName}</Text>
              <Text style={[styles.profileMeta, { color: colors.mutedText }]}>
                Joined Tigers Eye Life · since 2026
              </Text>
            </View>
            <ThemeToggle />
          </View>

          <View style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.rail, { backgroundColor: colors.accent }]} />
            <View style={styles.whyBody}>
              <Text style={[styles.cardKicker, { color: colors.accent }]}>YOUR BIG WHY</Text>
              <Text style={[styles.whyText, { color: colors.text }]}>
                {profile.bigWhy ||
                  'Stay strong enough to keep up with my kids and own my next decade.'}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                  {stat.label} · {stat.sub}
                </Text>
              </View>
            ))}
          </View>

          {/* Block progress — current block's action tracker summary,
              taps through to the full Karen-style grid */}
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
              {blockTitle.toUpperCase()} BLOCK · TRACKER
            </Text>
          </View>
          <Pressable
            onPress={() => router.push(`/tracker/${blockSlug}` as never)}
            style={({ pressed }) => [
              styles.blockCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={styles.blockCardHead}>
              <View style={[styles.blockBadge, { backgroundColor: colors.cardAlt }]}>
                <Target color={colors.accent} size={16} strokeWidth={2.2} />
              </View>
              <View style={styles.blockCardCopy}>
                <Text style={[styles.blockTarget, { color: colors.text }]}>
                  {programBlock.consistencyTarget} consistency
                </Text>
                <Text style={[styles.blockSub, { color: colors.mutedText }]}>
                  {currentBlockProgress.summary.blockTotal} of {currentBlockProgress.summary.blockTarget}
                  {' actions · weeks '}
                  {programBlock.weekRange[0]}–{programBlock.weekRange[1]}
                </Text>
              </View>
              <Text style={[styles.blockPct, { color: colors.accent }]}>{blockPct}%</Text>
            </View>
            <View style={[styles.blockBar, { backgroundColor: colors.cardAlt }]}>
              <View
                style={[styles.blockBarFill, { backgroundColor: colors.accent, width: `${blockPct}%` }]}
              />
            </View>
            <View style={styles.blockCta}>
              <Text style={[styles.blockCtaText, { color: COLORS.tangerine }]}>
                Open the tracker
              </Text>
              <ArrowRight color={COLORS.tangerine} size={14} strokeWidth={2.4} />
            </View>
          </Pressable>

          {/* My Goals — custom user goals (mirrors Karen's "My Goals" block) */}
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>MY GOALS</Text>
          </View>
          {customGoals.length === 0 ? (
            <Pressable
              onPress={() => router.push('/goals/edit' as never)}
              style={({ pressed }) => [
                styles.goalsEmpty,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Plus color={colors.accent} size={18} strokeWidth={2.2} />
              <Text style={[styles.goalsEmptyTitle, { color: colors.text }]}>
                Add your first goal
              </Text>
              <Text style={[styles.goalsEmptyBody, { color: colors.mutedText }]}>
                A number to move, an identity to grow into, or an intention to hold.
                Karen's "lose 10 lbs" and "60-sec sit-to-stands → 23" lived in this column.
              </Text>
            </Pressable>
          ) : (
            <View style={styles.goalsList}>
              {customGoals.map((goal) => (
                <CustomGoalRow key={goal.id} goal={goal} />
              ))}
              <Pressable
                onPress={() => router.push('/goals/edit' as never)}
                style={({ pressed }) => [
                  styles.goalAdd,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Plus color={colors.accent} size={16} strokeWidth={2.4} />
                <Text style={[styles.goalAddLabel, { color: colors.accent }]}>Add goal</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>POWER THREADS · LIFETIME</Text>
          </View>
          <View style={[styles.powerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(Object.keys(POWER_LETTERS) as PowerLetter[]).map((letter) => (
              <PowerRow key={letter} letter={letter} percentage={powerProgress[letter]} />
            ))}
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>YOUR PROGRAM KEY</Text>
          </View>
          <View style={[styles.intakeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IntakeRow label="DURATION" value={intake.duration} />
            <IntakeRow label="FORMAT" value={intake.format} />
            <IntakeRow label="EQUIPMENT" value={intake.location} />
            <IntakeRow label="SKILL" value={intake.skill} />
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>LOOKING BACK</Text>
          </View>

          <SettingsRow
            icon={<History color={colors.accent} size={18} strokeWidth={1.8} />}
            title="Your history"
            body="Your whole program, day by day. Look back and see how far you have come."
            onPress={() => router.push('/history' as never)}
          />

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>SETTINGS</Text>
          </View>

          <SettingsRow
            icon={<Sparkles color={colors.accent} size={18} strokeWidth={1.8} />}
            title="Coach preferences"
            body="Communication style, tone, response length, science depth."
            onPress={() => router.push('/coach-preferences')}
          />
          <SettingsRow
            icon={<Dumbbell color={colors.accent} size={18} strokeWidth={1.8} />}
            title="Training preferences"
            body="Days per week, equipment changes, live vs pre-recorded."
          />
          <SettingsRow
            icon={<ClipboardList color={colors.accent} size={18} strokeWidth={1.8} />}
            title="Intake & assessment"
            body="Re-take your Big WHY, POWER baseline, and dietary preferences."
          />
          <SettingsRow
            icon={<Bell color={colors.accent} size={18} strokeWidth={1.8} />}
            title="Notifications"
            body="Daily nudges, program updates, and coach check-ins."
            comingSoon
          />
          <SettingsRow
            icon={<Settings color={colors.accent} size={18} strokeWidth={1.8} />}
            title="Preferences & accessibility"
            body="Text size, contrast, language, and account."
            comingSoon
          />

          <Pressable
            onPress={signOut}
            style={[styles.signOut, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <LogOut color={colors.accent} size={18} strokeWidth={1.8} />
            <Text style={[styles.signOutText, { color: colors.accent }]}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function CustomGoalRow({ goal }: { goal: CustomGoal }) {
  const colors = useThemeColors();
  const kindLabel =
    goal.kind === 'metric' ? 'METRIC' : goal.kind === 'identity' ? 'IDENTITY' : 'INTENTION';

  return (
    <Pressable
      onPress={() => router.push(`/goals/edit?id=${goal.id}` as never)}
      style={({ pressed }) => [
        styles.goalRow,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.goalKind, { color: colors.accent }]}>{kindLabel}</Text>
      <Text style={[styles.goalLabel, { color: colors.text }]} numberOfLines={2}>
        {goal.label}
      </Text>
      {goal.kind === 'metric' && (goal.baseline || goal.target) ? (
        <Text style={[styles.goalMetric, { color: colors.mutedText }]}>
          {goal.baseline ? `Baseline ${goal.baseline}` : null}
          {goal.baseline && goal.target ? ' · ' : null}
          {goal.target ? `Target ${goal.target}` : null}
          {goal.unit ? ` ${goal.unit}` : null}
        </Text>
      ) : null}
      {goal.note ? (
        <Text style={[styles.goalNote, { color: colors.mutedText }]} numberOfLines={2}>
          {goal.note}
        </Text>
      ) : null}
    </Pressable>
  );
}

function PowerRow({ letter, percentage }: { letter: PowerLetter; percentage: number }) {
  const colors = useThemeColors();
  const tint = LETTER_TINT[letter];
  return (
    <View style={styles.powerRow}>
      <View style={[styles.powerLetter, { backgroundColor: tint }]}>
        <Text style={styles.powerLetterText}>{letter}</Text>
      </View>
      <View style={styles.powerBody}>
        <View style={styles.powerHead}>
          <Text style={[styles.powerName, { color: colors.text }]}>{POWER_LETTERS[letter]}</Text>
          <Text style={[styles.powerPct, { color: colors.mutedText }]}>{percentage}%</Text>
        </View>
        <View style={[styles.powerTrack, { backgroundColor: colors.cardAlt }]}>
          <View style={[styles.powerFill, { backgroundColor: tint, width: `${percentage}%` }]} />
        </View>
      </View>
    </View>
  );
}

function IntakeRow({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.intakeRow}>
      <Text style={[styles.intakeLabel, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[styles.intakeValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SettingsRow({
  body,
  icon,
  title,
  comingSoon,
  onPress,
}: {
  body: string;
  icon: ReactNode;
  title: string;
  comingSoon?: boolean;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={comingSoon || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: colors.cardAlt }]}>{icon}</View>
      <View style={styles.settingsBody}>
        <View style={styles.settingsHead}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>{title}</Text>
          {comingSoon ? (
            <Text style={[styles.soonBadge, { borderColor: colors.border, color: colors.mutedText }]}>
              SOON
            </Text>
          ) : null}
        </View>
        <Text style={[styles.settingsBodyText, { color: colors.mutedText }]}>{body}</Text>
      </View>
      <ChevronRight color={colors.mutedText} size={18} />
    </Pressable>
  );
}

function usePowerThreadProgress(): Record<PowerLetter, number> {
  const commit = usePowerActionProgress('commit');
  const refine = usePowerActionProgress('refine');
  const evolve = usePowerActionProgress('evolve');
  const adapt = usePowerActionProgress('adapt');
  const thrive = usePowerActionProgress('thrive');

  return useMemo(() => {
    const totals: Record<PowerLetter, { completed: number; target: number }> = {
      P: { completed: 0, target: 0 },
      O: { completed: 0, target: 0 },
      W: { completed: 0, target: 0 },
      E: { completed: 0, target: 0 },
      R: { completed: 0, target: 0 },
    };
    const blocks = [commit, refine, evolve, adapt, thrive];
    for (const { block, summary } of blocks) {
      if (!block) continue;
      for (const action of block.actions) {
        const stat = summary.perAction[action.id];
        if (!stat) continue;
        totals[action.letter].completed += stat.completed;
        totals[action.letter].target += stat.target;
      }
    }
    const result: Record<PowerLetter, number> = { P: 0, O: 0, W: 0, E: 0, R: 0 };
    for (const letter of Object.keys(totals) as PowerLetter[]) {
      const { completed, target } = totals[letter];
      result[letter] = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
    }
    return result;
  }, [commit.summary, refine.summary, evolve.summary, adapt.summary, thrive.summary]);
}

function readIntake(intake: Record<string, unknown>) {
  const setup = isRecord(intake.workout_setup) ? intake.workout_setup : {};
  const duration = String(intake.duration ?? setup.duration ?? '30 min');
  const formatRaw = String(intake.format ?? intake.program_preference ?? '');
  const locationRaw = String(intake.location ?? setup.equipment ?? '');
  const skillRaw = Array.isArray(intake.skill_level)
    ? intake.skill_level
    : Array.isArray(intake.strength_training_experience)
    ? intake.strength_training_experience
    : [];

  return {
    duration,
    format: humanizeFormat(formatRaw),
    location: humanizeLocation(locationRaw),
    skill: humanizeSkill(skillRaw),
  };
}

function humanizeFormat(value: string) {
  if (!value) return 'Pre-recorded';
  if (value === 'pre_recorded') return 'Pre-recorded';
  if (value === 'live') return 'Live';
  if (value === 'workout_only') return 'Workout only';
  return value;
}

function humanizeLocation(value: string) {
  if (!value) return 'Home basics';
  if (value === 'home_basics') return 'Home basics (DB + bands)';
  if (value === 'home_gym') return 'Home gym (barbell + plates)';
  if (value === 'commercial_gym') return 'Commercial gym';
  return value;
}

function humanizeSkill(values: unknown[]) {
  if (!values || values.length === 0) return 'Not set';
  return values
    .map((entry) => {
      const s = String(entry);
      if (s === 'novice' || s === 'new') return 'New to strength';
      if (s === 'rusty') return 'Returning';
      if (s === 'gym_app') return 'Using a gym app';
      if (s === 'designed_program') return 'In a program';
      if (s === 'free_weights_comfortable') return 'Free weights';
      if (s === 'machines_comfortable') return 'Gym machines';
      if (s === 'intermediate') return 'Intermediate';
      if (s === 'familiar_dumbbell_barbell_plates') return 'Free weights';
      if (s === 'familiar_commercial_gym') return 'Commercial gym';
      return s.replace(/_/g, ' ');
    })
    .join(' · ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.4,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  cardKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  content: {
    gap: 14,
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  blockBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  blockBar: {
    borderRadius: 999,
    height: 5,
    marginTop: 12,
    overflow: 'hidden',
    width: '100%',
  },
  blockBarFill: {
    borderRadius: 999,
    height: '100%',
  },
  blockCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    padding: 16,
  },
  blockCardCopy: { flex: 1 },
  blockCardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  blockCta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
  },
  blockCtaText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  blockPct: {
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  blockSub: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  blockTarget: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  goalAdd: {
    alignItems: 'center',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 12,
  },
  goalAddLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: -0.05,
  },
  goalKind: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  goalLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    marginTop: 4,
  },
  goalMetric: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
    marginTop: 4,
  },
  goalNote: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: 4,
  },
  goalRow: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    padding: 14,
  },
  goalsEmpty: {
    alignItems: 'flex-start',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 6,
    marginTop: 8,
    padding: 16,
  },
  goalsEmptyBody: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  goalsEmptyTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    marginTop: 4,
  },
  goalsList: { marginTop: 8 },
  programBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
    paddingVertical: 8,
  },
  programIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  programKicker: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    letterSpacing: -0.05,
  },
  programText: { flex: 1, minWidth: 0 },
  programTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  intakeCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  intakeLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    width: 100,
  },
  intakeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  intakeValue: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
    textAlign: 'right',
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  powerBody: {
    flex: 1,
    gap: 6,
  },
  powerCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  powerFill: {
    borderRadius: 999,
    height: '100%',
  },
  powerHead: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  powerLetter: {
    alignItems: 'center',
    borderRadius: 6,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  powerLetterText: {
    color: COLORS.onyx,
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.5,
  },
  powerName: {
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
  },
  powerPct: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
  },
  powerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  powerTrack: {
    borderRadius: 999,
    height: 5,
    overflow: 'hidden',
    width: '100%',
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  profileMeta: {
    fontFamily: FONTS.sans,
    fontSize: 12,
  },
  profileName: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  rail: {
    borderRadius: 999,
    width: 2,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  sectionHead: {
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  settingsBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  settingsBodyText: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  settingsCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  settingsHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  settingsIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  settingsTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  signOut: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 50,
  },
  signOutText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  soonBadge: {
    borderRadius: 999,
    borderWidth: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.4,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  statLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 10.5,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  whyBody: {
    flex: 1,
    gap: 6,
  },
  whyCard: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  whyText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
});
