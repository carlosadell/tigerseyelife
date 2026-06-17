// components/concept/LayerAudioPlayer.tsx
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type Props = {
  uri: string;
  durationSec: number;
  onPlay?: () => void;
  onComplete?: () => void;
};

export function LayerAudioPlayer({ uri, durationSec, onPlay, onComplete }: Props) {
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

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { backgroundColor: colors.accent, width: `${pct * 100}%` }]} />
      </View>
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
  fill: { borderRadius: 999, height: '100%' },
  playBtn: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  timer: { fontFamily: FONTS.sansMedium, fontSize: 13, marginLeft: 'auto' },
  track: { borderRadius: 999, height: 4, marginBottom: 14, overflow: 'hidden' },
  wrap: { gap: 4 },
});
