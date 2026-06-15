// components/today/GreetingHeader.tsx
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { FONTS, THEME_COLORS } from '../../lib/brand';
import { getDayPeriod } from '../../lib/greetings';

const light = THEME_COLORS.light;

type GreetingHeaderProps = {
  firstName?: string | null;
  subtitle?: string;
};

function periodCapitalized() {
  const p = getDayPeriod();
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function quietName(firstName?: string | null) {
  const first = firstName?.trim().split(/\s+/)[0];
  return first || 'friend';
}

/**
 * "Evening, Johnty." — sentence-case bold + muted subtitle ("Commit Block · Week 1").
 */
export function GreetingHeader({ firstName, subtitle }: GreetingHeaderProps) {
  const { width } = useWindowDimensions();
  const titleSize = width < 380 ? 26 : 28;

  return (
    <View style={styles.col}>
      <Text style={[styles.greeting, { fontSize: titleSize, lineHeight: titleSize + 4 }]}>
        {periodCapitalized()}, {quietName(firstName)}.
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  col: { gap: 4 },
  greeting: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
  },
});
