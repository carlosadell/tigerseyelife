import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import { EyeMark } from './EyeMark';

/**
 * Brand wordmark lockup — mark stacked above "TIGERSEYE Life".
 *
 * The "Life" script is rendered with Georgia italic as a temporary
 * stand-in for the brand script font (not yet loaded into the app).
 * To match the brand exactly: drop the script font file into
 * assets/fonts/, register it in RootLayout via `useFonts`, and swap
 * `fontFamily` below.
 */
type BrandLockupProps = {
  width?: number;
  style?: StyleProp<ViewStyle>;
  layout?: 'stacked' | 'horizontal';
};

export function BrandLockup({ width = 180, style, layout = 'stacked' }: BrandLockupProps) {
  const colors = useThemeColors();

  if (layout === 'horizontal') {
    const markWidth = Math.max(28, width * 0.18);
    return (
      <View
        style={[
          {
            alignItems: 'center',
            flexDirection: 'row',
            gap: width * 0.04,
            width,
          },
          style,
        ]}
      >
        <EyeMark color={colors.accent} size={markWidth} />
        <View style={{ alignItems: 'baseline', flex: 1, flexDirection: 'row' }}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.accent,
              fontFamily: FONTS.sansBold,
              fontSize: width * 0.078,
              letterSpacing: width * 0.005,
            }}
          >
            TIGERSEYE
          </Text>
          <Text
            style={{
              color: colors.accent,
              fontFamily: 'Georgia',
              fontSize: width * 0.085,
              fontStyle: 'italic',
              marginLeft: width * 0.012,
            }}
          >
            Life
          </Text>
        </View>
      </View>
    );
  }

  const markWidth = Math.max(40, width * 0.34);
  return (
    <View
      style={[
        {
          alignItems: 'center',
          gap: width * 0.05,
          width,
        },
        style,
      ]}
    >
      <EyeMark color={colors.accent} size={markWidth} strokeWidth={2} />
      <View style={{ alignItems: 'baseline', flexDirection: 'row' }}>
        <Text
          style={{
            color: colors.accent,
            fontFamily: FONTS.sansBold,
            fontSize: width * 0.13,
            letterSpacing: width * 0.008,
          }}
        >
          TIGERSEYE
        </Text>
        <Text
          style={{
            color: colors.accent,
            fontFamily: 'Georgia',
            fontSize: width * 0.16,
            fontStyle: 'italic',
            marginLeft: width * 0.018,
          }}
        >
          Life
        </Text>
      </View>
    </View>
  );
}
