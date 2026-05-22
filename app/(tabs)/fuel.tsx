import { Check, Droplet, Leaf, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfile } from '../../hooks/useProfile';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';

type MealSlot = 'A' | 'B' | 'C';
type Component = 'protein' | 'plant' | 'carb';

type MealState = {
  slot: MealSlot;
  label: string;
  hint: string;
  protein: boolean;
  plant: boolean;
  carb: boolean;
};

const INITIAL_MEALS: MealState[] = [
  { slot: 'A', label: 'Morning', hint: 'Eggs + greens + sourdough', protein: true, plant: true, carb: true },
  { slot: 'B', label: 'Midday', hint: 'Chicken bowl + roasted veg', protein: true, plant: true, carb: false },
  { slot: 'C', label: 'Evening', hint: 'Plan tonight', protein: false, plant: false, carb: false },
];

const PRECISION_LEVELS = [
  { id: 'hand', label: 'Hand portions' },
  { id: 'aware', label: 'Calorie aware' },
  { id: 'macro', label: 'Full macros' },
];

export default function FuelScreen() {
  const colors = useThemeColors();
  const { profile } = useProfile();
  const [meals, setMeals] = useState<MealState[]>(INITIAL_MEALS);
  const [water, setWater] = useState(8);
  const [precision, setPrecision] = useState('hand');

  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        protein: acc.protein + (meal.protein ? 1 : 0),
        plant: acc.plant + (meal.plant ? 1 : 0),
        carb: acc.carb + (meal.carb ? 1 : 0),
      }),
      { protein: 0, plant: 0, carb: 0 },
    );
  }, [meals]);

  const toggleComponent = (slot: MealSlot, component: Component) => {
    setMeals((current) =>
      current.map((meal) =>
        meal.slot === slot ? { ...meal, [component]: !meal[component] } : meal,
      ),
    );
  };

  const addWater = () => setWater((w) => Math.min(14, w + 1));
  const removeWater = () => setWater((w) => Math.max(0, w - 1));

  const greeting = profile.firstName ? `Hey ${profile.firstName.split(' ')[0]}.` : 'Hey there.';
  const proteinOnTrack = totals.protein >= 2;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.headerKicker, { color: colors.accent }]}>FUEL</Text>
            <Text style={[styles.title, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Lean into the simple version today — protein, plants, smart carbs. Stop at 80% full.
            </Text>
          </View>

          <View style={[styles.snapshot, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.rail, { backgroundColor: colors.accent }]} />
            <View style={styles.snapshotBody}>
              <Text style={[styles.cardKicker, { color: colors.accent }]}>NUTRITION SNAPSHOT</Text>
              <View style={styles.snapshotGrid}>
                <SnapshotStat
                  label="Protein"
                  value={`${totals.protein}/3`}
                  state={proteinOnTrack ? 'good' : 'pending'}
                />
                <SnapshotStat
                  label="Plants"
                  value={`${totals.plant}/3`}
                  state={totals.plant >= 2 ? 'good' : 'pending'}
                />
                <SnapshotStat
                  label="Carbs"
                  value={`${totals.carb}/3`}
                  state={totals.carb >= 1 ? 'good' : 'pending'}
                />
                <SnapshotStat
                  label="Water"
                  value={`${water * 8} oz`}
                  state={water >= 8 ? 'good' : 'pending'}
                />
              </View>
            </View>
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>ABC POWER MEALS · TODAY</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedText }]}>
              Each meal = Protein · Plant · Smart Carb
            </Text>
          </View>

          {meals.map((meal) => (
            <MealCard key={meal.slot} meal={meal} onToggle={toggleComponent} />
          ))}

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>HYDRATION</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedText }]}>
              {water}/14 glasses · {water * 8} oz
            </Text>
          </View>

          <View style={[styles.hydration, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.hydrationGrid}>
              {Array.from({ length: 14 }).map((_, index) => {
                const filled = index < water;
                return (
                  <Pressable
                    key={index}
                    hitSlop={4}
                    onPress={() => setWater(index + 1)}
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
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.hydrationActions}>
              <Pressable
                onPress={removeWater}
                style={[styles.hydrationButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.hydrationButtonText, { color: colors.mutedText }]}>−</Text>
              </Pressable>
              <Pressable
                onPress={addWater}
                style={[
                  styles.hydrationButton,
                  { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <Plus color={colors.inverseText} size={16} strokeWidth={2.6} />
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>PRECISION LEVEL</Text>
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

          <View style={[styles.deferred, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Leaf color={colors.accent} size={20} strokeWidth={1.8} />
            <View style={styles.deferredBody}>
              <Text style={[styles.deferredTitle, { color: colors.text }]}>
                Full meal builder · macro tracker · saved meals
              </Text>
              <Text style={[styles.deferredCopy, { color: colors.mutedText }]}>
                Coming in Round 4. The simple version (this screen) stays as the default for members
                who want food to be light-touch.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SnapshotStat({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: 'good' | 'pending';
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.snapshotItem}>
      <Text style={[styles.snapshotLabel, { color: colors.mutedText }]}>{label}</Text>
      <View style={styles.snapshotValueRow}>
        <Text
          style={[
            styles.snapshotValue,
            { color: state === 'good' ? colors.text : colors.mutedText },
          ]}
        >
          {value}
        </Text>
        <View
          style={[
            styles.snapshotDot,
            {
              backgroundColor: state === 'good' ? colors.success : colors.mutedText,
              opacity: state === 'good' ? 1 : 0.4,
            },
          ]}
        />
      </View>
    </View>
  );
}

function MealCard({
  meal,
  onToggle,
}: {
  meal: MealState;
  onToggle: (slot: MealSlot, component: Component) => void;
}) {
  const colors = useThemeColors();
  const complete = meal.protein && meal.plant && meal.carb;

  return (
    <View style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.mealHead}>
        <View style={styles.mealHeadLeft}>
          <View style={[styles.mealLetter, { backgroundColor: colors.accent }]}>
            <Text style={styles.mealLetterText}>{meal.slot}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.mealLabel, { color: colors.text }]}>{meal.label}</Text>
            <Text style={[styles.mealHint, { color: colors.mutedText }]} numberOfLines={1}>
              {meal.hint}
            </Text>
          </View>
        </View>
        {complete ? (
          <View style={[styles.completeBadge, { borderColor: colors.success }]}>
            <Check color={colors.success} size={14} strokeWidth={2.6} />
          </View>
        ) : null}
      </View>
      <View style={styles.componentRow}>
        <ComponentToggle
          label="Protein"
          active={meal.protein}
          onPress={() => onToggle(meal.slot, 'protein')}
        />
        <ComponentToggle
          label="Plant"
          active={meal.plant}
          onPress={() => onToggle(meal.slot, 'plant')}
        />
        <ComponentToggle
          label="Smart carb"
          active={meal.carb}
          onPress={() => onToggle(meal.slot, 'carb')}
        />
      </View>
    </View>
  );
}

function ComponentToggle({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.componentChip,
        {
          backgroundColor: active ? colors.action : 'transparent',
          borderColor: active ? colors.action : colors.border,
        },
      ]}
    >
      {active ? (
        <Check color="#FFFFFF" size={12} strokeWidth={3} />
      ) : (
        <View style={[styles.componentEmpty, { borderColor: colors.mutedText }]} />
      )}
      <Text style={[styles.componentLabel, { color: active ? '#FFFFFF' : colors.mutedText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  completeBadge: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.4,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  componentChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 8,
  },
  componentEmpty: {
    borderRadius: 6,
    borderWidth: 1,
    height: 10,
    width: 10,
  },
  componentLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  componentRow: {
    flexDirection: 'row',
    gap: 6,
  },
  content: {
    gap: 14,
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  deferred: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    padding: 14,
  },
  deferredBody: {
    flex: 1,
    gap: 4,
  },
  deferredCopy: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  deferredTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    lineHeight: 18,
  },
  dropCell: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexBasis: '12.6%',
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
  hydrationActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  hydrationButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  hydrationButtonText: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    lineHeight: 18,
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
  mealCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  mealHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  mealHeadLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  mealHint: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  mealLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    lineHeight: 19,
  },
  mealLetter: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  mealLetterText: {
    color: COLORS.onyx,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.4,
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
  snapshotDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  snapshotItem: {
    flexBasis: '46%',
    gap: 2,
  },
  snapshotLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  snapshotValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  snapshotValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
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
