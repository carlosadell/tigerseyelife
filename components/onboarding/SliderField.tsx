// components/onboarding/SliderField.tsx
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helperLow?: string;
  helperHigh?: string;
};

/**
 * 0–10 slider with a big value badge above the track. The 0..10 default
 * matches the §3.2 importance_level + confidence_level fields.
 */
export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  helperLow,
  helperHigh,
}: Props) {
  const displayValue = value ?? Math.floor((min + max) / 2);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{value === undefined ? '…' : String(value)}</Text>
        </View>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={displayValue}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={COLORS.tangerine}
        maximumTrackTintColor={light.border}
        thumbTintColor={light.accent}
      />
      {(helperLow || helperHigh) ? (
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>{helperLow ?? ''}</Text>
          <Text style={styles.helperText}>{helperHigh ?? ''}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  helperText: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
  },
  label: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  wrap: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
});
