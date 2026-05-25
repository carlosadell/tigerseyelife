import { router } from 'expo-router';
import { Check, Droplet, Dumbbell, Footprints, Moon, Plus } from 'lucide-react-native';
import { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { useTodayEngagement } from '../../hooks/useTodayEngagement';
import { FONTS } from '../../lib/brand';

type Icon = ComponentType<{ color: string; size: number; strokeWidth?: number }>;

type ChipProps = {
  active: boolean;
  icon: Icon;
  label: string;
  value: string;
  onPress: () => void;
};

type EngagementOrbitProps = {
  onLogMorePress: () => void;
};

export function EngagementOrbit({ onLogMorePress }: EngagementOrbitProps) {
  const colors = useThemeColors();
  const {
    engagement,
    workoutDone,
    waterTarget,
    toggleWalk,
    addWater,
    toggleSleep,
  } = useTodayEngagement();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Chip
          active={workoutDone}
          icon={Dumbbell}
          label="WORKOUT"
          value={workoutDone ? 'Done' : 'Open'}
          onPress={() => router.push('/(tabs)/train')}
        />
        <Chip
          active={engagement.walk}
          icon={Footprints}
          label="WALK"
          value={engagement.walk ? 'Done' : 'Tap'}
          onPress={toggleWalk}
        />
        <Chip
          active={engagement.water >= waterTarget}
          icon={Droplet}
          label="WATER"
          value={`${engagement.water}/${waterTarget}`}
          onPress={addWater}
        />
        <Chip
          active={engagement.sleep}
          icon={Moon}
          label="SLEEP"
          value={engagement.sleep ? 'Logged' : 'Tap'}
          onPress={toggleSleep}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onLogMorePress}
        style={({ pressed }) => [styles.logMore, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Plus color={colors.accent} size={14} strokeWidth={2.2} />
        <Text style={[styles.logMoreText, { color: colors.accent }]}>
          LOG SOMETHING ELSE
        </Text>
      </Pressable>
      {engagement.otherMovement.length > 0 ? (
        <View style={styles.otherRow}>
          {engagement.otherMovement.map((label) => (
            <View
              key={label}
              style={[styles.otherChip, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
            >
              <Check color={colors.success} size={12} strokeWidth={2.6} />
              <Text style={[styles.otherText, { color: colors.text }]}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Chip({ active, icon: Icon, label, value, onPress }: ChipProps) {
  const colors = useThemeColors();
  const background = active ? colors.accent : colors.cardAlt;
  const border = active ? colors.accent : colors.border;
  const iconColor = active ? colors.inverseText : colors.accent;
  const labelColor = active ? colors.inverseText : colors.mutedText;
  const valueColor = active ? colors.inverseText : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: background, borderColor: border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.chipIcon}>
        <Icon color={iconColor} size={18} strokeWidth={1.9} />
      </View>
      <Text style={[styles.chipLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: valueColor }]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 80,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  chipIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  chipLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  chipValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  logMore: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logMoreText: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.8,
  },
  otherChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  otherRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 10,
  },
  otherText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11.5,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  wrap: {
    marginTop: 18,
  },
});
