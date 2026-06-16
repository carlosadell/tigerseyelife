// components/onboarding/ReviewCard.tsx
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type Props = {
  label: string;
  value: string;
  onEdit: () => void;
};

export function ReviewCard({ label, value, onEdit }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
      onPress={onEdit}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View style={styles.card}>
        <View style={styles.left}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value} numberOfLines={3}>
            {value || '…'}
          </Text>
        </View>
        <ChevronRight color={COLORS.tangerine} size={20} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 14,
  },
  label: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  left: {
    flex: 1,
    gap: 4,
    marginRight: 10,
  },
  value: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    lineHeight: 21,
  },
});
