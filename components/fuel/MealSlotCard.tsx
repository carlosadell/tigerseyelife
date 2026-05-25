import { Plus, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import { LoggedMeal, MealSlot, estimateCalories } from '../../lib/meals';

export type FuelPrecision = 'hand' | 'aware' | 'macro';

type MealSlotCardProps = {
  slot: MealSlot;
  label: string;
  hint: string;
  meals: LoggedMeal[];
  precision: FuelPrecision;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMealPress?: (meal: LoggedMeal) => void;
};

export function MealSlotCard({
  slot,
  label,
  hint,
  meals,
  precision,
  onAdd,
  onRemove,
  onMealPress,
}: MealSlotCardProps) {
  const colors = useThemeColors();
  const hasMeals = meals.length > 0;
  const slotCalories = meals.reduce((sum, m) => sum + estimateCalories(m.macros), 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardBody}>
        <View style={styles.head}>
          <View style={[styles.slotBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.slotBadgeText}>{slot}</Text>
          </View>
          <View style={styles.headText}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.hint, { color: colors.mutedText }]} numberOfLines={1}>
              {hint}
            </Text>
          </View>
          <View style={styles.headRight}>
            {hasMeals && precision !== 'hand' ? (
              <Text style={[styles.slotStat, { color: colors.accent }]}>{slotCalories}</Text>
            ) : null}
            {hasMeals && precision !== 'hand' ? (
              <Text style={[styles.slotStatLabel, { color: colors.mutedText }]}>CAL</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${label}`}
              onPress={onAdd}
              style={({ pressed }) => [
                styles.addBtn,
                { backgroundColor: colors.cardAlt, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                hasMeals && precision !== 'hand' ? { marginTop: 4 } : null,
              ]}
            >
              <Plus color={colors.accent} size={16} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>

        {hasMeals ? (
          <View style={styles.mealList}>
            {meals.map((meal) => {
              const cals = estimateCalories(meal.macros);
              const macroLine = buildMacroLine(meal, cals, precision);
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${meal.name} details`}
                  key={meal.id}
                  onPress={() => onMealPress?.(meal)}
                  style={({ pressed }) => [
                    styles.mealRow,
                    { borderTopColor: colors.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>
                      {meal.name}
                    </Text>
                    {macroLine ? (
                      <Text style={[styles.mealMeta, { color: colors.mutedText }]}>{macroLine}</Text>
                    ) : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${meal.name}`}
                    hitSlop={8}
                    onPress={(e) => {
                      e.stopPropagation();
                      onRemove(meal.id);
                    }}
                    style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.5 : 1 }]}
                  >
                    <X color={colors.mutedText} size={14} strokeWidth={2} />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={[styles.cardBarTrack, { backgroundColor: colors.cardAlt }]}>
        <View
          style={[
            styles.cardBarFill,
            { backgroundColor: colors.accent, width: hasMeals ? '100%' : '0%' },
          ]}
        />
      </View>
    </View>
  );
}

function buildMacroLine(meal: LoggedMeal, cals: number, precision: FuelPrecision): string | null {
  if (precision === 'hand') return null;
  if (precision === 'aware') return `${cals} cal · ${meal.macros.protein}g protein`;
  return `${cals} cal · P ${meal.macros.protein}g · F ${meal.macros.fat}g · C ${meal.macros.carb}g · Fi ${meal.macros.fiber}g`;
}

const styles = StyleSheet.create({
  addBtn: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardBarFill: {
    height: '100%',
  },
  cardBarTrack: {
    height: 3,
    width: '100%',
  },
  cardBody: {
    paddingBottom: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  head: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  headRight: {
    alignItems: 'flex-end',
    gap: 2,
    minWidth: 32,
  },
  headText: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  hint: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
  label: {
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  mealList: {
    marginTop: 12,
  },
  mealMeta: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 1,
  },
  mealName: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
  },
  mealRow: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
  },
  removeBtn: {
    padding: 4,
  },
  slotBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  slotBadgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: 0.6,
  },
  slotStat: {
    fontFamily: FONTS.diagnostic,
    fontSize: 24,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  slotStatLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.6,
    marginTop: -2,
  },
});
