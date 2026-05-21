import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { ArrowUp, Sparkles } from 'lucide-react-native';
import type { ElementRef } from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EyeMark } from '../brand/EyeMark';
import { useCoachContext } from '../../hooks/useCoachContext';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';
import {
  CoachReply,
  QuickPrompt,
  getPersonalGreeting,
  getQuickPrompts,
  routeFreeform,
  routePrompt,
} from '../../lib/coachKnowledge';

type CoachMessage = {
  id: string;
  role: 'user' | 'coach';
  content: string;
  followups?: string[];
};

type CoachBottomSheetRef = ElementRef<typeof BottomSheet>;

export const CoachBottomSheet = forwardRef<CoachBottomSheetRef>(function CoachBottomSheet(_props, ref) {
  const { colors, mode } = useTheme();
  const knowledge = useCoachContext();
  const snapPoints = useMemo(() => ['78%', '94%'], []);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const quickPrompts = useMemo(() => getQuickPrompts(knowledge), [knowledge]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  const respond = useCallback(
    (reply: CoachReply) => {
      setThinking(true);
      const id = `${Date.now()}-coach`;
      setTimeout(() => {
        setThinking(false);
        setMessages((current) => [
          ...current,
          {
            id,
            role: 'coach',
            content: reply.text,
            followups: reply.followups,
          },
        ]);
      }, 650);
    },
    [],
  );

  const sendFreeform = useCallback(() => {
    const content = draft.trim();
    if (!content) return;
    Haptics.selectionAsync();
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: 'user', content },
    ]);
    setDraft('');
    respond(routeFreeform(content, knowledge));
  }, [draft, knowledge, respond]);

  const askPrompt = useCallback(
    (prompt: QuickPrompt) => {
      Haptics.selectionAsync();
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-user`, role: 'user', content: prompt.label },
      ]);
      respond(routePrompt(prompt.id, knowledge));
    },
    [knowledge, respond],
  );

  const askFollowup = useCallback(
    (label: string) => {
      Haptics.selectionAsync();
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-user`, role: 'user', content: label },
      ]);
      respond(routeFreeform(label, knowledge));
    },
    [knowledge, respond],
  );

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.card }]}
      enablePanDownToClose
      handleIndicatorStyle={[styles.handle, { backgroundColor: colors.accent }]}
      index={-1}
      keyboardBlurBehavior="restore"
      keyboardBehavior="interactive"
      ref={ref}
      snapPoints={snapPoints}
    >
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.cardAlt, borderColor: colors.accent }]}>
          <EyeMark color={colors.accent} size={26} strokeWidth={2.1} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerKicker, { color: colors.accent }]}>YOUR COACH</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tigers Eye</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.thread}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <CoachIntro
            greeting={getPersonalGreeting(knowledge)}
            knowledge={knowledge}
            quickPrompts={quickPrompts}
            onPromptPress={askPrompt}
          />
        ) : (
          <>
            <Text style={[styles.threadKicker, { color: colors.mutedText }]}>
              CONVERSATION
            </Text>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onFollowupPress={askFollowup} />
            ))}
            {thinking ? <TypingBubble /> : null}
          </>
        )}
      </BottomSheetScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={16}
      >
        {messages.length > 0 && !thinking ? (
          <View style={[styles.followupBar, { borderTopColor: colors.border }]}>
            {quickPrompts.slice(0, 3).map((prompt) => (
              <Pressable
                key={prompt.id}
                onPress={() => askPrompt(prompt)}
                style={[
                  styles.followupChip,
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.followupChipText, { color: colors.text }]} numberOfLines={1}>
                  {prompt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={[styles.composer, { borderTopColor: colors.border }]}>
          <BottomSheetTextInput
            onChangeText={setDraft}
            onSubmitEditing={sendFreeform}
            placeholder="Ask your coach…"
            placeholderTextColor={colors.mutedText}
            returnKeyType="send"
            style={[
              styles.input,
              {
                backgroundColor: colors.cardAlt,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={draft}
          />
          <Pressable
            accessibilityRole="button"
            onPress={sendFreeform}
            style={[styles.send, { backgroundColor: draft.trim() ? colors.accent : colors.cardAlt }]}
          >
            <ArrowUp
              color={draft.trim() ? colors.inverseText : colors.mutedText}
              size={18}
              strokeWidth={2.6}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
});

function CoachIntro({
  greeting,
  knowledge,
  quickPrompts,
  onPromptPress,
}: {
  greeting: string;
  knowledge: ReturnType<typeof useCoachContext>;
  quickPrompts: QuickPrompt[];
  onPromptPress: (prompt: QuickPrompt) => void;
}) {
  const { colors } = useTheme();
  const knownItems: { label: string; value: string }[] = [];
  if (knowledge.program) knownItems.push({ label: 'Program', value: knowledge.program.name });
  if (knowledge.todayWorkout) knownItems.push({ label: 'Today', value: knowledge.todayWorkout.name });
  knownItems.push({ label: 'Streak', value: `${knowledge.streakDays} days` });
  if (knowledge.intention) {
    knownItems.push({
      label: 'Intent',
      value: knowledge.intention.length > 84 ? `${knowledge.intention.slice(0, 80)}…` : knowledge.intention,
    });
  }

  return (
    <View style={styles.introStack}>
      <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>

      <View
        style={[styles.knowCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
      >
        <View style={[styles.knowRail, { backgroundColor: colors.accent }]} />
        <View style={styles.knowBody}>
          <View style={styles.knowHeader}>
            <Sparkles color={colors.accent} size={14} strokeWidth={2.2} />
            <Text style={[styles.knowKicker, { color: colors.accent }]}>I HAVE YOUR CONTEXT</Text>
          </View>
          {knownItems.map((item) => (
            <View key={item.label} style={styles.knowRow}>
              <Text style={[styles.knowLabel, { color: colors.mutedText }]}>{item.label}</Text>
              <Text style={[styles.knowValue, { color: colors.text }]} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[styles.introKicker, { color: colors.mutedText }]}>QUICK ASKS</Text>
      <View style={styles.promptGrid}>
        {quickPrompts.map((prompt) => (
          <Pressable
            key={prompt.id}
            onPress={() => onPromptPress(prompt)}
            style={({ pressed }) => [
              styles.promptCard,
              {
                backgroundColor: colors.cardAlt,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.promptText, { color: colors.text }]}>{prompt.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MessageBubble({
  message,
  onFollowupPress,
}: {
  message: CoachMessage;
  onFollowupPress: (label: string) => void;
}) {
  const { colors } = useTheme();
  const isCoach = message.role === 'coach';

  return (
    <View style={styles.messageBlock}>
      <View
        style={[
          styles.bubble,
          isCoach
            ? { alignSelf: 'flex-start', backgroundColor: colors.cardAlt, borderColor: colors.border, borderWidth: 1 }
            : { alignSelf: 'flex-end', backgroundColor: colors.accent },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isCoach ? colors.text : colors.inverseText },
          ]}
        >
          {message.content}
        </Text>
      </View>
      {isCoach && message.followups && message.followups.length > 0 ? (
        <View style={styles.bubbleFollowups}>
          {message.followups.map((label) => (
            <Pressable
              key={label}
              onPress={() => onFollowupPress(label)}
              style={[styles.followupGhost, { borderColor: colors.accent }]}
            >
              <Text style={[styles.followupGhostText, { color: colors.accent }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TypingBubble() {
  const { colors } = useTheme();
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            delay: index * 140,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            toValue: 0.3,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View style={styles.messageBlock}>
      <View
        style={[
          styles.bubble,
          styles.typingBubble,
          { alignSelf: 'flex-start', backgroundColor: colors.cardAlt, borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={[styles.typingDot, { backgroundColor: colors.accent, opacity: dot }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.4,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  background: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  bubble: {
    borderRadius: 16,
    maxWidth: '88%',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  bubbleFollowups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  bubbleText: {
    fontFamily: FONTS.sans,
    fontSize: 14.5,
    lineHeight: 20,
  },
  composer: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 14,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  followupBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 6,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  followupChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  followupChipText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
  },
  followupGhost: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  followupGhostText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  greeting: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 2,
  },
  handle: {
    opacity: 0.5,
    width: 42,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  headerRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 14,
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  headerTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  input: {
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14.5,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  introKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
    paddingHorizontal: 2,
    paddingTop: 4,
  },
  introStack: {
    gap: 14,
  },
  knowBody: {
    flex: 1,
    gap: 8,
  },
  knowCard: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  knowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  knowKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 2,
  },
  knowLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    width: 56,
  },
  knowRail: {
    borderRadius: 999,
    width: 2,
  },
  knowRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  knowValue: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 17,
  },
  messageBlock: {
    marginBottom: 12,
  },
  promptCard: {
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    padding: 12,
  },
  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 17,
  },
  send: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    marginTop: 2,
    width: 8,
  },
  thread: {
    gap: 0,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  threadKicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  typingBubble: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  typingDot: {
    borderRadius: 4,
    height: 6,
    width: 6,
  },
});
