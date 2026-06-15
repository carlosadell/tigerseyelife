// app/non-member.tsx
import { Redirect } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoHeroCard } from '../components/ui/PhotoHeroCard';
import { coachStillForToday } from '../lib/coachStills';
import { useAuth } from '../hooks/useAuth';
import { FONTS, SPACING, THEME_COLORS } from '../lib/brand';

const light = THEME_COLORS.light;

/**
 * Non-member landing — placeholder. Destination TBD per spec §11. Closes
 * the loop on the diagnostic so the flow doesn't dead-end.
 */
export default function NonMemberLandingScreen() {
  const { session, signOut } = useAuth();
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PhotoHeroCard
            kicker="THANKS — WE HEARD YOU"
            title={"You're in the right place.\nWe're still building this part."}
            photoUri={coachStillForToday()}
          />
          <Text style={styles.body}>
            The non-member experience is in design. Karen and Ryan are deciding what you'll see here
            next. If you'd like to skip the wait, ask Ryan about joining the Create Power program.
          </Text>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable onPress={signOut} style={({ pressed }) => [styles.ghost, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={styles.ghostText}>Sign out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { color: light.text, fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22, marginTop: 20 },
  content: { paddingBottom: 24, paddingHorizontal: SPACING.screenX, paddingTop: 20 },
  footer: { paddingBottom: 12, paddingHorizontal: SPACING.screenX, paddingTop: 8 },
  frame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  ghost: { alignItems: 'center', paddingVertical: 14 },
  ghostText: { color: light.text, fontFamily: FONTS.sansMedium, fontSize: 14 },
  screen: { alignItems: 'center', flex: 1 },
});
