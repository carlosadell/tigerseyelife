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

const THUMB_SIZE = 84;
const HORIZ_PAD = 14;
const THUMB_GAP = 14;

/**
 * 84×84 scene-photo thumbnail (absolutely positioned left) + meta + bold title +
 * body. Same anti-flex-fail rebuild as AnchorRow — thumb is pinned, label area
 * is a normal column.
 */
export function LessonCard({ meta, title, body, thumbUri, onPress }: LessonCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Lesson: ${title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed && onPress ? 0.94 : 1 }]}
    >
      <Image source={{ uri: thumbUri }} style={styles.thumbAbs} />
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
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  card: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingBottom: HORIZ_PAD,
    paddingLeft: HORIZ_PAD + THUMB_SIZE + THUMB_GAP,
    paddingRight: HORIZ_PAD,
    paddingTop: HORIZ_PAD,
    position: 'relative',
  },
  col: {
    minHeight: THUMB_SIZE,
    justifyContent: 'center',
  },
  meta: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.4,
  },
  thumbAbs: {
    backgroundColor: light.cardAlt,
    borderRadius: 14,
    height: THUMB_SIZE,
    left: HORIZ_PAD,
    position: 'absolute',
    top: HORIZ_PAD,
    width: THUMB_SIZE,
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
