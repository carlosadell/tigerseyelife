import { StyleSheet } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

export const stepStyles = StyleSheet.create({
  cardTitle: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
  },
  copy: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  hero: {
    gap: 10,
  },
  eyeStage: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: light.card,
    borderColor: COLORS.tigerGold,
    borderRadius: 32,
    borderWidth: 1,
    height: 116,
    justifyContent: 'center',
    width: 116,
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
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  input: {
    backgroundColor: light.card,
    borderColor: light.border,
    borderRadius: 16,
    borderWidth: 1,
    color: light.text,
    fontFamily: FONTS.sans,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    minHeight: 110,
    textAlignVertical: 'top',
  },
  title: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 30,
    lineHeight: 35,
  },
});
