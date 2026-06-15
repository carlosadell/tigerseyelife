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

/**
 * Returns a contrast-safe version of a brand color for use as TEXT on the
 * current theme's card background. Use for diagnostic-font numbers, legend
 * grams, thread stat values — anywhere the brand color is drawn as text
 * rather than a fill.
 *
 * - Dark mode: brand colors stay as-is (they pop on dark backgrounds).
 * - Light mode: electricYellow + tigerGold get darkened variants since their
 *   raw values are nearly invisible on white. Other tints already have
 *   acceptable contrast and pass through unchanged.
 */
export function textTintOf(color: string, mode: ThemeMode): string {
  if (mode === 'dark') return color;
  if (color === COLORS.electricYellow) return '#8B6E0F';
  if (color === COLORS.tigerGold) return '#A87414';
  return color;
}

/**
 * Returns the right text/icon color to draw ON TOP of a tangerine CTA fill.
 *
 * Tangerine (#FF914D) is the brand action color in both modes. White text
 * on tangerine reads well in dark mode (the surrounding dark background
 * makes the white label visually pop) but only achieves ~2.3:1 against
 * tangerine itself — fine when the button anchors against onyx, but fragile
 * against cream cardAlt in light mode where the whole composition reads as
 * "warm-on-warm." Light mode gets the onyx text variant for a 6.5:1
 * contrast ratio, comfortably passing WCAG AA, while preserving the brand
 * fill color across modes.
 */
export function ctaTextOnTangerine(mode: ThemeMode): string {
  return mode === 'light' ? COLORS.onyx : '#FFFFFF';
}

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
