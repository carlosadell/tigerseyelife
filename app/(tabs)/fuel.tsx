// app/(tabs)/fuel.tsx
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { isFeatureUnlocked } from '../../lib/unlocks';

export default function FuelScreen() {
  const colors = useThemeColors();
  const { weekNumber } = useCurrentWeek();
  const mealLoggingUnlocked = isFeatureUnlocked('meal-logging', weekNumber);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.accent }]}>FUEL</Text>
            <Text style={[styles.title, { color: colors.text }]}>Nutrition this week</Text>
          </View>

          {!mealLoggingUnlocked ? (
            <Pressable
              onPress={() => router.push('/tool/nutrition-track-chooser')}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardKicker, { color: colors.accent }]}>THIS BLOCK</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Choose your nutrition track
                </Text>
                <Text style={[styles.cardBody, { color: colors.mutedText }]}>
                  In COMMIT, awareness comes first. Pick the track that meets you where you are.
                  Logging joins us in REFINE.
                </Text>
                <View style={styles.cardCta}>
                  <Text style={[styles.cardCtaText, { color: COLORS.tangerine }]}>Open the chooser</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardKicker, { color: colors.accent }]}>ABC POWER MEALS</Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Log today's meals</Text>
              <Text style={[styles.cardBody, { color: colors.mutedText }]}>
                Anchor, Balance, Complete. Tap a meal slot to log what you ate.
              </Text>
              <View style={styles.mealSlots}>
                {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((slot) => (
                  <View key={slot} style={[styles.mealSlot, { borderColor: colors.border }]}>
                    <Text style={[styles.mealSlotLabel, { color: colors.mutedText }]}>{slot}</Text>
                    <Text style={[styles.mealSlotHint, { color: colors.mutedText }]}>Tap to log</Text>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => router.push('/tool/abc-power-meals-guide')}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginTop: 6 })}
              >
                <View style={styles.cardCta}>
                  <Text style={[styles.cardCtaText, { color: COLORS.tangerine }]}>ABC reminder</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, gap: 10, padding: 14 },
  cardBody: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  cardCta: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  cardCtaText: { fontFamily: FONTS.sansBold, fontSize: 13.5 },
  cardKicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 2 },
  cardTitle: { fontFamily: FONTS.sansBold, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  content: { gap: 18, paddingBottom: 128, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  header: { gap: 6 },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 2.4 },
  mealSlot: {
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: '48%',
    gap: 4,
    padding: 12,
  },
  mealSlotHint: { fontFamily: FONTS.sans, fontSize: 12 },
  mealSlotLabel: { fontFamily: FONTS.sansBold, fontSize: 13 },
  mealSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  phoneFrame: { flex: 1, maxWidth: Platform.OS === 'web' ? 430 : undefined, width: '100%' },
  screen: { alignItems: 'center', flex: 1 },
  title: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.3, lineHeight: 28 },
});
