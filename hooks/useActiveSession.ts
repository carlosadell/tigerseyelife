import { useActiveWorkoutStore } from '../stores/activeWorkout';

export function useActiveSession() {
  return useActiveWorkoutStore((state) => ({
    clearSession: state.clearSession,
    currentExerciseIndex: state.currentExerciseIndex,
    session: state.currentSession,
    workout: state.currentWorkout,
  }));
}
