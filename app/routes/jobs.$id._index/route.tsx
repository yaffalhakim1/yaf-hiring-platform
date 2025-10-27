import { Box, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { JobDetailPanel } from '../../components/jobs/JobDetailPanel';
import { usePublicJob } from '../../hooks/useJobs';
import type { Job as DatabaseJob, Job } from '../../types/jobs';
import StateDisplay, { LoadingState } from '~/components/ui/EmptyState';

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

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { job: dbJob, isLoading, error } = usePublicJob(id || '');

  const handleBackClick = () => {
    navigate('/jobs');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !dbJob) {
    return (
      <StateDisplay
        type='error'
        title='Job Not Found'
        description='The job you are looking for does not exist or has been removed.'
        actionText='Back to Jobs'
        onAction={handleBackClick}
      />
    );
  }

  const job = transformJob(dbJob);

  return <JobDetailPanel job={job} isLoading={isLoading} />;
}
