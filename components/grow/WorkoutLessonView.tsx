// components/grow/WorkoutLessonView.tsx
import { Play } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import type { WorkoutContent } from '../../lib/curriculum';

const light = THEME_COLORS.light;

type Props = {
  content: WorkoutContent;
};

/**
 * Renders a `kind: 'workout'` section body. Composes:
 *   - Video placeholder card (real streaming swap is a future slice)
 *   - Muscle groups (chip list with PRIMARY tag for primary movers)
 *   - Numbered instructions
 *   - Set/rep target chip
 */
export function WorkoutLessonView({ content }: Props) {
  return (
    <View style={styles.stack}>
      <View style={styles.videoPlaceholder}>
        <View style={styles.playWell}>
          <Play color={light.text} fill={light.text} size={24} />
        </View>
        <Text style={styles.videoLabel}>Video coming soon</Text>
      </View>

      <View>
        <Text style={styles.sectionKicker}>MUSCLE GROUPS</Text>
        <View style={styles.muscleRow}>
          {content.muscleGroups.map((m) => (
            <View
              key={m.name}
              style={[
                styles.muscleChip,
                m.primary && styles.muscleChipPrimary,
              ]}
            >
              <Text
                style={[
                  styles.muscleChipText,
                  m.primary && styles.muscleChipTextPrimary,
                ]}
              >
                {m.name}
              </Text>
              {m.primary ? <Text style={styles.muscleChipTag}> PRIMARY</Text> : null}
            </View>
          ))}
        </View>
      </View>

      <View>
        <Text style={styles.sectionKicker}>INSTRUCTIONS</Text>
        <View style={styles.instructionsCard}>
          {content.instructions.map((step, idx) => (
            <View key={`${idx}-${step.slice(0, 10)}`} style={styles.instructionRow}>
              <Text style={styles.instructionNum}>{String(idx + 1).padStart(2, '0')}</Text>
              <Text style={styles.instructionText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      {content.setRepTarget ? (
        <View style={styles.targetChip}>
          <Text style={styles.targetText}>{content.setRepTarget}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  instructionNum: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
    minWidth: 26,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  instructionText: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  instructionsCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  muscleChip: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  muscleChipPrimary: {
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
  },
  muscleChipTag: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  muscleChipText: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  muscleChipTextPrimary: {
    color: light.text,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  playWell: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  sectionKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  stack: {
    gap: 18,
  },
  targetChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  targetText: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  videoLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  videoPlaceholder: {
    alignItems: 'center',
    backgroundColor: light.cardAlt,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    justifyContent: 'center',
    minHeight: 200,
    padding: 24,
  },
});
