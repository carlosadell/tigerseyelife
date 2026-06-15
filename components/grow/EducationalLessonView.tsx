// components/grow/EducationalLessonView.tsx
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';
import type { EducationalContent } from '../../lib/curriculum';

const light = THEME_COLORS.light;

type Props = {
  content: EducationalContent;
};

/**
 * Renders a `kind: 'educational'` section body. Composes:
 *   - Intro paragraph
 *   - Key concepts (title + body cards)
 *   - Takeaway callout (gold-tint card)
 *   - Reflection prompt (cream card)
 *
 * No completion logic here — the parent screen owns the CTA.
 */
export function EducationalLessonView({ content }: Props) {
  return (
    <View style={styles.stack}>
      <Text style={styles.intro}>{content.introParagraph}</Text>

      {content.keyConcepts.map((concept, idx) => (
        <View key={`${concept.title}-${idx}`} style={styles.conceptCard}>
          <Text style={styles.conceptTitle}>{concept.title}</Text>
          <Text style={styles.conceptBody}>{concept.body}</Text>
        </View>
      ))}

      <View style={styles.takeawayCard}>
        <View style={styles.takeawayIcon}>
          <Sparkles color={light.accent} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.takeawayBody}>
          <Text style={styles.takeawayKicker}>TAKEAWAY</Text>
          <Text style={styles.takeawayText}>{content.takeaway}</Text>
        </View>
      </View>

      <View style={styles.reflectCard}>
        <Text style={styles.reflectKicker}>REFLECT</Text>
        <Text style={styles.reflectText}>{content.reflectionPrompt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conceptBody: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  conceptCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  conceptTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  intro: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  reflectCard: {
    backgroundColor: light.cardAlt,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  reflectKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  reflectText: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: 6,
  },
  stack: {
    gap: 14,
  },
  takeawayBody: {
    flex: 1,
    minWidth: 0,
  },
  takeawayCard: {
    alignItems: 'flex-start',
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  takeawayIcon: {
    alignItems: 'center',
    backgroundColor: light.background,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  takeawayKicker: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  takeawayText: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
});
