import { Linking, Text } from "react-native";

import {
  LegalScreen,
  LegalSection,
  legalStyles,
} from "../components/legal/LegalScreen";

const SUPPORT_EMAIL = "hello@tigerseyelife.com";

export default function PrivacyScreen() {
  return (
    <LegalScreen eyebrow="YOUR PRIVACY" title="Privacy Policy">
      <LegalSection title="What we collect">
        Tigers Eye Life collects the account information you provide, your
        Create Power membership status, onboarding and coaching preferences,
        goals, check-ins, workouts, meals, progress, and content you choose to
        enter. If you use meal scanning or voice input, the selected photo or
        spoken request is processed only to provide that feature.
      </LegalSection>
      <LegalSection title="How we use it">
        We use your data to authenticate you, personalize the program, save your
        progress, provide coaching and meal feedback, support your account,
        secure the service, and improve app reliability. Tigers Eye Life does
        not sell personal data and does not use third-party advertising in the
        app.
      </LegalSection>
      <LegalSection title="Service providers">
        Supabase provides authentication, database, and server functions.
        Anthropic processes the prompts or meal photos you intentionally submit
        to AI features. Apple, Google, and Expo may process limited technical
        information needed to distribute and operate the app. Each provider
        handles information under its own contractual and security obligations.
      </LegalSection>
      <LegalSection title="Health and wellness information">
        Workout, nutrition, mood, and progress information is used to support
        the Tigers Eye Life experience. The app is educational and is not a
        medical device or a substitute for medical diagnosis or treatment. We do
        not connect to Apple Health or Health Connect in this release.
      </LegalSection>
      <LegalSection title="Retention and deletion">
        We keep account data while your account is active and as needed to
        operate and secure the service. You can permanently delete your account
        and associated app data from the You screen. Limited records may be
        retained only when required for security, fraud prevention, or law, and
        encrypted backups may take additional time to expire.
      </LegalSection>
      <LegalSection title="Your choices">
        Camera, photo-library, microphone, and speech access are optional and
        requested only when you choose the related feature. You can decline or
        later revoke those permissions in device settings. You may also request
        access, correction, or deletion by contacting us.
      </LegalSection>
      <LegalSection title="Age and changes">
        Tigers Eye Life is intended for people age 13 and older. We may update
        this policy as the app changes and will publish the revised date here.
      </LegalSection>
      <LegalSection title="Contact">
        Questions about privacy or your data can be sent to Tigers Eye Life at{" "}
        <Text
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          style={legalStyles.link}
        >
          {SUPPORT_EMAIL}
        </Text>
        .
      </LegalSection>
    </LegalScreen>
  );
}
