import { supabaseClient } from '~/lib/supabase.client';
import { errorHandlers, successMessages } from '~/lib/error-handling';
import type { Job, CreateJobData } from '~/types/jobs';

export interface UpdateJobData extends Partial<CreateJobData> {
  status?: 'active' | 'inactive' | 'draft';
}

export class JobsService {
  // Generate job ID
  static generateJobId(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `job_${date}_${random}`;
  }

  // Generate slug from title
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Generate salary display text
  static generateSalaryDisplayText(
    min?: number,
    max?: number
  ): string | undefined {
    if (!min && !max) return undefined;
    if (min && max) {
      return `Rp${min.toLocaleString('id-ID')} - Rp${max.toLocaleString('id-ID')}`;
    }
    if (min) return `Rp${min.toLocaleString('id-ID')}`;
    return `Rp${max?.toLocaleString('id-ID')}`;
  }

  // Generate list card data
  static generateListCardData(
    status: string,
    createdAt: string
  ): Job['list_card'] {
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return {
      badge: status.charAt(0).toUpperCase() + status.slice(1),
      started_on_text: `started on ${formattedDate}`,
      cta: 'Manage Job',
    };
  }

  // Create job
  static async createJob(jobData: CreateJobData, userId: string): Promise<Job> {
    try {
      const id = this.generateJobId();
      const slug = this.generateSlug(jobData.title);
      const salaryDisplayText = this.generateSalaryDisplayText(
        jobData.salary_min,
        jobData.salary_max
      );
      const now = new Date().toISOString();
      const status = jobData.status || 'draft';
      const listCard = this.generateListCardData(status, now);

      const { data, error } = await supabaseClient
        .from('jobs')
        .insert({
          id,
          slug,
          title: jobData.title,
          description: jobData.description,
          type: jobData.type,
          number_of_candidates: jobData.number_of_candidates,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          salary_currency: 'IDR',
          salary_display_text: salaryDisplayText,
          status: status,
          list_card: listCard,
          profile_config: jobData.profile_config,
          created_at: now,
          updated_at: now,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(errorHandlers.create('job')(error));
    }
  }

  // Update job
  static async updateJob(id: string, jobData: UpdateJobData): Promise<Job> {
    try {
      const updateData: any = {
        ...jobData,
        updated_at: new Date().toISOString(),
      };

      // Update salary display text if salary changed
      if (
        jobData.salary_min !== undefined ||
        jobData.salary_max !== undefined
      ) {
        updateData.salary_display_text = this.generateSalaryDisplayText(
          jobData.salary_min,
          jobData.salary_max
        );
      }

      // Update list card if status changed
      if (jobData.status) {
        const { data: currentJob } = await supabaseClient
          .from('jobs')
          .select('created_at')
          .eq('id', id)
          .single();

        if (currentJob) {
          updateData.list_card = this.generateListCardData(
            jobData.status,
            currentJob.created_at
          );
        }
      }

      const { data, error } = await supabaseClient
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(errorHandlers.update('job')(error));
    }
  }

  // Delete job
  static async deleteJob(id: string): Promise<void> {
    try {
      const { error } = await supabaseClient.from('jobs').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new Error(errorHandlers.delete('job')(error));
    }
  }
}
