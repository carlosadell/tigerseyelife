import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { COLORS } from '../lib/brand';

export default function Index() {
  const { loading, session } = useAuth();
  const { completed, loading: onboardingLoading } = useOnboardingStatus();

  if (loading || (session && onboardingLoading)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.tigerGold} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href={completed ? '/(tabs)/today' : '/onboarding'} />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: COLORS.onyx,
    flex: 1,
    justifyContent: 'center',
  },
});
