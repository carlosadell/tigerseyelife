import { router } from "expo-router";
import { ArrowRight, Lock } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthShell } from "../components/auth/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { COLORS, FONTS } from "../lib/brand";

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const savePassword = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      router.replace("/(tabs)/today");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update your password.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow="ACCOUNT SECURITY" footer={null}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a new password</Text>
        <Text style={styles.copy}>
          Use at least 8 characters, then return to your program.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Field label="NEW PASSWORD" value={password} onChangeText={setPassword} />
      <Field
        label="CONFIRM PASSWORD"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Pressable
        accessibilityRole="button"
        disabled={submitting}
        onPress={savePassword}
        style={({ pressed }) => [
          styles.primaryButton,
          { opacity: submitting || pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.primaryButtonText}>Save password</Text>
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.4} />
        )}
      </Pressable>
    </AuthShell>
  );
}

function Field({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        <Lock color={COLORS.tigerGold} size={16} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <View style={styles.fieldWrap}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          placeholder="At least 8 characters"
          placeholderTextColor="rgba(168,175,184,0.5)"
          secureTextEntry
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: COLORS.steel,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
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
  fieldGroup: { gap: 6 },
  fieldLabel: {
    color: COLORS.steel,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.6,
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
  header: { gap: 8, marginBottom: 4 },
  input: {
    color: COLORS.bone,
    fontFamily: FONTS.sans,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.tangerine,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
  },
  title: {
    color: COLORS.bone,
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    lineHeight: 32,
  },
});
