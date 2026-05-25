import { Droplet } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddMealSheet } from '../../components/fuel/AddMealSheet';
import { MacroPie } from '../../components/fuel/MacroPie';
import { MealDetailSheet } from '../../components/fuel/MealDetailSheet';
import { FuelPrecision, MealSlotCard } from '../../components/fuel/MealSlotCard';
import { WeekStrip } from '../../components/history/WeekStrip';
import { useDailyMeals } from '../../hooks/useDailyMeals';
import { useProfile } from '../../hooks/useProfile';
import { useTheme, useThemeColors } from '../../hooks/useTheme';
import { useTodayEngagement } from '../../hooks/useTodayEngagement';
import { COLORS, FONTS, SPACING, textTintOf } from '../../lib/brand';
import { DEFAULT_TARGETS, LoggedMeal, MEAL_SLOTS, MealSlot } from '../../lib/meals';

type PrecisionOption = { id: FuelPrecision; label: string; description: string };

const PRECISION_LEVELS: PrecisionOption[] = [
  { id: 'hand', label: 'Hand portions', description: 'No counting. Just acknowledge balanced meals.' },
  { id: 'aware', label: 'Calories + protein', description: 'Track calories and protein only.' },
  { id: 'macro', label: 'Full macros', description: 'Every macro tracked in grams.' },
];

export default function FuelScreen() {
  const colors = useThemeColors();
  const { profile } = useProfile();
  const { bySlot, totals, totalCalories, logMeal, removeMeal } = useDailyMeals();
  const { engagement, waterTarget, addWater } = useTodayEngagement();
  const [precision, setPrecision] = useState<FuelPrecision>('hand');
  const [addingSlot, setAddingSlot] = useState<MealSlot | null>(null);
  const [detailMeal, setDetailMeal] = useState<LoggedMeal | null>(null);

  const greeting = profile.firstName ? `Hey ${profile.firstName.split(' ')[0]}.` : 'Hey there.';

  const mealsLogged = useMemo(
    () => MEAL_SLOTS.reduce((n, s) => n + (bySlot[s.id].length > 0 ? 1 : 0), 0),
    [bySlot],
  );

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

          <WeekStrip />

          <NutritionSnapshot
            precision={precision}
            mealsLogged={mealsLogged}
            totalCalories={totalCalories}
            totals={totals}
          />

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
              precision={precision}
              onAdd={() => setAddingSlot(slot.id)}
              onRemove={removeMeal}
              onMealPress={setDetailMeal}
            />
          ))}

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>HYDRATION</Text>
          </View>

          <HydrationCard count={engagement.water} target={waterTarget} onAdd={addWater} />

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
          <Text style={[styles.precisionHelper, { color: colors.mutedText }]}>
            {PRECISION_LEVELS.find((l) => l.id === precision)?.description}
          </Text>
        </ScrollView>
      </View>
      <AddMealSheet
        visible={addingSlot !== null}
        slot={addingSlot}
        onClose={() => setAddingSlot(null)}
        onLog={logMeal}
      />
      <MealDetailSheet
        visible={detailMeal !== null}
        meal={detailMeal}
        onClose={() => setDetailMeal(null)}
        onRemove={removeMeal}
      />
    </SafeAreaView>
  );
}

type SnapshotProps = {
  precision: FuelPrecision;
  mealsLogged: number;
  totalCalories: number;
  totals: { protein: number; fat: number; carb: number; fiber: number };
};

function NutritionSnapshot({ precision, mealsLogged, totalCalories, totals }: SnapshotProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.snapshot, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.rail, { backgroundColor: colors.accent }]} />
      <View style={styles.snapshotBody}>
        <Text style={[styles.cardKicker, { color: colors.accent }]}>NUTRITION SNAPSHOT</Text>

        {precision === 'hand' ? (
          <HandPortionsView mealsLogged={mealsLogged} />
        ) : (
          <View style={styles.barsStack}>
            <MacroBar
              label="Calories"
              value={totalCalories}
              target={DEFAULT_TARGETS.calories}
              unit="cal"
              tint={COLORS.tangerine}
            />
            {precision === 'aware' ? (
              <MacroBar
                label="Protein"
                value={totals.protein}
                target={DEFAULT_TARGETS.protein}
                unit="g"
                tint={COLORS.deepGreen}
              />
            ) : null}
            {precision === 'macro' ? (
              <>
                <MacroMixRow totals={totals} />
                <MacroBar
                  label="Fiber"
                  value={totals.fiber}
                  target={DEFAULT_TARGETS.fiber}
                  unit="g"
                  tint={COLORS.evidenceBlue}
                />
              </>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

function HandPortionsView({ mealsLogged }: { mealsLogged: number }) {
  const colors = useThemeColors();
  const pct = Math.round((mealsLogged / 4) * 100);
  return (
    <View style={styles.handView}>
      <View style={styles.handHead}>
        <Text style={[styles.handLabel, { color: colors.text }]}>MEALS LOGGED</Text>
        <Text style={[styles.handValue, { color: colors.accent }]}>{mealsLogged}/4</Text>
      </View>
      <View style={[styles.macroTrack, { backgroundColor: colors.cardAlt }]}>
        <View style={[styles.macroFill, { backgroundColor: colors.accent, width: `${pct}%` }]} />
      </View>
      <Text style={[styles.handHelper, { color: colors.mutedText }]}>
        Hand portions mode — just acknowledge balanced meals. Switch to Calories + protein or Full
        macros below if you want numbers.
      </Text>
    </View>
  );
}

function MacroMixRow({
  totals,
}: {
  totals: { protein: number; fat: number; carb: number; fiber: number };
}) {
  const colors = useThemeColors();
  const proteinCal = totals.protein * 4;
  const fatCal = totals.fat * 9;
  const carbCal = totals.carb * 4;
  const macroCalTotal = Math.max(1, proteinCal + fatCal + carbCal);
  const pctProtein = Math.round((proteinCal / macroCalTotal) * 100);
  const pctFat = Math.round((fatCal / macroCalTotal) * 100);
  const pctCarb = Math.round((carbCal / macroCalTotal) * 100);

  return (
    <View style={styles.mixRow}>
      <View style={styles.mixPieWrap}>
        <MacroPie
          protein={totals.protein}
          fat={totals.fat}
          carb={totals.carb}
          size={108}
        />
      </View>
      <View style={styles.mixChips}>
        <MacroChip
          label="PROTEIN"
          color={COLORS.deepGreen}
          grams={totals.protein}
          pct={pctProtein}
        />
        <MacroChip
          label="CARBS"
          color={COLORS.electricYellow}
          grams={totals.carb}
          pct={pctCarb}
        />
        <MacroChip label="FAT" color={COLORS.tigerGold} grams={totals.fat} pct={pctFat} />
        <Text style={[styles.mixHelper, { color: colors.mutedText }]}>% of macro calories</Text>
      </View>
    </View>
  );
}

function MacroChip({
  label,
  color,
  grams,
  pct,
}: {
  label: string;
  color: string;
  grams: number;
  pct: number;
}) {
  const colors = useThemeColors();
  const { mode } = useTheme();
  const textColor = textTintOf(color, mode);
  return (
    <View style={styles.chipRow}>
      <View style={[styles.chipSwatch, { backgroundColor: color }]} />
      <Text style={[styles.chipLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.chipGrams, { color: textColor }]}>{grams}g</Text>
      <Text style={[styles.chipPct, { color: colors.mutedText }]}>{pct}%</Text>
    </View>
  );
}

function MacroBar({
  label,
  value,
  target,
  unit,
  tint,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  tint: string;
}) {
  const colors = useThemeColors();
  const { mode } = useTheme();
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const left = Math.max(0, target - value);
  const textColor = textTintOf(tint, mode);
  return (
    <View style={styles.macroBar}>
      <View style={styles.macroHead}>
        <Text style={[styles.macroLabel, { color: colors.text }]}>{label.toUpperCase()}</Text>
        <View style={styles.macroValueRow}>
          <Text style={[styles.macroValueDiag, { color: textColor }]}>{value}</Text>
          <Text style={[styles.macroUnit, { color: colors.mutedText }]}>{unit}</Text>
        </View>
      </View>
      <View style={[styles.macroTrack, { backgroundColor: colors.cardAlt }]}>
        <View style={[styles.macroFill, { backgroundColor: tint, width: `${pct}%` }]} />
      </View>
      <Text style={[styles.macroMeta, { color: colors.mutedText }]}>
        {pct}% · {left} {unit} LEFT
      </Text>
    </View>
  );
}

function HydrationCard({
  count,
  target,
  onAdd,
}: {
  count: number;
  target: number;
  onAdd: () => void;
}) {
  const colors = useThemeColors();
  const tint = COLORS.evidenceBlue;
  const pct = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
  const atTarget = count >= target;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Hydration ${count} of ${target} glasses, tap to add one`}
      onPress={onAdd}
      style={({ pressed }) => [
        styles.hydrationCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.96 : 1 },
      ]}
    >
      <View style={styles.hydrationBody}>
        <View style={[styles.hydrationBadge, { backgroundColor: atTarget ? tint : colors.cardAlt }]}>
          <Droplet color={atTarget ? '#FFFFFF' : tint} size={16} strokeWidth={2} />
        </View>
        <View style={styles.hydrationText}>
          <Text style={[styles.hydrationName, { color: colors.text }]}>
            Hydration
            <Text style={[styles.hydrationModifier, { color: colors.mutedText }]}>
              {'  ·  '}FOUNDATION
            </Text>
          </Text>
          <Text style={[styles.hydrationCompass, { color: colors.mutedText }]}>
            Tap card to log a glass · {count * 8} oz so far
          </Text>
        </View>
        <View style={styles.hydrationStat}>
          <Text style={[styles.hydrationStatValue, { color: tint }]}>
            {count}/{target}
          </Text>
          <Text style={[styles.hydrationStatLabel, { color: colors.mutedText }]}>TODAY</Text>
          <Text style={[styles.hydrationStatBlock, { color: colors.mutedText }]}>
            {pct}% TARGET
          </Text>
        </View>
      </View>
      <View style={[styles.cardBarTrack, { backgroundColor: colors.cardAlt }]}>
        <View style={[styles.cardBarFill, { backgroundColor: tint, width: `${pct}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  barsStack: {
    gap: 14,
  },
  cardBarFill: {
    height: '100%',
  },
  cardBarTrack: {
    height: 3,
    width: '100%',
  },
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
  handHead: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  handHelper: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  handLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  handValue: {
    fontFamily: FONTS.diagnostic,
    fontSize: 34,
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  handView: {
    gap: 8,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  hydrationBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  hydrationBody: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  hydrationCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  hydrationCompass: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  hydrationModifier: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  hydrationName: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    lineHeight: 19,
  },
  hydrationStat: {
    alignItems: 'flex-end',
    gap: 1,
    minWidth: 64,
    paddingTop: 2,
  },
  hydrationStatBlock: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 1,
  },
  hydrationStatLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.6,
    marginTop: -1,
  },
  hydrationStatValue: {
    fontFamily: FONTS.diagnostic,
    fontSize: 32,
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  hydrationText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingTop: 3,
  },
  intro: {
    gap: 6,
    paddingTop: 4,
  },
  chipGrams: {
    fontFamily: FONTS.diagnostic,
    fontSize: 20,
    letterSpacing: 0.4,
    lineHeight: 20,
    minWidth: 38,
    textAlign: 'right',
  },
  chipLabel: {
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  chipPct: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 0.6,
    minWidth: 30,
    textAlign: 'right',
  },
  chipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  chipSwatch: {
    borderRadius: 3,
    height: 12,
    width: 12,
  },
  macroBar: {
    gap: 5,
  },
  mixChips: {
    flex: 1,
    gap: 7,
    paddingTop: 4,
  },
  mixHelper: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  mixPieWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mixRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 6,
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
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  macroMeta: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
  },
  macroTrack: {
    borderRadius: 999,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  macroUnit: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  macroValueDiag: {
    fontFamily: FONTS.diagnostic,
    fontSize: 28,
    letterSpacing: 0.4,
    lineHeight: 28,
  },
  macroValueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 4,
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
  precisionHelper: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: 2,
    paddingHorizontal: 4,
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
