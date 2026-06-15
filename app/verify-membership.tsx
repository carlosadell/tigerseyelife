// app/verify-membership.tsx
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoHeroCard } from '../components/ui/PhotoHeroCard';
import { coachStillForToday } from '../lib/coachStills';
import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { supabase } from '../lib/supabase';
import { COLORS, FONTS, SPACING, THEME_COLORS, ctaTextOnTangerine } from '../lib/brand';

const light = THEME_COLORS.light;
type Stage = 'email' | 'code' | 'success' | 'not_found';
type StartResponse = { found: boolean; otpSent: boolean };
type ConfirmResponse = { verified: boolean; reason?: string };

export default function VerifyMembershipScreen() {
  const { isDevSession, session } = useAuth();
  const { devMarkVerified, recordNonMember, refresh } = useMembership();

  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  const callEdge = async <T,>(body: object): Promise<T> => {
    if (!supabase) throw new Error('supabase_not_configured');
    const { data, error: invokeError } = await supabase.functions.invoke<T>('verify-membership', { body });
    if (invokeError) throw invokeError;
    if (!data) throw new Error('empty_response');
    return data;
  };

  const onSendCode = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      setError('Please enter the email you used to join.');
      return;
    }
    setSubmitting(true);
    try {
      if (isDevSession || !supabase) {
        setStage('code');
        return;
      }
      const result = await callEdge<StartResponse>({ mode: 'start', email: trimmed });
      if (!result.found) {
        setStage('not_found');
        return;
      }
      setStage('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirm = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    setSubmitting(true);
    try {
      if (isDevSession || !supabase) {
        if (code !== '123456') {
          setError('Dev mode: the code is 123456.');
          return;
        }
        await devMarkVerified(trimmed);
        router.replace('/onboarding');
        return;
      }
      const result = await callEdge<ConfirmResponse>({ mode: 'confirm', email: trimmed, code: code.trim() });
      if (!result.verified) {
        if (result.reason === 'no_longer_member') setStage('not_found');
        else setError("That code didn't work. Try again.");
        return;
      }
      await refresh();
      router.replace('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.frame}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <PhotoHeroCard
              kicker={stage === 'not_found' ? 'NOT FOUND' : 'VERIFY MEMBERSHIP'}
              title={
                stage === 'email' ? 'Which email did you use to join?' :
                stage === 'code' ? 'Check your inbox.' :
                stage === 'not_found' ? "We couldn't find your membership." :
                'Verified.'
              }
              photoUri={coachStillForToday()}
            />

            {stage === 'email' && (
              <>
                <Text style={styles.body}>
                  We'll send a six-digit code to confirm. Your app login can be a different email. We just need the one you used for Create Power.
                </Text>
                <Text style={styles.label}>Join email</Text>
                <TextInput
                  accessibilityLabel="Join email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!submitting}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={light.mutedText}
                  style={styles.input}
                  value={email}
                />
                {isDevSession && (
                  <Text style={styles.hint}>Dev mode: any email with "+member" matches. OTP is 123456.</Text>
                )}
              </>
            )}

            {stage === 'code' && (
              <>
                <Text style={styles.body}>
                  We sent a code to {email.trim().toLowerCase()}. It expires in 10 minutes.
                </Text>
                <Text style={styles.label}>Verification code</Text>
                <TextInput
                  accessibilityLabel="Verification code"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor={light.mutedText}
                  style={[styles.input, styles.code]}
                  value={code}
                />
                <Pressable onPress={() => setStage('email')} hitSlop={8}>
                  <Text style={[styles.hint, { color: COLORS.tigerGold }]}>Use a different email</Text>
                </Pressable>
              </>
            )}

            {stage === 'not_found' && (
              <Text style={styles.body}>
                Double-check the email you used to join Create Power. If it still doesn't work, you can continue as a non-member or contact Ryan / Karen for help.
              </Text>
            )}

            {error && <Text style={styles.error}>{error}</Text>}
          </ScrollView>

          <View style={styles.footer}>
            {stage === 'email' && (
              <Pressable
                disabled={submitting || !email.trim()}
                onPress={onSendCode}
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: COLORS.tangerine, opacity: pressed ? 0.85 : (submitting || !email.trim()) ? 0.5 : 1 },
                ]}
              >
                <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                  {submitting ? 'Sending…' : 'Send code'}
                </Text>
              </Pressable>
            )}
            {stage === 'code' && (
              <Pressable
                disabled={submitting || code.length < 4}
                onPress={onConfirm}
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: COLORS.tangerine, opacity: pressed ? 0.85 : (submitting || code.length < 4) ? 0.5 : 1 },
                ]}
              >
                <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                  {submitting ? 'Verifying…' : 'Verify'}
                </Text>
              </Pressable>
            )}
            {stage === 'not_found' && (
              <>
                <Pressable
                  onPress={() => { setStage('email'); setEmail(''); setCode(''); setError(null); }}
                  style={({ pressed }) => [styles.ghost, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={styles.ghostText}>Try again</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await recordNonMember({});
                    router.replace('/non-member' as never);
                  }}
                  style={({ pressed }) => [styles.cta, { backgroundColor: COLORS.tangerine, opacity: pressed ? 0.85 : 1 }]}
                >
                  <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>Continue as non-member</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { color: light.mutedText, fontFamily: FONTS.sansMedium, fontSize: 14 },
  body: { color: light.text, fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22, marginTop: 18 },
  code: { letterSpacing: 6, textAlign: 'center' },
  content: { paddingBottom: 24, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  cta: { alignItems: 'center', borderRadius: 14, paddingVertical: 16 },
  ctaText: { fontFamily: FONTS.sansBold, fontSize: 16, letterSpacing: -0.1 },
  error: { color: COLORS.deepRed, fontFamily: FONTS.sansMedium, fontSize: 13.5, marginTop: 14 },
  footer: { gap: 8, paddingBottom: 12, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  ghost: { alignItems: 'center', paddingVertical: 14 },
  ghostText: { color: light.text, fontFamily: FONTS.sansMedium, fontSize: 14 },
  hint: { color: light.mutedText, fontFamily: FONTS.sansMedium, fontSize: 12, marginTop: 8 },
  input: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  label: { color: light.text, fontFamily: FONTS.sansMedium, fontSize: 13, marginTop: 18 },
  screen: { alignItems: 'center', flex: 1 },
  topBar: { paddingHorizontal: SPACING.screenX, paddingTop: 6 },
});
