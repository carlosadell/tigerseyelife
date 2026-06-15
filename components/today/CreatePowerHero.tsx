import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Droplet, Moon } from 'lucide-react-native';
import { ReactNode, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { EyeMark } from '../brand/EyeMark';
import { LETTER_INK, LETTER_TINT } from '../grow/ActionCard';
import { ThemeToggle } from '../brand/ThemeToggle';
import { useTheme, useThemeColors } from '../../hooks/useTheme';
import { usePowerActionProgress } from '../../hooks/usePowerActionProgress';
import { useTodayEngagement } from '../../hooks/useTodayEngagement';
import { COLORS, FONTS } from '../../lib/brand';
import { getGreeting } from '../../lib/greetings';
import { getPowerBlock, POWER_LETTERS, PowerLetter } from '../../lib/powerBlocks';

const CURRENT_BLOCK_ID = 'commit';

type OrbitItem = {
  key: string;
  indicator: ReactNode;
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
    waterTarget,
    addWater,
    toggleSleep,
  } = useTodayEngagement();

  const { isChecked, summary } = usePowerActionProgress(CURRENT_BLOCK_ID);
  const perLetter = useMemo(() => {
    const key = new Date().toISOString().slice(0, 10);
    const block = getPowerBlock(CURRENT_BLOCK_ID);
    const buckets: Record<PowerLetter, { todayDone: number; todayTotal: number }> = {
      P: { todayDone: 0, todayTotal: 0 },
      O: { todayDone: 0, todayTotal: 0 },
      W: { todayDone: 0, todayTotal: 0 },
      E: { todayDone: 0, todayTotal: 0 },
      R: { todayDone: 0, todayTotal: 0 },
    };
    if (block) {
      for (const action of block.actions) {
        buckets[action.letter].todayTotal += 1;
        if (isChecked(action.id, key)) buckets[action.letter].todayDone += 1;
      }
    }
    return buckets;
  }, [isChecked, summary]);

  const todayProgress = useMemo(() => {
    let sum = 0;
    let count = 0;
    for (const letter of Object.keys(perLetter) as PowerLetter[]) {
      const { todayDone, todayTotal } = perLetter[letter];
      if (todayTotal > 0) {
        sum += todayDone / todayTotal;
        count += 1;
      }
    }
    sum += engagement.sleep ? 1 : 0;
    count += 1;
    sum += Math.min(1, engagement.water / waterTarget);
    count += 1;
    return count > 0 ? sum / count : 0;
  }, [perLetter, engagement.sleep, engagement.water, waterTarget]);

  const powerItems: OrbitItem[] = (Object.keys(POWER_LETTERS) as PowerLetter[]).map((letter) => {
    const { todayDone, todayTotal } = perLetter[letter];
    const active = todayTotal > 0 && todayDone === todayTotal;
    return {
      key: letter,
      indicator: <LetterBadge letter={letter} dim={!active} />,
      label: POWER_LETTERS[letter].toUpperCase(),
      value: todayTotal > 0 ? `${todayDone}/${todayTotal}` : '…',
      active,
      onPress: () =>
        router.push({ pathname: '/grow/thread', params: { block: CURRENT_BLOCK_ID, letter } }),
    };
  });

  const sleepItem: OrbitItem = {
    key: 'sleep',
    indicator: (
      <Moon
        color={engagement.sleep ? COLORS.evidenceBlue : colors.mutedText}
        size={13}
        strokeWidth={engagement.sleep ? 2.4 : 1.9}
      />
    ),
    label: 'SLEEP',
    value: engagement.sleep ? 'Logged' : 'Tap',
    active: engagement.sleep,
    onPress: toggleSleep,
  };

  const hydrationItem: OrbitItem = {
    key: 'water',
    indicator: (
      <Droplet
        color={engagement.water >= waterTarget ? COLORS.evidenceBlue : colors.mutedText}
        size={13}
        strokeWidth={engagement.water >= waterTarget ? 2.4 : 1.9}
      />
    ),
    label: 'WATER',
    value: `${engagement.water}/${waterTarget}`,
    active: engagement.water >= waterTarget,
    onPress: addWater,
  };

  // 7 chips: 4 left + 3 right
  const leftItems: OrbitItem[] = [powerItems[0], powerItems[1], powerItems[2], sleepItem];
  const rightItems: OrbitItem[] = [powerItems[3], powerItems[4], hydrationItem];

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
  const valueColor = item.active ? colors.accent : colors.text;
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
        {align === 'left' ? item.indicator : null}
        <Text style={[styles.orbitValue, { color: valueColor }]}>{item.value}</Text>
        {align === 'right' ? item.indicator : null}
      </View>
    </Pressable>
  );
}

function LetterBadge({ letter, dim }: { letter: PowerLetter; dim: boolean }) {
  const tint = LETTER_TINT[letter];
  const ink = LETTER_INK[letter];
  return (
    <View
      style={[
        styles.letterBadge,
        { backgroundColor: dim ? `${tint}55` : tint },
      ]}
    >
      <Text style={[styles.letterBadgeText, { color: ink }]}>{letter}</Text>
    </View>
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
  letterBadge: {
    alignItems: 'center',
    borderRadius: 5,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  letterBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 0.4,
  },
  orbitColumn: {
    gap: 18,
    justifyContent: 'center',
    width: 86,
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
