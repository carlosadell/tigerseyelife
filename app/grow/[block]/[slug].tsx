// app/grow/[block]/[slug].tsx
import { ChevronLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EducationalLessonView } from '../../../components/grow/EducationalLessonView';
import { StubLessonView } from '../../../components/grow/StubLessonView';
import { WorkoutLessonView } from '../../../components/grow/WorkoutLessonView';
import {
  BLOCK_IDS,
  isStub,
  nextIncompleteSection,
  sectionBySlug,
  THREAD_NAMES,
  type BlockId,
} from '../../../lib/curriculum';
import {
  COLORS,
  FONTS,
  SPACING,
  THEME_COLORS,
  ctaTextOnTangerine,
} from '../../../lib/brand';

const light = THEME_COLORS.light;

export default function SectionDetailScreen() {
  const params = useLocalSearchParams<{ block?: string; slug?: string }>();
  const blockId = useMemo<BlockId | null>(() => {
    const upper = String(params.block ?? '').toUpperCase();
    return (BLOCK_IDS as readonly string[]).includes(upper) ? (upper as BlockId) : null;
  }, [params.block]);
  const slug = String(params.slug ?? '');
  const section = sectionBySlug(slug);
  const isCompleted = (_slug: string) => false;
  const completeSection = async (_bId: string, _slug: string) => {};

  if (!blockId || !section || section.blockId !== blockId) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: light.background }]}>
        <View style={styles.frame}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>This section doesn't exist.</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.notFoundBack}>Back</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const stub = isStub(section);
  const alreadyDone = isCompleted(section.slug);
  const ctaLabel = alreadyDone
    ? 'Continue'
    : stub
      ? 'Mark as read'
      : 'Complete and Next';

  const onComplete = async () => {
    if (!alreadyDone) await completeSection(blockId, section.slug);
    const next = nextIncompleteSection(blockId, isCompleted);
    if (next && next.slug !== section.slug) {
      router.replace(`/grow/${blockId.toLowerCase()}/${next.slug}` as never);
    } else {
      router.replace(`/grow/${blockId.toLowerCase()}` as never);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={light.text} size={24} />
          </Pressable>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {THREAD_NAMES[section.threadLetter]}
          </Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerStack}>
            {section.emoji ? <Text style={styles.emoji}>{section.emoji}</Text> : null}
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.thread}>
              {`Block ${section.blockId} · ${THREAD_NAMES[section.threadLetter]}`}
            </Text>
          </View>

          <View style={styles.body}>
            {section.content.kind === 'educational' ? (
              <EducationalLessonView content={section.content} />
            ) : section.content.kind === 'workout' ? (
              <WorkoutLessonView content={section.content} />
            ) : (
              <StubLessonView />
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            onPress={onComplete}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={styles.cta}>
              <Text style={[styles.ctaText, { color: ctaTextOnTangerine('light') }]}>
                {ctaLabel}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    height: 32,
    width: 32,
  },
  body: {
    marginTop: 24,
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 16,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaText: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    letterSpacing: -0.1,
  },
  emoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  footer: {
    paddingBottom: 12,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
  frame: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    width: '100%',
  },
  headerStack: {
    gap: 6,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  notFoundBack: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  notFoundText: {
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
  },
  thread: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
  },
  topBarTitle: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.2,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
});
