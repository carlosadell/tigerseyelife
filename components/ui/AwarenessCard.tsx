// components/ui/AwarenessCard.tsx
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';
import { type DailyPrompt } from '../../lib/commitPrompts';

const light = THEME_COLORS.light;

type AwarenessCardProps = {
  prompt: DailyPrompt;
};

/**
 * Single slot for the day. Awareness prompt OR coach nudge (never both at
 * once — see spec §5, AwarenessCard row). Kicker label adjusts; body and
 * attribution render conditionally.
 */
export function AwarenessCard({ prompt }: AwarenessCardProps) {
  const kicker = prompt.kind === 'nudge' ? 'FROM YOUR COACH' : 'FOR TODAY';

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Sparkles color={light.accent} size={18} strokeWidth={2.2} />
      </View>
      <View style={styles.col}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.body}>{prompt.body}</Text>
        {prompt.kind === 'nudge' && prompt.attribution ? (
          <Text style={styles.attribution}>· {prompt.attribution}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  attribution: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    marginTop: 6,
  },
  body: {
    color: light.text,
    fontFamily: FONTS.sansMedium,
    fontSize: 14.5,
    letterSpacing: -0.1,
    lineHeight: 20,
    marginTop: 2,
  },
  card: {
    alignItems: 'flex-start',
    backgroundColor: '#F4E9D2',
    borderColor: '#E3CC92',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: light.background,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  kicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1,
  },
});
