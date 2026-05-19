import * as WebBrowser from 'expo-web-browser';
import { ArrowUpRight, BookOpenCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '../../components/brand/SectionLabel';
import { useMicrolearningModules } from '../../hooks/useMicrolearningModules';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../lib/brand';
import { MicrolearningModule } from '../../lib/programs';

export default function GrowScreen() {
  const colors = useThemeColors();
  const { data = [] } = useMicrolearningModules();
  const [activeBlock, setActiveBlock] = useState('ALL');
  const blocks = useMemo(() => ['ALL', ...Array.from(new Set(data.map((module) => module.block)))], [data]);
  const visibleModules = activeBlock === 'ALL' ? data : data.filter((module) => module.block === activeBlock);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionLabel label="GROW" />
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.kicker, { color: colors.accent }]}>MICROLEARNING</Text>
          <Text style={[styles.title, { color: colors.text }]}>Small lessons. Better signals.</Text>
          <Text style={[styles.copy, { color: colors.mutedText }]}>
            Karen&apos;s modules stay full-length by design. For beta, each card opens the current
            Tiiny version in-app while native long-form rendering is prepared later.
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.filterContent}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {blocks.map((block) => {
            const active = block === activeBlock;
            return (
              <Pressable
                key={block}
                onPress={() => setActiveBlock(block)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.accent : colors.card,
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: active ? colors.inverseText : colors.mutedText }]}>
                  {block}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.sectionHeader}>
          <Text style={[styles.kicker, { color: colors.accent }]}>
            {activeBlock === 'ALL' ? 'ALL MODULES' : `${activeBlock} BLOCK`}
          </Text>
          <Text style={[styles.count, { color: colors.mutedText }]}>
            {visibleModules.length} lessons
          </Text>
        </View>
        {visibleModules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ModuleCard({ module }: { module: MicrolearningModule }) {
  const colors = useThemeColors();

  const openModule = () => {
    WebBrowser.openBrowserAsync(module.tiiny_url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  };

  return (
    <Pressable
      onPress={openModule}
      style={[styles.moduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.iconWell, { backgroundColor: colors.cardAlt }]}>
        <BookOpenCheck color={colors.accent} size={21} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.block, { color: colors.accent }]}>{module.block}</Text>
        <Text style={[styles.moduleTitle, { color: colors.text }]}>{module.title}</Text>
        <Text style={[styles.copy, { color: colors.mutedText }]}>{module.description}</Text>
      </View>
      <ArrowUpRight color={colors.accent} size={19} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  content: {
    gap: 14,
    paddingBottom: 126,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  copy: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  count: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  filterContent: {
    gap: 8,
    paddingRight: SPACING.screenX,
  },
  filterScroll: {
    marginRight: -SPACING.screenX,
  },
  filterText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  kicker: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  moduleCard: {
    alignItems: 'flex-start',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  moduleTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 4,
    marginTop: 2,
  },
  screen: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 25,
    lineHeight: 31,
  },
});
