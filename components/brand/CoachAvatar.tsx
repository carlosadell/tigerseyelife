import { View } from 'react-native';

import { COLORS } from '../../lib/brand';
import { EyeMark } from './EyeMark';

type CoachAvatarProps = {
  size?: number;
};

export function CoachAvatar({ size = 64 }: CoachAvatarProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: COLORS.charcoal2,
        borderColor: COLORS.tigerGold,
        borderRadius: size / 2,
        borderWidth: 2,
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      <EyeMark color={COLORS.tigerGold} size={size * 0.56} strokeWidth={2.2} />
    </View>
  );
}
