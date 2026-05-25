import { RotateCcw, X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '../../hooks/useTheme';
import { useTodayEngagement } from '../../hooks/useTodayEngagement';
import { FONTS } from '../../lib/brand';

const OTHER_MOVEMENT_OPTIONS = [
  'Pickleball',
  'Yoga',
  'Hiking',
  'Swimming',
  'Dancing',
  'Cycling',
  'Gardening',
  'Stretching',
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.6);

type QuickAddSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function QuickAddSheet({ visible, onClose }: QuickAddSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { engagement, addOtherMovement, resetWater } = useTodayEngagement();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_HEIGHT);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          duration: 240,
          easing: Easing.out(Easing.cubic),
          toValue: 0.55,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [backdropOpacity, translateY, visible]);

  const close = () => {
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
    ]).start(() => onClose());
  };

  return (
    <Modal animationType="none" onRequestClose={close} statusBarTranslucent transparent visible={visible}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents={visible ? 'auto' : 'none'}>
          <Pressable onPress={close} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              height: SHEET_HEIGHT,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.accent }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: colors.accent }]}>QUICK LOG</Text>
              <Text style={[styles.title, { color: colors.text }]}>Anything counts</Text>
              <Text style={[styles.body, { color: colors.mutedText }]}>
                Any engagement keeps your streak alive. Tap what you did today.
              </Text>
            </View>
            <Pressable hitSlop={10} onPress={close} style={styles.closeBtn}>
              <X color={colors.mutedText} size={20} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>OTHER MOVEMENT</Text>
            <View style={styles.tagWrap}>
              {OTHER_MOVEMENT_OPTIONS.map((label) => {
                const active = engagement.otherMovement.includes(label);
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={label}
                    onPress={() => {
                      if (!active) {
                        addOtherMovement(label);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.tag,
                      {
                        backgroundColor: active ? colors.accent : colors.cardAlt,
                        borderColor: active ? colors.accent : colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: active ? colors.inverseText : colors.text },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedText }]}>WATER</Text>
            <View style={[styles.row, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                Currently {engagement.water} glass{engagement.water === 1 ? '' : 'es'} logged today
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={resetWater}
                style={({ pressed }) => [
                  styles.resetBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <RotateCcw color={colors.mutedText} size={14} strokeWidth={2} />
                <Text style={[styles.resetText, { color: colors.mutedText }]}>Reset</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={close}
            style={[styles.doneBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.doneText, { color: colors.inverseText }]}>Done</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  body: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  doneBtn: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 'auto',
    minHeight: 50,
  },
  doneText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  handle: {
    borderRadius: 999,
    height: 4,
    opacity: 0.5,
    width: 42,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 8,
  },
  header: {
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  kicker: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  resetBtn: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resetText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  row: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLabel: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  section: {
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 19,
    letterSpacing: -0.3,
    marginTop: 2,
  },
});
