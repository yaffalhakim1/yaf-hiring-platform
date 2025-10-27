import React from 'react';
import {
  Button,
  Container,
  Box,
  VStack,
  Heading,
  Text,
  HStack,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { CandidatesTable } from '../../components/candidates/CandidatesTable';
import { useCandidates } from '~/hooks/useCandidates';
import { useJobs } from '~/hooks/useJobs';
import { ErrorState, LoadingState } from '~/components/ui/EmptyState';

export default function JobCandidatesPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const { candidates, isLoading, error } = useCandidates(jobId);
  const { jobs } = useJobs();

  // Find the current job details
  const currentJob = jobs.find((job) => job.id === jobId);

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState />;
  }

  // Show job not found state
  if (!currentJob && jobId) {
    return (
      <Container clearTop>
        <Box w='full' as='section'>
          <VStack align='start' gap={6}>
            <Button
              variant='ghost'
              gap={2}
              onClick={() => navigate('/admin/jobs')}
            >
              <ArrowLeft size={4} />
              Back to Jobs
            </Button>
            <VStack gap={4}>
              <Heading size='2xl'>Job Not Found</Heading>
              <Text color='fg.muted'>
                The job you're looking for doesn't exist or you don't have
                access to it.
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Container clearTop>
      <Box w='full' as='section'>
        <VStack align='start' gap={6}>
          {/* Header */}
          <Box w='full'>
            <HStack justify='space-between' align='start' mb={4}>
              <Box>
                <Button
                  variant='ghost'
                  gap={2}
                  mb={2}
                  onClick={() => navigate('/admin/jobs')}
                >
                  <ArrowLeft size={4} />
                  Back to Jobs
                </Button>
                <Heading size='2xl' mb={2}>
                  Candidates for {currentJob?.title || 'Job'}
                </Heading>
                <Text color='fg.muted'>
                  Managing applicants for this specific job position
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Candidates Table */}
          <CandidatesTable
            candidates={candidates}
            title={`Candidates for ${currentJob?.title || 'Job'}`}
            description={`Managing applicants for ${currentJob?.title || 'this job'}`}
            showJobFilter={false}
          />
        </VStack>
      </Box>
    </Container>
  );
}
