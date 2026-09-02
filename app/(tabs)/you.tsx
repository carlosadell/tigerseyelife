import { router } from "expo-router";
import {
  ArrowRight,
  ChevronRight,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  User,
  UserCircle2,
} from "lucide-react-native";
import { ReactNode, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeToggle } from "../../components/brand/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { useCurrentWeek } from "../../hooks/useCurrentWeek";
import { useCustomGoals } from "../../hooks/useCustomGoals";
import type { CustomGoal } from "../../hooks/useCustomGoals";
import { usePowerActionProgress } from "../../hooks/usePowerActionProgress";
import { useProfile } from "../../hooks/useProfile";
import { useStreak } from "../../hooks/useStreak";
import { useTheme, useThemeColors } from "../../hooks/useTheme";
import { useWorkoutSessions } from "../../hooks/useWorkoutSessions";
import { COLORS, FONTS, SPACING } from "../../lib/brand";
import { blockFor } from "../../lib/program";

export default function YouScreen() {
  const colors = useThemeColors();
  const { mode } = useTheme();
  const { deleteAccount, signOut } = useAuth();
  const { profile } = useProfile();
  const { weekNumber, blockId } = useCurrentWeek();
  const { goals: customGoals } = useCustomGoals();
  const { days: streakDays } = useStreak();
  const { sessions } = useWorkoutSessions();
  const [accountError, setAccountError] = useState<string | null>(null);

  // Current block's action progress, for the Block Progress card.
  // usePowerActionProgress uses lowercase block slugs.
  const blockSlug = blockId.toLowerCase();
  const currentBlockProgress = usePowerActionProgress(blockSlug);
  const programBlock = blockFor(blockId);

  const firstName = profile.firstName ?? "Friend";
  const blockTitle = `${blockId.charAt(0)}${blockId.slice(1).toLowerCase()}`;

  const blockPct =
    currentBlockProgress.summary.blockTarget > 0
      ? Math.round(
          (currentBlockProgress.summary.blockTotal /
            currentBlockProgress.summary.blockTarget) *
            100,
        )
      : 0;

  const completedWorkouts = sessions.filter(
    (session) => session.completed_at,
  ).length;
  const stats = [
    {
      label: "Streak",
      value: String(streakDays),
      sub: streakDays === 1 ? "day" : "days",
    },
    { label: "Week", value: String(weekNumber), sub: "of 12" },
    { label: "Workouts", value: String(completedWorkouts), sub: "completed" },
  ];

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete your account?",
      "This permanently removes your profile, intake, workouts, meals, progress, and login. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            try {
              setAccountError(null);
              await deleteAccount();
            } catch (error) {
              setAccountError(
                error instanceof Error
                  ? error.message
                  : "Unable to delete your account.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.phoneFrame}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Program identity bar — matches Train and Fuel */}
          <View style={styles.programBar}>
            <View
              style={[styles.programIcon, { backgroundColor: colors.cardAlt }]}
            >
              <UserCircle2 color={colors.accent} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.programText}>
              <Text style={[styles.programKicker, { color: colors.mutedText }]}>
                {blockTitle} Block · Week {weekNumber}
              </Text>
              <Text
                style={[styles.programTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {firstName} · {mode === "dark" ? "Dark" : "Light"} theme
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.profileCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.cardAlt, borderColor: colors.accent },
              ]}
            >
              <User color={colors.accent} size={26} strokeWidth={1.8} />
            </View>
            <View style={styles.profileCopy}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {firstName}
              </Text>
              <Text style={[styles.profileMeta, { color: colors.mutedText }]}>
                Create Power member
              </Text>
            </View>
            <ThemeToggle />
          </View>

          <View
            style={[
              styles.whyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.rail, { backgroundColor: colors.accent }]} />
            <View style={styles.whyBody}>
              <Text style={[styles.cardKicker, { color: colors.accent }]}>
                YOUR BIG WHY
              </Text>
              <Text style={[styles.whyText, { color: colors.text }]}>
                {profile.bigWhy ||
                  "Stay strong enough to keep up with my kids and own my next decade."}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
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
              <View
                style={[styles.blockBadge, { backgroundColor: colors.cardAlt }]}
              >
                <Target color={colors.accent} size={16} strokeWidth={2.2} />
              </View>
              <View style={styles.blockCardCopy}>
                <Text style={[styles.blockTarget, { color: colors.text }]}>
                  {programBlock.consistencyTarget} consistency
                </Text>
                <Text style={[styles.blockSub, { color: colors.mutedText }]}>
                  {currentBlockProgress.summary.blockTotal} of{" "}
                  {currentBlockProgress.summary.blockTarget}
                  {" actions · weeks "}
                  {programBlock.weekRange[0]}–{programBlock.weekRange[1]}
                </Text>
              </View>
              <Text style={[styles.blockPct, { color: colors.accent }]}>
                {blockPct}%
              </Text>
            </View>
            <View
              style={[styles.blockBar, { backgroundColor: colors.cardAlt }]}
            >
              <View
                style={[
                  styles.blockBarFill,
                  { backgroundColor: colors.accent, width: `${blockPct}%` },
                ]}
              />
            </View>
            <View style={styles.blockCta}>
              <Text style={[styles.blockCtaText, { color: COLORS.tangerine }]}>
                Open the tracker
              </Text>
              <ArrowRight
                color={COLORS.tangerine}
                size={14}
                strokeWidth={2.4}
              />
            </View>
          </Pressable>

          {/* My Goals — custom user goals (mirrors Karen's "My Goals" block) */}
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
              MY GOALS
            </Text>
          </View>
          {customGoals.length === 0 ? (
            <Pressable
              onPress={() => router.push("/goals/edit" as never)}
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
              <Text
                style={[styles.goalsEmptyBody, { color: colors.mutedText }]}
              >
                Track a number, an identity you are building, or an intention
                you want to hold.
              </Text>
            </Pressable>
          ) : (
            <View style={styles.goalsList}>
              {customGoals.map((goal) => (
                <CustomGoalRow key={goal.id} goal={goal} />
              ))}
              <Pressable
                onPress={() => router.push("/goals/edit" as never)}
                style={({ pressed }) => [
                  styles.goalAdd,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Plus color={colors.accent} size={16} strokeWidth={2.4} />
                <Text style={[styles.goalAddLabel, { color: colors.accent }]}>
                  Add goal
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
              SETTINGS
            </Text>
          </View>

          <SettingsRow
            icon={
              <Sparkles color={colors.accent} size={18} strokeWidth={1.8} />
            }
            title="Coach preferences"
            body="Communication style, tone, response length, science depth."
            onPress={() => router.push("/coach-preferences")}
          />
          <SettingsRow
            icon={
              <ShieldCheck color={colors.accent} size={18} strokeWidth={1.8} />
            }
            title="Privacy & account data"
            body="Read the privacy policy and learn how deletion works."
            onPress={() => router.push("/privacy")}
          />

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
              ACCOUNT
            </Text>
          </View>
          {accountError ? (
            <Text style={styles.accountError}>{accountError}</Text>
          ) : null}
          <Pressable
            onPress={signOut}
            style={[
              styles.signOut,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <LogOut color={colors.accent} size={18} strokeWidth={1.8} />
            <Text style={[styles.signOutText, { color: colors.accent }]}>
              Sign out
            </Text>
          </Pressable>
          <Pressable
            onPress={confirmDeleteAccount}
            style={[
              styles.signOut,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Trash2 color={colors.danger} size={18} strokeWidth={1.8} />
            <Text style={[styles.signOutText, { color: colors.danger }]}>
              Delete account
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function CustomGoalRow({ goal }: { goal: CustomGoal }) {
  const colors = useThemeColors();
  const kindLabel =
    goal.kind === "metric"
      ? "METRIC"
      : goal.kind === "identity"
        ? "IDENTITY"
        : "INTENTION";

  return (
    <Pressable
      onPress={() => router.push(`/goals/edit?id=${goal.id}` as never)}
      style={({ pressed }) => [
        styles.goalRow,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.goalKind, { color: colors.accent }]}>
        {kindLabel}
      </Text>
      <Text
        style={[styles.goalLabel, { color: colors.text }]}
        numberOfLines={2}
      >
        {goal.label}
      </Text>
      {goal.kind === "metric" && (goal.baseline || goal.target) ? (
        <Text style={[styles.goalMetric, { color: colors.mutedText }]}>
          {goal.baseline ? `Baseline ${goal.baseline}` : null}
          {goal.baseline && goal.target ? " · " : null}
          {goal.target ? `Target ${goal.target}` : null}
          {goal.unit ? ` ${goal.unit}` : null}
        </Text>
      ) : null}
      {goal.note ? (
        <Text
          style={[styles.goalNote, { color: colors.mutedText }]}
          numberOfLines={2}
        >
          {goal.note}
        </Text>
      ) : null}
    </Pressable>
  );
}

function SettingsRow({
  body,
  icon,
  title,
  onPress,
}: {
  body: string;
  icon: ReactNode;
  title: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
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
      <View style={[styles.settingsIcon, { backgroundColor: colors.cardAlt }]}>
        {icon}
      </View>
      <View style={styles.settingsBody}>
        <Text style={[styles.settingsTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingsBodyText, { color: colors.mutedText }]}>
          {body}
        </Text>
      </View>
      <ChevronRight color={colors.mutedText} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accountError: {
    color: COLORS.deepRed,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1.4,
    height: 48,
    justifyContent: "center",
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
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  blockBar: {
    borderRadius: 999,
    height: 5,
    marginTop: 12,
    overflow: "hidden",
    width: "100%",
  },
  blockBarFill: {
    borderRadius: 999,
    height: "100%",
  },
  blockCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    padding: 16,
  },
  blockCardCopy: { flex: 1 },
  blockCardHead: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  blockCta: {
    alignItems: "center",
    flexDirection: "row",
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
    alignItems: "center",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
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
    fontStyle: "italic",
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
    alignItems: "flex-start",
    borderRadius: 16,
    borderStyle: "dashed",
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
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
    paddingVertical: 8,
  },
  programIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
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
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  intakeValue: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
    textAlign: "right",
  },
  phoneFrame: {
    alignSelf: "center",
    flex: 1,
    maxWidth: Platform.OS === "web" ? 430 : undefined,
    width: "100%",
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
    height: "100%",
  },
  powerHead: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  powerLetter: {
    alignItems: "center",
    borderRadius: 6,
    height: 22,
    justifyContent: "center",
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
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  powerTrack: {
    borderRadius: 999,
    height: 5,
    overflow: "hidden",
    width: "100%",
  },
  profileCard: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
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
    alignItems: "center",
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
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  settingsHead: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  settingsIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  settingsTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  signOut: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
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
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statCard: {
    alignItems: "center",
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
    textAlign: "center",
  },
  statValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  whyBody: {
    flex: 1,
    gap: 6,
  },
  whyCard: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  whyText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
});
