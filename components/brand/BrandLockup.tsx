import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import { EyeMark } from './EyeMark';

type BrandLockupProps = {
  width?: number;
  style?: StyleProp<ViewStyle>;
};

export function BrandLockup({ width = 180, style }: BrandLockupProps) {
  const colors = useThemeColors();
  const markSize = Math.max(24, width * 0.14);

  return (
    <View
      style={[
        {
          alignItems: 'center',
          flexDirection: 'row',
          gap: width * 0.055,
          width,
        },
        style,
      ]}
    >
      <EyeMark color={colors.accent} size={markSize} />
      <Text
        numberOfLines={1}
        style={{
          color: colors.accent,
          flex: 1,
          fontFamily: FONTS.sansBold,
          fontSize: width * 0.068,
          letterSpacing: width * 0.014,
        }}
      >
        TIGERS EYE LIFE
      </Text>
    </View>
  );
}
