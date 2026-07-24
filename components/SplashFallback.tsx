// components/SplashFallback.tsx
//
// The in-app splash shown between the native splash unmount and the point at
// which fonts finish loading. Brand-dark by design (matches AuthShell and the
// native splash config, so there is no color jump on launch).
//
// Motion (ported from the approved browser study):
//   • a slow gold aura drifts behind everything (dark, restrained)
//   • a soft halo breathes directly behind the lockup
//   • the diamond+sparkle mark settles in, the wordmark rises, CREATE POWER fades
//   • the gold wordmark shimmers on a slow loop (foil catching light)
//   • a single gold dot breathes at the base as a quiet load cue
//
// Sizing is screen-relative and the wordmark auto-fits its width, so the
// lockup sits centered on any phone. Vector mark + system fonts only — no
// image asset and no Inter (not loaded yet in this window). Uses react-native-svg
// (Expo-Go safe) for genuinely soft radial glows; core Animated only.

import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '../lib/brand';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HALO = Math.round(Math.min(SCREEN_W, SCREEN_H) * 1.02);
const AURA = Math.round(Math.max(SCREEN_W, SCREEN_H) * 0.95);
const MARK_W = Math.min(112, SCREEN_W * 0.28);
const MARK_H = MARK_W * 0.64;

// A soft radial glow as an SVG rect fill — no blur module required.
function Glow({ id, size, color, peak }: { id: string; size: number; color: string; peak: number }) {
  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={peak} />
          <Stop offset="55%" stopColor={color} stopOpacity={peak * 0.25} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={size} height={size} fill={`url(#${id})`} />
    </Svg>
  );
}

export function SplashFallback() {
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markShift = useRef(new Animated.Value(8)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordShift = useRef(new Animated.Value(12)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const haloOpacity = useRef(new Animated.Value(0.5)).current;
  const haloScale = useRef(new Animated.Value(0.96)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const driftA = useRef(new Animated.Value(0)).current;
  const driftB = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(markOpacity, { toValue: 1, duration: 460, useNativeDriver: true }),
        Animated.spring(markShift, { toValue: 0, damping: 12, stiffness: 90, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.spring(wordShift, { toValue: 0, damping: 13, stiffness: 90, useNativeDriver: true }),
      ]),
      Animated.timing(tagOpacity, { toValue: 0.82, duration: 420, useNativeDriver: true }),
    ]).start();

    const loop = (val: Animated.Value, to: number, from: number, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: to, duration: dur, useNativeDriver: true }),
          Animated.timing(val, { toValue: from, duration: dur, useNativeDriver: true }),
        ]),
      );

    const halo = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(haloOpacity, { toValue: 0.9, duration: 2300, useNativeDriver: true }),
          Animated.timing(haloScale, { toValue: 1.04, duration: 2300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(haloOpacity, { toValue: 0.5, duration: 2300, useNativeDriver: true }),
          Animated.timing(haloScale, { toValue: 0.96, duration: 2300, useNativeDriver: true }),
        ]),
      ]),
    );

    const shine = Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(shimmer, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );

    const a = loop(driftA, 1, 0, 7000);
    const b = loop(driftB, 1, 0, 9000);
    const dot = loop(dotOpacity, 0.9, 0.25, 900);

    halo.start();
    shine.start();
    a.start();
    b.start();
    dot.start();
    return () => {
      halo.stop();
      shine.stop();
      a.stop();
      b.stop();
      dot.stop();
    };
  }, [markOpacity, markShift, wordOpacity, wordShift, tagOpacity, haloOpacity, haloScale, shimmer, driftA, driftB, dotOpacity]);

  const auraAStyle = {
    transform: [
      { translateX: driftA.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_W * 0.06] }) },
      { translateY: driftA.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_H * 0.05] }) },
    ],
  };
  const auraBStyle = {
    transform: [
      { translateX: driftB.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_W * 0.07] }) },
      { translateY: driftB.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_H * 0.04] }) },
    ],
  };
  // Wordmark shimmer: a gentle brightening of the gold on each loop.
  const wordShimmer = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.72, 1],
  });

  return (
    <View style={styles.splash}>
      <Animated.View style={[styles.auraA, auraAStyle]} pointerEvents="none">
        <Glow id="auraA" size={AURA} color={COLORS.tigerGold} peak={0.16} />
      </Animated.View>
      <Animated.View style={[styles.auraB, auraBStyle]} pointerEvents="none">
        <Glow id="auraB" size={AURA} color={COLORS.amber} peak={0.14} />
      </Animated.View>

      <View style={styles.center} pointerEvents="none">
        <Animated.View
          style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
        >
          <Glow id="halo" size={HALO} color="rgba(212,160,42,1)" peak={0.4} />
        </Animated.View>

        <Animated.View
          style={{ opacity: markOpacity, transform: [{ translateY: markShift }] }}
        >
          <Svg width={MARK_W} height={MARK_H} viewBox="0 0 96 62">
            <Path
              d="M48 4 L92 31 L48 58 L4 31 Z"
              stroke={COLORS.tigerGold}
              strokeWidth={2.4}
              fill="none"
            />
            <Path
              d="M48 20 L51.5 28.5 L60 31 L51.5 33.5 L48 42 L44.5 33.5 L36 31 L44.5 28.5 Z"
              fill={COLORS.tigerGold}
            />
          </Svg>
        </Animated.View>

        <Animated.View
          style={{ opacity: Animated.multiply(wordOpacity, wordShimmer), transform: [{ translateY: wordShift }] }}
        >
          <Text
            style={styles.wordmark}
            numberOfLines={1}
            adjustsFontSizeToFit
            allowFontScaling={false}
          >
            <Text style={styles.tigers}>TIGERS</Text>
            <Text style={styles.eye}>EYE</Text>
            <Text style={styles.life}> Life</Text>
          </Text>
        </Animated.View>

        <Animated.Text style={[styles.tag, { opacity: tagOpacity }]} allowFontScaling={false}>
          CREATE POWER
        </Animated.Text>
      </View>

      <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  auraA: { left: -AURA * 0.28, position: 'absolute', top: -AURA * 0.3 },
  auraB: { bottom: -AURA * 0.32, position: 'absolute', right: -AURA * 0.26 },
  center: { alignItems: 'center', justifyContent: 'center' },
  dot: {
    backgroundColor: COLORS.tigerGold,
    borderRadius: 999,
    bottom: '11%',
    height: 6,
    position: 'absolute',
    width: 6,
  },
  eye: { fontWeight: '800', letterSpacing: 0.5 },
  halo: {
    alignItems: 'center',
    height: HALO,
    justifyContent: 'center',
    position: 'absolute',
    width: HALO,
  },
  life: {
    fontFamily: Platform.select({ ios: 'Snell Roundhand', default: undefined }),
    fontStyle: 'italic',
    fontWeight: '500',
  },
  splash: {
    alignItems: 'center',
    backgroundColor: COLORS.onyx,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tag: {
    color: COLORS.tigerGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 18,
    paddingLeft: 4,
  },
  tigers: { fontWeight: '500', letterSpacing: 1.5 },
  wordmark: {
    color: COLORS.tigerGold,
    fontSize: Math.min(34, SCREEN_W * 0.085),
    maxWidth: SCREEN_W * 0.92,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
});
