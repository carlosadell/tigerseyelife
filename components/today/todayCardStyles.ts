import { StyleSheet } from 'react-native';

import { COLORS, FONTS } from '../../lib/brand';

export const todayCardStyles = StyleSheet.create({
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  body: {
    color: COLORS.steel,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.charcoal,
    borderColor: COLORS.line,
    borderRadius: 10,
    borderWidth: 1,
    gap: 9,
    padding: 15,
  },
  checkOutline: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.tigerGold,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  flame: {
    fontSize: 18,
  },
  goldAction: {
    color: COLORS.tigerGold,
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  goldCard: {
    borderColor: COLORS.tigerGold,
  },
  iconWell: {
    alignItems: 'center',
    backgroundColor: COLORS.charcoal2,
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  initials: {
    alignItems: 'center',
    backgroundColor: COLORS.tigerGold,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  initialsText: {
    color: COLORS.onyx,
    fontFamily: FONTS.sansBold,
    fontSize: 12,
  },
  kicker: {
    color: COLORS.steel,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  mealNumber: {
    color: COLORS.bone,
    fontFamily: FONTS.diagnostic,
    fontSize: 36,
    lineHeight: 38,
  },
  mealRow: {
    flexDirection: 'row',
    gap: 22,
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: COLORS.bone,
    flex: 1,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    textAlign: 'center',
  },
  quietCard: {
    backgroundColor: COLORS.charcoal2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  rowBetween: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  streak: {
    color: COLORS.bone,
    fontFamily: FONTS.sansBold,
    fontSize: 15,
  },
  title: {
    color: COLORS.bone,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    lineHeight: 21,
  },
});
