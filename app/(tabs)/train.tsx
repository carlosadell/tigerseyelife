import { ReactNode } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Dumbbell,
  ListChecks,
  MapPin,
  Sparkles,
  Tv,
  Video,
} from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAssignedProgram } from '../../hooks/useAssignedProgram';
import { useProfile } from '../../hooks/useProfile';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';

export default function TrainScreen() {
  const colors = useThemeColors();
  const { profile } = useProfile();
  const { assignedProgram, todayWorkout, workouts } = useAssignedProgram();
  const isAssigned = Boolean(assignedProgram);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.headerKicker, { color: colors.accent }]}>TRAIN</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isAssigned ? assignedProgram?.name : 'Your program'}
            </Text>
            {isAssigned && assignedProgram?.description ? (
              <Text style={[styles.headerCopy, { color: colors.mutedText }]}>
                {assignedProgram.description}
              </Text>
            ) : null}
          </View>

          {isAssigned ? (
            <AssignedState
              todayWorkout={todayWorkout}
              workouts={workouts}
              intakeAnswers={profile.intakeAnswers}
            />
          ) : (
            <UnassignedState intakeAnswers={profile.intakeAnswers} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type AssignedStateProps = {
  todayWorkout: ReturnType<typeof useAssignedProgram>['todayWorkout'];
  workouts: ReturnType<typeof useAssignedProgram>['workouts'];
  intakeAnswers: Record<string, unknown>;
};

function AssignedState({ todayWorkout, workouts, intakeAnswers }: AssignedStateProps) {
  const colors = useThemeColors();
  const summary = todayWorkout
    ? `${todayWorkout.duration_minutes} min · ${todayWorkout.exercise_count} exercises · ${todayWorkout.equipment.join(' + ')}`
    : 'Ryan is finalizing the next session.';

  const openTodayWorkout = () => {
    if (!todayWorkout) return;
    router.push(`/workout/${todayWorkout.id}`);
  };

  return (
    <View style={styles.stack}>
      <ProgramKeyCard intakeAnswers={intakeAnswers} />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.accent }]}>TODAY'S WORKOUT</Text>
        <Text style={[styles.workoutTitle, { color: colors.text }]}>
          {todayWorkout?.name ?? 'Workout pending'}
        </Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>{summary}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={openTodayWorkout}
          style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        >
          <View
            style={[
              styles.cta,
              {
                backgroundColor: COLORS.tangerine,
                shadowColor: COLORS.tangerine,
              },
            ]}
          >
            <Text style={[styles.ctaText, { color: '#FFFFFF' }]}>Open today's workout</Text>
            <View style={styles.ctaArrow} pointerEvents="none">
              <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.6} />
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>PROGRAM SESSIONS</Text>
        <View
          style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {workouts.map((workout, index) => {
            const isToday = workout.id === todayWorkout?.id;
            return (
              <View
                key={workout.id}
                style={[styles.sessionRow, index < workouts.length - 1 && styles.sessionRowDivider, { borderBottomColor: colors.border }]}
              >
                <View
                  style={[
                    styles.sessionDot,
                    {
                      backgroundColor: isToday ? colors.accent : 'transparent',
                      borderColor: colors.accent,
                    },
                  ]}
                />
                <View style={styles.sessionCopy}>
                  <Text style={[styles.sessionTitle, { color: colors.text }]}>{workout.name}</Text>
                  <Text style={[styles.sessionMeta, { color: colors.mutedText }]}>
                    {workout.day_label} · {workout.duration_minutes} min · {workout.exercise_count} exercises
                  </Text>
                </View>
                {isToday ? (
                  <Text style={[styles.todayPill, { color: colors.accent, borderColor: colors.accent }]}>
                    TODAY
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>
          TUTORIALS FOR THIS WORKOUT
        </Text>
        {todayWorkout?.tutorial_urls?.length ? (
          todayWorkout.tutorial_urls.map((tutorial) => (
            <View
              key={tutorial.url}
              style={[styles.tutorialCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Video color={colors.accent} size={20} strokeWidth={1.8} />
              <Text style={[styles.tutorialTitle, { color: colors.text }]}>{tutorial.title}</Text>
            </View>
          ))
        ) : (
          <View
            style={[styles.tutorialCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Video color={colors.accent} size={20} strokeWidth={1.8} />
            <Text style={[styles.tutorialTitle, { color: colors.mutedText }]}>
              Ryan's tutorial clips will appear here scoped to this workout.
            </Text>
          </View>
        )}
        <Text style={[styles.tutorialFootnote, { color: colors.mutedText }]}>
          Scoped to today's 4 exercises. Never the full library.
        </Text>
      </View>
    </View>
  );
}

function ProgramKeyCard({ intakeAnswers }: { intakeAnswers: Record<string, unknown> }) {
  const colors = useThemeColors();
  const key = derive4AxisKey(intakeAnswers);

  return (
    <View style={[styles.card, styles.programKeyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.rail, { backgroundColor: colors.accent }]} />
      <View style={styles.programKeyBody}>
        <Text style={[styles.kicker, { color: colors.accent }]}>YOUR PROGRAM KEY</Text>
        <Text style={[styles.programKeyHelper, { color: colors.mutedText }]}>
          Four axes from your intake select the same program for the same key, every time.
        </Text>
        <View style={styles.axisGrid}>
          <AxisRow icon={<Clock color={colors.accent} size={16} />} label="DURATION" value={key.duration} />
          <AxisRow icon={<Tv color={colors.accent} size={16} />} label="FORMAT" value={key.format} />
          <AxisRow icon={<MapPin color={colors.accent} size={16} />} label="EQUIPMENT" value={key.location} />
          <AxisRow icon={<Sparkles color={colors.accent} size={16} />} label="SKILL" value={key.skill} />
        </View>
      </View>
    </View>
  );
}

function AxisRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.axisRow}>
      <View style={styles.axisIcon}>{icon}</View>
      <Text style={[styles.axisLabel, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[styles.axisValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function UnassignedState({ intakeAnswers }: { intakeAnswers: Record<string, unknown> }) {
  const colors = useThemeColors();

  return (
    <View style={styles.stack}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.accent }]}>AWAITING ASSIGNMENT</Text>
        <Text style={[styles.workoutTitle, { color: colors.text }]}>
          Ryan is matching your program.
        </Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Your intake is the signal. Karen and Ryan will slot you into the right live, pre-recorded,
          or written path before workouts unlock here.
        </Text>
      </View>

      <ProgramKeyCard intakeAnswers={intakeAnswers} />

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>ASSIGNMENT PATH</Text>
        <View
          style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <TimelineItem
            active
            label="Intake received"
            detail="Your training preferences and practice baseline are saved."
          />
          <TimelineItem
            label="Coach review"
            detail="Ryan uses your signals to choose the right program and workout."
          />
          <TimelineItem
            label="Program unlocks"
            detail="Today and Train update automatically once assignment is set."
          />
        </View>
      </View>

      <View
        style={[styles.tutorialCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <ListChecks color={colors.accent} size={20} strokeWidth={1.8} />
        <Text style={[styles.tutorialTitle, { color: colors.text }]}>
          No workout browsing. TEL is assignment-first.
        </Text>
      </View>
    </View>
  );
}

function TimelineItem({ active, detail, label }: { active?: boolean; detail: string; label: string }) {
  const colors = useThemeColors();

  return (
    <View style={styles.timelineRow}>
      <View
        style={[
          styles.timelineDot,
          {
            backgroundColor: active ? colors.accent : 'transparent',
            borderColor: colors.accent,
          },
        ]}
      >
        {active ? <CheckCircle2 color={colors.inverseText} size={14} /> : null}
      </View>
      <View style={styles.sessionCopy}>
        <Text style={[styles.sessionTitle, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.sessionMeta, { color: colors.mutedText }]}>{detail}</Text>
      </View>
    </View>
  );
}

function derive4AxisKey(intake: Record<string, unknown>) {
  const workoutSetup = readObject(intake.workout_setup);
  const formatRaw = String(intake.format ?? intake.program_preference ?? workoutSetup.format ?? '');
  const durationRaw = String(intake.duration ?? workoutSetup.duration ?? '');
  const locationRaw = String(intake.location ?? workoutSetup.equipment ?? '');
  const skillRaw = intake.skill_level ?? intake.strength_training_experience;

  return {
    duration: durationRaw || 'Not set',
    format: humanizeFormat(formatRaw),
    location: humanizeLocation(locationRaw),
    skill: humanizeSkill(skillRaw),
  };
}

function humanizeFormat(value: string) {
  if (!value) return 'Not set';
  if (value === 'pre_recorded') return 'Pre-recorded';
  if (value === 'live') return 'Live';
  if (value === 'workout_only') return 'Workout only';
  return value;
}

function humanizeLocation(value: string) {
  if (!value) return 'Not set';
  if (value === 'home_basics') return 'Home basics';
  if (value === 'home_gym') return 'Home gym';
  if (value === 'commercial_gym') return 'Commercial gym';
  return value;
}

function humanizeSkill(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return 'Not set';
  return value
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

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const styles = StyleSheet.create({
  axisGrid: {
    gap: 12,
    marginTop: 4,
  },
  axisIcon: {
    width: 20,
  },
  axisLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    width: 88,
  },
  axisRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  axisValue: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    textAlign: 'right',
  },
  body: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  content: {
    gap: 18,
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
  cta: {
    alignItems: 'center',
    borderRadius: 10,
    elevation: 4,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 54,
    paddingHorizontal: 18,
    position: 'relative',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  ctaArrow: {
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    top: 0,
  },
  ctaText: {
    color: COLORS.bone,
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  header: {
    gap: 8,
  },
  headerCopy: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  headerTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  listCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  phoneFrame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  programKeyBody: {
    flex: 1,
    gap: 10,
  },
  programKeyCard: {
    flexDirection: 'row',
    gap: 14,
  },
  programKeyHelper: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 18,
  },
  rail: {
    borderRadius: 999,
    width: 2,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
    paddingHorizontal: 4,
  },
  sessionCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  sessionDot: {
    borderRadius: 999,
    borderWidth: 1.5,
    height: 12,
    marginTop: 5,
    width: 12,
  },
  sessionMeta: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  sessionRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  sessionRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sessionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    lineHeight: 20,
  },
  stack: {
    gap: 14,
  },
  timelineDot: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    marginTop: 1,
    width: 24,
  },
  timelineRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  todayPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    marginTop: 4,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tutorialCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  tutorialFootnote: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  tutorialTitle: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    lineHeight: 19,
  },
  workoutTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 20,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
});
