import { useQuery } from '@tanstack/react-query';

import { MicrolearningModule, microlearningSeed } from '../lib/programs';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

export function useMicrolearningModules() {
  return useQuery({
    queryKey: ['microlearning-modules'],
    queryFn: fetchMicrolearningModules,
  });
}

async function fetchMicrolearningModules(): Promise<MicrolearningModule[]> {
  if (!hasSupabaseConfig || !supabase) return microlearningSeed;

  const { data, error } = await supabase
    .from('microlearning_modules')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (error) return microlearningSeed;
  return (data ?? []) as MicrolearningModule[];
}
