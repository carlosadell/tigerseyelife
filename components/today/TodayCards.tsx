import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  Clock,
  Leaf,
  Moon,
  NotebookPen,
  Utensils,
  Waves,
} from 'lucide-react-native';

import { todayCardStyles as styles } from './todayCardStyles';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type CardProps = {
  children: ReactNode;
  tone?: 'default' | 'gold' | 'quiet';
};

type ActionCardProps = {
  icon?: ReactNode;
  kicker?: string;
  title: string;
  detail?: string;
  action?: string;
};

type WorkoutCardProps = {
  assigned?: boolean;
  durationMinutes?: number;
  exerciseCount?: number;
  name?: string;
};

export function TodayCard({ children, tone = 'default' }: CardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        tone === 'gold' && { borderColor: colors.accent },
        tone === 'quiet' && { backgroundColor: colors.cardAlt },
      ]}
    >
      {children}
    </View>
  );
}

export function PatternNudgeCard() {
  const colors = useThemeColors();

  return (
    <TodayCard tone="gold">
      <View style={styles.row}>
        <Text style={styles.flame}>🔥</Text>
        <Text style={[styles.streak, { color: colors.text }]}>23 day practice streak</Text>
      </View>
      <Text style={[styles.kicker, { color: colors.mutedText }]}>This week · Patterns</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Notice what triggers evening snacking
      </Text>
    </TodayCard>
  );
}

export function WorkoutCard({
  assigned,
  durationMinutes,
  exerciseCount,
  name,
}: WorkoutCardProps) {
  const colors = useThemeColors();
  const summary = assigned && name
    ? `${name} · ${durationMinutes ?? 30} min · ${exerciseCount ?? 6} exercises`
    : 'Awaiting program assignment';
  const ctaLabel = assigned ? 'Start workout' : 'View status';

  return (
    <TodayCard>
      <View style={workoutStyles.headerStack}>
        <Text style={[styles.kicker, { color: colors.accent }]}>TODAY'S WORKOUT</Text>
        <Text style={[workoutStyles.summary, { color: colors.text }]}>{summary}</Text>
      </View>
      {!assigned ? (
        <Text style={[styles.body, { color: colors.mutedText, marginTop: 2 }]}>
          Ryan and Karen will match your intake to the right program. Train activates when your
          assignment is ready.
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/train')}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        {assigned ? (
          <View
            style={[
              workoutStyles.cta,
              workoutStyles.ctaPrimary,
              { backgroundColor: COLORS.tangerine, shadowColor: COLORS.tangerine },
            ]}
          >
            <Text style={[workoutStyles.ctaText, { color: '#FFFFFF' }]}>{ctaLabel}</Text>
            <View style={workoutStyles.ctaArrow} pointerEvents="none">
              <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.6} />
            </View>
          </View>
        ) : (
          <View
            style={[
              workoutStyles.cta,
              workoutStyles.ctaGhost,
              { backgroundColor: colors.cardAlt, borderColor: colors.accent },
            ]}
          >
            <Text style={[workoutStyles.ctaText, { color: colors.accent }]}>{ctaLabel}</Text>
            <View style={workoutStyles.ctaArrow} pointerEvents="none">
              <ArrowRight color={colors.accent} size={20} strokeWidth={2.4} />
            </View>
          </View>
        )}
      </Pressable>
    </TodayCard>
  );
}

export function BuddyCard() {
  const colors = useThemeColors();

  return (
    <TodayCard>
      <View style={styles.row}>
        <View style={[styles.initials, { backgroundColor: colors.accent }]}>
          <Text style={styles.initialsText}>JC</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.kicker, { color: colors.mutedText }]}>Your buddy Jen C.</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Completed Upper Body B today · 🔥 18 day streak
          </Text>
        </View>
      </View>
    </TodayCard>
  );
}

export function NutritionCard() {
  const colors = useThemeColors();

  return (
    <TodayCard>
      <View style={nutritionStyles.row}>
        <View style={nutritionStyles.leaf}>
          <Leaf color={colors.accent} size={20} strokeWidth={1.8} />
        </View>
        <View style={nutritionStyles.copy}>
          <View style={nutritionStyles.labelRow}>
            <Text style={[styles.kicker, { color: colors.accent }]}>FUEL</Text>
            <Text style={[nutritionStyles.labelMuted, { color: colors.mutedText }]}>
              Nutrition status
            </Text>
          </View>
          <Text style={[nutritionStyles.body, { color: colors.text }]}>
            Protein on track · Water 64 oz · Dinner planned
          </Text>
        </View>
        <View style={[nutritionStyles.check, { borderColor: colors.accent }]}>
          <Check color={colors.accent} size={16} strokeWidth={2.4} />
        </View>
      </View>
    </TodayCard>
  );
}

export function EveningCheckInCard() {
  const colors = useThemeColors();

  return (
    <ActionCard
      detail="Available tonight at 8pm · 2 minutes"
      icon={<Clock color={colors.accent} size={19} />}
      title="Evening check-in"
    />
  );
}

export function UpcomingCard() {
  const colors = useThemeColors();

  return (
    <ActionCard
      detail="Karen's coaching call · Thursday 11am EST"
      icon={<Calendar color={colors.accent} size={19} />}
      title="Upcoming"
    />
  );
}

function ActionCard({ action, detail, icon, kicker, title }: ActionCardProps) {
  const colors = useThemeColors();

  return (
    <TodayCard>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {kicker ? <Text style={[styles.kicker, { color: colors.mutedText }]}>{kicker}</Text> : null}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {detail ? <Text style={[styles.body, { color: colors.mutedText }]}>{detail}</Text> : null}
        </View>
        {icon ? <View style={[styles.iconWell, { backgroundColor: colors.cardAlt }]}>{icon}</View> : null}
      </View>
      {action ? (
        <Pressable style={styles.actionRow}>
          <Text style={[styles.goldAction, { color: colors.accent }]}>{action}</Text>
          <ArrowRight color={colors.accent} size={16} />
        </Pressable>
      ) : null}
    </TodayCard>
  );
}

export function getReminderIcon(key: string, color: string) {
  if (key === 'bedtime') return <Moon color={color} size={17} />;
  if (key === 'evening') return <NotebookPen color={color} size={17} />;
  if (key === 'hydration') return <Waves color={color} size={17} />;
  if (key === 'protein') return <Utensils color={color} size={17} />;
  return <Bell color={color} size={17} />;
}

const workoutStyles = StyleSheet.create({
  cta: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 54,
    paddingHorizontal: 18,
    position: 'relative',
  },
  ctaGhost: {
    borderWidth: 1.4,
  },
  ctaPrimary: {
    elevation: 4,
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
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  headerStack: {
    gap: 6,
  },
  summary: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15.5,
    lineHeight: 21,
  },
});

const nutritionStyles = StyleSheet.create({
  body: {
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 19,
  },
  check: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.4,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  labelMuted: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  leaf: {
    paddingTop: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});
