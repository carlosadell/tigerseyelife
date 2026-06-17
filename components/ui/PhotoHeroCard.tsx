// components/ui/PhotoHeroCard.tsx
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type PhotoHeroCardProps = {
  kicker: string;
  title: string;
  photoUri: string;
  photoSide?: 'right' | 'full';
};

/**
 * Photographic hero card — cream-gradient (flat cream here, since we don't
 * want a Reanimated/expo-linear-gradient dependency for this surface) bg,
 * gold kicker, bold sentence-case headline, photo bleeding into the right edge.
 *
 * Used for Today's "This Week's Focus," the verify-membership coach hero, and
 * the non-member landing.
 */
export function PhotoHeroCard({ kicker, title, photoUri, photoSide = 'right' }: PhotoHeroCardProps) {
  const source: ImageSourcePropType = { uri: photoUri };

  if (photoSide === 'full') {
    return (
      <View style={[styles.card, styles.full]}>
        <Image source={source} style={styles.fullPhoto} />
        <View style={styles.fullOverlay}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>{title}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.right]}>
      <View style={styles.textCol}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Image source={source} style={styles.rightPhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F4E9D2',
    borderColor: light.border,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  full: {
    minHeight: 180,
    position: 'relative',
  },
  fullOverlay: {
    bottom: 16,
    gap: 4,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  fullPhoto: {
    height: 180,
    width: '100%',
  },
  kicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 130,
  },
  rightPhoto: {
    height: 130,
    width: 110,
  },
  textCol: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 26,
    marginTop: 2,
  },
});
