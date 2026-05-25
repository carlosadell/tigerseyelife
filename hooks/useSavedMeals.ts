import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { LoggedMeal, SavedMeal } from '../lib/meals';

export function useSavedMeals() {
  const { session } = useAuth();
  const userId = session?.user.id ?? 'anonymous';
  const storageKey = `tel:saved-meals:${userId}`;

  const [saved, setSaved] = useState<SavedMeal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          setSaved(JSON.parse(raw) as SavedMeal[]);
        } catch {
          setSaved([]);
        }
      } else {
        setSaved([]);
      }
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const persist = useCallback(
    async (next: SavedMeal[]) => {
      setSaved(next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  const saveMeal = useCallback(
    (input: { name: string; description?: string; macros: SavedMeal['macros']; origin: SavedMeal['origin']; origin_id?: string }) => {
      const exists = saved.some(
        (m) => m.name.toLowerCase() === input.name.toLowerCase() && m.origin_id === input.origin_id,
      );
      if (exists) return Promise.resolve();
      const next: SavedMeal = {
        ...input,
        id: `saved-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        saved_at: new Date().toISOString(),
      };
      return persist([next, ...saved]);
    },
    [persist, saved],
  );

  const saveFromLogged = useCallback(
    (meal: LoggedMeal) => {
      return saveMeal({
        name: meal.name,
        macros: meal.macros,
        origin: meal.source,
        origin_id: meal.source_id,
      });
    },
    [saveMeal],
  );

  const removeSaved = useCallback(
    (id: string) => {
      return persist(saved.filter((m) => m.id !== id));
    },
    [persist, saved],
  );

  const isSaved = useCallback(
    (meal: LoggedMeal) => {
      return saved.some(
        (m) => m.name.toLowerCase() === meal.name.toLowerCase() && m.origin_id === meal.source_id,
      );
    },
    [saved],
  );

  return {
    saved,
    loaded,
    saveMeal,
    saveFromLogged,
    removeSaved,
    isSaved,
  };
}
