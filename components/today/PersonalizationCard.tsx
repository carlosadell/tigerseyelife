import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { TodayCard } from './TodayCards';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

export function PersonalizationCard() {
  const colors = useThemeColors();
  const [medications, setMedications] = useState('');
  const [doctorGoals, setDoctorGoals] = useState('');
  const [saved, setSaved] = useState(false);
  const [skipped, setSkipped] = useState(false);

  if (skipped) {
    return (
      <TodayCard tone="quiet">
        <Text style={[styles.title, { color: colors.text }]}>Personalization skipped for now.</Text>
      </TodayCard>
    );
  }

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={[styles.title, { color: colors.text }]}>Help us personalize further</Text>
        <Text style={[styles.copy, { color: colors.mutedText }]}>
          Optional. The more we know, the smarter your coach gets. You can skip this entirely.
        </Text>
      </View>
      <TodayCard>
        <QuestionInput
          colors={colors}
          onChangeText={setMedications}
          title="Any medications that affect exercise or nutrition?"
          value={medications}
        />
        <QuestionInput
          colors={colors}
          onChangeText={setDoctorGoals}
          title="Working with a doctor on any health goals?"
          value={doctorGoals}
        />
        <Text style={[styles.note, { color: colors.mutedText }]}>
          Note: We're not medical providers. This information helps personalize your coaching
          experience. For example, if you're on a GLP-1, your coach will emphasize protein to
          protect muscle mass during weight loss. Always follow your doctor's guidance.
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() => setSaved(true)}
            style={[styles.primary, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.primaryText, { color: colors.inverseText }]}>
              {saved ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSkipped(true)}
            style={[styles.secondary, { borderColor: colors.glassBorder }]}
          >
            <Text style={[styles.secondaryText, { color: colors.mutedText }]}>Skip this</Text>
          </Pressable>
        </View>
      </TodayCard>
    </View>
  );
}

function QuestionInput({
  onChangeText,
  colors,
  title,
  value,
}: {
  colors: ReturnType<typeof useThemeColors>;
  onChangeText: (value: string) => void;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{title}</Text>
      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder="Optional"
        placeholderTextColor={colors.mutedText}
        style={[
          styles.input,
          {
            backgroundColor: colors.cardAlt,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  copy: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    lineHeight: 19,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontFamily: FONTS.sans,
    minHeight: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  note: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  primary: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 13,
  },
  primaryText: {
    fontFamily: FONTS.sansBold,
  },
  secondary: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 13,
  },
  secondaryText: {
    fontFamily: FONTS.sansBold,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 20,
    lineHeight: 25,
  },
  wrap: {
    gap: 12,
  },
});
