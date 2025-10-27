// Profile field state enum
export const PROFILE_FIELD_STATES = {
  MANDATORY: 'mandatory',
  OPTIONAL: 'optional',
  OFF: 'off',
} as const;

export type ProfileFieldState =
  (typeof PROFILE_FIELD_STATES)[keyof typeof PROFILE_FIELD_STATES];

// Job status enum
export const JOB_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
} as const;

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

// job type enum
export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  FREELANCE: 'freelance',
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

// Default profile fields configuration
export const DEFAULT_PROFILE_FIELDS = [
  { id: 'fullName', label: 'Full Name', state: PROFILE_FIELD_STATES.MANDATORY },
  { id: 'email', label: 'Email', state: PROFILE_FIELD_STATES.MANDATORY },
  { id: 'phone', label: 'Phone', state: PROFILE_FIELD_STATES.OPTIONAL },
  { id: 'linkedin', label: 'LinkedIn', state: PROFILE_FIELD_STATES.OPTIONAL },
  { id: 'domicile', label: 'Domicile', state: PROFILE_FIELD_STATES.OPTIONAL },
  { id: 'education', label: 'Education', state: PROFILE_FIELD_STATES.OPTIONAL },
  { id: 'photo', label: 'Photo', state: PROFILE_FIELD_STATES.MANDATORY },
  { id: 'gender', label: 'Gender', state: PROFILE_FIELD_STATES.OFF },
  {
    id: 'dateOfBirth',
    label: 'Date of Birth',
    state: PROFILE_FIELD_STATES.OFF,
  },
];

// Department options
export const DEPARTMENT_OPTIONS = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
];

// Job status options
export const JOB_STATUS_OPTIONS = [
  { label: 'Active', value: JOB_STATUSES.ACTIVE },
  { label: 'Inactive', value: JOB_STATUSES.INACTIVE },
  { label: 'Draft', value: JOB_STATUSES.DRAFT },
];

export const JOB_TYPE_OPTIONS = [
  { label: 'Full-time', value: 'full_time' },
  { label: 'Part-time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
  { label: 'Freelance', value: 'freelance' },
];

// Salary validation constants
export const SALARY_VALIDATION = {
  MIN_AMOUNT: 1000000,
  CURRENCY: 'IDR',
  FORMAT: 'Rp',
} as const;
