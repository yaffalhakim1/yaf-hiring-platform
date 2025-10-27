import useSWR from 'swr';
import { jobsApi } from '~/lib/swr';
import type { Job, JobApplicationForm } from '~/types/jobs';

export function useJobs(filters?: { status?: string; type?: string }) {
  const { data, error, isLoading, mutate } = useSWR<Job[]>(
    ['jobs', filters?.status, filters?.type],
    () => {
      if (filters?.status && filters.status !== 'all') {
        return jobsApi.getJobsByStatus(filters.status);
      }
      return jobsApi.getJobs();
    }
  );

  return {
    jobs: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useJob(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Job>(
    id ? ['job', id] : null,
    () => jobsApi.getJob(id)
  );

  return {
    job: data,
    isLoading,
    error,
    mutate,
  };
}

export function usePublicJobs() {
  const { data, error, isLoading, mutate } = useSWR<Job[]>(
    'public-jobs',
    jobsApi.getActiveJobs,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    jobs: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function usePublicJob(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Job>(
    id ? ['public-job', id] : null,
    () => jobsApi.getPublicJob(id)
  );

  return {
    job: data,
    isLoading,
    error,
    mutate,
  };
}

export function useJobForm(jobId: string) {
  const { data, error, isLoading, mutate } = useSWR<JobApplicationForm[]>(
    jobId ? ['job-form', jobId] : null,
    () => jobsApi.getJobForm(jobId)
  );

  return {
    form: data?.[0],
    isLoading,
    error,
    mutate,
  };
}
