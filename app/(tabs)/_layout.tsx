// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from "expo-router";
import { useCallback, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import {
  CoachBottomSheet,
  type CoachSheetHandle,
} from "../../components/navigation/CoachBottomSheet";
import { FloatingTabBar } from "../../components/navigation/FloatingTabBar";
import { useAuth } from "../../hooks/useAuth";
import { useCurrentWeek } from "../../hooks/useCurrentWeek";
import { useMembership } from "../../hooks/useMembership";
import { useOnboardingStatus } from "../../hooks/useOnboardingStatus";
import { useThemeColors } from "../../hooks/useTheme";
import { isFeatureUnlocked } from "../../lib/unlocks";

/**
 * Tabs layout re-checks the same gates as app/index.tsx so deep-linking
 * into /(tabs)/today can't bypass the fork.
 */
export default function TabsLayout() {
  const { loading, session } = useAuth();
  const { loading: membershipLoading, membership } = useMembership();
  const { completed, loading: onboardingLoading } = useOnboardingStatus();
  const { weekNumber } = useCurrentWeek();
  const colors = useThemeColors();
  const coachSheetRef = useRef<CoachSheetHandle>(null);
  const fuelUnlocked = isFeatureUnlocked("meal-logging", weekNumber);

  const openCoach = useCallback(() => {
    coachSheetRef.current?.snapToIndex(0);
  }, []);

  if (loading || (session && (membershipLoading || onboardingLoading))) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!membership.forkAnswered) return <Redirect href="/membership" />;
  if (!membership.programMember) return <Redirect href="/non-member" />;
  if (!completed) return <Redirect href="/onboarding/intake/age" />;

  return (
    <View style={styles.root}>
      <Tabs
        initialRouteName="today"
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
        }}
        tabBar={(props) => (
          <FloatingTabBar {...props} onCoachPress={openCoach} />
        )}
      >
        <Tabs.Screen name="today" options={{ title: "Today" }} />
        <Tabs.Screen name="train" options={{ title: "Train" }} />
        <Tabs.Screen
          name="fuel"
          options={{
            title: "Fuel",
            href: fuelUnlocked ? "/fuel" : null,
          }}
        />
        <Tabs.Screen name="grow" options={{ title: "Grow" }} />
        <Tabs.Screen name="you" options={{ title: "You" }} />
      </Tabs>
      <CoachBottomSheet ref={coachSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  root: { flex: 1 },
});
