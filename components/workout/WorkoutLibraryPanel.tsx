import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { useWorkoutLibrary } from '../../hooks/useWorkoutLibrary';
import { FONTS } from '../../lib/brand';
import { WorkoutFilters, WorkoutLibraryItem } from '../../lib/workouts';
import { useActiveWorkoutStore } from '../../stores/activeWorkout';
import { useWorkoutFilterStore } from '../../stores/workoutFilters';

const durationFilters: Array<[WorkoutFilters['duration'], string]> = [
  ['any', 'Any'],
  ['15', '15 min'],
  ['30', '30 min'],
  ['45', '45 min'],
  ['60', '60+ min'],
];
const equipmentFilters: Array<[WorkoutFilters['equipment'], string]> = [
  ['any', 'Any'],
  ['bodyweight', 'Bodyweight'],
  ['dumbbells', 'Dumbbells'],
  ['bands', 'Bands'],
  ['barbell', 'Barbell'],
];
const focusFilters: Array<[WorkoutFilters['focus'], string]> = [
  ['any', 'Any'],
  ['upper', 'Upper'],
  ['lower', 'Lower'],
  ['full', 'Full'],
  ['mobility', 'Mobility'],
  ['core', 'Core'],
  ['cardio', 'Cardio'],
];

export function WorkoutLibraryPanel() {
  const colors = useThemeColors();
  const filters = useWorkoutFilterStore();
  const { data = [] } = useWorkoutLibrary(filters);

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.filters}>
          <ResumeWorkoutCard />
          <FilterGroup items={durationFilters} value={filters.duration} onChange={filters.setDuration} />
          <FilterGroup items={equipmentFilters} value={filters.equipment} onChange={filters.setEquipment} />
          <FilterGroup items={focusFilters} value={filters.focus} onChange={filters.setFocus} />
        </View>
      }
      data={data}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: colors.mutedText }]}>
          No workouts match those filters. Try widening your criteria.
        </Text>
      }
      renderItem={({ item }) => <WorkoutCard workout={item} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

function ResumeWorkoutCard() {
  const colors = useThemeColors();
  const { clearSession, currentSession } = useActiveWorkoutStore();

  if (!currentSession) return null;

  return (
    <View style={[styles.resumeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.resumeTitle, { color: colors.text }]}>Resume your workout from earlier?</Text>
        <Text style={[styles.resumeCopy, { color: colors.mutedText }]}>{currentSession.name}</Text>
      </View>
      <Pressable onPress={() => router.push(`/workout/active/${currentSession.id}`)} style={[styles.resumeButton, { backgroundColor: colors.accent }]}>
        <Text style={[styles.resumeButtonText, { color: colors.inverseText }]}>Resume</Text>
      </Pressable>
      <Pressable onPress={clearSession}>
        <Text style={[styles.discard, { color: colors.mutedText }]}>Discard</Text>
      </Pressable>
    </View>
  );
}

function FilterGroup<T extends string>({
  items,
  onChange,
  value,
}: {
  items: Array<[T, string]>;
  onChange: (value: T) => void;
  value: T;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.filterRow}>
        {items.map(([key, label]) => (
          <FilterChip key={key} active={key === value} label={label} onPress={() => onChange(key)} />
        ))}
      </View>
    </ScrollView>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? colors.accent : colors.cardAlt,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <Text style={[styles.filterText, { color: active ? colors.inverseText : colors.mutedText }]}>{label}</Text>
    </Pressable>
  );
}

function WorkoutCard({ workout }: { workout: WorkoutLibraryItem }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => router.push(`/workout/${workout.id}`)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.metaRow}>
        <View style={[styles.dot, { backgroundColor: workout.cover_color }]} />
        <Text style={[styles.meta, { color: colors.mutedText }]}>
          {workout.duration_minutes} MIN · {workout.difficulty.toUpperCase()} · {workout.focus_area.toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{workout.name}</Text>
          <Text numberOfLines={2} style={[styles.cardCopy, { color: colors.mutedText }]}>{workout.description}</Text>
          <View style={styles.equipmentRow}>
            {workout.equipment.map((item) => (
              <Text key={item} style={[styles.equipment, { backgroundColor: colors.cardAlt, color: colors.mutedText }]}>
                {item}
              </Text>
            ))}
          </View>
        </View>
        <Text style={[styles.start, { color: colors.accent }]}>Start →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: 1, gap: 12, marginBottom: 12, padding: 16 },
  cardBody: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  cardCopy: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20, marginTop: 4 },
  cardTitle: { fontFamily: FONTS.sansBold, fontSize: 18 },
  discard: { fontFamily: FONTS.sansBold, fontSize: 12 },
  dot: { borderRadius: 4, height: 8, width: 8 },
  emptyText: { fontFamily: FONTS.sans, paddingTop: 36, textAlign: 'center' },
  equipment: { borderRadius: 999, fontFamily: FONTS.sansMedium, fontSize: 11, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, textTransform: 'capitalize' },
  equipmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  filterChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterText: { fontFamily: FONTS.sansBold, fontSize: 12 },
  filters: { gap: 8, marginBottom: 14 },
  listContent: { paddingBottom: 170 },
  meta: { fontFamily: FONTS.sansMedium, fontSize: 10, letterSpacing: 1.2 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  resumeButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  resumeButtonText: { fontFamily: FONTS.sansBold, fontSize: 12 },
  resumeCard: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 10, marginBottom: 6, padding: 12 },
  resumeCopy: { fontFamily: FONTS.sans, fontSize: 13, marginTop: 2 },
  resumeTitle: { fontFamily: FONTS.sansBold, fontSize: 14 },
  start: { fontFamily: FONTS.sansBold, fontSize: 14 },
});
