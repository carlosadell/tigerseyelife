import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { CoachPreferences, DEFAULT_COACH_PREFERENCES } from '../lib/coachPreferences';

export function useCoachPreferences() {
  const { session } = useAuth();
  const userId = session?.user.id ?? 'anonymous';
  const storageKey = `tel:coach-prefs:${userId}`;

  const [prefs, setPrefs] = useState<CoachPreferences>(DEFAULT_COACH_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<CoachPreferences>;
          setPrefs({ ...DEFAULT_COACH_PREFERENCES, ...parsed });
        } catch {
          setPrefs(DEFAULT_COACH_PREFERENCES);
        }
      } else {
        setPrefs(DEFAULT_COACH_PREFERENCES);
      }
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const update = useCallback(
    async (patch: Partial<CoachPreferences>) => {
      const next = { ...prefs, ...patch };
      setPrefs(next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    },
    [prefs, storageKey],
  );

  return { prefs, loaded, update };
}
