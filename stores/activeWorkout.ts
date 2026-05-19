import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { WorkoutLibraryItem, WorkoutSession, WorkoutSetLog } from '../lib/workouts';

type RestTimer = {
  exerciseId: string;
  secondsLeft: number;
  running: boolean;
} | null;

type ActiveWorkoutStore = {
  currentExerciseIndex: number;
  currentSession: WorkoutSession | null;
  currentWorkout: WorkoutLibraryItem | null;
  restTimer: RestTimer;
  setCurrentExerciseIndex: (index: number) => void;
  startSession: (workout: WorkoutLibraryItem, session: WorkoutSession) => void;
  logSet: (setLog: WorkoutSetLog) => void;
  setRestTimer: (timer: RestTimer) => void;
  tickRestTimer: () => void;
  clearSession: () => void;
};

export const useActiveWorkoutStore = create<ActiveWorkoutStore>()(
  persist(
    (set) => ({
      currentExerciseIndex: 0,
      currentSession: null,
      currentWorkout: null,
      restTimer: null,
      setCurrentExerciseIndex: (currentExerciseIndex) => set({ currentExerciseIndex }),
      startSession: (currentWorkout, currentSession) =>
        set({ currentExerciseIndex: 0, currentSession, currentWorkout, restTimer: null }),
      logSet: (setLog) =>
        set((state) => {
          if (!state.currentSession) return state;

          const withoutDuplicate = state.currentSession.set_logs.filter(
            (item) =>
              !(
                item.exercise_id === setLog.exercise_id &&
                item.set_number === setLog.set_number
              ),
          );

          return {
            currentSession: {
              ...state.currentSession,
              set_logs: [...withoutDuplicate, setLog],
            },
          };
        }),
      setRestTimer: (restTimer) => set({ restTimer }),
      tickRestTimer: () =>
        set((state) => {
          if (!state.restTimer?.running) return state;
          const secondsLeft = Math.max(0, state.restTimer.secondsLeft - 1);
          return {
            restTimer:
              secondsLeft === 0 ? null : { ...state.restTimer, secondsLeft },
          };
        }),
      clearSession: () =>
        set({
          currentExerciseIndex: 0,
          currentSession: null,
          currentWorkout: null,
          restTimer: null,
        }),
    }),
    {
      name: 'tel:active-workout',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
