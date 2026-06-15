// app/membership.tsx
import { Redirect, router } from 'expo-router';
import { BadgeCheck, MapPinned } from 'lucide-react-native';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLockup } from '../components/brand/BrandLockup';
import { AnchorRow } from '../components/ui/AnchorRow';
import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../lib/brand';

const light = THEME_COLORS.light;

/**
 * Onboarding fork — first question every user answers after auth.
 *
 *   "Are you part of the Create Power program?" → Yes / No
 *
 * Yes → /verify-membership (server proves the claim).
 * No  → /non-member-diagnostic.
 */
export default function MembershipForkScreen() {
  const { loading: authLoading, session } = useAuth();
  const { loading: membershipLoading, membership } = useMembership();

  if (authLoading || membershipLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.tigerGold} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (membership.programMember) return <Redirect href="/onboarding" />;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <BrandLockup width={170} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.headline}>Welcome to Tigers Eye Life.</Text>
          <Text style={styles.lede}>Quick question so we send you to the right place.</Text>
          <Text style={styles.q}>Are you part of the Create Power program?</Text>

          <View style={{ marginTop: 6 }}>
            <AnchorRow
              Icon={BadgeCheck}
              title="Yes, I'm a Create Power member"
              sub="We'll verify your join email and unlock the program experience."
              onPress={() => router.push('/verify-membership' as never)}
            />
            <AnchorRow
              Icon={MapPinned}
              title="Not yet"
              sub="Two quick questions to point you in the right direction."
              onPress={() => router.push('/non-member-diagnostic' as never)}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, paddingHorizontal: SPACING.screenX, paddingTop: 24 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  headline: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  lede: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 26,
    marginTop: 6,
  },
  loading: { alignItems: 'center', backgroundColor: light.background, flex: 1, justifyContent: 'center' },
  q: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
    lineHeight: 23,
    marginBottom: 12,
  },
  screen: { alignItems: 'center', flex: 1 },
  topBar: { paddingHorizontal: SPACING.screenX, paddingTop: 12 },
});
