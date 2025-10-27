import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Alert,
  Fieldset,
  Spinner,
  Container,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RHFormInput } from '../../components/rhforms';
import StateDisplay, { LoadingState } from '../../components/ui/EmptyState';
import { usePublicJob } from '../../hooks/useJobs';
import type { Job as DatabaseJob, Job } from '../../types/jobs';
import { FIELD_CONFIGS } from '../../constants/form-fields';
import type { FieldConfigKey } from '../../types/form-fields';
import { appToasts, toaster } from '../../lib/toast';
import { CandidatesService } from '../../lib/database/candidates-service';
import { useAuth } from '../../contexts/AuthContext';
import { RoleGuard } from '~/components/guards/RoleGuard';

// Transform database job to JobCard interface
function transformJob(dbJob: DatabaseJob): Job {
  return {
    id: dbJob.id,
    title: dbJob.title,
    number_of_candidates: dbJob.number_of_candidates,
    status: dbJob.status,
    type: dbJob.type || 'full_time',
    salaryRange: {
      min: dbJob.salary_min || 0,
      max: dbJob.salary_max || 0,
      displayText: dbJob.salary_display_text || 'Salary not specified',
    },
    description: dbJob.description || 'No description available',
    createdAt: dbJob.created_at
      ? new Date(dbJob.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recently',
  };
}

// Create dynamic form schema based on job configuration
function createDynamicFormSchema(profileConfig: DatabaseJob['profile_config']) {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  if (!profileConfig) {
    return z.object({});
  }

  // Define field schemas based on configuration
  const fieldSchemas = {
    fullName: z
      .string()
      .min(1, 'Nama lengkap wajib diisi')
      .min(3, 'Nama lengkap minimal 3 karakter'),
    email: z.email('Format email tidak valid').min(1, 'Email wajib diisi'),
    phone: z
      .string()
      .min(1, 'Nomor telepon wajib diisi')
      .regex(/^[+]?[0-9]{10,15}$/, 'Format nomor telepon tidak valid'),
    linkedin: z.string().optional(),
    domicile: z
      .string()
      .min(1, 'Domisili wajib diisi')
      .min(2, 'Domisili minimal 2 karakter'),
    portfolio: z.string().optional(),
    experience: z
      .string()
      .min(1, 'Pengalaman wajib diisi')
      .min(2, 'Pengalaman minimal 2 karakter'),
    education: z.string().optional(),
    photo: z.string().min(1, 'Foto wajib diunggah').optional(),
  };

  // Add fields based on job configuration
  Object.entries(profileConfig).forEach(([fieldId, config]) => {
    if (config.state === 'off') return; // Skip hidden fields

    const fieldSchema = fieldSchemas[fieldId as keyof typeof fieldSchemas];
    if (fieldSchema) {
      schemaFields[fieldId] =
        config.state === 'mandatory' ? fieldSchema : fieldSchema.optional();
    }
  });

  return z.object(schemaFields);
}

function ApplicationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { job: dbJob, isLoading, error } = usePublicJob(id || '');
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const job = dbJob ? transformJob(dbJob) : undefined;
  const formSchema = dbJob
    ? createDynamicFormSchema(dbJob.profile_config)
    : z.object({});

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleBackClick = () => {
    navigate(`/jobs/${id}`);
  };

  const onFormSubmit = async (data: any) => {
    if (!user || !id) {
      setSubmitStatus('error');
      setErrorMessage('User not authenticated or job ID missing');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Save application to database
      await CandidatesService.createCandidate({
        job_id: id,
        user_id: user.id,
        status: 'pending',
        attributes: data,
      });

      // Show success toast
      appToasts.applicationSuccess(job?.title || 'posisi ini');

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/jobs/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Application submission error:', error);
      // Show error toast
      appToasts.applicationError();
      setSubmitStatus('error');
      setErrorMessage('Gagal mengirim aplikasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box h='calc(100vh - 120px)' w='full'>
        <LoadingState
          title='Memuat Formulir Aplikasi'
          description='Sedang memuat data lowongan. Silakan tunggu sebentar...'
        />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box h='calc(100vh - 120px)' w='full'>
        <StateDisplay
          type='error'
          title='Lowongan Tidak Ditemukan'
          description='Lowongan pekerjaan yang Anda lamar tidak tersedia atau telah dihapus.'
          actionText='Kembali ke Daftar Lowongan'
          onAction={() => navigate('/jobs')}
        />
      </Box>
    );
  }

  // Render form fields based on job configuration
  const renderFormField = (fieldId: string, config: any) => {
    if (config.state === 'off') return null;

    const isRequired = config.state === 'mandatory';
    const label = config.label;
    const fieldConfig = FIELD_CONFIGS[fieldId as FieldConfigKey];

    if (!fieldConfig) {
      // Fallback for unknown fields
      return (
        <RHFormInput
          key={fieldId}
          name={fieldId}
          control={control}
          label={label}
          placeholder={`Masukkan ${label.toLowerCase()}`}
          required={isRequired}
        />
      );
    }

    const { component: FieldComponent, props: fieldProps } = fieldConfig;

    return (
      <FieldComponent
        key={fieldId}
        name={fieldId}
        control={control}
        label={label}
        required={isRequired}
        {...fieldProps}
      />
    );
  };

  return (
    <VStack h='full' align='stretch' gap={6} py={6}>
      {/* Header */}
      <Box py={2}>
        <Button onClick={handleBackClick} variant='ghost' size='sm' gap={2}>
          <ArrowLeft size={16} />
          Back to Job Details
        </Button>
      </Box>

      <VStack flex={1} align='start' gap={6}>
        {/* Job Info */}
        <VStack align='start' gap={2}>
          <Heading size='lg'>Apply for {job.title}</Heading>
          <Text color='fg.muted'>
            {job.number_of_candidates} Slot • {job.salaryRange?.displayText}
          </Text>
        </VStack>

        {/* Error Alert */}
        {submitStatus === 'error' && (
          <Alert.Root status='error' variant='subtle'>
            <Alert.Indicator />
            <Box>
              <Alert.Title>Application Failed</Alert.Title>
              <Alert.Description>{errorMessage}</Alert.Description>
            </Box>
          </Alert.Root>
        )}

        {/* Application Form */}
        <Box as='form' w='full' onSubmit={handleSubmit(onFormSubmit)}>
          <Fieldset.Root gap={2}>
            <Fieldset.Legend>Informasi Pribadi</Fieldset.Legend>

            {/* Render dynamic form fields based on job configuration */}
            {dbJob?.profile_config &&
              Object.entries(dbJob.profile_config).map(([fieldId, config]) =>
                renderFormField(fieldId, config)
              )}
          </Fieldset.Root>

          <HStack gap={4} mt={6}>
            <Button
              type='submit'
              colorPalette='primary'
              loading={isSubmitting ? true : false}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Aplikasi'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={handleBackClick}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </HStack>
        </Box>
      </VStack>
    </VStack>
  );
}

export default function JobApply() {
  return (
    <AuthGuard>
      <RoleGuard roles={['admin', 'applicant']}>
        <ApplicationForm />
      </RoleGuard>
    </AuthGuard>
  );
}
