import { View } from 'react-native';

import { COLORS } from '../../lib/brand';

export function HairlineDivider() {
  return (
    <View
      style={{
        backgroundColor: COLORS.line,
        height: 1,
        width: '100%',
      }}
    />
  );
}
