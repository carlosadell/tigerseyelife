// components/grow/StubLessonView.tsx
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

/**
 * Renderer for unauthored sections. Single centered card so members can still
 * "Mark as read" and progress through the block while content is being
 * written. The Complete button on the parent screen relabels itself when the
 * section is a stub.
 */
export function StubLessonView() {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>IN THE WORKS</Text>
      <Text style={styles.body}>Karen and Ryan are writing this one.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
  },
  kicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
});
