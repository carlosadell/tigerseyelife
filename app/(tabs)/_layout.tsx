import { Redirect, Tabs } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CoachBottomSheet, type CoachSheetHandle } from '../../components/navigation/CoachBottomSheet';
import { CoachFloatingButton } from '../../components/navigation/CoachFloatingButton';
import { FloatingTabBar } from '../../components/navigation/FloatingTabBar';
import { useAuth } from '../../hooks/useAuth';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import { useThemeColors } from '../../hooks/useTheme';

export default function TabsLayout() {
  const { loading, session } = useAuth();
  const { completed, loading: onboardingLoading } = useOnboardingStatus();
  const colors = useThemeColors();
  const coachSheetRef = useRef<CoachSheetHandle>(null);

  const openCoach = useCallback(() => {
    coachSheetRef.current?.snapToIndex(0);
  }, []);

  if (loading || (session && onboardingLoading)) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!completed) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={styles.root}>
      <Tabs
        initialRouteName="today"
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
        }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen name="today" options={{ title: 'Today' }} />
        <Tabs.Screen name="train" options={{ title: 'Train' }} />
        <Tabs.Screen name="fuel" options={{ title: 'Fuel' }} />
        <Tabs.Screen name="grow" options={{ title: 'Grow' }} />
        <Tabs.Screen name="you" options={{ title: 'You' }} />
      </Tabs>
      <CoachFloatingButton onPress={openCoach} />
      <CoachBottomSheet ref={coachSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  root: {
    flex: 1,
  },
});
