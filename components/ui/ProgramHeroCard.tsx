// components/ui/ProgramHeroCard.tsx
//
// The Train tab's program identity, elevated into a two-band hero:
//
//   ┌ photo band ───────────────┐   full-bleed, gold-tinted, gradient scrim.
//   │ REFINE BLOCK · WEEK 5     │   kicker + big program name + format overlaid.
//   │ APEX30 / Home             │
//   ├ instrument band ──────────┤   cream band carrying one of three bodies:
//   │ 30   12   5               │   • stats  — VT323 "diagnostic" readout (the
//   │ MIN  WKS  CUR             │     signature), the common home/pre-recorded case
//   │ [ ▶ Start today's ... ]   │   • schedule — Live GST Zoom slots
//   └───────────────────────────┘   • note — honest "being prepared" copy for
//                                      commercial-gym content that isn't authored yet.
//
// Boldness spends in exactly two places: the photo and the one tangerine CTA.
// Everything else stays quiet. The VT323 numerals reuse the brand's existing
// diagnostic font (no new asset) so the program reads like an instrument panel.

import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { COLORS, FONTS, THEME_COLORS } from '../../lib/brand';

const light = THEME_COLORS.light;

export type ProgramHeroStat = { value: string; label: string };
export type ProgramHeroScheduleSlot = { day: string; timeET: string };

export type ProgramHeroBody =
  | { kind: 'stats'; items: ProgramHeroStat[] }
  | { kind: 'schedule'; label: string; slots: readonly ProgramHeroScheduleSlot[]; note: string }
  | { kind: 'note'; label?: string; text: string };

type ProgramHeroCardProps = {
  kicker: string;
  name: string;
  subtitle?: string;
  photoUri: string;
  /** Instrument band content. Omit for a photo-only hero (Today), where the
   *  big title is a greeting rather than a program that has stats. */
  body?: ProgramHeroBody;
  /** Program names are brand marks (APEX30) → uppercase. A greeting or focus
   *  sentence (Today) reads better in natural case. */
  nameTransform?: 'uppercase' | 'none';
  /** Optional primary action. Omit on browse-style surfaces (Fuel/Grow) whose
   *  actions live in the cards/list below; present on Train ("Start"). */
  ctaLabel?: string;
  onPressCta?: () => void;
};

export function ProgramHeroCard({
  kicker,
  name,
  subtitle,
  photoUri,
  body,
  nameTransform = 'uppercase',
  ctaLabel,
  onPressCta,
}: ProgramHeroCardProps) {
  const source: ImageSourcePropType = { uri: photoUri };
  const hasCta = Boolean(ctaLabel && onPressCta);
  const showBand = Boolean(body) || hasCta;

  return (
    <View style={styles.card}>
      {/* Photo band — identity overlaid on a gold-warmed, scrimmed image. */}
      <View style={styles.photoBand}>
        <Image source={source} style={styles.photo} />
        {/* Gold tint ties the placeholder photo to the brand until real
            Apex footage lands; a swap of photoUri needs no layout change. */}
        <View style={styles.goldTint} pointerEvents="none" />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.22)', 'rgba(0,0,0,0.80)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.photoOverlay}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text
            style={[styles.name, nameTransform === 'none' && styles.nameNatural]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {name}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Instrument band — one of three bodies, then the single CTA. Omitted
          entirely for a photo-only hero (no body, no CTA). */}
      {showBand ? (
      <View style={styles.band}>
        {body?.kind === 'stats' ? (
          <View style={styles.statRow}>
            {body.items.map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {body?.kind === 'schedule' ? (
          <View style={styles.scheduleWrap}>
            <Text style={styles.bandLabel}>{body.label}</Text>
            {body.slots.map((slot) => (
              <View key={`${slot.day}-${slot.timeET}`} style={styles.scheduleRow}>
                <Text style={styles.scheduleDay}>{slot.day}</Text>
                <Text style={styles.scheduleTime}>{slot.timeET}</Text>
              </View>
            ))}
            <Text style={styles.note}>{body.note}</Text>
          </View>
        ) : null}

        {body?.kind === 'note' ? (
          <View style={styles.noteWrap}>
            {body.label ? <Text style={styles.bandLabel}>{body.label}</Text> : null}
            <Text style={styles.note}>{body.text}</Text>
          </View>
        ) : null}

        {/* Layout + fill live on an inner View: Pressable does not reliably
            apply background/flex styles in this RN config (see CLAUDE.md /
            feedback_pressable_flex_layout). Pressable only handles the press. */}
        {ctaLabel && onPressCta ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            onPress={onPressCta}
            style={({ pressed }) => (pressed ? styles.ctaPressed : undefined)}
          >
            <View style={styles.cta}>
              <Play color="#FFFFFF" size={16} strokeWidth={2.4} fill="#FFFFFF" />
              <Text style={styles.ctaLabel}>{ctaLabel}</Text>
            </View>
          </Pressable>
        ) : null}
      </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: '#F4E9D2',
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  bandLabel: {
    color: light.accent,
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.8,
    marginBottom: 2,
  },
  card: {
    borderColor: light.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  cta: {
    alignItems: 'center',
    backgroundColor: light.action,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  ctaPressed: { opacity: 0.85 },
  goldTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(200,159,77,0.20)',
  },
  kicker: {
    color: COLORS.electricYellow,
    fontFamily: FONTS.sansBold,
    fontSize: 11.5,
    letterSpacing: 1.6,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  name: {
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    fontSize: 34,
    letterSpacing: -0.6,
    lineHeight: 38,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    textTransform: 'uppercase',
  },
  nameNatural: {
    fontSize: 30,
    letterSpacing: -0.8,
    textTransform: 'none',
  },
  note: {
    color: light.mutedText,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    lineHeight: 18,
  },
  noteWrap: { gap: 4 },
  photo: {
    height: 210,
    width: '100%',
  },
  photoBand: {
    height: 210,
    position: 'relative',
  },
  photoOverlay: {
    bottom: 16,
    left: 18,
    position: 'absolute',
    right: 18,
  },
  scheduleDay: {
    color: light.text,
    fontFamily: FONTS.sansBold,
    fontSize: 13.5,
  },
  scheduleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  scheduleTime: {
    color: light.mutedText,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  scheduleWrap: { gap: 2 },
  stat: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statLabel: {
    color: light.mutedText,
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  statRow: {
    flexDirection: 'row',
  },
  statValue: {
    color: light.text,
    fontFamily: FONTS.diagnostic,
    fontSize: 40,
    lineHeight: 40,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    letterSpacing: 0.2,
    marginTop: 3,
  },
});
