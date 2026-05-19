import { Text, TextProps } from 'react-native';

import { COLORS, FONTS } from '../../lib/brand';

type DiagnosticNumberProps = TextProps & {
  children: string | number;
  size?: number;
};

export function DiagnosticNumber({
  children,
  size = 56,
  style,
  ...props
}: DiagnosticNumberProps) {
  return (
    <Text
      {...props}
      style={[
        {
          color: COLORS.bone,
          fontFamily: FONTS.diagnostic,
          fontSize: size,
          lineHeight: size,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
