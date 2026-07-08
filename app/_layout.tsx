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
// which fonts finish loading. Intentionally uses onyx to match the
// native splash background so there is no visual jump. System fonts
// only — Inter is not loaded yet in this window.
function SplashFallback() {
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.timing(wordmarkOpacity, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
    // A soft pulse on the tigerGold dot — barely perceptible movement so
    // the screen feels alive without looking like a spinner. Loops for
    // however long the fallback is on screen (usually <500ms).
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 780,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.35,
          duration: 780,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [wordmarkOpacity, dotOpacity]);

  return (
    <View style={styles.splash}>
      <View style={styles.splashInner}>
        <Image
          source={require('../assets/splash-icon.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <Animated.View style={[styles.splashText, { opacity: wordmarkOpacity }]}>
          <Text style={styles.splashKicker}>CREATE POWER</Text>
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
  splashInner: {
    alignItems: 'center',
  },
  splashKicker: {
    color: COLORS.tigerGold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.6,
  },
  splashLogo: {
    height: 132,
    width: 132,
  },
  splashText: {
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  splashWordmark: {
    color: COLORS.bone,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
