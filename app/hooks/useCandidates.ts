import useSWR from 'swr';
import { candidatesApi } from '~/lib/swr';
import { supabaseClient } from '~/lib/supabase.client';
import { CandidatesService } from '~/lib/database/candidates-service';
import type { Candidate, CandidateAttribute } from '~/types/jobs';

export function useCandidates(jobId?: string) {
  const { data, error, isLoading, mutate } = useSWR<Candidate[]>(
    jobId ? ['candidates', jobId] : ['candidates'],
    async () => {
      const rawData = jobId
        ? await candidatesApi.getCandidatesByJob(jobId)
        : await candidatesApi.getAllCandidates();

      // Transform the joined data to flatten attributes
      return CandidatesService.transformCandidatesWithAttributes(rawData);
    }
  );

  return {
    candidates: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useCandidateAttributes(candidateId: string) {
  const { data, error, isLoading, mutate } = useSWR<CandidateAttribute[]>(
    candidateId ? ['candidate-attributes', candidateId] : null,
    () => candidatesApi.getCandidateAttributes(candidateId)
  );

  return {
    attributes: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook to get candidate with attributes
export function useCandidateWithAttributes(candidateId: string) {
  const { data: candidate, ...candidateRest } = useSWR<Candidate>(
    candidateId ? ['candidate', candidateId] : null,
    async () => {
      const { data } = await supabaseClient
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();
      return data;
    }
  );

  const { attributes, ...attributesRest } = useCandidateAttributes(candidateId);

  return {
    candidate: candidate ? { ...candidate, attributes: attributes } : null,
    isLoading: candidateRest.isLoading || attributesRest.isLoading,
    error: candidateRest.error || attributesRest.error,
    mutate: () => {
      candidateRest.mutate();
      attributesRest.mutate();
    },
  };
}
