// app/tool/[slug].tsx
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LayeredConceptBody } from '../../components/concept/LayeredConceptBody';
import { useCurrentWeek } from '../../hooks/useCurrentWeek';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';
import { toolBySlug } from '../../lib/tools';

export default function ToolScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = useThemeColors();
  const { weekNumber } = useCurrentWeek();

  const tool = slug ? toolBySlug(slug) : undefined;

  if (!tool) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>Tool not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (tool.introducedInWeek !== 0 && weekNumber < tool.introducedInWeek) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft color={colors.accent} size={26} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={[styles.title, { color: colors.text }]}>{tool.title}</Text>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            You will meet this one when you reach Week {tool.introducedInWeek}.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft color={colors.accent} size={26} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroHead}>
          <Text style={[styles.heroKicker, { color: colors.accent }]}>
            {tool.metadata.block} BLOCK
          </Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{tool.title}</Text>
        </View>
        <LayeredConceptBody
          conceptSlug={tool.slug}
          block={tool.metadata.block}
          content={tool.layered}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  content: { gap: 16, paddingBottom: 40, paddingHorizontal: SPACING.screenX, paddingTop: 12 },
  empty: {
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenX,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  headerTitle: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 17, textAlign: 'center' },
  heroHead: { gap: 4, marginBottom: 4 },
  heroKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  screen: { flex: 1 },
  spacer: { width: 26 },
  title: { fontFamily: FONTS.sansBold, fontSize: 20 },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 8,
  },
});
