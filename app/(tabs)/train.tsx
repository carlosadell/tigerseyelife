// app/(tabs)/train.tsx
//
// Train has its own identity — no streak/week chrome (those belong to Today).
// Slim program-context bar up top, big full-width hero, slot-numbered workout
// rows with state, and a floating "resume" pill when an active session exists.

import { Activity, CalendarClock, Clock, Dumbbell, MoreVertical, RotateCcw, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoHeroCard } from '../../components/ui/PhotoHeroCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useApexAssignmentValue } from '../../hooks/useApexAssignment';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { LIVE_GST_SCHEDULE } from '../../lib/apexPrograms';
import { FONTS, THEME_COLORS } from '../../lib/brand';
import { trainHeroPhotoForWeek } from '../../lib/heroPhotos';
import { blockFor } from '../../lib/program';
import type { Workout } from '../../lib/workoutSchedule';
import { workoutsForBlock } from '../../lib/workoutSchedule';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';

const light = THEME_COLORS.light;

const TODAY_SLOT = 1 as const;

type WorkoutStatus = 'today' | 'upcoming';

function statusFor(workout: Workout): WorkoutStatus {
  return workout.slotIndex === TODAY_SLOT ? 'today' : 'upcoming';
}

function badgeFor(status: WorkoutStatus): string {
  return status === 'today' ? 'Today' : 'Open';
}

export default function TrainScreen() {
  const { weekNumber, blockId } = useCurrentWeek();
  const block = blockFor(blockId);
  const workouts = workoutsForBlock(blockId);
  const todayWorkout = workouts.find((w) => w.slotIndex === TODAY_SLOT) ?? workouts[0];
  const blockTitle = `${blockId.charAt(0)}${blockId.slice(1).toLowerCase()}`;

  // The member's assigned Apex program (from onboarding slotting). Drives the
  // program identity line and two informational states: a live-session schedule
  // for Live GST members, and a "being prepared" note for commercial-gym
  // families whose tutorials are not authored yet. The workout list below stays
  // as the trainable content in every case.
  const { family: apexFamily } = useApexAssignmentValue();
  const programName = apexFamily?.displayName ?? 'CREATE POWER';
  const isLiveProgram = apexFamily?.id === 'live-gst';
  const isContentPending = apexFamily ? !apexFamily.contentAvailable : false;

  const currentSession = useActiveWorkoutStore((s) => s.currentSession);
  const currentWorkout = useActiveWorkoutStore((s) => s.currentWorkout);
  const clearSession = useActiveWorkoutStore((s) => s.clearSession);
  const hasActiveSession = !!(currentSession && currentWorkout);

  const insets = useSafeAreaInsets();
  // The floating tab bar wraps in `insets.bottom + 6` padding plus its own
  // ~62px pill body. We sit the resume pill 14px above that so the two
  // never visually touch — see FloatingTabBar.tsx for the math.
  const tabBarTop = insets.bottom + 6 + 62;
  const pillBottom = tabBarTop + 14;

  // Where Return should take the user. The active-workout route is
  // /workout/active/[sessionId] and the screen rehydrates from the
  // persisted zustand store, so the user lands back on the exact set
  // they paused on.
  const returnHref = currentSession ? `/workout/active/${currentSession.id}` : null;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          hasActiveSession && styles.contentWithPill,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Program identity bar — Train's own header, not Today's chrome */}
        <View style={styles.programBar}>
          <View style={styles.programIcon}>
            <Dumbbell color={light.accent} size={16} strokeWidth={2.2} />
          </View>
          <View style={styles.programText}>
            <Text style={styles.programKicker}>
              {blockTitle} Block · Week {weekNumber}
            </Text>
            <Text style={styles.programTitle} numberOfLines={1}>
              {isLiveProgram ? programName : `${programName} · ${workouts.length} workouts`}
            </Text>
          </View>
        </View>

        {isLiveProgram ? (
          <View style={styles.apexCard}>
            <View style={styles.apexCardHead}>
              <CalendarClock color={light.accent} size={16} strokeWidth={2.2} />
              <Text style={styles.apexCardKicker}>LIVE SESSIONS MEET</Text>
            </View>
            {LIVE_GST_SCHEDULE.map((slot) => (
              <View key={`${slot.day}-${slot.timeET}`} style={styles.apexScheduleRow}>
                <Text style={styles.apexScheduleDay}>{slot.day}</Text>
                <Text style={styles.apexScheduleTime}>{slot.timeET}</Text>
              </View>
            ))}
            <Text style={styles.apexCardNote}>
              Your program meets live on Zoom. The workouts below are here for the days between
              sessions.
            </Text>
          </View>
        ) : null}

        {isContentPending ? (
          <View style={styles.apexCard}>
            <View style={styles.apexCardHead}>
              <Clock color={light.accent} size={16} strokeWidth={2.2} />
              <Text style={styles.apexCardKicker}>{programName.toUpperCase()}</Text>
            </View>
            <Text style={styles.apexCardNote}>
              Your commercial gym program is being prepared. The video tutorials for gym equipment
              arrive later this year. You can start with the workouts below, and the gym sessions
              will show up when they land.
            </Text>
          </View>
        ) : null}

        {todayWorkout ? (
          <View style={styles.heroWrap}>
            <PhotoHeroCard
              kicker={`TODAY · WORKOUT ${todayWorkout.slotIndex}`}
              title={todayWorkout.helper ?? block.mindset}
              photoUri={trainHeroPhotoForWeek(weekNumber)}
              photoSide="full"
            />
          </View>
        ) : null}

        <SectionHeader
          title="This Week's Schedule"
          meta={`${workouts.length} workouts`}
        />

        <View>
          {workouts.map((workout) => {
            const status = statusFor(workout);
            const isToday = status === 'today';
            const numLabel = String(workout.slotIndex).padStart(2, '0');

            return (
              <Pressable
                key={workout.slug}
                accessibilityRole="button"
                accessibilityLabel={`Open ${workout.title}`}
                onPress={() => router.push(`/workout/${workout.slug}` as never)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View style={[styles.row, isToday && styles.rowToday]}>
                  <View style={[styles.tile, isToday && styles.tileToday]}>
                    <Text style={[styles.tileNum, isToday && styles.tileNumToday]}>
                      {numLabel}
                    </Text>
                    <Dumbbell
                      color={isToday ? light.accent : light.mutedText}
                      size={20}
                      strokeWidth={2.2}
                    />
                  </View>

                  <View style={styles.body}>
                    <Text style={styles.title}>{workout.title}</Text>
                    {workout.helper ? (
                      <Text style={styles.helper} numberOfLines={2}>
                        {workout.helper}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={[styles.badge, isToday && styles.badgeToday]}>
                    {badgeFor(status)}
                  </Text>
                  <MoreVertical color={light.mutedText} size={16} strokeWidth={2} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Resume-workout pill — only when there's an active session. Sits
          above the floating tab bar using safe-area insets so it doesn't
          touch the tab bar on any device. */}
      {hasActiveSession && returnHref ? (
        <View style={[styles.pillWrap, { bottom: pillBottom }]} pointerEvents="box-none">
          <View style={styles.pill}>
            <View style={styles.pillBody}>
              <Text style={styles.pillKicker}>Workout in progress</Text>
              <Text style={styles.pillName} numberOfLines={1}>
                {currentWorkout.name}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Discard workout"
              hitSlop={10}
              onPress={() => clearSession()}
              style={({ pressed }) => [styles.pillDiscard, pressed && styles.pillDiscardPressed]}
            >
              <X color={light.danger} size={16} strokeWidth={2.2} />
            </Pressable>
            <Pressable
              accessibilityLabel="Return to workout"
              hitSlop={6}
              onPress={() => router.push(returnHref as never)}
              style={({ pressed }) => [styles.pillReturn, pressed && styles.pillReturnPressed]}
            >
              <RotateCcw color={light.text} size={14} strokeWidth={2.4} />
              <Text style={styles.pillReturnLabel}>Return</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// Activity is kept around for the rest-day row design we'll surface once
// flexible-scheduling lands.
void Activity;

const styles = StyleSheet.create({
  apexCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 14,
    padding: 16,
  },
  apexCardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  apexCardKicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.8,
  },
  apexCardNote: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  apexScheduleDay: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
  },
  apexScheduleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  apexScheduleTime: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  badge: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    marginRight: 6,
    textTransform: 'uppercase',
  },
  badgeToday: { color: light.accent },
  body: { flex: 1 },
  content: {
    paddingBottom: 128,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  contentWithPill: { paddingBottom: 200 },
  heroWrap: { marginTop: 20 },
  helper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  pillBody: { flex: 1 },
  pillDiscard: {
    alignItems: 'center',
    backgroundColor: '#FBEDEC',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  pillDiscardPressed: { opacity: 0.6 },
  pillKicker: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  pillName: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
    letterSpacing: -0.1,
    marginTop: 1,
  },
  pillReturn: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillReturnLabel: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  pillReturnPressed: { opacity: 0.7 },
  pillWrap: {
    left: 16,
    position: 'absolute',
    right: 16,
  },
  programBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
    paddingVertical: 8,
  },
  programIcon: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  programKicker: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    letterSpacing: -0.05,
  },
  programText: { flex: 1, minWidth: 0 },
  programTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowToday: {
    borderColor: light.accent,
    shadowColor: light.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  screen: { flex: 1 },
  tile: {
    alignItems: 'center',
    backgroundColor: '#F0E2C2',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  tileNum: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    left: 4,
    letterSpacing: 0.5,
    opacity: 0.65,
    position: 'absolute',
    top: 2,
  },
  tileNumToday: { opacity: 0.95 },
  tileToday: { backgroundColor: '#F4E9D2' },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    lineHeight: 19,
  },
});
