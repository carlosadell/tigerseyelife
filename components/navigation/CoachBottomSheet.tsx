import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { ArrowUp, Mic, Sparkles, X } from 'lucide-react-native';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

// expo-speech-recognition is a native module — not available in Expo Go.
// Lazy-require so the import doesn't crash, then gate the UI behind availability.
const isExpoGo = Constants.executionEnvironment === 'storeClient';
let SpeechModule: any = null;
let useSpeechRecognitionEvent: any = null;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-speech-recognition');
    SpeechModule = mod.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
  } catch {
    SpeechModule = null;
  }
}
const VOICE_AVAILABLE = SpeechModule !== null && typeof useSpeechRecognitionEvent === 'function';

type CoachMessage = {
  id: string;
  role: 'user' | 'coach';
  content: string;
  followups?: string[];
};

export type CoachSheetHandle = {
  snapToIndex: (index: number) => void;
  close: () => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.86);

export const CoachBottomSheet = forwardRef<CoachSheetHandle>(function CoachBottomSheet(_props, ref) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const knowledge = useCoachContext();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const quickPrompts = useMemo(() => getQuickPrompts(knowledge), [knowledge]);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
        toValue: SHEET_HEIGHT,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [backdropOpacity, translateY]);

  useImperativeHandle(
    ref,
    () => ({
      snapToIndex: () => open(),
      close,
    }),
    [close, open],
  );

  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_HEIGHT);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 320,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          duration: 240,
          easing: Easing.out(Easing.cubic),
          toValue: 0.6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [backdropOpacity, translateY, visible]);

  const respond = useCallback((reply: CoachReply) => {
    setThinking(true);
    const id = `${Date.now()}-coach`;
    setTimeout(() => {
      setThinking(false);
      setMessages((current) => [
        ...current,
        { id, role: 'coach', content: reply.text, followups: reply.followups },
      ]);
    }, 650);
  }, []);

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
    <Modal animationType="none" onRequestClose={close} statusBarTranslucent transparent visible={visible}>
      <View style={styles.modalRoot}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents={visible ? 'auto' : 'none'}
        >
          <Pressable onPress={close} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              height: SHEET_HEIGHT,
              paddingBottom: insets.bottom,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.handleContainer]}>
            <View style={[styles.handle, { backgroundColor: colors.accent }]} />
          </View>

          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.cardAlt, borderColor: colors.accent }]}>
              <EyeMark color={colors.accent} size={24} strokeWidth={2.1} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.headerKicker, { color: colors.accent }]}>YOUR COACH</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Tigers Eye</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Pressable hitSlop={10} onPress={close} style={styles.closeBtn}>
              <X color={colors.mutedText} size={20} />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
            style={styles.body}
          >
            <ScrollView
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
                  <Text style={[styles.threadKicker, { color: colors.mutedText }]}>CONVERSATION</Text>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} onFollowupPress={askFollowup} />
                  ))}
                  {thinking ? <TypingBubble /> : null}
                </>
              )}
            </ScrollView>

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
              <TextInput
                onChangeText={setDraft}
                onSubmitEditing={sendFreeform}
                placeholder={listening ? 'Listening…' : 'Ask your coach…'}
                placeholderTextColor={listening ? COLORS.tangerine : colors.mutedText}
                returnKeyType="send"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardAlt,
                    borderColor: listening ? COLORS.tangerine : colors.border,
                    color: colors.text,
                  },
                ]}
                value={draft}
              />
              {VOICE_AVAILABLE ? (
                <VoiceMic
                  listening={listening}
                  onTranscript={setDraft}
                  onListeningChange={setListening}
                />
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={sendFreeform}
                style={[
                  styles.send,
                  { backgroundColor: draft.trim() ? colors.accent : colors.cardAlt },
                ]}
              >
                <ArrowUp
                  color={draft.trim() ? colors.inverseText : colors.mutedText}
                  size={18}
                  strokeWidth={2.6}
                />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
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

      <View style={[styles.knowCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
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
        <Text style={[styles.bubbleText, { color: isCoach ? colors.text : colors.inverseText }]}>
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

type VoiceMicProps = {
  listening: boolean;
  onTranscript: (text: string) => void;
  onListeningChange: (listening: boolean) => void;
};

function VoiceMic({ listening, onTranscript, onListeningChange }: VoiceMicProps) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  // expo-speech-recognition hook — only attached when the module is loaded
  useSpeechRecognitionEvent('result', (event: any) => {
    const transcript = event?.results?.[0]?.transcript;
    if (typeof transcript === 'string') {
      onTranscript(transcript);
    }
  });
  useSpeechRecognitionEvent('end', () => onListeningChange(false));
  useSpeechRecognitionEvent('error', () => onListeningChange(false));

  useEffect(() => {
    if (!listening) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 700,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 700,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  const toggle = async () => {
    if (listening) {
      try {
        SpeechModule?.stop();
      } catch {
        // ignore
      }
      onListeningChange(false);
      return;
    }
    try {
      const perm = await SpeechModule.requestPermissionsAsync();
      if (!perm?.granted) return;
      Haptics.selectionAsync();
      onListeningChange(true);
      SpeechModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
      });
    } catch {
      onListeningChange(false);
    }
  };

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={listening ? 'Stop listening' : 'Speak to your coach'}
      onPress={toggle}
      style={styles.mic}
    >
      {listening ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.micPulse,
            {
              borderColor: COLORS.tangerine,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.micCircle,
          {
            backgroundColor: listening ? COLORS.tangerine : colors.cardAlt,
            borderColor: listening ? COLORS.tangerine : colors.border,
          },
        ]}
      >
        <Mic
          color={listening ? '#FFFFFF' : colors.mutedText}
          size={18}
          strokeWidth={2.2}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.4,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backdrop: {
    backgroundColor: '#000',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  body: {
    flex: 1,
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
  closeBtn: {
    padding: 4,
  },
  composer: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 12,
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
    borderRadius: 999,
    height: 4,
    opacity: 0.5,
    width: 42,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
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
    paddingBottom: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
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
  mic: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  micCircle: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  micPulse: {
    borderRadius: 22,
    borderWidth: 1.6,
    height: 44,
    position: 'absolute',
    width: 44,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
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
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    marginTop: 2,
    width: 8,
  },
  thread: {
    paddingBottom: 8,
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
