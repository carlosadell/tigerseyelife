import { router } from 'expo-router';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCoachPreferences } from '../hooks/useCoachPreferences';
import { useThemeColors } from '../hooks/useTheme';
import { FONTS, SPACING } from '../lib/brand';
import {
  COMMUNICATION_OPTIONS,
  CoachPreferences,
  LENGTH_OPTIONS,
  SCIENCE_OPTIONS,
  TONE_OPTIONS,
} from '../lib/coachPreferences';

export default function CoachPreferencesScreen() {
  const colors = useThemeColors();
  const { prefs, update } = useCoachPreferences();

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
          <Text style={[styles.headerKicker, { color: colors.accent }]}>COACH PREFERENCES</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.intro, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Sparkles color={colors.accent} size={18} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.introTitle, { color: colors.text }]}>
                How should your coach talk to you?
              </Text>
              <Text style={[styles.introBody, { color: colors.mutedText }]}>
                These settings shape Karen and Ryan's coach voice when it answers you. Change them
                anytime. Your future replies adapt immediately.
              </Text>
            </View>
          </View>

          <PreferenceSection
            kicker="COMMUNICATION STYLE"
            value={prefs.communicationStyle}
            options={COMMUNICATION_OPTIONS}
            onSelect={(id) => update({ communicationStyle: id as CoachPreferences['communicationStyle'] })}
          />
          <PreferenceSection
            kicker="COACHING TONE"
            value={prefs.tone}
            options={TONE_OPTIONS}
            onSelect={(id) => update({ tone: id as CoachPreferences['tone'] })}
          />
          <PreferenceSection
            kicker="RESPONSE LENGTH"
            value={prefs.responseLength}
            options={LENGTH_OPTIONS}
            onSelect={(id) => update({ responseLength: id as CoachPreferences['responseLength'] })}
          />
          <PreferenceSection
            kicker="SCIENCE DEPTH"
            value={prefs.scienceDepth}
            options={SCIENCE_OPTIONS}
            onSelect={(id) => update({ scienceDepth: id as CoachPreferences['scienceDepth'] })}
          />

          <Text style={[styles.footer, { color: colors.mutedText }]}>
            The AI coach launches in a future round. These preferences are saved now so your first
            real conversation already knows how you want it to feel.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type Option = { id: string; label: string; description: string };

function PreferenceSection({
  kicker,
  value,
  options,
  onSelect,
}: {
  kicker: string;
  value: string;
  options: Option[];
  onSelect: (id: string) => void;
}) {
  const colors = useThemeColors();
  const active = options.find((o) => o.id === value);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>{kicker}</Text>
      <View style={styles.optionRow}>
        {options.map((option) => {
          const isActive = option.id === value;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : undefined}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [
                styles.optionPill,
                {
                  backgroundColor: isActive ? colors.accent : colors.card,
                  borderColor: isActive ? colors.accent : colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: isActive ? colors.inverseText : colors.text },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {active ? (
        <Text style={[styles.sectionHelper, { color: colors.mutedText }]}>{active.description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 60,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  footer: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 8,
  },
  headerKicker: {
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 2.6,
    textAlign: 'center',
  },
  iconButton: {
    height: 32,
    padding: 4,
    width: 32,
  },
  intro: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  introBody: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  introTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  optionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  optionPill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  screen: {
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionHelper: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 17,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
    paddingHorizontal: 4,
  },
});
