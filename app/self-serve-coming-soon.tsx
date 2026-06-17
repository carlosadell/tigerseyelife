import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '../hooks/useTheme';
import { FONTS, SPACING } from '../lib/brand';

export default function SelfServeComingSoon() {
  const colors = useThemeColors();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.body}>
        <Text style={[styles.kicker, { color: colors.accent }]}>SELF-SERVE</Text>
        <Text style={[styles.title, { color: colors.text }]}>We will be ready when you are.</Text>
        <Text style={[styles.copy, { color: colors.mutedText }]}>
          The self-paced path opens after the next release. If you want to start sooner, the guided
          12 week cohort is open now. Reach out to Karen or Ryan and they will get you in.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { gap: 14, paddingHorizontal: SPACING.screenX, paddingTop: 40 },
  copy: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 2.2 },
  screen: { flex: 1 },
  title: { fontFamily: FONTS.sansBold, fontSize: 24, letterSpacing: -0.3, lineHeight: 30 },
});
