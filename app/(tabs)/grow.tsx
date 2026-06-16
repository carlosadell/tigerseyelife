// app/(tabs)/grow.tsx
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { ArrowUpRight, BookOpenCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlockCard } from '../../components/grow/BlockCard';
import { useMembership } from '../../hooks/useMembership';
import { useMicrolearningModules } from '../../hooks/useMicrolearningModules';
import { useThemeColors } from '../../hooks/useTheme';
import { COLORS, FONTS, SPACING } from '../../lib/brand';
import { BLOCK_IDS, type BlockId } from '../../lib/curriculum';
import type { MicrolearningModule } from '../../lib/programs';

export default function GrowScreen() {
  const colors = useThemeColors();
  const { membership } = useMembership();
  const completedInBlock = (_blockId: string) => 0;
  const { data = [] } = useMicrolearningModules();

  const currentBlock = (membership.currentBlock ?? 'COMMIT') as BlockId;

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
              Two-week cycles of small actions. Aim for 40 to 50 percent consistency. The rest is bonus.
            </Text>
          </View>

          <View style={styles.blockStack}>
            {BLOCK_IDS.map((blockId) => (
              <BlockCard
                key={blockId}
                blockId={blockId}
                currentBlock={currentBlock}
                doneCount={completedInBlock(blockId)}
                onPress={() => router.push(`/grow/${blockId.toLowerCase()}` as never)}
              />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>MICROLEARNING</Text>
            <Text style={[styles.sectionHelper, { color: colors.mutedText }]}>
              Karen and Ryan's modules stay full-length by design. Cards open the current Tiiny version in-app.
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
            <Text style={[styles.sectionHelper, { color: colors.mutedText }]}>
              {visibleModules.length} modules
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

function ModuleCard({ module }: { module: MicrolearningModule }) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open module ${module.title}`}
      onPress={() => {
        if (!module.tiiny_url) return;
        WebBrowser.openBrowserAsync(module.tiiny_url).catch(() => {});
      }}
      style={({ pressed }) => [
        styles.moduleCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.94 : 1 },
      ]}
    >
      <View style={styles.moduleHead}>
        <View style={[styles.moduleIcon, { backgroundColor: colors.cardAlt }]}>
          <BookOpenCheck color={colors.accent} size={18} strokeWidth={2} />
        </View>
        <Text style={[styles.moduleBlock, { color: colors.mutedText }]}>{module.block}</Text>
      </View>
      <Text style={[styles.moduleTitle, { color: colors.text }]} numberOfLines={2}>
        {module.title}
      </Text>
      <View style={styles.moduleFooter}>
        <Text style={[styles.moduleDuration, { color: colors.mutedText }]} numberOfLines={2}>
          {module.description ?? ''}
        </Text>
        <ArrowUpRight color={COLORS.tangerine} size={18} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blockStack: {
    marginBottom: 24,
    marginTop: 8,
  },
  content: {
    paddingBottom: 128,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterContent: {
    paddingRight: 14,
  },
  filterScroll: {
    marginTop: 8,
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
  intro: {
    gap: 6,
    paddingTop: 4,
  },
  moduleBlock: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  moduleCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  moduleDuration: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
  },
  moduleFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  moduleHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  moduleIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  moduleTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15.5,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  phoneFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  section: {
    gap: 4,
    marginTop: 8,
  },
  sectionHelper: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 18,
  },
  sectionInline: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    marginTop: 14,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    color: '#141416',
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
});
