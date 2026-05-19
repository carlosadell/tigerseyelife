import { StyleSheet } from 'react-native';

import { COLORS, FONTS, SPACING, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

export const onboardingStyles = StyleSheet.create({
  content: {
    gap: 22,
    paddingBottom: 120,
    paddingHorizontal: SPACING.screenX,
  },
  exit: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
  },
  footer: {
    backgroundColor: light.background,
    borderTopColor: light.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    left: 0,
    padding: 16,
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
    paddingVertical: 14,
  },
  progressText: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
  },
  screen: {
    backgroundColor: light.background,
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenX,
    paddingTop: 8,
  },
});
