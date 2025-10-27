import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Input,
  Grid,
  Container,
  createToaster,
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import CreateJobDialog from '../../components/jobs/CreateJobDialog';
import FormSelect from '../../components/form/FormSelect';
import { AdminJobCard } from '../../components/jobs/AdminJobCard';
import { useJobs } from '~/hooks/useJobs';
import { JobsService } from '~/lib/database/jobs-service';
import { useAuth } from '~/contexts/AuthContext';
import { errorHandlers, successMessages } from '~/lib/error-handling';
import { toaster } from '~/lib/toast';
import StateDisplay, {
  NoJobsState,
  NoSearchResultsState,
} from '~/components/ui/EmptyState';
import type { Job, CreateJobData, UpdateJobData } from '~/types/jobs';

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive' | 'draft'
  >('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { withAdminAuth, getCurrentUserId } = useAuth();

  // Use SWR for data fetching
  const { jobs, isLoading, error, mutate } = useJobs({
    status: statusFilter,
  });

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Draft', value: 'draft' },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action handlers for the AdminJobCard
  const handleEditJob = (job: Job) => {
    // Find the original job from the jobs array
    const originalJob = jobs.find((j) => j.id === job.id);
    if (originalJob) {
      setEditingJob(originalJob);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    try {
      await withAdminAuth(() => JobsService.deleteJob(job.id));
      mutate();
      toaster.success({
        title: successMessages.delete('Job'),
      });
    } catch (error) {
      console.error('Failed to delete job:', error);
      toaster.error({
        title: errorHandlers.delete('Job')(error),
      });
    }
  };

  // Create job handler
  const handleCreateJob = async (formData: any) => {
    try {
      // Transform profile fields to the expected format
      const profileConfig: CreateJobData['profile_config'] = {};
      formData.profileFields.forEach((field: any) => {
        profileConfig[field.id] = {
          state: field.state,
          label: field.label,
        };
      });

      // Transform form data to match service interface
      const jobData: CreateJobData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        type: formData.type,
        salary_min: formData.salaryMin
          ? parseInt(formData.salaryMin)
          : undefined,
        salary_max: formData.salaryMax
          ? parseInt(formData.salaryMax)
          : undefined,
        profile_config: profileConfig,
        number_of_candidates: formData.numberOfCandidates
          ? parseInt(formData.numberOfCandidates)
          : undefined,
      };

      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await withAdminAuth(() => JobsService.createJob(jobData, userId));
      mutate(); // Revalidate SWR cache
      setIsCreateModalOpen(false);
      toaster.success({
        title: successMessages.create('Job'),
      });
    } catch (error) {
      console.error('Failed to create job:', error);
      toaster.error({
        title: errorHandlers.create('Job')(error),
      });
    }
  };

  // Edit job handler
  const handleEditJobSubmit = async (formData: any) => {
    if (!editingJob) return;

    try {
      const profileConfig: UpdateJobData['profile_config'] = {};
      formData.profileFields.forEach((field: any) => {
        profileConfig[field.id] = {
          state: field.state,
          label: field.label,
        };
      });

      // Transform form data to match service interface
      const jobData: UpdateJobData = {
        title: formData.title,
        number_of_candidates: formData.numberOfCandidates
          ? parseInt(formData.numberOfCandidates)
          : undefined,
        description: formData.description,
        status: formData.status,
        type: formData.type,
        salary_min: formData.salaryMin
          ? parseInt(formData.salaryMin)
          : undefined,
        salary_max: formData.salaryMax
          ? parseInt(formData.salaryMax)
          : undefined,
        profile_config: profileConfig,
      };

      await withAdminAuth(() => JobsService.updateJob(editingJob.id, jobData));
      mutate();
      setEditingJob(null);
      toaster.success({
        title: successMessages.update('Job'),
      });
    } catch (error) {
      console.error('Failed to update job:', error);
      toaster.error({
        title: errorHandlers.update('Job')(error),
      });
    }
  };

  // Unified dialog handlers
  const handleDialogClose = () => {
    setIsCreateModalOpen(false);
    setEditingJob(null);
  };

  const handleDialogSubmit = async (formData: any) => {
    if (editingJob) {
      await handleEditJobSubmit(formData);
    } else {
      await handleCreateJob(formData);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <StateDisplay
        type='loading'
        title='Loading Jobs'
        description='Please wait while we load your job listings...'
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <StateDisplay
        type='error'
        title='Error Loading Jobs'
        description={
          error.message || 'Failed to load job listings. Please try again.'
        }
        actionText='Retry'
        onAction={() => mutate()}
      />
    );
  }

  return (
    <Box w='full' as='section' p={10}>
      <VStack align='start' gap={6}>
        <Grid
          templateColumns={{ base: '1fr', sm: '1fr 1fr', md: '3fr 1fr 1fr' }}
          gap={4}
          w='full'
        >
          <Input
            placeholder='Search jobs...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fontSize={{ base: 'sm', md: 'md' }}
          />
          <FormSelect
            placeholder='Filter Status'
            options={statusOptions}
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as 'all' | 'active' | 'inactive' | 'draft')
            }
          />
          <Button
            colorPalette='primary'
            gap={1}
            onClick={() => setIsCreateModalOpen(true)}
            fontSize={{ base: 'sm', md: 'md' }}
          >
            <Plus size={4} />
            Create Job
          </Button>
        </Grid>

        {filteredJobs.length === 0 ? (
          searchTerm ? (
            <NoSearchResultsState
              onAction={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            />
          ) : (
            <NoJobsState onAction={() => setIsCreateModalOpen(true)} />
          )
        ) : (
          <VStack gap={4} w='full'>
            {filteredJobs.map((job) => (
              <AdminJobCard
                key={job.id}
                job={job}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
              />
            ))}
          </VStack>
        )}

        <CreateJobDialog
          open={isCreateModalOpen || !!editingJob}
          onOpenChange={handleDialogClose}
          onSubmit={handleDialogSubmit}
          onDelete={async () => {
            if (editingJob) {
              await handleDeleteJob(editingJob);
            }
          }}
          mode={editingJob ? 'edit' : 'create'}
          job={editingJob || undefined}
        />
      </VStack>
    </Box>
  );
}
