import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { ArrowUp } from 'lucide-react-native';
import type { ElementRef } from 'react';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CoachAvatar } from '../brand/CoachAvatar';
import { HairlineDivider } from '../brand/HairlineDivider';
import { COLORS, FONTS } from '../../lib/brand';

export type CoachMessage = {
  id: string;
  role: 'user' | 'coach';
  content: string;
};

type CoachBottomSheetRef = ElementRef<typeof BottomSheet>;

const starterMessages: CoachMessage[] = [
  {
    id: 'starter',
    role: 'coach',
    content: "I'm here when you need me. What's on your mind today?",
  },
];

export const CoachBottomSheet = forwardRef<CoachBottomSheetRef>(function CoachBottomSheet(
  _props,
  ref,
) {
  const snapPoints = useMemo(() => ['60%', '90%'], []);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>(starterMessages);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.62}
        pressBehavior="close"
      />
    ),
    [],
  );

  const sendMessage = () => {
    const content = draft.trim();

    if (!content) return;

    // [ ROUND 5 ] Messages stay local until the real AI coach API is wired.
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        role: 'user',
        content,
      },
    ]);
    setDraft('');
  };

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      enablePanDownToClose
      handleIndicatorStyle={styles.handle}
      index={-1}
      keyboardBlurBehavior="restore"
      keyboardBehavior="interactive"
      ref={ref}
      snapPoints={snapPoints}
    >
      <BottomSheetView style={styles.sheet}>
        <View style={styles.header}>
          <CoachAvatar size={56} />
          <View style={styles.headerCopy}>
            <Text style={styles.label}>COACH</Text>
            <Text style={styles.title}>Tigers Eye</Text>
          </View>
        </View>
        <HairlineDivider />
        <ScrollView
          contentContainerStyle={styles.thread}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => {
            const isCoach = message.role === 'coach';

            return (
              <View
                key={message.id}
                style={[
                  styles.bubble,
                  isCoach ? styles.coachBubble : styles.userBubble,
                ]}
              >
                <Text style={isCoach ? styles.coachBubbleText : styles.userBubbleText}>
                  {message.content}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={16}
        >
          <View style={styles.composer}>
            <BottomSheetTextInput
              onChangeText={setDraft}
              onSubmitEditing={sendMessage}
              placeholder="Message your coach..."
              placeholderTextColor={COLORS.steel}
              returnKeyType="send"
              style={styles.input}
              value={draft}
            />
            <Pressable accessibilityRole="button" onPress={sendMessage} style={styles.send}>
              <ArrowUp color={COLORS.onyx} size={18} strokeWidth={2.6} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.charcoal,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  bubble: {
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bone,
  },
  coachBubbleText: {
    color: COLORS.onyx,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  composer: {
    alignItems: 'center',
    borderTopColor: COLORS.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  handle: {
    backgroundColor: COLORS.tigerGold,
    opacity: 0.4,
    width: 42,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  headerCopy: {
    gap: 2,
  },
  input: {
    backgroundColor: COLORS.charcoal2,
    borderColor: COLORS.line,
    borderRadius: 999,
    borderWidth: 1,
    color: COLORS.bone,
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    color: COLORS.steel,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.65,
  },
  send: {
    alignItems: 'center',
    backgroundColor: COLORS.tigerGold,
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sheet: {
    flex: 1,
  },
  thread: {
    padding: 20,
  },
  title: {
    color: COLORS.bone,
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.deepGreen,
  },
  userBubbleText: {
    color: COLORS.bone,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
});
