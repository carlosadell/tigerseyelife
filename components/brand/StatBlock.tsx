import { Text, View } from 'react-native';

import { COLORS, FONTS } from '../../lib/brand';
import { DiagnosticNumber } from './DiagnosticNumber';

type StatBlockProps = {
  label: string;
  value: string | number;
  unit?: string;
};

export function StatBlock({ label, value, unit }: StatBlockProps) {
  return (
    <View>
      <Text
        style={{
          color: COLORS.steel,
          fontFamily: FONTS.sansMedium,
          fontSize: 11,
          letterSpacing: 1.65,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8 }}>
        <DiagnosticNumber>{value}</DiagnosticNumber>
        {unit ? (
          <Text
            style={{
              color: COLORS.steel,
              fontFamily: FONTS.sansMedium,
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
