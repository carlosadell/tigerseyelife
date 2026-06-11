import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';

type LayoutPreference = 'simplified' | 'expanded';

const PREFERENCE_KEY = (userId: string) => `tel:today:layoutPreference:${userId}`;
const MIGRATION_KEY = (userId: string) => `tel:today:layoutMigrationV2:${userId}`;

type ShowMoreToggleProps = {
  children: ReactNode;
};

export function ShowMoreToggle({ children }: ShowMoreToggleProps) {
  const colors = useThemeColors();
  const { session } = useAuth();
  const userId = session?.user.id ?? 'anonymous';

  const [preference, setPreference] = useState<LayoutPreference | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const migrationDone = await AsyncStorage.getItem(MIGRATION_KEY(userId));

      // One-time migration: any pre-existing 'expanded' preference gets reset
      // to 'simplified' so the new default reaches users who set it before.
      if (!migrationDone) {
        if (!cancelled) {
          setPreference('simplified');
          AsyncStorage.setItem(PREFERENCE_KEY(userId), 'simplified').catch(() => undefined);
          AsyncStorage.setItem(MIGRATION_KEY(userId), '1').catch(() => undefined);
        }
        return;
      }

      const stored = await AsyncStorage.getItem(PREFERENCE_KEY(userId));

      if (!cancelled && (stored === 'simplified' || stored === 'expanded')) {
        setPreference(stored);
        return;
      }

      if (!cancelled) {
        setPreference('simplified');
        AsyncStorage.setItem(PREFERENCE_KEY(userId), 'simplified').catch(() => undefined);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggle = () => {
    const next: LayoutPreference = preference === 'expanded' ? 'simplified' : 'expanded';
    setPreference(next);
    AsyncStorage.setItem(PREFERENCE_KEY(userId), next).catch(() => undefined);
  };

  if (preference === null) {
    // Hydrating — keep the button absent so layout doesn't jump.
    return null;
  }

  const isExpanded = preference === 'expanded';
  const Chevron = isExpanded ? ChevronUp : ChevronDown;
  const label = isExpanded ? 'Show less' : 'Show more';

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: isExpanded }}
        onPress={toggle}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonLabel, { color: colors.mutedText }]}>{label}</Text>
        <Chevron color={colors.mutedText} size={16} strokeWidth={2.2} />
      </Pressable>
      {isExpanded ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
  },
  buttonLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
    letterSpacing: 0.4,
  },
  children: {
    gap: 14,
    marginTop: 14,
  },
  wrap: {
    width: '100%',
  },
});
