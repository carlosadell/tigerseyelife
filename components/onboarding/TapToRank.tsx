// components/onboarding/TapToRank.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Item = {
  value: string;
  label: string;
};

type Props = {
  items: Item[];
  ranking: string[]; // ordered, length <= maxRanks
  onChange: (next: string[]) => void;
  maxRanks?: number; // default 2
};

/**
 * Tap a row to cycle through ranks: 1st → 2nd → unset. Reliable on RN
 * new arch; avoids drag-rank library flakiness.
 */
export function TapToRank({ items, ranking, onChange, maxRanks = 2 }: Props) {
  const handlePress = (value: string) => {
    const idx = ranking.indexOf(value);
    if (idx === -1) {
      // Add to end if under cap
      if (ranking.length >= maxRanks) return;
      onChange([...ranking, value]);
    } else if (idx === ranking.length - 1) {
      // Last rank → unset
      onChange(ranking.filter((v) => v !== value));
    } else {
      // Promote toward last (swap with next)
      const next = [...ranking];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      onChange(next);
    }
  };

  return (
    <View style={styles.stack}>
      {items.map((item) => {
        const rank = ranking.indexOf(item.value);
        const rankLabel = rank === -1 ? null : rank === 0 ? '1st' : '2nd';
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.label}, ${rankLabel ?? 'unranked'}`}
            key={item.value}
            onPress={() => handlePress(item.value)}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={[styles.row, rank !== -1 && styles.rowActive]}>
              <Text style={[styles.label, rank !== -1 && styles.labelActive]}>{item.label}</Text>
              {rankLabel ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{rankLabel}</Text>
                </View>
              ) : (
                <Text style={styles.hint}>tap to rank</Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.tangerine,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  hint: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
  },
  label: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
  },
  labelActive: {
    color: light.accent,
  },
  row: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 14,
  },
  rowActive: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  stack: {},
});
