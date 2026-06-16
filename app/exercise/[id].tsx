// app/exercise/[id].tsx
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Lightbulb } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';
import { EXERCISE_LIBRARY, type ExerciseId } from '../../lib/exerciseLibrary';

const light = THEME_COLORS.light;

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const [playerHeight] = useState(220);

  const exercise = id && id in EXERCISE_LIBRARY ? EXERCISE_LIBRARY[id as ExerciseId] : undefined;

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Exercise not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {exercise.youtubeVideoId ? (
          <View style={styles.videoWrap}>
            <YoutubePlayer height={playerHeight} videoId={exercise.youtubeVideoId} />
          </View>
        ) : (
          <View style={[styles.videoPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.placeholderText, { color: colors.mutedText }]}>
              Tutorial video coming soon.
            </Text>
          </View>
        )}

        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Muscle Groups</Text>
          <View style={styles.muscleRow}>
            {exercise.muscleGroups.map((m) => (
              <View
                key={m.name}
                style={[
                  styles.muscleChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  m.primary && styles.muscleChipPrimary,
                ]}
              >
                <Text
                  style={[
                    styles.muscleChipText,
                    { color: colors.mutedText },
                    m.primary && { color: light.text },
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercise Instructions</Text>
          {exercise.purpose ? (
            <View style={styles.purposeRow}>
              <Lightbulb color={colors.mutedText} size={18} strokeWidth={1.8} />
              <Text style={[styles.purposeText, { color: colors.mutedText }]}>{exercise.purpose}</Text>
            </View>
          ) : null}
          <View style={[styles.instructionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {exercise.instructions.map((step, idx) => (
              <View key={`${idx}-${step.slice(0, 10)}`} style={styles.instructionRow}>
                <Text style={[styles.instructionNum, { color: COLORS.tigerGold }]}>
                  {String(idx + 1).padStart(2, '0')}
                </Text>
                <Text style={[styles.instructionText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: { padding: 4, width: 34 },
  content: {
    gap: 24,
    paddingBottom: 40,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 12,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenX,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  instructionNum: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
    minWidth: 26,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  instructionText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  instructionsCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  muscleChip: {
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
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  placeholderText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  purposeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingRight: 8,
  },
  purposeText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  screen: { flex: 1 },
  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 20,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
  },
  videoPlaceholder: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 220,
    justifyContent: 'center',
  },
  videoWrap: {
    backgroundColor: '#000000',
    borderRadius: 14,
    overflow: 'hidden',
  },
});
