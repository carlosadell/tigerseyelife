import { create } from 'zustand';

import { WorkoutFilters } from '../lib/workouts';

type WorkoutFilterStore = WorkoutFilters & {
  setDuration: (duration: WorkoutFilters['duration']) => void;
  setEquipment: (equipment: WorkoutFilters['equipment']) => void;
  setFocus: (focus: WorkoutFilters['focus']) => void;
};

export const useWorkoutFilterStore = create<WorkoutFilterStore>((set) => ({
  duration: 'any',
  equipment: 'any',
  focus: 'any',
  setDuration: (duration) => set({ duration }),
  setEquipment: (equipment) => set({ equipment }),
  setFocus: (focus) => set({ focus }),
}));
