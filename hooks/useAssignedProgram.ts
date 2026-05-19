import { useQuery } from '@tanstack/react-query';

import { useProfile } from './useProfile';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import {
  ProgramWorkout,
  programSeed,
  programWorkoutSeed,
  WorkoutProgram,
} from '../lib/programs';

export function useAssignedProgram() {
  const { profile } = useProfile();
  const assignedProgramId = profile.assignedProgramId;
  const assignedWorkoutId = profile.assignedWorkoutId;

  const query = useQuery({
    enabled: Boolean(assignedProgramId),
    queryKey: ['assigned-program', assignedProgramId, assignedWorkoutId],
    queryFn: () => fetchAssignedProgram(assignedProgramId!, assignedWorkoutId),
  });

  return {
    ...query,
    assignedProgramId,
    assignedWorkoutId,
    assignedProgram: query.data?.program ?? null,
    todayWorkout: query.data?.todayWorkout ?? null,
    workouts: query.data?.workouts ?? [],
  };
}

async function fetchAssignedProgram(programId: string, assignedWorkoutId: string | null): Promise<{
  program: WorkoutProgram | null;
  todayWorkout: ProgramWorkout | null;
  workouts: ProgramWorkout[];
}> {
  if (!hasSupabaseConfig || !supabase) {
    const program = programSeed.find((item) => item.id === programId) ?? null;
    const workouts = programWorkoutSeed.filter((item) => item.program_id === programId);
    const assignedWorkout = workouts.find((item) => item.id === assignedWorkoutId) ?? null;
    return { program, todayWorkout: assignedWorkout ?? workouts[0] ?? null, workouts };
  }

  const [{ data: program }, { data: workouts }] = await Promise.all([
    supabase.from('workout_programs').select('*').eq('id', programId).maybeSingle(),
    supabase
      .from('program_workouts')
      .select('*')
      .eq('program_id', programId)
      .order('sort_order', { ascending: true }),
  ]);

  const typedWorkouts = (workouts ?? []) as ProgramWorkout[];
  const assignedWorkout = typedWorkouts.find((item) => item.id === assignedWorkoutId) ?? null;

  return {
    program: (program as WorkoutProgram | null) ?? null,
    todayWorkout: assignedWorkout ?? typedWorkouts[0] ?? null,
    workouts: typedWorkouts,
  };
}
