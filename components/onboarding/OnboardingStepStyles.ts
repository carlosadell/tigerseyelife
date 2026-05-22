import { StyleSheet } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

export const stepStyles = StyleSheet.create({
  cardTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  copy: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 19,
  },
  eyeStage: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: light.card,
    borderColor: COLORS.tigerGold,
    borderRadius: 14,
    borderWidth: 1.4,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  hero: {
    gap: 12,
  },
  heroCompactMascot: {
    alignSelf: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
  heroWide: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  infoCard: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  input: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 10,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 14.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  question: {
    gap: 10,
  },
  smallCopy: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  step: {
    gap: 14,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
});
