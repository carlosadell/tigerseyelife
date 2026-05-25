import { Plus, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import { LoggedMeal, MealSlot, estimateCalories } from '../../lib/meals';

type MealSlotCardProps = {
  slot: MealSlot;
  label: string;
  hint: string;
  meals: LoggedMeal[];
  onAdd: () => void;
  onRemove: (id: string) => void;
};

export function MealSlotCard({ slot, label, hint, meals, onAdd, onRemove }: MealSlotCardProps) {
  const colors = useThemeColors();
  const hasMeals = meals.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <View style={[styles.slotBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.slotBadgeText}>{slot}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.hint, { color: colors.mutedText }]} numberOfLines={1}>
            {hint}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${label}`}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.cardAlt, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Plus color={colors.accent} size={16} strokeWidth={2.4} />
        </Pressable>
      </View>

      {hasMeals ? (
        <View style={styles.mealList}>
          {meals.map((meal) => {
            const cals = estimateCalories(meal.macros);
            return (
              <View
                key={meal.id}
                style={[styles.mealRow, { borderTopColor: colors.border }]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>
                    {meal.name}
                  </Text>
                  <Text style={[styles.mealMeta, { color: colors.mutedText }]}>
                    {cals} cal · P {meal.macros.protein}g · F {meal.macros.fat}g · C {meal.macros.carb}g · Fi {meal.macros.fiber}g
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${meal.name}`}
                  hitSlop={8}
                  onPress={() => onRemove(meal.id)}
                  style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.5 : 1 }]}
                >
                  <X color={colors.mutedText} size={14} strokeWidth={2} />
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
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
    padding: 14,
  },
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  hint: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  mealList: {
    marginTop: 10,
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
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  slotBadgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
