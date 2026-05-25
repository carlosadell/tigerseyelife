import {
  Bell,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  LogOut,
  Settings,
  User,
} from 'lucide-react-native';
import { ReactNode, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle } from '../../components/brand/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { usePowerActionProgress } from '../../hooks/usePowerActionProgress';
import { useProfile } from '../../hooks/useProfile';
import { useTheme, useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { POWER_LETTERS, PowerLetter } from '../../lib/powerBlocks';

const LETTER_TINT: Record<PowerLetter, string> = {
  P: COLORS.tigerGold,
  O: COLORS.evidenceBlue,
  W: COLORS.tangerine,
  E: COLORS.electricYellow,
  R: COLORS.deepGreen,
};

const STATS = [
  { label: 'Streak', value: '23', sub: 'days' },
  { label: 'Week', value: '4', sub: 'of program' },
  { label: 'Workouts', value: '12', sub: 'completed' },
];

export default function YouScreen() {
  const colors = useThemeColors();
  const { mode } = useTheme();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const powerProgress = usePowerThreadProgress();

  const firstName = profile.firstName ?? 'Friend';
  const intake = readIntake(profile.intakeAnswers);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.headerKicker, { color: colors.accent }]}>YOU</Text>
            <Text style={[styles.title, { color: colors.text }]}>{firstName}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Member · Week 4 of CREATE POWER · {mode === 'dark' ? 'Dark' : 'Light'} theme
            </Text>
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
            {STATS.map((stat) => (
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
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>SETTINGS</Text>
          </View>

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
}: {
  body: string;
  icon: ReactNode;
  title: string;
  comingSoon?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
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
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.4,
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
  intro: {
    gap: 6,
    paddingTop: 4,
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
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
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
