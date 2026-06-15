// app/index.tsx
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { COLORS, THEME_COLORS } from '../lib/brand';

const light = THEME_COLORS.light;

/**
 * Routing gate.
 *
 *   no session                       → /(auth)/sign-in
 *   session, no fork answered        → /membership
 *   session, fork = no member        → /non-member
 *   session, member, no intake       → /onboarding
 *   session, member + intake         → /(tabs)/today
 *
 * Per CLAUDE.product.md §1 / §2: one app, fork at onboarding, membership
 * verified server-side only.
 */
export default function Index() {
  const { loading: authLoading, session } = useAuth();
  const { loading: membershipLoading, membership } = useMembership();
  const { completed: intakeCompleted, loading: intakeLoading } = useOnboardingStatus();

  const stillLoading = authLoading || (session && (membershipLoading || intakeLoading));

  if (stillLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.tigerGold} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!membership.forkAnswered) return <Redirect href="/membership" />;
  if (!membership.programMember) return <Redirect href="/non-member" />;
  if (!intakeCompleted) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/today" />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: light.background,
    flex: 1,
    justifyContent: 'center',
  },
});
