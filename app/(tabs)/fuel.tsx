import { Check, Utensils } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';

export default function FuelScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionLabel label="FUEL" />
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.kicker, { color: colors.accent }]}>NUTRITION SNAPSHOT</Text>
          <Text style={[styles.title, { color: colors.text }]}>Protein on track.</Text>
          <Text style={[styles.copy, { color: colors.mutedText }]}>
            Full Fuel logging and the three precision levels land in the next phase. For beta, Today
            keeps the signal simple.
          </Text>
        </View>
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Utensils color={colors.accent} size={24} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>ABC meals today</Text>
            <Text style={[styles.copy, { color: colors.mutedText }]}>
              1 of 2 logged · water 64 oz · dinner planned
            </Text>
          </View>
          <View style={[styles.check, { borderColor: colors.accent }]}>
            <Check color={colors.accent} size={17} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  check: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: {
    gap: 14,
    paddingBottom: 126,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  copy: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  kicker: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  screen: {
    flex: 1,
  },
  statusCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  statusTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    lineHeight: 22,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 25,
    lineHeight: 31,
  },
});
