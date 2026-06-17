// components/concept/LayerAudioPlayer.tsx
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import type { AudioChapter } from '../../lib/layeredContent';

type Props = {
  uri: string;
  durationSec: number;
  // Optional chapter structure. When provided, the scrubber draws each
  // segment in its kind-colored background (charcoal for human voice,
  // softer gold for synthetic) and a legend renders below. Plain solid
  // bar when omitted.
  chapters?: ReadonlyArray<AudioChapter>;
  onPlay?: () => void;
  onComplete?: () => void;
};

// Soft gold tint used as the synthetic-body chapter background. Chosen
// to read as "off-gold" against the accent-gold played fill so the
// played overlay still stands out.
const SYNTHETIC_BG = 'rgba(168, 116, 20, 0.28)';
const HUMAN_BG = 'rgba(20, 20, 22, 0.55)';

export function LayerAudioPlayer({ uri, durationSec, chapters, onPlay, onComplete }: Props) {
  const colors = useThemeColors();
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const firedComplete = useRef(false);

  useEffect(() => {
    if (status.didJustFinish && !firedComplete.current) {
      firedComplete.current = true;
      onComplete?.();
    }
  }, [status.didJustFinish, onComplete]);

  const toggle = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
      onPlay?.();
    }
  }, [status.playing, player, onPlay]);

  const skip = useCallback(
    (deltaSec: number) => {
      const nextSec = Math.max(0, (status.currentTime ?? 0) + deltaSec);
      player.seekTo(nextSec);
    },
    [player, status.currentTime],
  );

  const positionSec = status.currentTime ?? 0;
  const pct = durationSec > 0 ? Math.min(1, positionSec / durationSec) : 0;
  const hasChapters = chapters && chapters.length > 0 && durationSec > 0;

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: hasChapters ? 'transparent' : colors.border }]}>
        {hasChapters
          ? chapters!.map((ch, idx) => {
              const left = (ch.startSec / durationSec) * 100;
              const width = ((ch.endSec - ch.startSec) / durationSec) * 100;
              return (
                <View
                  key={`${ch.kind}-${ch.startSec}-${idx}`}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: ch.kind === 'human' ? HUMAN_BG : SYNTHETIC_BG,
                      left: `${left}%`,
                      width: `${width}%`,
                    },
                  ]}
                />
              );
            })
          : null}
        <View
          style={[
            styles.fill,
            { backgroundColor: colors.accent, width: `${pct * 100}%` },
          ]}
        />
      </View>

      {hasChapters ? (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: HUMAN_BG }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedText }]}>Karen / Ryan</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: SYNTHETIC_BG }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedText }]}>Core teaching</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.row}>
        <Pressable hitSlop={8} onPress={() => skip(-15)}>
          <RotateCcw color={colors.text} size={22} />
        </Pressable>
        <Pressable
          accessibilityLabel={status.playing ? 'Pause' : 'Play'}
          onPress={toggle}
          style={[styles.playBtn, { backgroundColor: colors.accent }]}
        >
          {status.playing ? (
            <Pause color="#FFFFFF" size={22} />
          ) : (
            <Play color="#FFFFFF" size={22} />
          )}
        </Pressable>
        <Pressable hitSlop={8} onPress={() => skip(15)}>
          <RotateCw color={colors.text} size={22} />
        </Pressable>
        <Text style={[styles.timer, { color: colors.mutedText }]}>
          {fmt(positionSec)} / {fmt(durationSec)}
        </Text>
      </View>
    </View>
  );
}

function fmt(sec: number): string {
  const total = Math.max(0, Math.floor(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  fill: {
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: -8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  legendLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  legendSwatch: {
    borderRadius: 2,
    height: 8,
    width: 10,
  },
  playBtn: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  segment: {
    bottom: 0,
    position: 'absolute',
    top: 0,
  },
  timer: { fontFamily: FONTS.sansMedium, fontSize: 13, marginLeft: 'auto' },
  track: {
    borderRadius: 999,
    height: 6,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  wrap: { gap: 4 },
});
