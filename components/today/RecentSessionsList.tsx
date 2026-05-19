import { Text, View } from 'react-native';

import { COLORS, FONTS } from '../../lib/brand';
import { DiagnosticNumber } from '../brand/DiagnosticNumber';
import { HairlineDivider } from '../brand/HairlineDivider';

const sessions = [
  ['Push Day', '58M 0S', '2,183'],
  ['Pull Day', '47M 12S', '2,875'],
  ['Leg Day', '52M 30S', '3,573'],
] as const;

export function RecentSessionsList() {
  return (
    <View style={{ backgroundColor: COLORS.charcoal, borderRadius: 24, padding: 16 }}>
      {sessions.map(([name, duration, volume], index) => (
        <View key={name}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 12,
            }}
          >
            <View>
              <Text style={{ color: COLORS.bone, fontFamily: FONTS.sansMedium, fontSize: 15 }}>
                {name}
              </Text>
              <Text style={{ color: COLORS.steel, fontFamily: FONTS.sansMedium, fontSize: 11 }}>
                {duration}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <DiagnosticNumber size={28}>{volume}</DiagnosticNumber>
              <Text style={{ color: COLORS.steel, fontFamily: FONTS.sansMedium, fontSize: 11 }}>
                KG
              </Text>
            </View>
          </View>
          {index < sessions.length - 1 ? <HairlineDivider /> : null}
        </View>
      ))}
    </View>
  );
}
