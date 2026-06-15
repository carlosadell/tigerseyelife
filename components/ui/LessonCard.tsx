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
 * 84×84 scene-photo thumb + meta + bold title + body. Pressable handles tap
 * only; inner View holds the flex row layout — Pressable + flex in this RN
 * config has a style-application bug, the View wrapper sidesteps it.
 */
export function LessonCard({ meta, title, body, thumbUri, onPress }: LessonCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Lesson: ${title}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed && onPress ? 0.94 : 1 })}
    >
      <View style={styles.card}>
        <Image source={{ uri: thumbUri }} style={styles.thumb} />
        <View style={styles.col}>
          <Text style={styles.meta}>{meta}</Text>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {body ? <Text style={styles.body} numberOfLines={2}>{body}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  col: {
    flex: 1,
  },
  meta: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.4,
  },
  thumb: {
    backgroundColor: light.cardAlt,
    borderRadius: 14,
    height: 84,
    marginRight: 14,
    width: 84,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: -0.2,
    lineHeight: 21,
    marginTop: 4,
  },
});
