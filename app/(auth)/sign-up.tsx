import { Link, router } from "expo-router";
import { ArrowRight, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthShell } from "../../components/auth/AuthShell";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, FONTS } from "../../lib/brand";

export default function SignUpScreen() {
  const { devSignIn, hasSupabaseConfig, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const result = await signUp(email, password);
      if (result.requiresEmailConfirmation) {
        setMessage("Check your email to confirm your account, then sign in.");
      } else {
        router.replace("/membership");
      }
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to create account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevSignIn = () => {
    devSignIn();
    router.replace("/(tabs)/today");
  };

  return (
    <AuthShell
      eyebrow="CREATE POWER"
      footer={
        <View style={styles.footerStack}>
          <Link href="/(auth)/sign-in" style={styles.link}>
            <Text style={styles.linkMuted}>Already have an account? </Text>
            <Text style={styles.linkAccent}>Sign in</Text>
          </Link>
          <Link href="/privacy" style={styles.privacyLink}>
            Privacy policy
          </Link>
          {__DEV__ ? (
            <Pressable hitSlop={8} onPress={handleDevSignIn}>
              <Text style={styles.devSkipText}>Skip for dev preview →</Text>
            </Pressable>
          ) : null}
        </View>
      }
    >
      {!hasSupabaseConfig ? (
        <View style={styles.banner}>
          <Text style={styles.bannerKicker}>DEV MODE</Text>
          <Text style={styles.bannerText}>
            Supabase keys are empty. Fill .env to create real accounts, or use
            Skip for dev.
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

      <FieldGroup
        focused={focusedField === "email"}
        icon={<Mail color={COLORS.tigerGold} size={16} />}
        label="EMAIL"
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onBlur={() => setFocusedField(null)}
          onChangeText={setEmail}
          onFocus={() => setFocusedField("email")}
          placeholder="you@example.com"
          placeholderTextColor="rgba(168,175,184,0.5)"
          style={styles.input}
          value={email}
        />
      </FieldGroup>

      <FieldGroup
        focused={focusedField === "password"}
        icon={<Lock color={COLORS.tigerGold} size={16} />}
        label="PASSWORD"
      >
        <TextInput
          onBlur={() => setFocusedField(null)}
          onChangeText={setPassword}
          onFocus={() => setFocusedField("password")}
          placeholder="At least 8 characters"
          placeholderTextColor="rgba(168,175,184,0.5)"
          secureTextEntry
          style={styles.input}
          value={password}
        />
      </FieldGroup>

      <Pressable
        accessibilityRole="button"
        disabled={submitting}
        onPress={handleSignUp}
        style={({ pressed }) => [
          styles.primaryButton,
          { opacity: submitting || pressed ? 0.92 : 1 },
        ]}
      >
        <Text style={styles.primaryButtonText}>
          {submitting ? "Creating account…" : "Create account"}
        </Text>
        {submitting ? (
          <View style={styles.primaryArrow}>
            <ActivityIndicator color={COLORS.bone} size="small" />
          </View>
        ) : (
          <View style={styles.primaryArrow}>
            <ArrowRight color={COLORS.bone} size={20} strokeWidth={2.4} />
          </View>
        )}
      </Pressable>
    </AuthShell>
  );
}

function FieldGroup({
  children,
  focused,
  icon,
  label,
}: {
  children: React.ReactNode;
  focused: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        {icon}
        <Text style={[styles.fieldLabel, focused && styles.fieldLabelFocused]}>
          {label}
        </Text>
      </View>
      <View style={[styles.fieldWrap, focused && styles.fieldWrapFocused]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "rgba(200,159,77,0.12)",
    borderColor: "rgba(200,159,77,0.34)",
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  bannerKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 2,
  },
  bannerText: {
    color: COLORS.bone,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  devSkipText: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  errorCard: {
    backgroundColor: "rgba(165,72,72,0.16)",
    borderColor: "rgba(165,72,72,0.4)",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: "#F2A6A6",
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: COLORS.steel,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  fieldLabelFocused: {
    color: COLORS.tigerGold,
  },
  fieldLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 2,
  },
  fieldWrap: {
    backgroundColor: "rgba(245,242,234,0.05)",
    borderColor: "rgba(245,242,234,0.12)",
    borderRadius: 10,
    borderWidth: 1,
  },
  fieldWrapFocused: {
    borderColor: COLORS.tigerGold,
  },
  footerStack: {
    alignItems: "center",
    gap: 14,
  },
  input: {
    color: COLORS.bone,
    fontFamily: FONTS.sans,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  link: {
    fontFamily: FONTS.sans,
    fontSize: 13,
  },
  linkAccent: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
  },
  linkMuted: {
    color: COLORS.steel,
  },
  messageCard: {
    backgroundColor: "rgba(30,91,69,0.18)",
    borderColor: "rgba(30,91,69,0.45)",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  messageText: {
    color: COLORS.bone,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryArrow: {
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    right: 18,
    top: 0,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.tangerine,
    borderRadius: 10,
    elevation: 4,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
    position: "relative",
    shadowColor: COLORS.tangerine,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: 0.2,
  },
  privacyLink: {
    color: COLORS.steel,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
