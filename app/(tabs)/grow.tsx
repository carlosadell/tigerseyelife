import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { ArrowUpRight, BookOpenCheck, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMicrolearningModules } from '../../hooks/useMicrolearningModules';
import { usePowerActionProgress } from '../../hooks/usePowerActionProgress';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { MicrolearningModule } from '../../lib/programs';
import { PowerBlock, powerBlocks } from '../../lib/powerBlocks';

export default function GrowScreen() {
  const colors = useThemeColors();
  const { data = [] } = useMicrolearningModules();
  const [activeBlock, setActiveBlock] = useState('ALL');
  const blocks = useMemo(
    () => ['ALL', ...Array.from(new Set(data.map((module) => module.block)))],
    [data],
  );
  const visibleModules = activeBlock === 'ALL' ? data : data.filter((module) => module.block === activeBlock);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.headerKicker, { color: colors.accent }]}>GROW</Text>
            <Text style={[styles.title, { color: colors.text }]}>CREATE POWER blocks</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Two-week cycles of small actions. Aim for 40–50% consistency — the rest is bonus.
            </Text>
          </View>

          <View style={styles.blockStack}>
            {powerBlocks.map((block) => (
              <BlockSummaryCard key={block.id} block={block} />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>MICROLEARNING</Text>
            <Text style={[styles.sectionHelper, { color: colors.mutedText }]}>
              Karen and Ryan’s modules stay full-length by design. Cards open the current Tiiny version in-app.
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

          <View style={styles.sectionInline}>
            <Text style={[styles.sectionLabel, { color: colors.accent }]}>
              {activeBlock === 'ALL' ? 'ALL MODULES' : `${activeBlock} MODULES`}
            </Text>
            <Text style={[styles.count, { color: colors.mutedText }]}>
              {visibleModules.length} lessons
            </Text>
          </View>

          {visibleModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function BlockSummaryCard({ block }: { block: PowerBlock }) {
  const colors = useThemeColors();
  const { summary, loading } = usePowerActionProgress(block.id);
  const percentage = summary.blockTarget > 0
    ? Math.min(100, Math.round((summary.blockTotal / summary.blockTarget) * 100))
    : 0;
  const actionsCount = block.actions.length;

  return (
    <Pressable
      onPress={() => router.push(`/grow/${block.id}`)}
      style={({ pressed }) => [
        styles.blockCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.blockRail, { backgroundColor: colors.accent }]} />
      <View style={styles.blockBody}>
        <View style={styles.blockHeader}>
          <View>
            <Text style={[styles.blockKicker, { color: colors.accent }]}>BLOCK</Text>
            <Text style={[styles.blockName, { color: colors.text }]}>{block.name}</Text>
          </View>
          <ChevronRight color={colors.mutedText} size={20} />
        </View>
        <Text style={[styles.blockTagline, { color: colors.mutedText }]} numberOfLines={2}>
          {block.tagline}
        </Text>
        <View style={styles.blockMeta}>
          <Text style={[styles.blockMetaText, { color: colors.mutedText }]}>
            {actionsCount} actions · 14 days
          </Text>
          <Text style={[styles.blockMetaValue, { color: colors.accent }]}>
            {loading ? '—' : `${percentage}%`}
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.cardAlt }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.accent, width: loading ? '0%' : `${percentage}%` },
            ]}
          />
        </View>
      </View>
    </Pressable>
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
        <BookOpenCheck color={colors.accent} size={20} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.moduleBlock, { color: colors.accent }]}>{module.block}</Text>
        <Text style={[styles.moduleTitle, { color: colors.text }]}>{module.title}</Text>
        <Text style={[styles.moduleCopy, { color: colors.mutedText }]}>{module.description}</Text>
      </View>
      <ArrowUpRight color={colors.accent} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blockBody: {
    flex: 1,
    gap: 8,
  },
  blockCard: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  blockHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  blockKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    letterSpacing: 2,
  },
  blockMeta: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  blockMetaText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11.5,
  },
  blockMetaValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
  },
  blockName: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
    marginTop: 2,
  },
  blockRail: {
    borderRadius: 999,
    width: 2,
  },
  blockStack: {
    gap: 12,
  },
  blockTagline: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  content: {
    gap: 14,
    paddingBottom: 126,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  count: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11.5,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    fontSize: 11.5,
    letterSpacing: 0.8,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  intro: {
    gap: 6,
    paddingTop: 4,
  },
  moduleBlock: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  moduleCard: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  moduleCopy: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  moduleTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    marginTop: 2,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  progressTrack: {
    borderRadius: 999,
    height: 5,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  section: {
    gap: 4,
    paddingTop: 8,
  },
  sectionHelper: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 17,
  },
  sectionInline: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 22,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
});
