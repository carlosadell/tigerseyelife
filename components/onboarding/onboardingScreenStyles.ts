import { StyleSheet } from 'react-native';

import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

export const onboardingStyles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 132,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 4,
  },
  exit: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.3,
  },
  footer: {
    backgroundColor: light.background,
    borderTopColor: light.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    left: 0,
    paddingBottom: 18,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  keyboard: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: light.background,
    flex: 1,
    justifyContent: 'center',
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingVertical: 12,
  },
  progressText: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
  },
  screen: {
    backgroundColor: light.background,
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    borderBottomColor: light.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: SPACING.screenX,
    paddingTop: 6,
  },
});

export const onboardingColors = {
  accent: COLORS.tigerGold,
  action: COLORS.tangerine,
  background: light.background,
  border: light.border,
  card: light.card,
  cardAlt: light.cardAlt,
  mutedText: light.mutedText,
  text: light.text,
};
