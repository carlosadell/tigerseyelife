// app/self-serve-intake.tsx
//
// Self-serve onboarding questionnaire — skeleton per the dev brief.
// Builds the routing layer the brief asks for ("turning self-serve on
// later is a switch, not a rebuild") even though Beta 2 launches
// guided-only. Wording is placeholder; the scoring algorithm, the
// time-eligibility gate, and the entry-concept routing are real.
//
// Route is reachable only by deep link until the self-serve pathway is
// turned on — the existing /onboarding flow still handles the guided
// pathway.

import { router } from 'expo-router';
import { ArrowRight, ChevronLeft } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useConceptTelemetry } from '../hooks/useConceptTelemetry';
import { COLORS, FONTS, THEME_COLORS } from '../lib/brand';
import { entryConceptFor } from '../lib/conceptRouter';
import type { Limiter } from '../lib/limiters';
import { LIMITERS } from '../lib/limiters';
import {
  LIMITER_QUESTIONS,
  SEE_THROUGH_FOLLOWUP,
  TIME_ELIGIBILITY_QUESTION,
  scoreLimiterAnswers,
} from '../lib/limiterScoring';
import type { ScoredAnswer, ScoringResult } from '../lib/limiterScoring';

const light = THEME_COLORS.light;

export default function SelfServeIntakeScreen() {
  const t = useConceptTelemetry();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ScoringResult | null>(null);

  const timeAnswer = answers[TIME_ELIGIBILITY_QUESTION.id];
  const followupAnswer = answers[SEE_THROUGH_FOLLOWUP.id];
  const triggersFollowup = timeAnswer === 'not-eligible';
  const isConfirmedOptOut =
    triggersFollowup && followupAnswer === 'full-season';

  // The full questionnaire flows like this:
  //   1. Time-eligibility question (always shown).
  //   2. See-through follow-up (only if user picked "not-eligible").
  //   3. Limiter questions (shown when user is eligible OR when the
  //      follow-up revealed a disguised systems/energy issue, never
  //      when a genuine "full-season" was confirmed).
  const visibleQuestions = useMemo(() => {
    const visible: Array<typeof TIME_ELIGIBILITY_QUESTION> = [TIME_ELIGIBILITY_QUESTION];
    if (triggersFollowup) {
      visible.push(SEE_THROUGH_FOLLOWUP);
      if (followupAnswer && followupAnswer !== 'full-season') {
        visible.push(...LIMITER_QUESTIONS);
      }
    } else if (timeAnswer === 'eligible') {
      visible.push(...LIMITER_QUESTIONS);
    }
    return visible;
  }, [timeAnswer, triggersFollowup, followupAnswer]);

  const allAnswered = useMemo(
    () => visibleQuestions.every((q) => !!answers[q.id]),
    [visibleQuestions, answers],
  );

  // Suppress unused-var warning while keeping the variable available
  // for any future "you opted out" inline messaging.
  void isConfirmedOptOut;

  const submit = () => {
    const scoredAnswers: ScoredAnswer[] = Object.entries(answers).map(
      ([questionId, optionId]) => ({ questionId, optionId }),
    );
    const next = scoreLimiterAnswers(scoredAnswers);

    // Telemetry. Two distinct events depending on outcome — the brief
    // explicitly separates time-eligibility opt-out from limiter
    // scoring so the analytics aren't muddled by people who never
    // entered the program.
    if (next.outcome === 'time-optout') {
      t.recordTimeEligibilityOptout('time-eligibility', 'library');
    } else {
      t.recordLimiterScored(next.outcome, 'library', {
        meta: {
          identity: next.scores.identity,
          knowledge: next.scores.knowledge,
          systems: next.scores.systems,
          energy: next.scores.energy,
          resilience: next.scores.resilience,
          competence: next.scores.competence,
        },
      });
    }

    setResult(next);
  };

  if (result) {
    return <ResultView result={result} onRetake={() => setResult(null)} />;
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft color={light.text} size={26} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          A few questions
        </Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>SELF-SERVE INTAKE</Text>
        <Text style={styles.title}>Where does the work need to start?</Text>
        <Text style={styles.lede}>
          Answer honestly — there is no right answer, just the one that fits.
          We use this to pick where you land on day one, not to label you.
        </Text>

        {visibleQuestions.map((question, idx) => (
          <View key={question.id} style={styles.questionBlock}>
            <Text style={styles.questionNumber}>Q{String(idx + 1).padStart(2, '0')}</Text>
            <Text style={styles.questionPrompt}>{question.prompt}</Text>
            {question.helper ? (
              <Text style={styles.questionHelper}>{question.helper}</Text>
            ) : null}

            <View style={styles.optionList}>
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                    }
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable
          disabled={!allAnswered}
          onPress={submit}
          style={({ pressed }) => [
            styles.submitBtn,
            { opacity: !allAnswered ? 0.4 : pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.submitLabel}>See where to start</Text>
          <ArrowRight color={light.inverseText} size={18} strokeWidth={2.4} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultView({
  result,
  onRetake,
}: {
  result: ScoringResult;
  onRetake: () => void;
}) {
  if (result.outcome === 'time-optout') {
    return <TimeOptOutView onRetake={onRetake} />;
  }
  return <LimiterResultView limiterId={result.outcome} scores={result.scores} onRetake={onRetake} />;
}

function LimiterResultView({
  limiterId,
  scores,
  onRetake,
}: {
  limiterId: import('../lib/limiters').LimiterId;
  scores: import('../lib/limiterScoring').LimiterScore;
  onRetake: () => void;
}) {
  const limiter: Limiter = LIMITERS[limiterId];
  const entryConcept = entryConceptFor(limiterId);

  const runnerUp = useMemo(() => {
    const ranked = Object.entries(scores)
      .filter(([id]) => id !== limiterId)
      .sort(([, a], [, b]) => b - a);
    const [topId, topScore] = ranked[0] ?? [];
    return topScore && topScore > 0 ? LIMITERS[topId as import('../lib/limiters').LimiterId] : null;
  }, [limiterId, scores]);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={onRetake} hitSlop={8}>
          <ChevronLeft color={light.text} size={26} />
        </Pressable>
        <Text style={styles.headerTitle}>Your starting point</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>YOUR LIMITER</Text>
        <Text style={styles.title}>{limiter.longLabel}.</Text>
        <Text style={styles.lede}>{limiter.helper}</Text>

        <View style={styles.quoteCard}>
          <View style={styles.quoteRail} />
          <Text style={styles.quoteText}>{`"${limiter.exampleQuote}"`}</Text>
        </View>

        {runnerUp ? (
          <Text style={styles.runnerUp}>
            You scored close on <Text style={styles.runnerUpName}>{runnerUp.shortLabel}</Text> too —
            we will revisit that one as you go.
          </Text>
        ) : null}

        {entryConcept ? (
          <Pressable
            onPress={() => router.replace(`/tool/${entryConcept.slug}` as never)}
            style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.submitLabel}>Start with {entryConcept.title}</Text>
            <ArrowRight color={light.inverseText} size={18} strokeWidth={2.4} />
          </Pressable>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderLabel}>NO ENTRY CONCEPT YET</Text>
            <Text style={styles.placeholderBody}>
              We do not have a purpose-built concept for {limiter.shortLabel} just yet.
              Karen is writing it. Until then, talk to your coach — that thread is
              fastest one-on-one.
            </Text>
          </View>
        )}

        <Pressable onPress={onRetake} hitSlop={8} style={styles.retake}>
          <Text style={styles.retakeLabel}>Retake the questionnaire</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimeOptOutView({ onRetake }: { onRetake: () => void }) {
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: light.background }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={onRetake} hitSlop={8}>
          <ChevronLeft color={light.text} size={26} />
        </Pressable>
        <Text style={styles.headerTitle}>Honest answer</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>TIME ELIGIBILITY</Text>
        <Text style={styles.title}>We will be ready when you are.</Text>
        <Text style={styles.lede}>
          Ten minutes a day is the floor. If you do not have it right now, that is an
          honest answer — not a failure. Come back when the season is different.
        </Text>

        <Pressable onPress={onRetake} hitSlop={8} style={styles.retake}>
          <Text style={styles.retakeLabel}>Actually, let me try again</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 64,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  headerTitle: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    textAlign: 'center',
  },
  kicker: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.8,
    marginTop: 8,
  },
  lede: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14.5,
    lineHeight: 21,
    marginBottom: 14,
  },
  option: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionLabel: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    lineHeight: 19,
  },
  optionLabelSelected: { color: light.text },
  optionList: { gap: 8, marginTop: 12 },
  optionSelected: {
    borderColor: light.accent,
    shadowColor: light.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  placeholderBody: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 6,
  },
  placeholderCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginTop: 10,
    padding: 14,
  },
  placeholderLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  questionBlock: {
    marginTop: 18,
  },
  questionHelper: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  questionNumber: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  questionPrompt: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
    marginTop: 4,
  },
  quoteCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    padding: 14,
  },
  quoteRail: {
    backgroundColor: light.accent,
    borderRadius: 999,
    width: 2,
  },
  quoteText: {
    color: light.text,
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  radio: {
    alignItems: 'center',
    borderColor: light.border,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioDot: {
    backgroundColor: light.accent,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  radioSelected: { borderColor: light.accent },
  retake: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 10,
  },
  retakeLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
  },
  runnerUp: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  runnerUpName: {
    color: light.text,
    fontFamily: FONTS.sansBold,
  },
  screen: { flex: 1 },
  spacer: { width: 26 },
  submitBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.tangerine,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 14,
  },
  submitLabel: {
    color: light.inverseText,
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
    marginTop: 6,
  },
});
