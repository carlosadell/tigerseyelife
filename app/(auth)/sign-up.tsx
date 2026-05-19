import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthShell } from '../../components/auth/AuthShell';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS } from '../../lib/brand';

export default function SignUpScreen() {
  const { devSignIn, hasSupabaseConfig, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      await signUp(email, password);
      setMessage('Account created. You can sign in when ready.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevSignIn = () => {
    devSignIn();
    router.replace('/(tabs)/today');
  };

  return (
    <AuthShell
      eyebrow="CREATE POWER"
      footer={
        <>
          <Link href="/(auth)/sign-in" style={styles.link}>
            Already have an account?
          </Link>
          {__DEV__ ? (
            <Pressable onPress={handleDevSignIn} style={styles.devSkip}>
              <Text style={styles.devSkipText}>Skip for dev</Text>
            </Pressable>
          ) : null}
        </>
      }
    >
      {!hasSupabaseConfig ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            Supabase env values are empty. Fill .env before creating accounts.
          </Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {message ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        onBlur={() => setFocusedField(null)}
        onChangeText={setEmail}
        onFocus={() => setFocusedField('email')}
        placeholder="Email"
        placeholderTextColor={COLORS.steel}
        style={[styles.input, focusedField === 'email' && styles.inputFocused]}
        value={email}
      />
      <TextInput
        onBlur={() => setFocusedField(null)}
        onChangeText={setPassword}
        onFocus={() => setFocusedField('password')}
        placeholder="Password"
        placeholderTextColor={COLORS.steel}
        secureTextEntry
        style={[styles.input, focusedField === 'password' && styles.inputFocused]}
        value={password}
      />
      <Pressable
        disabled={submitting}
        onPress={handleSignUp}
        style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
      >
        <Text style={styles.primaryButtonText}>
          {submitting ? 'Creating...' : 'Create Account'}
        </Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  devSkip: {
    marginTop: 10,
  },
  devSkipText: {
    color: COLORS.steel,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
  },
  errorCard: {
    backgroundColor: 'rgba(165,72,72,0.12)',
    borderColor: 'rgba(165,72,72,0.34)',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: '#F2A6A6',
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: 'rgba(245,242,234,0.08)',
    borderColor: 'rgba(245,242,234,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    color: COLORS.bone,
    fontFamily: FONTS.sans,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputFocused: {
    borderColor: COLORS.tigerGold,
  },
  link: {
    color: COLORS.steel,
    fontFamily: FONTS.sansMedium,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: 'rgba(30,91,69,0.18)',
    borderColor: 'rgba(30,91,69,0.45)',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  messageText: {
    color: COLORS.bone,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.tigerGold,
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.64,
  },
  primaryButtonText: {
    color: COLORS.onyx,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
  },
});
