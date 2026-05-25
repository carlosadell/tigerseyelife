import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import {
  LoggedMeal,
  Macros,
  MealSlot,
  estimateCalories,
  sumMacros,
} from '../lib/meals';

export function useDailyMeals() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id ?? 'anonymous';
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const storageKey = `tel:meals-logged:${userId}:${today}`;

  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          setMeals(JSON.parse(raw) as LoggedMeal[]);
        } catch {
          setMeals([]);
        }
      } else {
        setMeals([]);
      }
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const persist = useCallback(
    async (next: LoggedMeal[]) => {
      setMeals(next);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      queryClient.invalidateQueries({ queryKey: ['engagement-dates', userId] });
    },
    [queryClient, storageKey, userId],
  );

  const logMeal = useCallback(
    (meal: Omit<LoggedMeal, 'id' | 'logged_at'>) => {
      const next: LoggedMeal = {
        ...meal,
        id: `log-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        logged_at: new Date().toISOString(),
      };
      return persist([...meals, next]);
    },
    [meals, persist],
  );

  const removeMeal = useCallback(
    (id: string) => {
      return persist(meals.filter((m) => m.id !== id));
    },
    [meals, persist],
  );

  const totals: Macros = useMemo(() => sumMacros(meals), [meals]);
  const totalCalories = useMemo(() => estimateCalories(totals), [totals]);

  const bySlot = useMemo(() => {
    const grouped: Record<MealSlot, LoggedMeal[]> = { '1': [], '2': [], '3': [], S: [] };
    for (const m of meals) {
      grouped[m.slot].push(m);
    }
    return grouped;
  }, [meals]);

  return {
    meals,
    bySlot,
    totals,
    totalCalories,
    loaded,
    logMeal,
    removeMeal,
  };
}
