import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type NextLessonCardProps = {
  kicker?: string;
  title?: string;
  description?: string;
  onPress?: () => void;
};

export function NextLessonCard({
  kicker = 'Prep · 3 min',
  title = 'Welcome!',
  description = 'Get ready to build your foundation for success.',
  onPress,
}: NextLessonCardProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Next lesson: ${title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.94 : 1,
        },
      ]}
    >
      <View style={styles.thumb}>
        <LinearGradient
          colors={[COLORS.tangerine, COLORS.tigerGold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.thumbSheen} pointerEvents="none" />
        <BookOpen color="#FFFFFF" size={28} strokeWidth={2.2} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.kicker, { color: colors.accent }]} numberOfLines={1}>
          {kicker}
        </Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.description, { color: colors.mutedText }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  description: {
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 18,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  thumb: {
    alignItems: 'center',
    borderRadius: 16,
    height: 80,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
  },
  thumbSheen: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: '50%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.1,
  },
});
