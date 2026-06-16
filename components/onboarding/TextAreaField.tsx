// components/onboarding/TextAreaField.tsx
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  showCount?: boolean;
  numberOfLines?: number;
};

export function TextAreaField({
  value,
  onChange,
  placeholder,
  minHeight = 120,
  maxLength,
  showCount = true,
  numberOfLines = 6,
}: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityLabel={placeholder ?? 'Answer'}
        autoCorrect
        multiline
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={light.mutedText}
        style={[styles.input, { minHeight }]}
        value={value}
      />
      {showCount && maxLength ? (
        <Text style={styles.count}>
          {value.length} / {maxLength}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  input: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  wrap: {},
});
