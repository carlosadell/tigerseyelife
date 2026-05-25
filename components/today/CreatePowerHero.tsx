import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Droplet, Dumbbell, Footprints, Moon } from 'lucide-react-native';
import { ComponentType } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { EyeMark } from '../brand/EyeMark';
import { ThemeToggle } from '../brand/ThemeToggle';
import { useTheme, useThemeColors } from '../../hooks/useTheme';
import { useTodayEngagement } from '../../hooks/useTodayEngagement';
import { COLORS, FONTS } from '../../lib/brand';
import { getGreeting } from '../../lib/greetings';

type OrbitIcon = ComponentType<{ color: string; size: number; strokeWidth?: number }>;

type OrbitItem = {
  icon: OrbitIcon;
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
};

const darkTextureSource = require('../../assets/brand/tigers-eye-hero-dark-overlay-v5.png');
const lightTextureSource = require('../../assets/brand/tigers-eye-hero-light-overlay-v8.png');

type CreatePowerHeroProps = {
  firstName?: string | null;
  onSignOut: () => void;
  streakDays: number;
  subtitle: string;
};

export function CreatePowerHero({
  firstName,
  onSignOut,
  streakDays,
  subtitle,
}: CreatePowerHeroProps) {
  const { colors, mode, toggleMode } = useTheme();
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const compact = frameWidth < 370;
  const titleSize = compact ? 26 : 30;
  const darkMode = mode === 'dark';
  const fadeStops = darkMode
    ? (['rgba(11,11,12,0)', 'rgba(11,11,12,0.65)', COLORS.onyx] as const)
    : (['rgba(251,248,241,0)', 'rgba(251,248,241,0.7)', '#FBF8F1'] as const);

  const {
    engagement,
    workoutDone,
    waterTarget,
    toggleWalk,
    addWater,
    toggleSleep,
  } = useTodayEngagement();

  const completedToday =
    (workoutDone ? 1 : 0) +
    (engagement.walk ? 1 : 0) +
    (engagement.water >= waterTarget ? 1 : 0) +
    (engagement.sleep ? 1 : 0);
  const todayProgress = completedToday / 4;

  const leftItems: OrbitItem[] = [
    {
      icon: Dumbbell,
      label: 'WORKOUT',
      value: workoutDone ? 'Done' : 'Open',
      active: workoutDone,
      onPress: () => router.push('/(tabs)/train'),
    },
    {
      icon: Footprints,
      label: 'WALK',
      value: engagement.walk ? 'Done' : 'Tap',
      active: engagement.walk,
      onPress: toggleWalk,
    },
  ];

  const rightItems: OrbitItem[] = [
    {
      icon: Droplet,
      label: 'WATER',
      value: `${engagement.water}/${waterTarget}`,
      active: engagement.water >= waterTarget,
      onPress: addWater,
    },
    {
      icon: Moon,
      label: 'SLEEP',
      value: engagement.sleep ? 'Logged' : 'Tap',
      active: engagement.sleep,
      onPress: toggleSleep,
    },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.bannerWrap} pointerEvents="none">
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          source={darkMode ? darkTextureSource : lightTextureSource}
          style={styles.texture}
        />
        <LinearGradient
          colors={fadeStops}
          locations={[0, 0.55, 1]}
          style={styles.fade}
        />
      </View>

      <View style={[styles.topRow, { paddingHorizontal: 0 }]}>
        <Pressable onLongPress={toggleMode} style={styles.brandRow}>
          <EyeMark color={colors.accent} size={compact ? 20 : 22} />
          <Text numberOfLines={1} style={[styles.wordmark, { color: colors.accent }]}>
            TIGERS EYE LIFE
          </Text>
        </Pressable>
        <View style={styles.actions}>
          <ThemeToggle />
          <Pressable hitSlop={10} onLongPress={onSignOut}>
            <Bell color={colors.text} size={22} strokeWidth={1.6} />
          </Pressable>
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text, fontSize: titleSize, lineHeight: titleSize + 6 }]}>
          {getGreeting(firstName)}
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          style={[styles.subtitle, { color: colors.accent }]}
        >
          {subtitle}
        </Text>
      </View>

      <View style={styles.orbitRow}>
        <View style={styles.orbitColumn}>
          {leftItems.map((item) => (
            <OrbitStat key={item.label} item={item} align="right" />
          ))}
        </View>
        <StreakRing compact={compact} progress={todayProgress} value={streakDays} />
        <View style={styles.orbitColumn}>
          {rightItems.map((item) => (
            <OrbitStat key={item.label} item={item} align="left" />
          ))}
        </View>
      </View>

      <Text style={[styles.streakLabel, { color: colors.accent }]}>DAY PRACTICE STREAK</Text>
    </View>
  );
}

function OrbitStat({ item, align }: { item: OrbitItem; align: 'left' | 'right' }) {
  const colors = useThemeColors();
  const iconColor = item.active ? colors.accent : colors.mutedText;
  const valueColor = item.active ? colors.accent : colors.text;
  const iconNode = (
    <item.icon color={iconColor} size={13} strokeWidth={item.active ? 2.4 : 1.9} />
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.label} ${item.value}`}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.orbitStat,
        { alignItems: align === 'left' ? 'flex-start' : 'flex-end', opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.orbitLabel, { color: colors.mutedText }]}>{item.label}</Text>
      <View style={styles.orbitValueRow}>
        {align === 'left' ? iconNode : null}
        <Text style={[styles.orbitValue, { color: valueColor }]}>{item.value}</Text>
        {align === 'right' ? iconNode : null}
      </View>
    </Pressable>
  );
}

function StreakRing({
  compact,
  progress,
  value,
}: {
  compact: boolean;
  progress: number;
  value: number;
}) {
  const { colors, mode } = useTheme();
  const ringColor = mode === 'dark' ? COLORS.tigerGold : '#B67A12';
  const progressColor = COLORS.deepGreen;
  const ringSize = compact ? 116 : 132;
  const radius = (ringSize - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clamped);
  const center = ringSize / 2;

  return (
    <View style={[styles.ring, { height: ringSize, width: ringSize }]}>
      <Svg
        height={ringSize}
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        width={ringSize}
      >
        <Circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke={ringColor}
          strokeOpacity={0.28}
          strokeWidth={1}
        />
        <Circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke={ringColor}
          strokeWidth={2}
        />
        {clamped > 0 ? (
          <Circle
            cx={center}
            cy={center}
            fill="none"
            r={radius}
            stroke={progressColor}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth={5}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : null}
      </Svg>
      <Text style={[styles.streakValue, compact && styles.compactStreakValue, { color: colors.accent }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  bannerWrap: {
    height: 280,
    left: -40,
    overflow: 'hidden',
    position: 'absolute',
    right: -40,
    top: -40,
  },
  brandRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  compactStreakValue: {
    fontSize: 40,
    lineHeight: 46,
  },
  copy: {
    gap: 8,
    marginTop: 60,
  },
  fade: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitColumn: {
    gap: 22,
    justifyContent: 'center',
    width: 78,
  },
  orbitLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.4,
  },
  orbitRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    marginTop: 28,
  },
  orbitStat: {
    gap: 4,
  },
  orbitValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  orbitValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  streakLabel: {
    alignSelf: 'center',
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 3.2,
    marginTop: 14,
  },
  streakValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 46,
    lineHeight: 54,
  },
  subtitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  texture: {
    height: '100%',
    width: '100%',
  },
  title: {
    fontFamily: FONTS.sansBold,
    letterSpacing: -0.4,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wordmark: {
    flexShrink: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 3.4,
  },
  wrap: {
    paddingTop: 18,
  },
});
