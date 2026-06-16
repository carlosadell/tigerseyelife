// app/onboarding/_layout.tsx
//
// Wraps all /onboarding/intake/* routes in a single <FormProvider> so step
// changes don't reset form state. The Stack here owns its own header so we
// can keep IntakeStep clean.

import { Stack } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';

import { intakeDefaults, type PartialIntake } from '../../lib/onboardingSchema';

export default function OnboardingLayout() {
  const methods = useForm<PartialIntake>({
    defaultValues: intakeDefaults,
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="intake/[step]" />
        <Stack.Screen name="intake/review" />
      </Stack>
    </FormProvider>
  );
}
