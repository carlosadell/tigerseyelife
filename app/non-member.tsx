// app/non-member.tsx
import { Redirect, router } from 'expo-router';
import { Tag, UtensilsCrossed, Workflow } from 'lucide-react-native';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnchorRow } from '../components/ui/AnchorRow';
import { PhotoHeroCard } from '../components/ui/PhotoHeroCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { coachStillForToday } from '../lib/coachStills';
import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../lib/brand';

const light = THEME_COLORS.light;

// TODO: replace with the real Create Power join URL when Ryan provides it.
const JOIN_URL = 'https://tigerseyelife.com/create-power';

/**
 * Non-member experience (Hybrid per session decision 2026-06-16).
 *
 * 1. PhotoHeroCard acknowledges them.
 * 2. We mirror back the friction + stopping point they typed in the
 *    diagnostic — they get to see we heard them.
 * 3. Three preview anchors hint at the Commit-block work without unlocking
 *    the gated content.
 * 4. Soft CTA to join Create Power.
 *
 * In dev session, a "Start over" card lets us re-walk the fork.
 */
export default function NonMemberScreen() {
  const { isDevSession, session, signOut } = useAuth();
  const { devReset, membership } = useMembership();
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  const diagnostic = membership.nonMemberDiagnostic;

  const onJoin = () => Linking.openURL(JOIN_URL).catch(() => {});

  const onStartOver = async () => {
    await devReset();
    router.replace('/membership' as never);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PhotoHeroCard
            kicker="THANKS — WE HEARD YOU"
            title={"You're in the right place.\nLet's make a plan."}
            photoUri={coachStillForToday()}
          />

          {diagnostic ? (
            <View style={styles.echo}>
              <Text style={styles.echoKicker}>YOU TOLD US</Text>
              <View style={styles.echoBlock}>
                <Text style={styles.echoLabel}>The friction</Text>
                <Text style={styles.echoBody}>{diagnostic.friction || '—'}</Text>
              </View>
              <View style={[styles.echoBlock, { marginTop: 14 }]}>
                <Text style={styles.echoLabel}>The stopping point</Text>
                <Text style={styles.echoBody}>{diagnostic.stoppingPoint || '—'}</Text>
              </View>
            </View>
          ) : null}

          <Text style={styles.bridge}>
            Create Power is built around the kinds of frictions you just named. Here's a taste of how
            we'd start with you.
          </Text>

          <SectionHeader title="Where we'd start" meta="3 anchors" />
          <AnchorRow
            Icon={Tag}
            title="Read labels"
            sub="Know what's in it before it goes in. The first habit we build."
          />
          <AnchorRow
            Icon={UtensilsCrossed}
            title="ABC Power Meals"
            sub="Anchor protein · Balance the plate · Complete with embellishments."
          />
          <AnchorRow
            Icon={Workflow}
            title="The TEB Loop"
            sub="Trigger → Emotion → Behavior. Where stopping points actually live."
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Join Create Power"
            onPress={onJoin}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={styles.cta}>
              <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                Join Create Power
              </Text>
            </View>
          </Pressable>
          <Text style={styles.ctaSub}>Walk through the program with Karen and Ryan.</Text>

          {isDevSession ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dev: start over"
              onPress={onStartOver}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View style={styles.devReset}>
                <Text style={styles.devKicker}>DEV ONLY</Text>
                <Text style={styles.devBody}>↺  Start over from the fork</Text>
              </View>
            </Pressable>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <Pressable onPress={signOut} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <View style={styles.ghost}>
              <Text style={styles.ghostText}>Sign out</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bridge: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 24,
  },
  content: { paddingBottom: 24, paddingHorizontal: SPACING.screenX, paddingTop: 20 },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 14,
    marginTop: 28,
    paddingVertical: 16,
  },
  ctaSub: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    marginTop: 8,
    textAlign: 'center',
  },
  ctaText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: -0.1 },
  devBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    letterSpacing: -0.1,
    marginTop: 4,
  },
  devKicker: {
    color: COLORS.tangerine,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  devReset: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginTop: 28,
    padding: 14,
  },
  echo: {
    marginTop: 24,
  },
  echoBlock: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  echoBody: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14.5,
    fontStyle: 'italic',
    lineHeight: 21,
    marginTop: 4,
  },
  echoKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  echoLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  footer: { paddingBottom: 12, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  ghost: { alignItems: 'center', paddingVertical: 14 },
  ghostText: { color: light.text, fontFamily: FONTS.sansMedium, fontSize: 14 },
  screen: { alignItems: 'center', flex: 1 },
});
