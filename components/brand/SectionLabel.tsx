import { Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type SectionLabelProps = {
  label: string;
  accessory?: string;
  centered?: boolean;
};

export function SectionLabel({ label, accessory, centered }: SectionLabelProps) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: centered ? 'center' : 'space-between',
      }}
    >
      <Text
        style={{
          color: colors.mutedText,
          fontFamily: FONTS.sansMedium,
          fontSize: 11,
          letterSpacing: 1.65,
          textTransform: 'uppercase',
        }}
      >
        [ {label} ]
      </Text>
      {accessory ? (
        <Text
          style={{
            color: colors.mutedText,
            fontFamily: FONTS.sansMedium,
            fontSize: 11,
            letterSpacing: 1.65,
            opacity: 0.72,
            textTransform: 'uppercase',
          }}
        >
          [ {accessory} ]
        </Text>
      ) : null}
    </View>
  );
}
