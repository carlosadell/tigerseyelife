// components/ui/LessonCard.tsx
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type LessonCardProps = {
  meta: string;
  title: string;
  body?: string;
  thumbUri: string;
  onPress?: () => void;
};

/**
 * 80×80 scene-photo thumbnail + meta + bold title + body. Used for Today's
 * "Next Lesson" and as the row layout in the Lessons tab.
 */
export function LessonCard({ meta, title, body, thumbUri, onPress }: LessonCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Lesson: ${title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed && onPress ? 0.94 : 1 }]}
    >
      <Image source={{ uri: thumbUri }} style={styles.thumb} />
      <View style={styles.col}>
        <Text style={styles.meta}>{meta}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {body ? <Text style={styles.body} numberOfLines={2}>{body}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 4,
  },
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.3,
  },
  thumb: {
    backgroundColor: light.cardAlt,
    borderRadius: 14,
    height: 80,
    width: 80,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: -0.2,
    marginTop: 2,
  },
});
