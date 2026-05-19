import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { COLORS, FONTS } from '../../lib/brand';
import { DiagnosticNumber } from '../brand/DiagnosticNumber';

type WeeklyVolumeCardProps = {
  style?: StyleProp<ViewStyle>;
};

export function WeeklyVolumeCard({ style }: WeeklyVolumeCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.charcoal,
          borderRadius: 24,
          flex: 1.4,
          minHeight: 140,
          minWidth: 0,
          padding: 20,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: COLORS.steel,
          fontFamily: FONTS.sansMedium,
          fontSize: 11,
          letterSpacing: 1.65,
        }}
      >
        WEEKLY VOLUME
      </Text>
      <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8, marginTop: 18 }}>
        <DiagnosticNumber>5,756</DiagnosticNumber>
        <Text
          style={{
            color: COLORS.steel,
            fontFamily: FONTS.sansMedium,
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          KG
        </Text>
      </View>
    </View>
  );
}
