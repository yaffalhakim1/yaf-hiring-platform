export interface Job {
  id: string;
  slug?: string;
  title: string;
  status: 'active' | 'inactive' | 'draft';
  description: string;
  type?: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';

  // Salary information
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_display_text?: string;
  salaryRange?: {
    min: number;
    max: number;
    displayText: string;
  };

  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  createdAt?: string;
  number_of_candidates?: number;

  // UI-specific data
  list_card?: {
    badge: string;
    started_on_text: string;
    cta: string;
  };

  // Profile configuration for applications
  profile_config?: {
    [key: string]: {
      label: string;
      state: 'mandatory' | 'optional' | 'off';
    };
  };
}

export interface JobApplicationForm {
  id: string;
  job_id: string;
  application_form: {
    sections: ApplicationFormSection[];
  };
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationFormSection {
  title: string;
  fields: ApplicationFormField[];
}

export interface ApplicationFormField {
  key: string;
  validation: {
    required?: boolean;
    [key: string]: any;
  };
}

export interface Candidate {
  id: string;
  job_id: string;
  user_id?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at?: string;
  created_at?: string;
  updated_at?: string;

  // Flattened attributes from candidate_attributes table
  fullName?: string;
  photo?: string;
  gender?: string;
  domicile?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  dateOfBirth?: string;

  // Job information
  jobTitle?: string;
  jobType?: string;

  // Original attributes for detailed view
  attributes?: CandidateAttribute[];
}

export interface CandidateAttribute {
  id: string;
  candidate_id: string;
  key: string;
  label: string;
  value: string;
  order: number;
  created_at?: string;
}

// API Response Types
export interface JobsResponse {
  data: Job[];
}

export interface CandidatesResponse {
  data: Candidate[];
}

// Service Types
export interface CreateJobData {
  title: string;
  description?: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  salary_min?: number;
  salary_max?: number;
  profile_config?: {
    [key: string]: {
      state: 'mandatory' | 'optional' | 'off';
      label: string;
    };
  };
  status?: 'active' | 'inactive' | 'draft';
  number_of_candidates?: number;
}

export interface UpdateJobData extends Partial<CreateJobData> {
  status?: 'active' | 'inactive' | 'draft';
}
