import { ReactNode } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Dumbbell,
  ListChecks,
  Video,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { useAssignedProgram } from '../../hooks/useAssignedProgram';
import { useProfile } from '../../hooks/useProfile';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';

export default function TrainScreen() {
  const colors = useThemeColors();
  const { assignedProgram, todayWorkout, workouts } = useAssignedProgram();
  const isAssigned = Boolean(assignedProgram);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionLabel label="TRAIN" />
        {isAssigned ? (
          <>
            <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.kicker, { color: colors.accent }]}>CURRENT PROGRAM</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{assignedProgram?.name}</Text>
              <Text style={[styles.copy, { color: colors.mutedText }]}>{assignedProgram?.description}</Text>
              <View style={styles.metaRow}>
                <MetaPill label={assignedProgram?.level ?? 'Assigned'} />
                <MetaPill label={formatDelivery(assignedProgram?.delivery_type)} />
              </View>
            </View>
            <View style={[styles.workoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.kicker, { color: colors.accent }]}>TODAY'S WORKOUT</Text>
                  <Text style={[styles.title, { color: colors.text }]}>{todayWorkout?.name ?? 'Workout pending'}</Text>
                  <Text style={[styles.copy, { color: colors.mutedText }]}>
                    {todayWorkout
                      ? `${todayWorkout.duration_minutes} min · ${todayWorkout.exercise_count} exercises · ${todayWorkout.equipment.join(' + ')}`
                      : 'Ryan is finalizing the next session.'}
                  </Text>
                </View>
                <Dumbbell color={colors.accent} size={26} />
              </View>
              <Pressable style={[styles.primaryAction, { backgroundColor: colors.action }]}>
                <Text style={styles.primaryActionText}>Start assigned workout</Text>
                <ArrowRight color="#FFFFFF" size={21} />
              </Pressable>
            </View>
            <View style={styles.sectionBlock}>
              <SectionLabel label="PROGRAM SESSIONS" />
              {workouts.map((workout) => (
                <View
                  key={workout.id}
                  style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <CheckCircle2 color={colors.accent} size={20} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>{workout.name}</Text>
                    <Text style={[styles.rowMeta, { color: colors.mutedText }]}>
                      {workout.day_label} · {workout.duration_minutes} min · {workout.exercise_count} exercises
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.sectionBlock}>
              <SectionLabel label="TUTORIAL VIDEOS" />
              {todayWorkout?.tutorial_urls?.length ? (
                todayWorkout.tutorial_urls.map((tutorial) => (
                  <PlaceholderCard
                    icon={<Video color={colors.accent} size={21} />}
                    key={tutorial.url}
                    title={tutorial.title}
                    body={tutorial.url}
                  />
                ))
              ) : (
                <PlaceholderCard
                  icon={<Video color={colors.accent} size={21} />}
                  title="Filtered to your assigned program"
                  body="Ryan's tutorial clips will appear here when his program media table lands."
                />
              )}
            </View>
          </>
        ) : (
          <AwaitingAssignment />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AwaitingAssignment() {
  const colors = useThemeColors();
  const { profile } = useProfile();
  const intakeSummary = getIntakeSummary(profile.intakeAnswers);

  return (
    <>
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.accent }]}>AWAITING ASSIGNMENT</Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Ryan is matching your program.</Text>
        <Text style={[styles.copy, { color: colors.mutedText }]}>
          Your intake is the signal. Karen and Ryan will slot you into the right live,
          pre-recorded, or written path before workouts unlock here.
        </Text>
      </View>
      <View style={styles.sectionBlock}>
        <SectionLabel label="ASSIGNMENT PATH" />
        <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TimelineItem active label="Intake received" detail="Your training preferences and practice baseline are saved." />
          <TimelineItem label="Coach review" detail="Ryan uses your signals to choose the right program and workout." />
          <TimelineItem label="Program unlocks" detail="Today and Train update automatically once assignment is set." />
        </View>
      </View>
      <View style={styles.sectionBlock}>
        <SectionLabel label="SIGNALS SENT" />
        <View style={[styles.signalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {intakeSummary.map((item) => (
            <View key={item.label} style={styles.signalRow}>
              <Text style={[styles.signalLabel, { color: colors.mutedText }]}>{item.label}</Text>
              <Text style={[styles.signalValue, { color: colors.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
      <PlaceholderCard
        icon={<CalendarClock color={colors.accent} size={21} />}
        title="What happens next"
        body="You will see your current program, today's workout, tutorials, and session history here once assigned."
      />
      <PlaceholderCard
        icon={<ListChecks color={colors.accent} size={21} />}
        title="No workout browsing"
        body="TEL is assignment-first. Members do not pick random workouts; they follow the path Ryan designs."
      />
    </>
  );
}

function MetaPill({ label }: { label: string }) {
  const colors = useThemeColors();

  return (
    <Text style={[styles.metaPill, { backgroundColor: colors.cardAlt, color: colors.mutedText }]}>
      {label}
    </Text>
  );
}

function PlaceholderCard({ body, icon, title }: { body: string; icon: ReactNode; title: string }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {icon}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowMeta, { color: colors.mutedText }]}>{body}</Text>
      </View>
    </View>
  );
}

function formatDelivery(delivery?: string) {
  if (delivery === 'pre_recorded') return 'Pre-recorded';
  if (delivery === 'live') return 'Live';
  if (delivery === 'written') return 'Written + tutorials';
  return 'Assigned';
}

function TimelineItem({ active, detail, label }: { active?: boolean; detail: string; label: string }) {
  const colors = useThemeColors();

  return (
    <View style={styles.timelineRow}>
      <View
        style={[
          styles.timelineDot,
          { backgroundColor: active ? colors.accent : colors.cardAlt, borderColor: active ? colors.accent : colors.border },
        ]}
      >
        {active ? <CheckCircle2 color={colors.inverseText} size={14} /> : null}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowMeta, { color: colors.mutedText }]}>{detail}</Text>
      </View>
    </View>
  );
}

function getIntakeSummary(intakeAnswers: Record<string, unknown>) {
  const workoutSetup = readObject(intakeAnswers.workout_setup);
  const nutrition = readObject(intakeAnswers.nutrition);
  const experience = Array.isArray(intakeAnswers.strength_training_experience)
    ? intakeAnswers.strength_training_experience.map(humanizeSignal).join(', ')
    : 'Not provided';

  return [
    { label: 'Experience', value: experience },
    { label: 'Schedule', value: [workoutSetup.days_per_week, workoutSetup.duration].filter(Boolean).join(' · ') || 'Not provided' },
    { label: 'Equipment', value: String(workoutSetup.equipment ?? 'Not provided') },
    { label: 'Priorities', value: Array.isArray(workoutSetup.goals) ? workoutSetup.goals.join(', ') : 'Not provided' },
    { label: 'Program style', value: String(intakeAnswers.program_preference ?? 'Not provided') },
    { label: 'Fuel approach', value: String(nutrition.approach ?? 'Not provided') },
  ];
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function humanizeSignal(value: unknown) {
  return String(value).replace(/_/g, ' ');
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 126,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  copy: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  heroTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    lineHeight: 30,
  },
  kicker: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  metaPill: {
    borderRadius: 999,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryActionText: {
    color: '#FFFFFF',
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    textAlign: 'center',
  },
  rowBetween: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  rowCard: {
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  rowMeta: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  rowTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    lineHeight: 21,
  },
  signalCard: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  signalLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  signalRow: {
    gap: 3,
  },
  signalValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    lineHeight: 20,
    textTransform: 'capitalize',
  },
  screen: {
    flex: 1,
  },
  sectionBlock: {
    gap: 10,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 20,
    lineHeight: 25,
  },
  timelineCard: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  timelineDot: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    marginTop: 1,
    width: 26,
  },
  timelineRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  workoutCard: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
});
