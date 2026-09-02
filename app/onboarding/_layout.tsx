// app/onboarding/_layout.tsx
//
// Wraps all /onboarding/intake/* routes in a single <FormProvider> so step
// changes don't reset form state. The Stack here owns its own header so we
// can keep IntakeStep clean.

import { Redirect, Stack } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "../../hooks/useAuth";
import { COLORS, THEME_COLORS } from "../../lib/brand";
import { intakeDefaults, type PartialIntake } from "../../lib/onboardingSchema";

export default function OnboardingLayout() {
  const { loading, session } = useAuth();
  const methods = useForm<PartialIntake>({
    defaultValues: intakeDefaults,
    mode: "onChange",
  });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.tigerGold} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <FormProvider {...methods}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="intake/[step]" />
        <Stack.Screen name="intake/review" />
      </Stack>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: THEME_COLORS.light.background,
    flex: 1,
    justifyContent: "center",
  },
});
