import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EyeMark } from '../brand/EyeMark';
import { COLORS, FONTS } from '../../lib/brand';

const textureSource = require('../../assets/brand/tigers-eye-texture.png');

type AuthShellProps = {
  children: ReactNode;
  footer: ReactNode;
  eyebrow?: string;
};

export function AuthShell({ children, eyebrow = 'MEMBER APP', footer }: AuthShellProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.phoneFrame}>
        <Image accessibilityIgnoresInvertColors resizeMode="cover" source={textureSource} style={styles.topTexture} />
        <Image accessibilityIgnoresInvertColors resizeMode="cover" source={textureSource} style={styles.bottomTexture} />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(11,11,12,0.12)', 'rgba(11,11,12,0.36)', 'rgba(11,11,12,0.86)', COLORS.onyx]}
          locations={[0, 0.38, 0.72, 1]}
          style={styles.topScrim}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[COLORS.onyx, 'rgba(11,11,12,0.92)', 'rgba(11,11,12,0.56)']}
          locations={[0, 0.62, 1]}
          style={styles.bottomScrim}
        />
        <View style={styles.content}>
          <View style={styles.lockup}>
            <EyeMark color={COLORS.tigerGold} size={34} strokeWidth={1.7} />
            <View style={styles.lockupTextWrap}>
              <Text style={styles.lockupText}>TIGERS EYE</Text>
              <Text style={styles.lockupLife}>LIFE</Text>
            </View>
          </View>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>CREATE{'\n'}POWER</Text>
            <Text style={styles.subtitle}>Clarity. Strength. Intentionality.</Text>
          </View>
          <View style={styles.formCard}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomScrim: {
    bottom: 0,
    height: 230,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  bottomTexture: {
    bottom: 0,
    height: 138,
    left: 0,
    opacity: 0.46,
    position: 'absolute',
    right: 0,
    transform: [{ rotate: '180deg' }],
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 24,
  },
  eyebrow: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 2.4,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 18,
  },
  formCard: {
    backgroundColor: 'rgba(11,11,12,0.9)',
    borderColor: 'rgba(200,159,77,0.16)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    marginTop: 44,
  },
  lockup: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 74,
  },
  lockupLife: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    letterSpacing: 6,
    marginTop: 2,
  },
  lockupText: {
    color: COLORS.bone,
    fontFamily: FONTS.sansBold,
    fontSize: 21,
    letterSpacing: 4.5,
  },
  lockupTextWrap: {
    minWidth: 0,
  },
  phoneFrame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: COLORS.onyx,
    flex: 1,
  },
  subtitle: {
    color: COLORS.steel,
    fontFamily: FONTS.sans,
    fontSize: 13,
    letterSpacing: 1.3,
    textAlign: 'center',
  },
  title: {
    color: COLORS.amber,
    fontFamily: FONTS.sansBold,
    fontSize: 58,
    letterSpacing: 1,
    lineHeight: 67,
    textAlign: 'center',
  },
  topScrim: {
    height: 372,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  topTexture: {
    height: 276,
    left: 0,
    opacity: 0.92,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
});
