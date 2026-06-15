// app/non-member.tsx
import { Redirect, router } from 'expo-router';
import {
  ClipboardList,
  Mail,
  Sparkles,
  Tag,
  UtensilsCrossed,
  Workflow,
  type LucideIcon,
} from 'lucide-react-native';
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
import { useAuth } from '../hooks/useAuth';
import {
  isIntakeComplete,
  useMembership,
  type CoachingStyle,
  type NonMemberDiagnostic,
  type TopObstacle,
} from '../hooks/useMembership';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../lib/brand';

const light = THEME_COLORS.light;

// TODO: replace with the real Create Power join URL when Ryan provides it.
const JOIN_URL = 'https://tigerseyelife.com/create-power';
const REQUEST_URL = 'mailto:ryan@tigerseyelife.com?subject=Create%20Power%2C%20Request%20to%20join';

// Thematic hero image for the non-member surface. Food/plate scene, no faces,
// reliable Unsplash URL. Swap when Ryan ships real assets.
const HERO_IMAGE = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop';

/**
 * Non-member landing.
 *
 *  - If we don't yet have Ryan's intake (goal/topObstacle/coachingStyle),
 *    show the CHOICE surface: Join, Request to join, or Tailor a plan.
 *  - If intake is complete, show the PERSONALIZED surface: echo what they
 *    told us, render anchors selected against their top obstacle, with copy
 *    voiced by their coaching style preference.
 */
export default function NonMemberScreen() {
  const { isDevSession, session, signOut } = useAuth();
  const { devReset, membership } = useMembership();
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  const diagnostic = membership.nonMemberDiagnostic;
  const hasIntake = isIntakeComplete(diagnostic);

  const onJoin = () => Linking.openURL(JOIN_URL).catch(() => {});
  const onRequest = () => Linking.openURL(REQUEST_URL).catch(() => {});

  const onStartOver = async () => {
    await devReset();
    router.replace('/membership' as never);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {hasIntake && diagnostic ? (
            <PersonalizedView diagnostic={diagnostic} onJoin={onJoin} />
          ) : (
            <ChoiceView
              diagnostic={diagnostic}
              onJoin={onJoin}
              onRequest={onRequest}
              onTailor={() => router.push('/non-member-intake' as never)}
            />
          )}

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

// ──────────────────────────────────────────────────────────────────────────────
// Choice surface — Join / Request / Tailor
// ──────────────────────────────────────────────────────────────────────────────

type ChoiceViewProps = {
  diagnostic: NonMemberDiagnostic | null;
  onJoin: () => void;
  onRequest: () => void;
  onTailor: () => void;
};

function ChoiceView({ diagnostic, onJoin, onRequest, onTailor }: ChoiceViewProps) {
  return (
    <>
      <PhotoHeroCard
        kicker="WELCOME"
        title="Where would you like to start?"
        photoUri={HERO_IMAGE}
      />

      {diagnostic && (diagnostic.friction || diagnostic.stoppingPoint) ? (
        <View style={styles.echo}>
          <Text style={styles.echoKicker}>YOU TOLD US</Text>
          {diagnostic.friction ? (
            <View style={styles.echoBlock}>
              <Text style={styles.echoLabel}>The friction</Text>
              <Text style={styles.echoBody}>{diagnostic.friction}</Text>
            </View>
          ) : null}
          {diagnostic.stoppingPoint ? (
            <View style={[styles.echoBlock, { marginTop: 14 }]}>
              <Text style={styles.echoLabel}>The stopping point</Text>
              <Text style={styles.echoBody}>{diagnostic.stoppingPoint}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <SectionHeader title="Pick your path" />
      <AnchorRow
        Icon={Sparkles}
        title="Join Create Power"
        sub="The full 12-week program with Karen and Ryan."
        onPress={onJoin}
      />
      <AnchorRow
        Icon={Mail}
        title="Request to join"
        sub="Email Ryan and start a conversation first."
        onPress={onRequest}
      />
      <AnchorRow
        Icon={ClipboardList}
        title="Tailor a plan for me"
        sub="Three quick questions. We'll personalize what we show you."
        onPress={onTailor}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Personalized surface — anchors selected by top obstacle, copy voiced by style
// ──────────────────────────────────────────────────────────────────────────────

type PersonalizedAnchor = { Icon: LucideIcon; title: string; sub: string };

/**
 * Map a top obstacle to 3 framework-rooted anchors. Pulled from
 * docs/create-power-program-spec.md §8 (frameworks). ABC Power Meals wording
 * is verbatim per memory rule.
 */
function anchorsForObstacle(obstacle: TopObstacle): PersonalizedAnchor[] {
  switch (obstacle) {
    case 'time':
      return [
        { Icon: Tag, title: 'Read labels', sub: 'A 5-second habit that compounds.' },
        { Icon: Workflow, title: 'The TEB Loop', sub: 'Trigger → Emotion → Behavior. Catch the moment.' },
        { Icon: UtensilsCrossed, title: 'ABC Power Meals', sub: 'Anchor protein · Balance the plate · Complete with embellishments.' },
      ];
    case 'motivation':
      return [
        { Icon: Workflow, title: 'Never Miss Twice', sub: "Missed yesterday? Today's the one that matters." },
        { Icon: Sparkles, title: '3 Energy Accounts', sub: 'FLOWED · UNEVEN · BLOCKED. Match the day to the level.' },
        { Icon: Tag, title: 'Read labels', sub: 'A small win you can take today regardless of mood.' },
      ];
    case 'knowledge':
      return [
        { Icon: UtensilsCrossed, title: 'ABC Power Meals', sub: 'Anchor protein · Balance the plate · Complete with embellishments.' },
        { Icon: Tag, title: 'Read labels', sub: "Know what's in it before it goes in." },
        { Icon: Workflow, title: 'The TEB Loop', sub: 'Trigger → Emotion → Behavior. The pattern behind the plate.' },
      ];
    case 'injury':
      return [
        { Icon: Sparkles, title: '3 Energy Accounts', sub: 'Train the level you have today, not yesterday.' },
        { Icon: Workflow, title: 'Antifragility', sub: 'Stronger from stress when we titrate it right.' },
        { Icon: UtensilsCrossed, title: 'ABC Power Meals', sub: 'Anchor protein · Balance the plate · Complete with embellishments.' },
      ];
    case 'cost':
      return [
        { Icon: Tag, title: 'Read labels', sub: 'Free, always available, real signal.' },
        { Icon: UtensilsCrossed, title: 'ABC Power Meals', sub: 'Anchor protein · Balance the plate · Complete with embellishments.' },
        { Icon: Workflow, title: '80/20 Flexibility', sub: 'Adherence that fits a real budget.' },
      ];
    case 'other':
    default:
      return [
        { Icon: Tag, title: 'Read labels', sub: "Know what's in it before it goes in." },
        { Icon: UtensilsCrossed, title: 'ABC Power Meals', sub: 'Anchor protein · Balance the plate · Complete with embellishments.' },
        { Icon: Workflow, title: 'The TEB Loop', sub: 'Trigger → Emotion → Behavior.' },
      ];
  }
}

function bridgeFor(style: CoachingStyle | undefined): string {
  switch (style) {
    case 'direct':
      return "Here's the shortest path. Three frameworks we'd run first against the obstacle you named.";
    case 'warm':
      return "Here's where we'd start together. Three frameworks tuned to what you just told us. Gentle on-ramps, real change underneath.";
    case 'challenging':
      return 'Three frameworks. Pick the one that scares you most and start there.';
    case 'balanced':
    default:
      return "Three frameworks, tuned to the obstacle you named. Pick the one that feels closest and we'll go from there.";
  }
}

type PersonalizedViewProps = {
  diagnostic: NonMemberDiagnostic;
  onJoin: () => void;
};

function PersonalizedView({ diagnostic, onJoin }: PersonalizedViewProps) {
  const obstacle = diagnostic.topObstacle ?? 'other';
  const style = diagnostic.coachingStyle;
  const anchors = anchorsForObstacle(obstacle);
  const bridge = bridgeFor(style);

  return (
    <>
      <PhotoHeroCard
        kicker="YOUR PERSONALIZED PLAN"
        title="Built around what you told us."
        photoUri={HERO_IMAGE}
      />

      <View style={styles.echo}>
        <Text style={styles.echoKicker}>YOUR GOAL</Text>
        <View style={styles.echoBlock}>
          <Text style={styles.echoBody}>{diagnostic.goal || '…'}</Text>
        </View>
      </View>

      <Text style={styles.bridge}>{bridge}</Text>

      <SectionHeader title="Where we'd start" meta="3 anchors" />
      {anchors.map((a) => (
        <AnchorRow key={a.title} Icon={a.Icon} title={a.title} sub={a.sub} />
      ))}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Join Create Power"
        onPress={onJoin}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View style={styles.cta}>
          <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
            Join the full program
          </Text>
        </View>
      </Pressable>
      <Text style={styles.ctaSub}>Get the rest of the path. Karen and Ryan walk it with you.</Text>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bridge: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 22,
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
