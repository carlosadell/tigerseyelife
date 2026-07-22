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
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashFallback } from '../components/SplashFallback';
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

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.onyx,
    flex: 1,
  },
});
