// components/SplashFallback.tsx
//
// The in-app splash shown between the native splash unmount and the point at
// which fonts finish loading. Brand-dark by design.
//
// Uses the real brand lockup (assets/brand/tel-logo-lockup.png — tiger head +
// TIGER'S EYE LIFE). The lockup ships on solid black, so the splash ground is
// pure black too and the artwork blends seamlessly; the gold aura + halo bleed
// out around it. Motion (ported from the approved study): a slow gold aura
// drifts, a soft halo breathes behind the lockup, the lockup fades + scales in,
// CREATE POWER resolves beneath it, a gold dot breathes as a load cue.
//
// react-native-svg (Expo-Go safe) draws genuinely soft radial glows; core
// Animated only (no Reanimated at the root).

import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '../lib/brand';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const LOCKUP_W = Math.min(330, SCREEN_W * 0.82);
const LOCKUP_H = LOCKUP_W * (115 / 350); // native lockup aspect ratio
const HALO = Math.round(Math.max(LOCKUP_W * 1.7, Math.min(SCREEN_W, SCREEN_H) * 0.78));
const AURA = Math.round(Math.max(SCREEN_W, SCREEN_H) * 0.95);

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
  const lockupOpacity = useRef(new Animated.Value(0)).current;
  const lockupScale = useRef(new Animated.Value(0.92)).current;
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
        Animated.timing(lockupOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.spring(lockupScale, { toValue: 1, damping: 13, stiffness: 90, useNativeDriver: true }),
      ]),
      Animated.timing(tagOpacity, { toValue: 0.82, duration: 440, useNativeDriver: true }),
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
          Animated.timing(haloScale, { toValue: 1.05, duration: 2300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(haloOpacity, { toValue: 0.5, duration: 2300, useNativeDriver: true }),
          Animated.timing(haloScale, { toValue: 0.96, duration: 2300, useNativeDriver: true }),
        ]),
      ]),
    );
    const shine = loop(shimmer, 1, 0, 1900);
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
  }, [lockupOpacity, lockupScale, tagOpacity, haloOpacity, haloScale, shimmer, driftA, driftB, dotOpacity]);

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
  const lockupShimmer = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.86, 1] });

  return (
    <View style={styles.splash}>
      <Animated.View style={[styles.auraA, auraAStyle]} pointerEvents="none">
        <Glow id="auraA" size={AURA} color={COLORS.tigerGold} peak={0.18} />
      </Animated.View>
      <Animated.View style={[styles.auraB, auraBStyle]} pointerEvents="none">
        <Glow id="auraB" size={AURA} color={COLORS.amber} peak={0.15} />
      </Animated.View>

      <View style={styles.center} pointerEvents="none">
        <Animated.View
          style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
        >
          <Glow id="halo" size={HALO} color="rgba(212,160,42,1)" peak={0.16} />
        </Animated.View>

        <Animated.View
          style={{
            opacity: Animated.multiply(lockupOpacity, lockupShimmer),
            transform: [{ scale: lockupScale }],
          }}
        >
          <Image
            source={require('../assets/brand/tel-logo-lockup.png')}
            style={styles.lockup}
            resizeMode="contain"
          />
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
  halo: {
    alignItems: 'center',
    height: HALO,
    justifyContent: 'center',
    position: 'absolute',
    width: HALO,
  },
  lockup: { height: LOCKUP_H, width: LOCKUP_W },
  splash: {
    alignItems: 'center',
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tag: {
    color: COLORS.tigerGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 26,
    paddingLeft: 4,
  },
});
