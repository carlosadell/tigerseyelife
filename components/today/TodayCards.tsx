import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  Clock,
  Dumbbell,
  Moon,
  NotebookPen,
  Utensils,
  Waves,
} from 'lucide-react-native';

import { todayCardStyles as styles } from './todayCardStyles';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS } from '../../lib/brand';

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
  const title = assigned && name
    ? `${name} · ${durationMinutes ?? 30} min · ${exerciseCount ?? 6} exercises`
    : 'Awaiting program assignment';

  return (
    <TodayCard>
      <Text style={[styles.kicker, { color: colors.accent }]}>TODAY'S WORKOUT</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {!assigned ? (
        <Text style={[styles.body, { color: colors.mutedText }]}>
          Ryan and Karen will match your intake to the right program. Train activates when your
          assignment is ready.
        </Text>
      ) : null}
      <Pressable
        onPress={() => router.push('/(tabs)/train')}
        style={[styles.primaryAction, { backgroundColor: colors.action }]}
      >
        <Text style={styles.primaryActionText}>{assigned ? 'Start workout' : 'View status'}</Text>
        <ArrowRight color={COLORS.bone} size={22} />
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
      <View style={styles.rowBetween}>
        <View style={[styles.row, { flex: 1, minWidth: 0 }]}>
          <Utensils color={colors.accent} size={22} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.kicker, { color: colors.accent }]}>FUEL</Text>
            <Text style={[styles.body, { color: colors.text }]}>
              Protein on track · Water 64 oz · Dinner planned
            </Text>
          </View>
        </View>
        <View style={[styles.checkOutline, { borderColor: colors.accent }]}>
          <Check color={colors.accent} size={18} />
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

function DiagnosticMealNumber({ value }: { value: string }) {
  const colors = useThemeColors();

  return <Text style={[styles.mealNumber, { color: colors.text }]}>{value}</Text>;
}
