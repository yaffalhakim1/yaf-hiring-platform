import { supabaseClient } from '../supabase.client';
import type { Candidate, CandidateAttribute } from '~/types/jobs';

export interface CreateCandidateData {
  job_id: string;
  user_id: string;
  status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  attributes: Record<string, any>;
}

export interface UpdateCandidateStatusData {
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

export class CandidatesService {
  /**
   * Create a new candidate with attributes
   */
  static async createCandidate(data: CreateCandidateData): Promise<Candidate> {
    try {
      // Generate unique candidate ID
      const candidateId = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Insert main candidate record
      const { data: candidate, error: candidateError } = await supabaseClient
        .from('candidates')
        .insert({
          id: candidateId,
          job_id: data.job_id,
          user_id: data.user_id,
          status: data.status || 'pending',
        })
        .select()
        .single();

      if (candidateError) {
        throw new Error(
          `Failed to create candidate: ${candidateError.message}`
        );
      }

      // Insert candidate attributes
      const attributes = Object.entries(data.attributes).map(
        ([key, value], index) => ({
          candidate_id: candidateId,
          key,
          label: this.getFieldLabel(key),
          value: value?.toString() || '',
          order_num: index,
        })
      );

      if (attributes.length > 0) {
        const { error: attributesError } = await supabaseClient
          .from('candidate_attributes')
          .insert(attributes);

        if (attributesError) {
          // Rollback candidate creation if attributes fail
          await supabaseClient
            .from('candidates')
            .delete()
            .eq('id', candidateId);
          throw new Error(
            `Failed to create candidate attributes: ${attributesError.message}`
          );
        }
      }

      return candidate;
    } catch (error) {
      console.error('CandidatesService.createCandidate error:', error);
      throw error;
    }
  }

  /**
   * Get all candidates with their attributes
   */
  static async getAllCandidates(): Promise<Candidate[]> {
    try {
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

      if (error) {
        throw new Error(`Failed to fetch candidates: ${error.message}`);
      }

      return this.transformCandidatesWithAttributes(data || []);
    } catch (error) {
      console.error('CandidatesService.getAllCandidates error:', error);
      throw error;
    }
  }

  /**
   * Get candidates by job ID with their attributes
   */
  static async getCandidatesByJob(jobId: string): Promise<Candidate[]> {
    try {
      const { data, error } = await supabaseClient
        .from('candidates')
        .select(
          `
          *,
          candidate_attributes (*),
          jobs (title, type)
        `
        )
        .eq('job_id', jobId);
      // .order('applied_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch candidates for job: ${error.message}`);
      }

      return this.transformCandidatesWithAttributes(data || []);
    } catch (error) {
      console.error('CandidatesService.getCandidatesByJob error:', error);
      throw error;
    }
  }

  /**
   * Get candidate with attributes by ID
   */
  static async getCandidateById(
    candidateId: string
  ): Promise<Candidate | null> {
    try {
      const { data, error } = await supabaseClient
        .from('candidates')
        .select(
          `
          *,
          candidate_attributes (*),
          jobs (title, type)
        `
        )
        .eq('id', candidateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch candidate: ${error.message}`);
      }

      const transformed = this.transformCandidatesWithAttributes([data]);
      return transformed[0] || null;
    } catch (error) {
      console.error('CandidatesService.getCandidateById error:', error);
      throw error;
    }
  }

  /**
   * Update candidate status
   */
  static async updateCandidateStatus(
    candidateId: string,
    data: UpdateCandidateStatusData
  ): Promise<Candidate> {
    try {
      const { data: candidate, error } = await supabaseClient
        .from('candidates')
        .update({
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update candidate status: ${error.message}`);
      }

      return candidate;
    } catch (error) {
      console.error('CandidatesService.updateCandidateStatus error:', error);
      throw error;
    }
  }

  /**
   * Delete candidate and their attributes
   */
  static async deleteCandidate(candidateId: string): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('candidates')
        .delete()
        .eq('id', candidateId);

      if (error) {
        throw new Error(`Failed to delete candidate: ${error.message}`);
      }
    } catch (error) {
      console.error('CandidatesService.deleteCandidate error:', error);
      throw error;
    }
  }

  /**
   * Transform database results to include flattened attributes
   */
  public static transformCandidatesWithAttributes(data: any[]): Candidate[] {
    return data.map((candidate) => {
      const attributes = candidate.candidate_attributes || [];
      const attributeMap = attributes.reduce(
        (acc: Record<string, string>, attr: any) => {
          acc[attr.key] = attr.value;
          return acc;
        },
        {}
      );

      return {
        id: candidate.id,
        job_id: candidate.job_id,
        user_id: candidate.user_id,
        status: candidate.status,
        applied_at: candidate.applied_at,
        created_at: candidate.created_at,
        updated_at: candidate.updated_at,
        // Flatten attributes for easy access
        fullName: attributeMap.fullName || '',
        email: attributeMap.email || '',
        phone: attributeMap.phone || '',
        linkedin: attributeMap.linkedin || '',
        domicile: attributeMap.domicile || '',
        photo: attributeMap.photo || '',
        dateOfBirth: attributeMap.dateOfBirth || '',

        // Job information
        jobTitle: candidate.jobs?.title || '',
        // Keep original attributes for detailed view
        attributes: candidate.candidate_attributes || [],
      };
    });
  }

  /**
   * Get field label for attributes
   */
  private static getFieldLabel(key: string): string {
    const labels: Record<string, string> = {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      linkedin: 'LinkedIn',
      domicile: 'Domicile',
      portfolio: 'Portfolio',
      experience: 'Experience Years',
      education: 'Education',
    };
    return labels[key] || key;
  }
}
