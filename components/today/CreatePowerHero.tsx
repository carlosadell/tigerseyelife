import { format } from 'date-fns';
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
  subtitle: string;
};

export function CreatePowerHero({ firstName, onSignOut, subtitle }: CreatePowerHeroProps) {
  const { colors, mode, toggleMode } = useTheme();
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const compact = frameWidth < 370;
  const titleSize = compact ? 23 : 25;
  const darkMode = mode === 'dark';

  return (
    <View style={styles.wrap}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="stretch"
        source={darkMode ? darkTextureSource : lightTextureSource}
        style={[styles.texture, darkMode ? styles.darkTexture : styles.lightTexture]}
      />
      <View style={styles.topRow}>
        <Pressable onLongPress={toggleMode} style={styles.brandRow}>
          <EyeMark color={colors.accent} size={compact ? 22 : 24} />
          <Text numberOfLines={1} style={[styles.wordmark, { color: colors.accent }]}>
            TIGERS EYE LIFE
          </Text>
        </Pressable>
        <View style={styles.actions}>
          <ThemeToggle />
          <Pressable onLongPress={onSignOut}>
            <Bell color={colors.text} size={22} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text, fontSize: titleSize, lineHeight: titleSize + 7 }]}>
          {getGreeting(firstName)}
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          style={[styles.subtitle, compact && styles.compactSubtitle, { color: colors.accent }]}
        >
          {subtitle}
        </Text>
      </View>
      <StreakRing compact={compact} value={23} />
    </View>
  );
}

function StreakRing({ compact, value }: { compact: boolean; value: number }) {
  const { colors, mode } = useTheme();
  const ringColor = mode === 'dark' ? COLORS.tigerGold : '#B67A12';
  const ringSize = compact ? 86 : 94;
  const radius = compact ? 38 : 42;

  return (
    <View style={styles.streakWrap}>
      <View style={[styles.ring, { height: ringSize, width: ringSize }]}>
        <Svg height={ringSize} style={StyleSheet.absoluteFill} viewBox={`0 0 ${ringSize} ${ringSize}`} width={ringSize}>
          <Circle cx={ringSize / 2} cy={ringSize / 2} fill="none" r={radius} stroke={colors.border} strokeWidth="2" />
          <Circle cx={ringSize / 2} cy={ringSize / 2} fill="none" r={radius} stroke={ringColor} strokeWidth="3.5" />
        </Svg>
        <Text style={[styles.streakValue, compact && styles.compactStreakValue, { color: colors.accent }]}>{value}</Text>
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
  brandRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  copy: {
    gap: 5,
    marginTop: 76,
  },
  compactStreakValue: {
    fontSize: 34,
    lineHeight: 40,
  },
  compactSubtitle: {
    fontSize: 10,
    letterSpacing: 0.9,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 2.8,
  },
  streakValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 38,
    lineHeight: 44,
  },
  streakWrap: {
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  subtitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  texture: {
    height: 355,
    left: -34,
    position: 'absolute',
    right: -34,
    top: -24,
  },
  darkTexture: {
    opacity: 1,
  },
  lightTexture: {
    opacity: 1,
  },
  title: {
    fontFamily: FONTS.sansBold,
    letterSpacing: 0,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: FONTS.sansBold,
    flexShrink: 1,
    fontSize: 13,
    letterSpacing: 3.6,
  },
  wrap: {
    paddingTop: 32,
  },
});
