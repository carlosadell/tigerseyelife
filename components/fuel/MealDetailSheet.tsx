import { Trash2, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MacroPie } from './MacroPie';
import { useTheme, useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, textTintOf } from '../../lib/brand';
import { LoggedMeal, MEAL_SLOTS, estimateCalories } from '../../lib/meals';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.78);

const PIE_SIZE = 168;

type MealDetailSheetProps = {
  visible: boolean;
  meal: LoggedMeal | null;
  onClose: () => void;
  onRemove: (id: string) => void;
};

export function MealDetailSheet({ visible, meal, onClose, onRemove }: MealDetailSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const slotMeta = useMemo(
    () => (meal ? MEAL_SLOTS.find((s) => s.id === meal.slot) : null),
    [meal],
  );

  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_HEIGHT);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          duration: 240,
          easing: Easing.out(Easing.cubic),
          toValue: 0.55,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [backdropOpacity, translateY, visible]);

  const close = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
        toValue: SHEET_HEIGHT,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  if (!meal) {
    return (
      <Modal animationType="none" onRequestClose={close} statusBarTranslucent transparent visible={visible}>
        <View />
      </Modal>
    );
  }

  const cals = estimateCalories(meal.macros);
  const proteinCal = meal.macros.protein * 4;
  const fatCal = meal.macros.fat * 9;
  const carbCal = meal.macros.carb * 4;
  const macroCalTotal = Math.max(1, proteinCal + fatCal + carbCal);
  const pctProtein = Math.round((proteinCal / macroCalTotal) * 100);
  const pctFat = Math.round((fatCal / macroCalTotal) * 100);
  const pctCarb = Math.round((carbCal / macroCalTotal) * 100);

  return (
    <Modal animationType="none" onRequestClose={close} statusBarTranslucent transparent visible={visible}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents={visible ? 'auto' : 'none'}>
          <Pressable onPress={close} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              height: SHEET_HEIGHT,
              paddingBottom: insets.bottom,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.accent }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: colors.accent }]}>
                {slotMeta ? slotMeta.label.toUpperCase() : 'MEAL'} · {meal.source === 'library' ? 'FROM LIBRARY' : 'CUSTOM'}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>{meal.name}</Text>
            </View>
            <Pressable hitSlop={10} onPress={close} style={styles.closeBtn}>
              <X color={colors.mutedText} size={20} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollPad}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.pieWrap, { backgroundColor: colors.cardAlt }]}>
              <MacroPie protein={meal.macros.protein} fat={meal.macros.fat} carb={meal.macros.carb} size={PIE_SIZE} />
              <View style={styles.pieCenter} pointerEvents="none">
                <Text style={[styles.pieValue, { color: colors.text }]}>{cals}</Text>
                <Text style={[styles.pieLabel, { color: colors.mutedText }]}>CAL</Text>
              </View>
            </View>

            <View style={styles.legend}>
              <LegendRow
                color={COLORS.deepGreen}
                label="Protein"
                pct={pctProtein}
                grams={meal.macros.protein}
              />
              <LegendRow
                color={COLORS.electricYellow}
                label="Carbs"
                pct={pctCarb}
                grams={meal.macros.carb}
              />
              <LegendRow
                color={COLORS.tigerGold}
                label="Fat"
                pct={pctFat}
                grams={meal.macros.fat}
              />
              {meal.macros.fiber > 0 ? (
                <LegendRow
                  color={COLORS.evidenceBlue}
                  label="Fiber"
                  pct={null}
                  grams={meal.macros.fiber}
                />
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onRemove(meal.id);
                close();
              }}
              style={({ pressed }) => [
                styles.removeBtn,
                { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Trash2 color={colors.mutedText} size={15} strokeWidth={2} />
              <Text style={[styles.removeText, { color: colors.mutedText }]}>Remove meal</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function LegendRow({
  color,
  label,
  pct,
  grams,
}: {
  color: string;
  label: string;
  pct: number | null;
  grams: number;
}) {
  const colors = useThemeColors();
  const { mode } = useTheme();
  const gramsColor = textTintOf(color, mode);
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.legendValues}>
        {pct !== null ? (
          <Text style={[styles.legendPct, { color: colors.mutedText }]}>{pct}% cal</Text>
        ) : null}
        <Text style={[styles.legendGrams, { color: gramsColor }]}>{grams}g</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  closeBtn: {
    padding: 4,
  },
  handle: {
    borderRadius: 999,
    height: 4,
    opacity: 0.5,
    width: 42,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 8,
  },
  header: {
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  legend: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  legendGrams: {
    fontFamily: FONTS.diagnostic,
    fontSize: 22,
    letterSpacing: 0.4,
    lineHeight: 22,
  },
  legendLabel: {
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
  },
  legendPct: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  legendSwatch: {
    borderRadius: 4,
    height: 14,
    width: 14,
  },
  legendValues: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  pieCenter: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pieLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.6,
    marginTop: -2,
  },
  pieValue: {
    fontFamily: FONTS.diagnostic,
    fontSize: 42,
    letterSpacing: 0.5,
    lineHeight: 42,
  },
  pieWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    height: PIE_SIZE + 20,
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
    width: PIE_SIZE + 20,
  },
  removeBtn: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 28,
    minHeight: 48,
  },
  removeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrollPad: {
    paddingBottom: 24,
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 21,
    letterSpacing: -0.3,
    lineHeight: 26,
    marginTop: 2,
  },
});
