import { z } from 'zod';
import {
  PROFILE_FIELD_STATES,
  JOB_STATUSES,
  DEFAULT_PROFILE_FIELDS,
  JOB_STATUS_OPTIONS,
  SALARY_VALIDATION,
  JOB_TYPE_OPTIONS,
  JOB_TYPES,
} from '../constants/job.constants';

// Profile field state schema
export const profileFieldStateSchema = z.enum([
  PROFILE_FIELD_STATES.MANDATORY,
  PROFILE_FIELD_STATES.OPTIONAL,
  PROFILE_FIELD_STATES.OFF,
]);

// Profile field schema
export const profileFieldSchema = z.object({
  id: z.string().min(1, 'Field ID is required'),
  label: z.string().min(1, 'Field label is required'),
  state: profileFieldStateSchema,
});

// Job status schema
export const jobStatusSchema = z.enum([
  JOB_STATUSES.ACTIVE,
  JOB_STATUSES.INACTIVE,
  JOB_STATUSES.DRAFT,
]);

export const jobTypeSchema = z.enum([
  JOB_TYPES.FULL_TIME,
  JOB_TYPES.PART_TIME,
  JOB_TYPES.CONTRACT,
  JOB_TYPES.INTERNSHIP,
  JOB_TYPES.FREELANCE,
]);

// Job creation form schema
export const createJobSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Judul posisi wajib diisi')
      .min(3, 'Judul posisi minimal 3 karakter')
      .max(100, 'Judul posisi maksimal 100 karakter'),

    numberOfCandidates: z.string().min(1, 'Jumlah kandidat wajib diisi'),

    description: z
      .string()
      .min(1, 'Deskripsi wajib diisi')
      .min(10, 'Deskripsi minimal 10 karakter')
      .max(2000, 'Deskripsi maksimal 2000 karakter'),

    status: jobStatusSchema,

    type: jobTypeSchema,

    salaryMin: z
      .string()
      .min(1, 'Gaji minimum wajib diisi')
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        'Gaji minimum harus berupa angka yang valid'
      )
      .refine(
        (val) => Number(val) >= SALARY_VALIDATION.MIN_AMOUNT,
        `Gaji minimum minimal ${SALARY_VALIDATION.FORMAT} ${SALARY_VALIDATION.MIN_AMOUNT.toLocaleString('id-ID')}`
      ),

    salaryMax: z
      .string()
      .min(1, 'Gaji maksimum wajib diisi')
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        'Gaji maksimum harus berupa angka yang valid'
      )
      .refine(
        (val) => Number(val) >= SALARY_VALIDATION.MIN_AMOUNT,
        `Gaji maksimum minimal ${SALARY_VALIDATION.FORMAT} ${SALARY_VALIDATION.MIN_AMOUNT.toLocaleString('id-ID')}`
      ),

    profileFields: z
      .array(profileFieldSchema)
      .min(1, 'Setidaknya satu field profil harus dikonfigurasi')
      .refine(
        (fields) => fields.some((field) => field.state === 'mandatory'),
        'Setidaknya satu field profil harus wajib (mandatory)'
      ),
  })
  .refine((data) => Number(data.salaryMax) >= Number(data.salaryMin), {
    message: 'Gaji maksimum harus lebih besar atau sama dengan gaji minimum',
    path: ['salaryMax'],
  });

// Type inference from schema
export type CreateJobFormData = z.infer<typeof createJobSchema>;
export type ProfileField = z.infer<typeof profileFieldSchema>;
export type ProfileFieldState = z.infer<typeof profileFieldStateSchema>;

// Re-export constants from job.constants
export const defaultProfileFields = DEFAULT_PROFILE_FIELDS;
export const jobStatusOptions = JOB_STATUS_OPTIONS;
export const jobTypeOptions = JOB_TYPE_OPTIONS;
