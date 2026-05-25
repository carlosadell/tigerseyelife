import { router } from 'expo-router';
import { BookOpen, ChefHat, Sparkles } from 'lucide-react-native';
import { ComponentType, useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';
import { mealLibrarySeed } from '../../lib/mealLibrarySeed';
import { microlearningSeed } from '../../lib/programs';

const CARD_WIDTH = 268;
const CARD_GAP = 10;

type Card = {
  key: string;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  tint: string;
  icon: ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  onPress: () => void;
};

export function DailyAdviceCarousel() {
  const colors = useThemeColors();

  const cards = useMemo<Card[]>(() => {
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const moduleOfDay =
      microlearningSeed[dayIndex % microlearningSeed.length] ?? microlearningSeed[0];
    const mealOfDay = mealLibrarySeed[dayIndex % mealLibrarySeed.length] ?? mealLibrarySeed[0];

    return [
      {
        key: 'microlearning',
        kicker: 'TODAY · MICROLEARNING',
        title: moduleOfDay.title,
        body: moduleOfDay.description ?? 'A short module from Karen and Ryan.',
        cta: 'Read →',
        tint: COLORS.tigerGold,
        icon: BookOpen,
        onPress: () => {
          if (moduleOfDay.tiiny_url) {
            Linking.openURL(moduleOfDay.tiiny_url).catch(() => undefined);
          }
        },
      },
      {
        key: 'recipe',
        kicker: 'TODAY · RECIPE',
        title: mealOfDay.name,
        body: mealOfDay.description,
        cta: 'Log meal →',
        tint: COLORS.tangerine,
        icon: ChefHat,
        onPress: () => {
          router.push('/(tabs)/fuel');
        },
      },
      {
        key: 'tip',
        kicker: 'KAREN + RYAN',
        title: 'Lock the bedtime first',
        body: 'If you only do one thing this week, pick the bedtime and protect it. Sleep is the foundation everything else stacks on.',
        cta: 'Ask coach →',
        tint: COLORS.evidenceBlue,
        icon: Sparkles,
        onPress: () => {
          // Coach FAB is reachable via tab bar; surface the tip there in a future iteration.
        },
      },
    ];
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.kicker, { color: colors.mutedText }]}>DAILY ADVICE</Text>
        <Text style={[styles.helper, { color: colors.mutedText }]}>Swipe →</Text>
      </View>
      <ScrollView
        decelerationRate="fast"
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={CARD_WIDTH + CARD_GAP}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card) => (
          <AdviceCard key={card.key} card={card} />
        ))}
      </ScrollView>
    </View>
  );
}

function AdviceCard({ card }: { card: Card }) {
  const colors = useThemeColors();
  const Icon = card.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${card.kicker}: ${card.title}`}
      onPress={card.onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={[styles.cardBadge, { backgroundColor: card.tint }]}>
            <Icon color="#FFFFFF" size={14} strokeWidth={2.2} />
          </View>
          <Text style={[styles.cardKicker, { color: card.tint }]} numberOfLines={1}>
            {card.kicker}
          </Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
          {card.title}
        </Text>
        <Text style={[styles.cardCopy, { color: colors.mutedText }]} numberOfLines={3}>
          {card.body}
        </Text>
        <Text style={[styles.cardCta, { color: card.tint }]}>{card.cta}</Text>
      </View>
      <View style={[styles.cardBarTrack, { backgroundColor: colors.cardAlt }]}>
        <View style={[styles.cardBarFill, { backgroundColor: card.tint }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: CARD_WIDTH,
  },
  cardBadge: {
    alignItems: 'center',
    borderRadius: 6,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  cardBarFill: {
    height: '100%',
    width: '100%',
  },
  cardBarTrack: {
    height: 3,
    width: '100%',
  },
  cardBody: {
    gap: 6,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  cardCopy: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  cardCta: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.6,
    marginTop: 4,
  },
  cardKicker: {
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.6,
  },
  cardTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: -0.1,
    lineHeight: 20,
    marginTop: 4,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  helper: {
    fontFamily: FONTS.sans,
    fontSize: 11,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  scrollContent: {
    gap: CARD_GAP,
    paddingHorizontal: 1,
  },
  wrap: {
    gap: 8,
  },
});
