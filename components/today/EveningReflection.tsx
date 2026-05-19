import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Mood } from '../../hooks/useDailyEntry';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

const moods: Mood[] = ['strong', 'steady', 'drained'];
const movementTags = ['Strength', 'Walk', 'Pickleball', 'Swim', 'Hike', 'Yoga', 'Cycle'];

type EveningReflectionProps = {
  mood?: Mood | null;
  movementTags: string[];
  onMoodPress: (mood: Mood) => void | Promise<void>;
  onTagPress: (tag: string) => void | Promise<void>;
};

export function EveningReflection({
  mood,
  movementTags: activeTags,
  onMoodPress,
  onTagPress,
}: EveningReflectionProps) {
  const colors = useThemeColors();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);

  const handleMoodPress = async (nextMood: Mood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await onMoodPress(nextMood);
  };

  const handleTagPress = async (tag: string) => {
    if (tag === '+ Add') {
      setShowCustomInput(true);
      return;
    }

    Haptics.selectionAsync();
    await onTagPress(tag);
  };

  const addCustomTag = () => {
    const nextTag = customDraft.trim();

    if (!nextTag || customTags.includes(nextTag)) {
      setCustomDraft('');
      setShowCustomInput(false);
      return;
    }

    setCustomTags((current) => [...current, nextTag]);
    setCustomDraft('');
    setShowCustomInput(false);
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 24, gap: 14, padding: 16 }}>
      <Text style={{ color: colors.mutedText, fontFamily: FONTS.sansMedium, fontSize: 13 }}>
        HOW WAS TODAY?
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {moods.map((item) => {
          const active = item === mood;
          return (
            <Pressable
              key={item}
              onPress={() => handleMoodPress(item)}
              style={{
                alignItems: 'center',
                backgroundColor: active ? colors.accent : colors.cardAlt,
                borderColor: active ? colors.accent : colors.border,
                borderRadius: 999,
                borderWidth: 1,
                flex: 1,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  color: active ? colors.inverseText : colors.mutedText,
                  fontFamily: FONTS.sansBold,
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ color: colors.mutedText, fontFamily: FONTS.sansMedium, fontSize: 13 }}>
        MOVEMENT TODAY
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {[...movementTags, ...customTags, '+ Add'].map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => handleTagPress(tag)}
              style={{
                backgroundColor: active ? colors.success : colors.cardAlt,
                borderColor: colors.border,
                borderRadius: 999,
                borderWidth: active ? 0 : 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  color: active ? colors.successText : colors.mutedText,
                  fontFamily: FONTS.sansMedium,
                }}
              >
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {showCustomInput ? (
        <TextInput
          autoFocus
          onChangeText={setCustomDraft}
          onSubmitEditing={addCustomTag}
          placeholder="Add movement"
          placeholderTextColor={colors.mutedText}
          returnKeyType="done"
          style={{
            backgroundColor: colors.cardAlt,
            borderColor: colors.border,
            borderRadius: 12,
            borderWidth: 1,
            color: colors.text,
            fontFamily: FONTS.sans,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
          value={customDraft}
        />
      ) : null}
    </View>
  );
}
