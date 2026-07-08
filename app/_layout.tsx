import 'react-native-gesture-handler';
import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../hooks/useAuth';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { COLORS } from '../lib/brand';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    VT323_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Audio session config — set once on app start. `mixWithOthers`
  // lets a member keep Spotify / Apple Music / any other background
  // audio playing while they use the app. iOS ducks the background
  // music automatically when we play video/audio content
  // (exercise demos, coach playback later), so voiceovers stay audible
  // without cutting music. See memory: music_integration_decision.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
      allowsRecording: false,
    }).catch(() => {
      // Not fatal — worst case background music behavior falls back
      // to platform defaults. Deliberately swallowed to avoid crashing
      // startup on a config quirk.
    });
  }, []);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return <SplashFallback />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RootStack />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { colors, mode } = useTheme();

  return (
    <>
      <StatusBar backgroundColor={colors.background} style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="membership" />
        <Stack.Screen name="verify-membership" />
        <Stack.Screen name="non-member-intake" />
        <Stack.Screen name="non-member" />
        <Stack.Screen name="onboarding/intake/[step]" />
        <Stack.Screen name="onboarding/intake/review" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout/[id]" />
        <Stack.Screen name="tool/[slug]" />
        <Stack.Screen name="week/[n]" />
        <Stack.Screen name="exercise/[id]" />
        <Stack.Screen
          name="workout/active/[sessionId]"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="workout/complete/[sessionId]"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

// Fallback shown between the native splash unmount and the point at
// which fonts finish loading. Onyx background matches the native
// splash config so there is no visual jump. Entrance is a staggered
// choreography: (1) logo fades + gently scales in, (2) CREATE POWER
// kicker fades in, (3) Tigers Eye Life wordmark fades in, (4) a
// tigerGold dot near the bottom breathes on a slow loop. A soft
// gold halo behind the logo grounds it in the brand palette without
// requiring any new asset. System fonts only — Inter is not loaded
// yet in this window.
function SplashFallback() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const kickerOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 620,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(kickerOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]);
    entrance.start();

    // Slow breathing loop on the tigerGold dot. Barely perceptible
    // movement so the screen feels alive without reading as a
    // spinner. Runs for however long the fallback stays mounted
    // (usually <500ms in dev, longer on cold prod starts).
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 0.9,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.25,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [logoOpacity, logoScale, glowOpacity, kickerOpacity, wordmarkOpacity, dotOpacity]);

  return (
    <View style={styles.splash}>
      <View style={styles.splashInner}>
        <View style={styles.splashLogoWrap}>
          <Animated.View
            pointerEvents="none"
            style={[styles.splashGlow, { opacity: glowOpacity }]}
          />
          <Animated.View
            style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
          >
            <Image
              source={require('../assets/splash-icon.png')}
              style={styles.splashLogo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
        <Animated.View style={[styles.splashKickerWrap, { opacity: kickerOpacity }]}>
          <Text style={styles.splashKicker}>CREATE POWER</Text>
        </Animated.View>
        <Animated.View style={[styles.splashWordmarkWrap, { opacity: wordmarkOpacity }]}>
          <Text style={styles.splashWordmark}>Tigers Eye Life</Text>
        </Animated.View>
      </View>
      <Animated.View
        style={[styles.splashDot, { opacity: dotOpacity }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.onyx,
    flex: 1,
  },
  splash: {
    alignItems: 'center',
    backgroundColor: COLORS.onyx,
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 96,
  },
  splashDot: {
    backgroundColor: COLORS.tigerGold,
    borderRadius: 999,
    bottom: 96,
    height: 6,
    position: 'absolute',
    width: 6,
  },
  splashGlow: {
    backgroundColor: COLORS.goldGlow,
    borderRadius: 999,
    height: 220,
    left: -44,
    position: 'absolute',
    top: -44,
    width: 220,
  },
  splashInner: {
    alignItems: 'center',
  },
  splashKicker: {
    color: COLORS.tigerGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.6,
  },
  splashKickerWrap: {
    alignItems: 'center',
    marginTop: 32,
  },
  splashLogo: {
    height: 132,
    width: 132,
  },
  splashLogoWrap: {
    alignItems: 'center',
    height: 132,
    justifyContent: 'center',
    width: 132,
  },
  splashWordmark: {
    color: COLORS.bone,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  splashWordmarkWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
});
