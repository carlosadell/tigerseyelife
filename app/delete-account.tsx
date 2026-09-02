import { Linking, Pressable, Text, View } from "react-native";

import {
  LegalScreen,
  LegalSection,
  legalStyles,
} from "../components/legal/LegalScreen";

const SUPPORT_EMAIL = "hello@tigerseyelife.com";
const REQUEST_URL = `mailto:${SUPPORT_EMAIL}?subject=Tigers%20Eye%20Life%20account%20deletion`;

export default function DeleteAccountHelpScreen() {
  return (
    <LegalScreen eyebrow="ACCOUNT CONTROL" title="Delete your account">
      <View style={legalStyles.note}>
        <Text style={legalStyles.noteText}>
          In the app, open You, scroll to Account, and choose Delete account.
          You will be asked to confirm before anything is removed.
        </Text>
      </View>
      <LegalSection title="If you cannot access the app">
        Send a deletion request from the email address connected to your
        account. We will verify the request before deleting the account.
      </LegalSection>
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(REQUEST_URL)}
      >
        <Text style={legalStyles.link}>Email {SUPPORT_EMAIL}</Text>
      </Pressable>
      <LegalSection title="What deletion removes">
        Deletion removes your login, profile and intake answers, membership
        record, daily entries, workout history, coaching history, progress
        events, and other user-owned app records.
      </LegalSection>
      <LegalSection title="What may remain">
        Information may be retained only where required for security, fraud
        prevention, financial recordkeeping, or law. Encrypted backups may
        remain until their normal expiration and are not used to restore a
        deleted account.
      </LegalSection>
    </LegalScreen>
  );
}
