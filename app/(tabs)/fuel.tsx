import { Droplet, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddMealSheet } from '../../components/fuel/AddMealSheet';
import { MealSlotCard } from '../../components/fuel/MealSlotCard';
import { useDailyMeals } from '../../hooks/useDailyMeals';
import { useProfile } from '../../hooks/useProfile';
import { useThemeColors } from '../../hooks/useTheme';
import { useTodayEngagement } from '../../hooks/useTodayEngagement';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { DEFAULT_TARGETS, MEAL_SLOTS, MealSlot } from '../../lib/meals';

const PRECISION_LEVELS = [
  { id: 'hand', label: 'Hand portions' },
  { id: 'aware', label: 'Calories + protein' },
  { id: 'macro', label: 'Full macros' },
];

export default function FuelScreen() {
  const colors = useThemeColors();
  const { profile } = useProfile();
  const { bySlot, totals, totalCalories, logMeal, removeMeal } = useDailyMeals();
  const { engagement, waterTarget, addWater } = useTodayEngagement();
  const [precision, setPrecision] = useState('hand');
  const [addingSlot, setAddingSlot] = useState<MealSlot | null>(null);

  const greeting = profile.firstName ? `Hey ${profile.firstName.split(' ')[0]}.` : 'Hey there.';

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.headerKicker, { color: colors.accent }]}>FUEL</Text>
            <Text style={[styles.title, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Tap a meal slot to log from Karen and Ryan's library, or build your own.
            </Text>
          </View>

          <View style={[styles.snapshot, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.rail, { backgroundColor: colors.accent }]} />
            <View style={styles.snapshotBody}>
              <Text style={[styles.cardKicker, { color: colors.accent }]}>NUTRITION SNAPSHOT</Text>
              <MacroBar
                label="Calories"
                value={totalCalories}
                target={DEFAULT_TARGETS.calories}
                unit="cal"
                tint={COLORS.tangerine}
                emphasize
              />
              <MacroBar
                label="Protein"
                value={totals.protein}
                target={DEFAULT_TARGETS.protein}
                unit="g"
                tint={COLORS.deepGreen}
              />
              <MacroBar
                label="Fat"
                value={totals.fat}
                target={DEFAULT_TARGETS.fat}
                unit="g"
                tint={COLORS.tigerGold}
              />
              <MacroBar
                label="Carbs"
                value={totals.carb}
                target={DEFAULT_TARGETS.carb}
                unit="g"
                tint={COLORS.electricYellow}
              />
              <MacroBar
                label="Fiber"
                value={totals.fiber}
                target={DEFAULT_TARGETS.fiber}
                unit="g"
                tint={COLORS.evidenceBlue}
              />
            </View>
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>TODAY'S MEALS</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedText }]}>
              First, second, third, snack — your rhythm, your choice.
            </Text>
          </View>

          {MEAL_SLOTS.map((slot) => (
            <MealSlotCard
              key={slot.id}
              slot={slot.id}
              label={slot.label}
              hint={slot.hint}
              meals={bySlot[slot.id]}
              onAdd={() => setAddingSlot(slot.id)}
              onRemove={removeMeal}
            />
          ))}

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>HYDRATION</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedText }]}>
              {engagement.water}/{waterTarget} glasses · {engagement.water * 8} oz
            </Text>
          </View>

          <View style={[styles.hydration, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.hydrationGrid}>
              {Array.from({ length: waterTarget }).map((_, index) => {
                const filled = index < engagement.water;
                return (
                  <View
                    key={index}
                    style={[
                      styles.dropCell,
                      {
                        backgroundColor: filled ? colors.action : 'transparent',
                        borderColor: filled ? colors.action : colors.border,
                      },
                    ]}
                  >
                    <Droplet
                      color={filled ? '#FFFFFF' : colors.mutedText}
                      fill={filled ? '#FFFFFF' : 'transparent'}
                      size={14}
                    />
                  </View>
                );
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={addWater}
              style={({ pressed }) => [
                styles.hydrationButton,
                { backgroundColor: colors.accent, borderColor: colors.accent, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Plus color={colors.inverseText} size={16} strokeWidth={2.6} />
              <Text style={[styles.hydrationButtonText, { color: colors.inverseText }]}>
                Log a glass
              </Text>
            </Pressable>
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>PRECISION LEVEL</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedText }]}>
              How much detail you want surfaced — change anytime.
            </Text>
          </View>
          <View style={styles.precisionRow}>
            {PRECISION_LEVELS.map((level) => {
              const active = level.id === precision;
              return (
                <Pressable
                  key={level.id}
                  onPress={() => setPrecision(level.id)}
                  style={[
                    styles.precisionChip,
                    {
                      backgroundColor: active ? colors.accent : colors.card,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.precisionText,
                      { color: active ? colors.inverseText : colors.text },
                    ]}
                  >
                    {level.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <AddMealSheet
        visible={addingSlot !== null}
        slot={addingSlot}
        onClose={() => setAddingSlot(null)}
        onLog={logMeal}
      />
    </SafeAreaView>
  );
}

function MacroBar({
  label,
  value,
  target,
  unit,
  tint,
  emphasize,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  tint: string;
  emphasize?: boolean;
}) {
  const colors = useThemeColors();
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const left = Math.max(0, target - value);
  return (
    <View style={styles.macroBar}>
      <View style={styles.macroHead}>
        <Text style={[styles.macroLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.macroValue, { color: emphasize ? tint : colors.text }]}>
          {value} {unit}
        </Text>
      </View>
      <View style={[styles.macroTrack, { backgroundColor: colors.cardAlt }]}>
        <View style={[styles.macroFill, { backgroundColor: tint, width: `${pct}%` }]} />
      </View>
      <Text style={[styles.macroMeta, { color: colors.mutedText }]}>
        {pct}% of {target} {unit} · {left} {unit} left
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  content: {
    gap: 14,
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  dropCell: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexBasis: '11%',
    height: 30,
    justifyContent: 'center',
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  hydration: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  hydrationButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
  },
  hydrationButtonText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  hydrationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  intro: {
    gap: 6,
    paddingTop: 4,
  },
  macroBar: {
    gap: 5,
  },
  macroFill: {
    borderRadius: 999,
    height: '100%',
  },
  macroHead: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  macroMeta: {
    fontFamily: FONTS.sans,
    fontSize: 11,
  },
  macroTrack: {
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  macroValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  precisionChip: {
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  precisionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  precisionText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  rail: {
    borderRadius: 999,
    width: 2,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  sectionHead: {
    gap: 2,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  sectionSub: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
  },
  snapshot: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  snapshotBody: {
    flex: 1,
    gap: 12,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
});
