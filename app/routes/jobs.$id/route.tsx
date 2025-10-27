import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Container,
} from '@chakra-ui/react';
import { useParams, useNavigate, Outlet } from 'react-router';
import { usePublicJob } from '../../hooks/useJobs';
import type { Job as DatabaseJob } from '../../types/jobs';
import { LoadingState } from '~/components/ui/EmptyState';
import { Navbar } from '~/components/layout';

export default function JobDetailLayout() {
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
      <Box h='calc(100vh - 120px)' w='full'>
        <VStack h='full' justify='center' align='center' gap={4}>
          <Heading size='lg'>Job Not Found</Heading>
          <Text color='fg.muted'>
            The job you're looking for doesn't exist or has been removed.
          </Text>
          <Button onClick={handleBackClick} variant='outline'>
            Back to Jobs
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Container>
        <Outlet />
      </Container>
    </>
  );
}
