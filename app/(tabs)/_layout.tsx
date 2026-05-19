import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FloatingTabBar } from '../../components/navigation/FloatingTabBar';
import { useAuth } from '../../hooks/useAuth';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import { useThemeColors } from '../../hooks/useTheme';

export default function TabsLayout() {
  const { loading, session } = useAuth();
  const { completed, loading: onboardingLoading } = useOnboardingStatus();
  const colors = useThemeColors();

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
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
