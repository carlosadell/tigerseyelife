import { format } from 'date-fns';
import { ReactNode } from 'react';
import { StyleProp, Text, useWindowDimensions, View, ViewStyle } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import { getGreeting } from '../../lib/greetings';

type GreetingHeaderProps = {
  accessory?: ReactNode;
  firstName?: string | null;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
};

export function GreetingHeader({ accessory, firstName, style, subtitle }: GreetingHeaderProps) {
  const { width } = useWindowDimensions();
  const titleSize = width < 390 ? 26 : 28;
  const colors = useThemeColors();

  return (
    <View style={[{ gap: 8, minWidth: 0 }, style]}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: colors.mutedText,
            fontFamily: FONTS.sansMedium,
            fontSize: 11,
            letterSpacing: 1.32,
            textTransform: 'uppercase',
          }}
        >
          {format(new Date(), 'MMM d, yyyy')}
        </Text>
        {accessory}
      </View>
      <Text
        style={{
          color: colors.text,
          fontFamily: FONTS.sansBold,
          fontSize: titleSize,
          letterSpacing: 0,
          lineHeight: titleSize + 6,
        }}
      >
        {getGreeting(firstName)}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: colors.mutedText,
            fontFamily: FONTS.sansMedium,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
