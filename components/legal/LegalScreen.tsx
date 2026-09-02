import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { type ReactNode } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLockup } from "../brand/BrandLockup";
import { FONTS, SPACING, THEME_COLORS } from "../../lib/brand";

const light = THEME_COLORS.light;

export function LegalScreen({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Back"
            hitSlop={10}
            onPress={goBack}
            style={styles.back}
          >
            <ChevronLeft color={light.text} size={24} />
          </Pressable>
          <BrandLockup width={144} />
          <View style={styles.back} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.updated}>Last updated September 2, 2026</Text>
          <View style={styles.body}>{children}</View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function LegalSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

export const legalStyles = StyleSheet.create({
  link: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    lineHeight: 22,
    textDecorationLine: "underline",
  },
  note: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  noteText: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    lineHeight: 21,
  },
});

const styles = StyleSheet.create({
  back: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  body: { gap: 24, marginTop: 28 },
  content: {
    paddingBottom: 48,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 22,
  },
  eyebrow: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.7,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === "web" ? 620 : undefined,
    width: "100%",
  },
  screen: { alignItems: "center", backgroundColor: light.background, flex: 1 },
  section: { gap: 7 },
  sectionBody: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  sectionTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    lineHeight: 23,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 32,
    letterSpacing: -0.7,
    lineHeight: 38,
    marginTop: 8,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  updated: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    marginTop: 8,
  },
});
