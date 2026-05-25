import { Trash2, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSavedMeals } from '../../hooks/useSavedMeals';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import {
  LibraryMeal,
  LoggedMeal,
  MEAL_SLOTS,
  MealSlot,
  SavedMeal,
  ZERO_MACROS,
  estimateCalories,
} from '../../lib/meals';
import { mealLibrarySeed } from '../../lib/mealLibrarySeed';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.82);

type AddMealSheetProps = {
  visible: boolean;
  slot: MealSlot | null;
  onClose: () => void;
  onLog: (meal: Omit<LoggedMeal, 'id' | 'logged_at'>) => void | Promise<void>;
};

type Tab = 'library' | 'favorites' | 'custom';

export function AddMealSheet({ visible, slot, onClose, onLog }: AddMealSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { saved: favorites, removeSaved } = useSavedMeals();
  const [tab, setTab] = useState<Tab>('library');
  const [customName, setCustomName] = useState('');
  const [customMacros, setCustomMacros] = useState<{ [k in keyof typeof ZERO_MACROS]: string }>({
    protein: '',
    fat: '',
    carb: '',
    fiber: '',
  });
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const slotMeta = useMemo(() => MEAL_SLOTS.find((s) => s.id === slot), [slot]);

  useEffect(() => {
    if (visible) {
      setTab('library');
      setCustomName('');
      setCustomMacros({ protein: '', fat: '', carb: '', fiber: '' });
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

  const logFromLibrary = async (meal: LibraryMeal) => {
    if (!slot) return;
    await onLog({
      slot,
      name: meal.name,
      macros: meal.macros,
      source: 'library',
      source_id: meal.id,
    });
    close();
  };

  const logFromFavorite = async (fav: SavedMeal) => {
    if (!slot) return;
    await onLog({
      slot,
      name: fav.name,
      macros: fav.macros,
      source: fav.origin,
      source_id: fav.origin_id,
    });
    close();
  };

  const customMacrosNumeric = {
    protein: Number(customMacros.protein) || 0,
    fat: Number(customMacros.fat) || 0,
    carb: Number(customMacros.carb) || 0,
    fiber: Number(customMacros.fiber) || 0,
  };
  const customCalories = estimateCalories(customMacrosNumeric);
  const canSaveCustom = customName.trim().length > 0;

  const saveCustom = async () => {
    if (!slot || !canSaveCustom) return;
    await onLog({
      slot,
      name: customName.trim(),
      macros: customMacrosNumeric,
      source: 'custom',
    });
    close();
  };

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
              <Text style={[styles.kicker, { color: colors.accent }]}>ADD MEAL</Text>
              <Text style={[styles.title, { color: colors.text }]}>
                {slotMeta ? slotMeta.label : 'Meal'}
              </Text>
              <Text style={[styles.body, { color: colors.mutedText }]}>
                {slotMeta?.hint ?? 'Pick from the library or build your own.'}
              </Text>
            </View>
            <Pressable hitSlop={10} onPress={close} style={styles.closeBtn}>
              <X color={colors.mutedText} size={20} />
            </Pressable>
          </View>

          <View style={[styles.tabRow, { backgroundColor: colors.cardAlt }]}>
            <TabPill active={tab === 'library'} onPress={() => setTab('library')} label="Library" />
            <TabPill
              active={tab === 'favorites'}
              onPress={() => setTab('favorites')}
              label={favorites.length > 0 ? `Favorites · ${favorites.length}` : 'Favorites'}
            />
            <TabPill active={tab === 'custom'} onPress={() => setTab('custom')} label="Custom" />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
            style={styles.body2}
          >
            {tab === 'library' ? (
              <ScrollView
                contentContainerStyle={styles.scrollPad}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {mealLibrarySeed.map((meal) => {
                  const cals = estimateCalories(meal.macros);
                  return (
                    <Pressable
                      key={meal.id}
                      onPress={() => logFromLibrary(meal)}
                      style={({ pressed }) => [
                        styles.libRow,
                        {
                          backgroundColor: colors.cardAlt,
                          borderColor: colors.border,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.libName, { color: colors.text }]}>{meal.name}</Text>
                        <Text style={[styles.libDesc, { color: colors.mutedText }]} numberOfLines={1}>
                          {meal.description}
                        </Text>
                        <Text style={[styles.libMacros, { color: colors.mutedText }]}>
                          {cals} cal · P {meal.macros.protein}g · F {meal.macros.fat}g · C {meal.macros.carb}g · Fi {meal.macros.fiber}g
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : tab === 'favorites' ? (
              <ScrollView
                contentContainerStyle={styles.scrollPad}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {favorites.length === 0 ? (
                  <View
                    style={[
                      styles.emptyCard,
                      { backgroundColor: colors.cardAlt, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                      No favorites yet
                    </Text>
                    <Text style={[styles.emptyBody, { color: colors.mutedText }]}>
                      Tap any logged meal in your Fuel slots and choose "Save as favorite" to keep
                      it here for one-tap re-log.
                    </Text>
                  </View>
                ) : (
                  favorites.map((fav) => {
                    const cals = estimateCalories(fav.macros);
                    return (
                      <View
                        key={fav.id}
                        style={[
                          styles.libRow,
                          { backgroundColor: colors.cardAlt, borderColor: colors.border },
                        ]}
                      >
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => logFromFavorite(fav)}
                          style={({ pressed }) => [
                            { flex: 1, minWidth: 0, opacity: pressed ? 0.7 : 1 },
                          ]}
                        >
                          <Text style={[styles.libName, { color: colors.text }]}>{fav.name}</Text>
                          <Text style={[styles.libMacros, { color: colors.mutedText, marginTop: 4 }]}>
                            {cals} cal · P {fav.macros.protein}g · F {fav.macros.fat}g · C {fav.macros.carb}g · Fi {fav.macros.fiber}g
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${fav.name} from favorites`}
                          hitSlop={8}
                          onPress={() => removeSaved(fav.id)}
                          style={({ pressed }) => [styles.favRemove, { opacity: pressed ? 0.5 : 1 }]}
                        >
                          <Trash2 color={colors.mutedText} size={14} strokeWidth={2} />
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            ) : (
              <ScrollView
                contentContainerStyle={styles.scrollPad}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.formLabel, { color: colors.mutedText }]}>MEAL NAME</Text>
                <TextInput
                  onChangeText={setCustomName}
                  placeholder="e.g. Chicken stir fry"
                  placeholderTextColor={colors.mutedText}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.cardAlt,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={customName}
                />

                <Text style={[styles.formLabel, { color: colors.mutedText, marginTop: 16 }]}>MACROS (GRAMS)</Text>
                <View style={styles.macroGrid}>
                  <MacroField
                    label="Protein"
                    value={customMacros.protein}
                    onChange={(v) => setCustomMacros((c) => ({ ...c, protein: v }))}
                  />
                  <MacroField
                    label="Fat"
                    value={customMacros.fat}
                    onChange={(v) => setCustomMacros((c) => ({ ...c, fat: v }))}
                  />
                  <MacroField
                    label="Carbs"
                    value={customMacros.carb}
                    onChange={(v) => setCustomMacros((c) => ({ ...c, carb: v }))}
                  />
                  <MacroField
                    label="Fiber"
                    value={customMacros.fiber}
                    onChange={(v) => setCustomMacros((c) => ({ ...c, fiber: v }))}
                  />
                </View>

                <Text style={[styles.estCal, { color: colors.mutedText }]}>
                  Estimated {customCalories} calories
                </Text>

                <Pressable
                  accessibilityRole="button"
                  disabled={!canSaveCustom}
                  onPress={saveCustom}
                  style={({ pressed }) => [
                    styles.saveBtn,
                    {
                      backgroundColor: canSaveCustom ? colors.accent : colors.cardAlt,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.saveText,
                      { color: canSaveCustom ? colors.inverseText : colors.mutedText },
                    ]}
                  >
                    Log meal
                  </Text>
                </Pressable>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function TabPill({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.tabPill,
        {
          backgroundColor: active ? colors.card : 'transparent',
          shadowColor: active ? '#000' : 'transparent',
        },
      ]}
    >
      <Text style={[styles.tabPillText, { color: active ? colors.text : colors.mutedText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MacroField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.macroField}>
      <Text style={[styles.macroFieldLabel, { color: colors.mutedText }]}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={onChange}
        placeholder="0"
        placeholderTextColor={colors.mutedText}
        style={[
          styles.macroFieldInput,
          {
            backgroundColor: colors.cardAlt,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
      />
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
  body: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  body2: {
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  estCal: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  formInput: {
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: FONTS.sans,
    fontSize: 15,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  formLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
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
  libDesc: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 1,
  },
  libMacros: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 6,
  },
  libName: {
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
  },
  libRow: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    padding: 12,
  },
  emptyBody: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
  },
  emptyTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    textAlign: 'center',
  },
  favRemove: {
    padding: 6,
  },
  macroField: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 4,
  },
  macroFieldInput: {
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'center',
  },
  macroFieldLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  saveBtn: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 50,
  },
  saveText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  scrollPad: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  tabPill: {
    alignItems: 'center',
    borderRadius: 9,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 9,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  tabPillText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  tabRow: {
    borderRadius: 11,
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 3,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 19,
    letterSpacing: -0.3,
    marginTop: 2,
  },
});
