import { z } from 'zod';

// Application form schema
export const applicationFormSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Nama lengkap wajib diisi')
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter')
    .regex(
      /^[a-zA-Z\s]+$/,
      'Nama lengkap hanya boleh mengandung huruf dan spasi'
    ),

  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),

  phone_number: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^[+]?[0-9]{10,15}$/, 'Format nomor telepon tidak valid'),

  gender: z.enum(['male', 'female', 'other'], {
    message: 'Jenis kelamin wajib dipilih',
  }),

  linkedin_link: z

    .url('Format URL tidak valid')
    .min(1, 'Link LinkedIn wajib diisi')
    .refine(
      (url) => url.includes('linkedin.com'),
      'Link harus merupakan URL LinkedIn yang valid'
    ),

  domicile: z
    .string()
    .min(1, 'Domisili wajib diisi')
    .min(2, 'Domisili minimal 2 karakter')
    .max(50, 'Domisili maksimal 50 karakter'),

  date_of_birth: z
    .string()
    .min(1, 'Tanggal lahir wajib diisi')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 17 && age <= 65;
    }, 'Usia harus antara 17-65 tahun'),

  photo_profile: z
    .instanceof(File, { message: 'Foto profil wajib diupload' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Ukuran file maksimal 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Format file harus JPEG, PNG, atau WebP'
    ),

  cover_letter: z
    .string()
    .max(1000, 'Surat lamaran maksimal 1000 karakter')
    .optional(),
});

// Type inference from schema
export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

// Gender options for select field
export const genderOptions = [
  { value: 'male', label: 'Pria' },
  { value: 'female', label: 'Wanita' },
  { value: 'other', label: 'Lainnya' },
];
