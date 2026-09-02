import { Redirect, router } from "expo-router";
import { Globe2, Mail, ShieldCheck } from "lucide-react-native";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLockup } from "../components/brand/BrandLockup";
import { AnchorRow } from "../components/ui/AnchorRow";
import { useAuth } from "../hooks/useAuth";
import { FONTS, SPACING, THEME_COLORS } from "../lib/brand";

const light = THEME_COLORS.light;
const WEBSITE_URL = "https://tigerseye.life";
const CONTACT_URL =
  "mailto:hello@tigerseyelife.com?subject=Create%20Power%20membership";

export default function NonMemberScreen() {
  const { session, signOut } = useAuth();
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <BrandLockup width={170} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconWrap}>
            <ShieldCheck color={light.accent} size={30} />
          </View>
          <Text style={styles.eyebrow}>CREATE POWER MEMBERS</Text>
          <Text style={styles.title}>
            Your program starts after verification.
          </Text>
          <Text style={styles.body}>
            Tigers Eye Life is the companion app for active Create Power
            members. Verify the email you used to join to unlock your plan.
          </Text>

          <View style={styles.actions}>
            <AnchorRow
              Icon={ShieldCheck}
              title="Verify membership"
              sub="Use your Create Power join email."
              onPress={() => router.push("/verify-membership" as never)}
            />
            <AnchorRow
              Icon={Mail}
              title="Contact Tigers Eye Life"
              sub="Get help with membership or your join email."
              onPress={() => Linking.openURL(CONTACT_URL)}
            />
            <AnchorRow
              Icon={Globe2}
              title="Visit our website"
              sub="Learn more about Tigers Eye Life."
              onPress={() => Linking.openURL(WEBSITE_URL)}
            />
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={signOut}
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: 28 },
  body: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 54,
  },
  eyebrow: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.7,
    marginTop: 20,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === "web" ? 430 : undefined,
    width: "100%",
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  pressed: { opacity: 0.65 },
  screen: {
    alignItems: "center",
    backgroundColor: light.background,
    flex: 1,
  },
  signOut: {
    alignItems: "center",
    borderTopColor: light.border,
    borderTopWidth: 1,
    padding: 20,
  },
  signOutText: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 30,
    letterSpacing: -0.7,
    lineHeight: 36,
    marginTop: 8,
  },
  topBar: { paddingHorizontal: SPACING.screenX, paddingTop: 12 },
});
