import { ReactNode } from 'react';
import { Bell, Bot, ClipboardList, Dumbbell, LogOut, Settings, User } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { ThemeToggle } from '../../components/brand/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useTheme, useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';

export default function YouScreen() {
  const colors = useThemeColors();
  const { mode } = useTheme();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionLabel label="YOU" />
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={[styles.iconWell, { backgroundColor: colors.cardAlt }]}>
              <User color={colors.accent} size={23} />
            </View>
            <ThemeToggle />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {profile.firstName ? `${profile.firstName}'s profile` : 'Your profile'}
          </Text>
          <Text style={[styles.copy, { color: colors.mutedText }]}>
            Theme is set to {mode}. Your Big WHY, coach preferences, notifications, and account
            controls live here.
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.kicker, { color: colors.accent }]}>BIG WHY</Text>
          <Text style={[styles.body, { color: colors.text }]}>
            {profile.bigWhy || 'Complete onboarding to save the strongest future you are building toward.'}
          </Text>
        </View>
        <SettingsRow
          icon={<ClipboardList color={colors.accent} size={20} />}
          title="Intake summary"
          body={formatIntakeSummary(profile.intakeAnswers)}
        />
        <SettingsRow
          icon={<Dumbbell color={colors.accent} size={20} />}
          title="Program assignment"
          body={
            profile.assignedProgramId
              ? 'Your current program is active. Train shows today’s assigned workout and tutorial support.'
              : 'Awaiting Ryan and Karen review. Train will unlock when your program is assigned.'
          }
        />
        <SettingsRow
          icon={<Bot color={colors.accent} size={20} />}
          title="AI coach"
          body="[ ROUND 5 ] Coach access and real AI wiring will live here."
        />
        <SettingsRow
          icon={<Bell color={colors.accent} size={20} />}
          title="Notifications"
          body="Daily nudges and program updates will be managed here after push notifications are added."
        />
        <SettingsRow
          icon={<Settings color={colors.accent} size={20} />}
          title="Preferences"
          body="Training preferences, live/pre-recorded choice, and accessibility settings."
        />
        <Pressable
          onPress={signOut}
          style={[styles.signOut, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <LogOut color={colors.accent} size={18} />
          <Text style={[styles.signOutText, { color: colors.accent }]}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({ body, icon, title }: { body: string; icon: ReactNode; title: string }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={[styles.iconWell, { backgroundColor: colors.cardAlt }]}>{icon}</View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.copy, { color: colors.mutedText }]}>{body}</Text>
        </View>
      </View>
    </View>
  );
}

function formatIntakeSummary(intakeAnswers: Record<string, unknown>) {
  const workoutSetup = readObject(intakeAnswers.workout_setup);
  const nutrition = readObject(intakeAnswers.nutrition);
  const experience = Array.isArray(intakeAnswers.strength_training_experience)
    ? intakeAnswers.strength_training_experience.map((item) => String(item).replace(/_/g, ' ')).join(', ')
    : null;
  const goals = Array.isArray(workoutSetup.goals) ? workoutSetup.goals.join(', ') : null;
  const parts = [
    experience ? `Experience: ${experience}` : null,
    workoutSetup.days_per_week && workoutSetup.duration
      ? `Training: ${workoutSetup.days_per_week} · ${workoutSetup.duration}`
      : null,
    goals ? `Priorities: ${goals}` : null,
    intakeAnswers.program_preference ? `Program style: ${intakeAnswers.program_preference}` : null,
    nutrition.approach ? `Fuel: ${nutrition.approach}` : null,
  ].filter(Boolean);

  return parts.length ? parts.join('\n') : 'Complete onboarding to save your training and nutrition context.';
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

const styles = StyleSheet.create({
  body: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  content: {
    gap: 14,
    paddingBottom: 126,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  copy: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  kicker: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    marginBottom: 9,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    lineHeight: 21,
  },
  screen: {
    flex: 1,
  },
  signOut: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 50,
  },
  signOutText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    lineHeight: 32,
  },
});
