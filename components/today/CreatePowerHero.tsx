import { LinearGradient } from 'expo-linear-gradient';
import { Bell } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { EyeMark } from '../brand/EyeMark';
import { ThemeToggle } from '../brand/ThemeToggle';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';
import { getGreeting } from '../../lib/greetings';

const darkTextureSource = require('../../assets/brand/tigers-eye-hero-dark-overlay-v5.png');
const lightTextureSource = require('../../assets/brand/tigers-eye-hero-light-overlay-v8.png');

type CreatePowerHeroProps = {
  firstName?: string | null;
  onSignOut: () => void;
  streakDays: number;
  subtitle: string;
};

export function CreatePowerHero({ firstName, onSignOut, streakDays, subtitle }: CreatePowerHeroProps) {
  const { colors, mode, toggleMode } = useTheme();
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const compact = frameWidth < 370;
  const titleSize = compact ? 26 : 30;
  const darkMode = mode === 'dark';
  const fadeStops = darkMode
    ? (['rgba(11,11,12,0)', 'rgba(11,11,12,0.65)', COLORS.onyx] as const)
    : (['rgba(251,248,241,0)', 'rgba(251,248,241,0.7)', '#FBF8F1'] as const);

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

      <StreakRing compact={compact} value={streakDays} />
    </View>
  );
}

function StreakRing({ compact, value }: { compact: boolean; value: number }) {
  const { colors, mode } = useTheme();
  const ringColor = mode === 'dark' ? COLORS.tigerGold : '#B67A12';
  const ringSize = compact ? 116 : 132;
  const radius = (ringSize - 6) / 2;

  return (
    <View style={styles.streakWrap}>
      <View style={[styles.ring, { height: ringSize, width: ringSize }]}>
        <Svg
          height={ringSize}
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          width={ringSize}
        >
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            fill="none"
            r={radius}
            stroke={ringColor}
            strokeOpacity={0.28}
            strokeWidth={1}
          />
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            fill="none"
            r={radius}
            stroke={ringColor}
            strokeWidth={2}
          />
        </Svg>
        <Text style={[styles.streakValue, compact && styles.compactStreakValue, { color: colors.accent }]}>
          {value}
        </Text>
      </View>
      <Text style={[styles.streakLabel, { color: colors.accent }]}>DAY PRACTICE STREAK</Text>
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
  streakLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 3.2,
  },
  streakValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 46,
    lineHeight: 54,
  },
  streakWrap: {
    alignItems: 'center',
    gap: 14,
    marginTop: 28,
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
