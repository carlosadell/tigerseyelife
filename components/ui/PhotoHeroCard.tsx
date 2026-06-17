// components/ui/PhotoHeroCard.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

type PhotoHeroCardProps = {
  kicker: string;
  title: string;
  photoUri: string;
  photoSide?: 'right' | 'full';
};

/**
 * Photographic hero card. Two layouts:
 *
 * - `right` (default): cream card with the photo bleeding into the right
 *   edge. Text sits on cream so contrast is inherent — no scrim needed.
 * - `full`: photo fills the card, text overlays at the bottom. A real
 *   `LinearGradient` from transparent at the top to ~78% black at the
 *   bottom anchors the text region without showing horizontal banding
 *   (which a stack of solid semi-transparent layers would). Plus a
 *   brighter kicker and a text shadow on the headline for the rare
 *   moment when the bottom of the photo is light.
 */
export function PhotoHeroCard({ kicker, title, photoUri, photoSide = 'right' }: PhotoHeroCardProps) {
  const source: ImageSourcePropType = { uri: photoUri };

  if (photoSide === 'full') {
    return (
      <View style={[styles.card, styles.full]}>
        <Image source={source} style={styles.fullPhoto} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.78)']}
          locations={[0, 0.45, 1]}
          style={styles.scrim}
          pointerEvents="none"
        />
        <View style={styles.fullOverlay}>
          <Text style={styles.kickerOnPhoto}>{kicker}</Text>
          <Text style={styles.titleOnPhoto}>{title}</Text>
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
    minHeight: 200,
    position: 'relative',
  },
  fullOverlay: {
    bottom: 18,
    gap: 6,
    left: 18,
    position: 'absolute',
    right: 18,
  },
  fullPhoto: {
    height: 200,
    width: '100%',
  },
  kicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  // Kicker rendered ON the photo — brighter gold + text shadow so it
  // doesn't get swallowed by light backgrounds.
  kickerOnPhoto: {
    color: COLORS.electricYellow,
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 1.4,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
  scrim: {
    ...StyleSheet.absoluteFillObject,
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
  titleOnPhoto: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
