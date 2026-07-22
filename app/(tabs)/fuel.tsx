// app/(tabs)/fuel.tsx
//
// Fuel's own identity, not a Today clone. Program-context header, full-width
// hero, and behavior that splits at the meal-logging unlock (Week 3). Before
// unlock: COMMIT-block "awareness first" — choose a nutrition track + preview
// of what unlocks. After unlock: ABC POWER MEALS slots for the day.

import { ArrowRight, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgramHeroCard } from '../../components/ui/ProgramHeroCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import { fuelHeroPhotoForWeek } from '../../lib/heroPhotos';
import { blockFor } from '../../lib/program';
import type { FeatureKey } from '../../lib/unlocks';
import { UNLOCK_AT, isFeatureUnlocked } from '../../lib/unlocks';

const light = THEME_COLORS.light;

type NutritionPreviewItem = {
  feature: FeatureKey;
  title: string;
  helper: string;
};

const NUTRITION_PREVIEW: readonly NutritionPreviewItem[] = [
  { feature: 'meal-logging', title: 'Meal logging',     helper: 'Anchor, Balance, Complete — one tap per meal.' },
  { feature: 'kitchen-reset', title: 'Kitchen reset',   helper: 'A guided pass through your shelves.' },
  { feature: 'meal-prep',     title: 'Meal-prep system', helper: 'A sustainable rhythm, not a Sunday marathon.' },
];

export default function FuelScreen() {
  const { weekNumber, blockId } = useCurrentWeek();
  const block = blockFor(blockId);
  const blockTitle = `${blockId.charAt(0)}${blockId.slice(1).toLowerCase()}`;
  const mealLoggingUnlocked = isFeatureUnlocked('meal-logging', weekNumber);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Shared program hero — same frame as Train and Grow. */}
        <ProgramHeroCard
          kicker={`${blockTitle.toUpperCase()} BLOCK · WEEK ${weekNumber}`}
          name="POWER MEALS"
          subtitle={mealLoggingUnlocked ? 'Log your plate' : 'Awareness first'}
          photoUri={fuelHeroPhotoForWeek(weekNumber)}
          body={
            mealLoggingUnlocked
              ? {
                  kind: 'note',
                  label: 'ABC POWER MEALS',
                  text: 'Anchor, Balance, Complete. Half the plate vegetables, a palm of protein, a thumb of fat.',
                }
              : {
                  kind: 'note',
                  label: 'THIS BLOCK · POWER MEALS',
                  text: 'Before you log anything, you learn to see what is on the plate. Logging joins us in REFINE.',
                }
          }
        />

        {!mealLoggingUnlocked ? (
          <>
            <SectionHeader title="Start here" />
            <Pressable
              onPress={() => router.push('/tool/nutrition-track-chooser' as never)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View style={styles.actionCard}>
                <Text style={styles.actionKicker}>NUTRITION TRACK</Text>
                <Text style={styles.actionTitle}>Choose your nutrition track</Text>
                <Text style={styles.actionBody}>
                  In COMMIT, awareness comes first. Pick the track that meets you
                  where you are. Logging joins us in REFINE.
                </Text>
                <View style={styles.actionCta}>
                  <Text style={styles.actionCtaText}>Open the chooser</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>

            <SectionHeader title="What unlocks next" meta={`${NUTRITION_PREVIEW.length} tools`} />
            <View>
              {NUTRITION_PREVIEW.map((item) => {
                const unlockWeek = UNLOCK_AT[item.feature];
                const weeksAway = unlockWeek - weekNumber;
                const wait = weeksAway <= 0
                  ? 'Available now'
                  : weeksAway === 1
                    ? 'in 1 week'
                    : `in ${weeksAway} weeks`;
                return (
                  <View key={item.feature} style={styles.previewRow}>
                    <View style={styles.previewIcon}>
                      <Lock color={light.mutedText} size={16} strokeWidth={2.2} />
                    </View>
                    <View style={styles.previewBody}>
                      <Text style={styles.previewTitle}>{item.title}</Text>
                      <Text style={styles.previewHelper} numberOfLines={2}>
                        {item.helper}
                      </Text>
                    </View>
                    <View style={styles.previewWhen}>
                      <Text style={styles.previewWeek}>W{unlockWeek}</Text>
                      <Text style={styles.previewWait}>{wait}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={styles.footnote}>
              {block.mindset}
            </Text>
          </>
        ) : (
          <>
            <SectionHeader title="Today's meals" meta="0 of 4 logged" />
            <View style={styles.mealSlots}>
              {(['Breakfast', 'Lunch', 'Snack', 'Dinner'] as const).map((slot) => (
                <Pressable
                  key={slot}
                  accessibilityRole="button"
                  accessibilityLabel={`Log ${slot}`}
                  onPress={() => router.push('/tool/abc-power-meals-guide' as never)}
                  style={({ pressed }) => [
                    styles.mealSlot,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.mealSlotLabel}>{slot}</Text>
                  <Text style={styles.mealSlotHint}>Tap to log</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => router.push('/tool/abc-power-meals-guide' as never)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View style={styles.abcCard}>
                <Text style={styles.abcKicker}>ABC POWER MEALS</Text>
                <Text style={styles.abcTitle}>Anchor, Balance, Complete.</Text>
                <Text style={styles.abcBody}>
                  Half the plate vegetables. A palm of protein. A thumb of fat. The
                  frame that makes the math optional.
                </Text>
                <View style={styles.actionCta}>
                  <Text style={styles.actionCtaText}>ABC reminder</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/tool/protein-reference-guide' as never)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View style={styles.abcCard}>
                <Text style={styles.abcKicker}>PROTEIN REFERENCE</Text>
                <Text style={styles.abcTitle}>Every food, every macro.</Text>
                <Text style={styles.abcBody}>
                  Karen and Ryan&apos;s lookup for protein and full macros. Use it
                  to build plates and hit your targets.
                </Text>
                <View style={styles.actionCta}>
                  <Text style={styles.actionCtaText}>Open the guide</Text>
                  <ArrowRight color={COLORS.tangerine} size={16} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  abcBody: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 19,
  },
  abcCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginTop: 14,
    padding: 16,
  },
  abcKicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  abcTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  actionBody: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 19,
  },
  actionCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  actionCta: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 4 },
  actionCtaText: {
    color: COLORS.tangerine,
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
  },
  actionKicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  actionTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  content: {
    paddingBottom: 128,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  footnote: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 24,
  },
  mealSlot: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 3,
    padding: 14,
  },
  mealSlotHint: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
  },
  mealSlotLabel: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: -0.05,
  },
  mealSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewBody: { flex: 1 },
  previewHelper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  previewIcon: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  previewRow: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: light.border,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  previewTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  previewWait: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 10.5,
    marginTop: 1,
  },
  previewWeek: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  previewWhen: { alignItems: 'flex-end' },
  screen: { flex: 1 },
});
