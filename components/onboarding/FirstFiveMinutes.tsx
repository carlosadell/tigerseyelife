import { Check, Play } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { OnboardingButton, StepLabel } from './OnboardingPrimitives';
import { firstFiveStyles as styles } from './firstFiveStyles';
import { firstFiveMovements } from './onboardingData';
import { COLORS } from '../../lib/brand';

type FirstFiveMinutesProps = {
  onComplete: () => void;
};

export function FirstFiveMinutes({ onComplete }: FirstFiveMinutesProps) {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [running, secondsLeft]);

  const breathPhase = useMemo(() => {
    if (secondsLeft === 0) return 'Complete';
    const cycle = (60 - secondsLeft) % 16;
    if (cycle < 4) return 'Breathe in';
    if (cycle < 8) return 'Hold';
    if (cycle < 12) return 'Breathe out';
    return 'Hold';
  }, [secondsLeft]);

  const displayTime = `${Math.floor(secondsLeft / 60)}:${secondsLeft % 60 < 10 ? '0' : ''}${
    secondsLeft % 60
  }`;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <StepLabel>First Five Minutes</StepLabel>
        <Text style={styles.title}>Let's move together.</Text>
        <Text style={styles.copy}>
          A short Day 1 practice: move with control, then use the breath timer to downshift before
          entering Today.
        </Text>
      </View>
      <View style={styles.videoCard}>
        <View style={styles.playCircle}>
          <Play color={COLORS.onyx} fill={COLORS.onyx} size={22} />
        </View>
        <Text style={styles.videoTitle}>Ryan guided practice</Text>
        <Text style={styles.videoCopy}>Video slot reserved for beta</Text>
      </View>
      <View style={styles.movementList}>
        {firstFiveMovements.map((movement, index) => (
          <View key={movement.name} style={styles.moveCard}>
            <Text style={styles.moveNumber}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.moveTitle}>{movement.name}</Text>
              <Text style={styles.moveCopy}>{movement.copy}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>Calming breath</Text>
        <Text style={styles.phase}>{breathPhase}</Text>
        <Text style={styles.timer}>{secondsLeft === 0 ? 'DONE' : displayTime}</Text>
        {secondsLeft === 0 ? (
          <View style={styles.completeBadge}>
            <Check color={COLORS.onyx} size={16} />
            <Text style={styles.completeText}>Breath practice complete</Text>
          </View>
        ) : (
          <Pressable onPress={() => setRunning(true)} style={styles.timerButton}>
            <Text style={styles.timerButtonText}>{running ? 'Running' : 'Start timer'}</Text>
          </Pressable>
        )}
      </View>
      <OnboardingButton disabled={secondsLeft > 0} onPress={onComplete}>
        Enter Today
      </OnboardingButton>
    </View>
  );
}
