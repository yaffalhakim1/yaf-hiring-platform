import { supabaseClient } from './supabase.client';
import { extractErrorMessage } from './error-handling';
import { AuthService } from './auth-service';
import type {
  Job,
  JobApplicationForm,
  Candidate,
  CandidateAttribute,
} from '~/types/jobs';

// Generic fetcher for SWR with authentication
export async function fetcher<T>(key: string[]): Promise<T> {
  try {
    // Ensure user is authenticated by checking session
    const session = await AuthService.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const [table, ...params] = key;

    let query = supabaseClient.from(table).select('*');

    // Handle query parameters
    params.forEach((param) => {
      if (param.includes('eq:')) {
        const [field, value] = param.replace('eq:', '').split('=');
        query = query.eq(field, value);
      } else if (param.includes('order:')) {
        const [field, direction] = param.replace('order:', '').split('.');
        query = query.order(field, { ascending: direction === 'asc' });
      } else if (param.includes('limit:')) {
        const limit = parseInt(param.replace('limit:', ''));
        query = query.limit(limit);
      }
    });

    const { data, error } = await query;

    if (error) throw error;
    return data as T;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

// Specific fetchers for different endpoints
export const jobsApi = {
  // Get all jobs
  getJobs: () => fetcher<Job[]>(['jobs', 'order:created_at.desc']),

  // Get job by ID
  getJob: (id: string) => fetcher<Job>(['jobs', `eq:id=${id}`]),

  // Get jobs by status
  getJobsByStatus: (status: string) =>
    fetcher<Job[]>(['jobs', `eq:status=${status}`, 'order:created_at.desc']),

  // Get active jobs (public - no authentication required)
  getActiveJobs: async (): Promise<Job[]> => {
    try {
      const { data, error } = await supabaseClient
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Get job by ID (public - no authentication required)
  getPublicJob: async (id: string): Promise<Job> => {
    try {
      const { data, error } = await supabaseClient
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Get job application form
  getJobForm: (jobId: string) =>
    fetcher<JobApplicationForm[]>([
      'job_application_forms',
      `eq:job_id=${jobId}`,
    ]),
};

export const candidatesApi = {
  // Get all candidates with attributes
  getAllCandidates: async (): Promise<Candidate[]> => {
    try {
      const session = await AuthService.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabaseClient
        .from('candidates')
        .select(
          `
          *,
          candidate_attributes (*),
          jobs (title, type)
        `
        )
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Get candidates by job with attributes
  getCandidatesByJob: async (jobId: string): Promise<Candidate[]> => {
    try {
      const session = await AuthService.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabaseClient
        .from('candidates')
        .select(
          `
          *,
          candidate_attributes (*),
          jobs (title, type)
        `
        )
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Get candidate attributes
  getCandidateAttributes: (candidateId: string) =>
    fetcher<CandidateAttribute[]>([
      'candidate_attributes',
      `eq:candidate_id=${candidateId}`,
      'order:order_num.asc',
    ]),
};
