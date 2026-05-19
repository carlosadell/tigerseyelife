import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TodayCard, getReminderIcon } from './TodayCards';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

const nudges = [
  ['hydration', 'Hydration check', 'Every 2 hours · 9am–7pm'],
  ['bedtime', 'Bedtime wind-down', '30 min before · 10:00pm'],
  ['walk', 'Walk reminder', '12:30pm · After lunch'],
  ['protein', 'Protein check', 'If no meal logged by 1pm'],
  ['evening', 'Evening reflection', '8:00pm daily'],
] as const;

type NudgeKey = (typeof nudges)[number][0];

export function DailyNudges() {
  const colors = useThemeColors();
  const [enabled, setEnabled] = useState<Set<NudgeKey>>(
    () => new Set(nudges.map(([key]) => key)),
  );

  const toggle = (key: NudgeKey) => {
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={[styles.title, { color: colors.text }]}>Your daily nudges</Text>
        <Text style={[styles.copy, { color: colors.mutedText }]}>
          Gentle reminders to support your day. Toggle what helps, skip what doesn't.
        </Text>
      </View>
      <TodayCard>
        {nudges.map(([key, label, time]) => {
          const active = enabled.has(key);
          return (
            <Pressable key={key} onPress={() => toggle(key)} style={styles.nudgeRow}>
              <View style={[styles.icon, { backgroundColor: colors.cardAlt }]}>
                {getReminderIcon(key, colors.accent)}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.nudgeTitle, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.nudgeMeta, { color: colors.mutedText }]}>{time}</Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  { backgroundColor: colors.cardAlt, borderColor: colors.border },
                  active && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <View
                  style={[
                    styles.knob,
                    { backgroundColor: colors.mutedText },
                    active && [styles.knobActive, { backgroundColor: colors.inverseText }],
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
        <Text style={[styles.link, { color: colors.accent }]}>Customize times & frequency →</Text>
      </TodayCard>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  knob: {
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  knobActive: {
    alignSelf: 'flex-end',
  },
  link: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    marginTop: 2,
  },
  nudgeMeta: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  nudgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  nudgeTitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
  },
  title: {
    fontFamily: FONTS.sansBold,
    fontSize: 20,
  },
  toggle: {
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
    width: 42,
  },
  wrap: {
    gap: 12,
  },
});
