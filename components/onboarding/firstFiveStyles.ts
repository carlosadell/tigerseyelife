import { StyleSheet } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

export const firstFiveStyles = StyleSheet.create({
  completeBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.tigerGold,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  completeText: {
    color: COLORS.onyx,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
  },
  copy: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  header: {
    gap: 8,
  },
  moveCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  moveCopy: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  moveNumber: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.diagnostic,
    fontSize: 28,
    lineHeight: 30,
  },
  moveTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
  },
  movementList: {
    gap: 10,
  },
  phase: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
  },
  playCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.tigerGold,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  timer: {
    color: light.text,
    fontFamily: FONTS.diagnostic,
    fontSize: 64,
    lineHeight: 66,
  },
  timerButton: {
    alignSelf: 'center',
    borderColor: COLORS.tigerGold,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  timerButtonText: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
  },
  timerCard: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderWidth: 1,
    borderRadius: 22,
    gap: 8,
    padding: 18,
  },
  timerLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 30,
    lineHeight: 35,
  },
  videoCard: {
    alignItems: 'center',
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    padding: 28,
  },
  videoCopy: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  videoTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
  },
  wrap: {
    gap: 18,
  },
});
