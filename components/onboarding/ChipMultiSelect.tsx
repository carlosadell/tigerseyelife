// components/onboarding/ChipMultiSelect.tsx
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T[];
  onChange: (next: T[]) => void;
  otherValue: T | null;             // e.g., 'other' — when selected, reveal the text input
  otherText?: string;
  onOtherTextChange?: (v: string) => void;
};

export function ChipMultiSelect<T extends string>({
  options,
  value,
  onChange,
  otherValue,
  otherText,
  onOtherTextChange,
}: Props<T>) {
  const toggle = (v: T) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  const otherSelected = otherValue !== null && value.includes(otherValue);

  return (
    <View style={styles.stack}>
      <View style={styles.row}>
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={opt.value}
              onPress={() => toggle(opt.value)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {otherSelected && onOtherTextChange ? (
        <TextInput
          accessibilityLabel="Other obstacle, please describe"
          autoCorrect
          onChangeText={onOtherTextChange}
          placeholder="What else?"
          placeholderTextColor={light.mutedText}
          style={styles.otherInput}
          value={otherText ?? ''}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  chipText: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  chipTextActive: {
    color: light.accent,
  },
  otherInput: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stack: {
    gap: 14,
  },
});
