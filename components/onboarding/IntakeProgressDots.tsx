// components/onboarding/IntakeProgressDots.tsx
import { StyleSheet, View } from 'react-native';

import { COLORS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  total: number;
  current: number; // 0-indexed
};

export function IntakeProgressDots({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'future';
        return (
          <View
            key={i}
            style={[
              styles.dot,
              state === 'active' && styles.dotActive,
              state === 'done' && styles.dotDone,
              state === 'future' && styles.dotFuture,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: COLORS.tangerine,
    width: 18,
  },
  dotDone: {
    backgroundColor: light.accent,
  },
  dotFuture: {
    backgroundColor: light.border,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
});
