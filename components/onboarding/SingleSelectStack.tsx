// components/onboarding/SingleSelectStack.tsx
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T | undefined;
  onChange: (v: T) => void;
  otherValue?: T;
  otherText?: string;
  onOtherTextChange?: (v: string) => void;
};

export function SingleSelectStack<T extends string>({
  options,
  value,
  onChange,
  otherValue,
  otherText,
  onOtherTextChange,
}: Props<T>) {
  const otherSelected = otherValue !== undefined && value === otherValue;

  return (
    <View style={styles.stack}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={[styles.row, active && styles.rowActive]}>
              <View style={styles.body}>
                <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
                {opt.description ? (
                  <Text style={styles.description}>{opt.description}</Text>
                ) : null}
              </View>
              {active ? (
                <Check color={COLORS.tangerine} size={20} strokeWidth={2.4} />
              ) : null}
            </View>
          </Pressable>
        );
      })}

      {otherSelected && onOtherTextChange ? (
        <TextInput
          accessibilityLabel="Please describe"
          autoCorrect
          onChangeText={onOtherTextChange}
          placeholder="Tell us more"
          placeholderTextColor={light.mutedText}
          style={styles.otherInput}
          value={otherText ?? ''}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: 4 },
  description: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  labelActive: {
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
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 14,
  },
  rowActive: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  stack: {},
});
