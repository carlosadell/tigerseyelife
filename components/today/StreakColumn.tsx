import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { COLORS, FONTS } from '../../lib/brand';
import { HairlineDivider } from '../brand/HairlineDivider';

const rows = [
  ['STREAK', '2 WEEKS'],
  ['THIS WEEK', '2 SESSIONS'],
  ['NEXT ROUTINE', 'Push Day'],
] as const;

type StreakColumnProps = {
  style?: StyleProp<ViewStyle>;
};

export function StreakColumn({ style }: StreakColumnProps) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.charcoal,
          borderRadius: 24,
          flex: 1,
          justifyContent: 'center',
          minWidth: 0,
          padding: 16,
        },
        style,
      ]}
    >
      {rows.map(([label, value], index) => (
        <View key={label}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 10,
              minHeight: 34,
            }}
          >
            <Text
              style={{
                color: COLORS.steel,
                fontFamily: FONTS.sansMedium,
                fontSize: 10,
                flex: 1,
                letterSpacing: 1.2,
                minWidth: 0,
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                color: COLORS.bone,
                fontFamily: FONTS.sansMedium,
                fontSize: 13,
                lineHeight: 17,
                maxWidth: 82,
                textAlign: 'right',
              }}
            >
              {value}
            </Text>
          </View>
          {index < rows.length - 1 ? <HairlineDivider /> : null}
        </View>
      ))}
    </View>
  );
}
