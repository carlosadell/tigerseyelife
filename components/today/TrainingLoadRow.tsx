import { Text, View } from 'react-native';

import { COLORS, FONTS } from '../../lib/brand';

const loads = [
  { value: '2875', label: 'S1' },
  { value: '3573', label: 'S2' },
  { value: '2183', label: 'S3' },
];

export function TrainingLoadRow() {
  return (
    <View
      style={{
        backgroundColor: COLORS.charcoal,
        borderRadius: 24,
        flexDirection: 'row',
        gap: 8,
        padding: 16,
      }}
    >
      {loads.map((load) => (
        <View key={load.label} style={{ alignItems: 'center', flex: 1, gap: 8 }}>
          <Text style={{ color: COLORS.steel, fontFamily: FONTS.sansMedium, fontSize: 14 }}>
            {load.value}
          </Text>
          <View
            style={{
              backgroundColor: COLORS.bone,
              borderRadius: 8,
              height: 80,
              width: '100%',
            }}
          />
          <Text
            style={{
              color: COLORS.steel,
              fontFamily: FONTS.sansMedium,
              fontSize: 11,
              letterSpacing: 1.65,
            }}
          >
            {load.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
