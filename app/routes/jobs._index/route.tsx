import { Box, VStack, Heading, Text, Container } from '@chakra-ui/react';
import { JobsLayout } from '../../components/jobs/JobsLayout';
import { usePublicJobs } from '../../hooks/useJobs';
import type { Job as DatabaseJob, Job } from '../../types/jobs';
import { Navbar } from '~/components/layout';

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

export default function JobsIndex() {
  const { jobs: dbJobs, isLoading, error } = usePublicJobs();

  // Transform database jobs to JobCard format
  const jobs: Job[] = dbJobs.map(transformJob);

  return (
    <>
      <Navbar />
      <Container clearVertical>
        <VStack h='full' align='stretch' gap={0}>
          {/* Page Header */}
          <Box py={4}>
            <VStack align='start' gap={2}>
              <Heading size='2xl'>Career Opportunities</Heading>
              <Text color='fg.muted'>
                Discover exciting career opportunities and join our talented
                team
              </Text>
            </VStack>
          </Box>

          <JobsLayout jobs={jobs} isLoading={isLoading} />
        </VStack>
      </Container>
    </>
  );
}
