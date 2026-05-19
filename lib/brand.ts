export const colors = {
  onyx: '#0B0B0C',
  charcoal: '#2E2F2F',
  'charcoal-2': '#202121',
  'tiger-gold': '#C89F4D',
  amber: '#B78219',
  tangerine: '#FF914D',
  'electric-yellow': '#FFDE59',
  'evidence-blue': '#436E99',
  'deep-green': '#1E5B45',
  steel: '#A8AFB8',
  bone: '#F5F2EA',
  line: 'rgba(255,255,255,0.06)',
} as const;

export const COLORS = {
  ...colors,
  charcoal2: colors['charcoal-2'],
  evidenceBlue: colors['evidence-blue'],
  electricYellow: colors['electric-yellow'],
  tigerGold: colors['tiger-gold'],
  tangerine: colors.tangerine,
  deepGreen: colors['deep-green'],
  deepRed: '#A54848',
  glassPanel: 'rgba(28,28,31,0.72)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassHighlight: 'rgba(255,255,255,0.05)',
  goldGlow: 'rgba(212,160,42,0.38)',
} as const;

export const THEME_COLORS = {
  dark: {
    accent: COLORS.tigerGold,
    accentMuted: COLORS.amber,
    action: COLORS.tangerine,
    background: COLORS.onyx,
    border: COLORS.line,
    card: COLORS.charcoal,
    cardAlt: COLORS.charcoal2,
    coachBubble: COLORS.bone,
    coachBubbleText: COLORS.onyx,
    danger: COLORS.deepRed,
    glassBorder: COLORS.glassBorder,
    glassHighlight: COLORS.glassHighlight,
    glassPanel: COLORS.glassPanel,
    glow: COLORS.goldGlow,
    inverseText: COLORS.onyx,
    mutedText: COLORS.steel,
    success: COLORS.deepGreen,
    successText: '#FFFFFF',
    text: COLORS.bone,
  },
  light: {
    accent: '#A87414',
    accentMuted: COLORS.amber,
    action: COLORS.tangerine,
    background: '#FBF8F1',
    border: 'rgba(11,11,12,0.10)',
    card: '#FFFFFF',
    cardAlt: '#F2EDE3',
    coachBubble: '#FFFFFF',
    coachBubbleText: '#141416',
    danger: COLORS.deepRed,
    glassBorder: 'rgba(11,11,12,0.12)',
    glassHighlight: 'rgba(255,255,255,0.70)',
    glassPanel: 'rgba(255,255,255,0.78)',
    glow: 'rgba(212,160,42,0.24)',
    inverseText: COLORS.onyx,
    mutedText: '#5F6670',
    success: COLORS.deepGreen,
    successText: '#FFFFFF',
    text: '#141416',
  },
} as const;

export type ThemeMode = keyof typeof THEME_COLORS;

export const fontFamily = {
  sans: 'Inter_400Regular',
  'sans-medium': 'Inter_500Medium',
  'sans-bold': 'Inter_700Bold',
  mono: 'Inter_500Medium',
  diagnostic: 'VT323_400Regular',
  serif: 'Georgia',
} as const;

export const FONTS = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_700Bold',
  mono: 'Inter_500Medium',
  diagnostic: 'VT323_400Regular',
  serif: 'Georgia',
} as const;

export const SPACING = {
  screenX: 20,
  cardRadius: 24,
} as const;
