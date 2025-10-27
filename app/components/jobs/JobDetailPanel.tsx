import {
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  Box,
  Separator,
  Grid,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Building,
  Briefcase,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { LoadingState, NoDataState } from '../ui/EmptyState';
import type { Job } from '~/types/jobs';

interface JobDetailPanelProps {
  job?: Job;
  isLoading?: boolean;
}

const getStatusBadge = (status: Job['status']) => {
  const variants = {
    active: { colorPalette: 'green', label: 'Active' },
    inactive: { colorPalette: 'red', label: 'Inactive' },
    draft: { colorPalette: 'gray', label: 'Draft' },
  };

  const variant = variants[status];
  return (
    <Badge colorPalette={variant.colorPalette} variant='solid' size='sm'>
      {variant.label}
    </Badge>
  );
};

const getTypeBadge = (type?: string) => {
  if (!type) return null;

  const variants = {
    'full-time': { colorPalette: 'blue', label: 'Full Time' },
    'part-time': { colorPalette: 'orange', label: 'Part Time' },
    contract: { colorPalette: 'purple', label: 'Contract' },
    internship: { colorPalette: 'teal', label: 'Internship' },
  };

  const variant = variants[type as keyof typeof variants];
  return variant ? (
    <Badge colorPalette={variant.colorPalette} variant='subtle' size='sm'>
      {variant.label}
    </Badge>
  ) : null;
};

export function JobDetailPanel({
  job,
  isLoading = false,
}: JobDetailPanelProps) {
  const navigate = useNavigate();

  const handleApplyClick = () => {
    if (job) {
      navigate(`/jobs/${job.id}/apply`);
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        title='Memuat Detail Lowongan'
        description='Sedang memuat detail lowongan pekerjaan. Silakan tunggu sebentar...'
      />
    );
  }

  if (!job) {
    return <NoDataState />;
  }

  return (
    <Box h='full'>
      <VStack align='stretch' gap={6}>
        {/* Header */}
        <VStack align='start' gap={3}>
          <HStack justify='space-between' align='start' w='full'>
            <Heading size='lg' fontWeight='semibold'>
              {job.title}
            </Heading>
            <HStack gap={2}>
              {getStatusBadge(job.status)}
              {getTypeBadge(job.type)}
            </HStack>
          </HStack>

          <HStack gap={4} color='fg.muted' fontSize='sm'>
            <HStack gap={1}>
              <Building size={14} />
              {/* <Text>{job.department}</Text> */}
            </HStack>
            {/* {job.location && (
              <HStack gap={1}>
                <MapPin size={14} />
                <Text>{job.location}</Text>
              </HStack>
            )} */}
            {job.number_of_candidates !== undefined && (
              <HStack gap={1}>
                <Users size={14} />
                <Text>{job.number_of_candidates} applicants</Text>
              </HStack>
            )}
          </HStack>
        </VStack>

        <Separator />

        {/* Job Overview */}
        <Card.Root variant='outline'>
          <CardHeader pb={3}>
            <Heading size='md'>Job Overview</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Grid
              templateColumns={{ base: '1fr', md: '1fr 1fr' }}
              gap={{ base: 3, md: 4 }}
            >
              <HStack gap={2}>
                <DollarSign size={16} color='fg.muted' />
                <VStack align='start' gap={0}>
                  <Text fontSize='xs' color='fg.muted'>
                    Salary Range
                  </Text>
                  <Text fontWeight='medium' fontSize='sm'>
                    {job.salaryRange?.displayText || 'Not specified'}
                  </Text>
                </VStack>
              </HStack>

              <HStack gap={2}>
                <Briefcase size={16} color='fg.muted' />
                <VStack align='start' gap={0}>
                  <Text fontSize='xs' color='fg.muted'>
                    Employment Type
                  </Text>
                  <Text fontWeight='medium' fontSize='sm'>
                    {job.type ? getTypeBadge(job.type) : 'Not specified'}
                  </Text>
                </VStack>
              </HStack>

              <HStack gap={2}>
                <Calendar size={16} color='fg.muted' />
                <VStack align='start' gap={0}>
                  <Text fontSize='xs' color='fg.muted'>
                    Posted Date
                  </Text>
                  <Text fontWeight='medium' fontSize='sm'>
                    {job.createdAt}
                  </Text>
                </VStack>
              </HStack>

              <HStack gap={2}>
                <Clock size={16} color='fg.muted' />
                <VStack align='start' gap={0}>
                  <Text fontSize='xs' color='fg.muted'>
                    Application Deadline
                  </Text>
                  <Text fontWeight='medium' fontSize='sm'>
                    Open until filled
                  </Text>
                </VStack>
              </HStack>
            </Grid>
          </CardBody>
        </Card.Root>

        {/* Job Description */}
        <VStack align='start' gap={3}>
          <Heading size='md'>Job Description</Heading>
          <Text lineHeight='1.6' color='fg.default'>
            {job.description}
          </Text>
        </VStack>

        {/* Apply Button */}
        <Box pt={4}>
          <Button
            colorPalette='primary'
            size='lg'
            w='full'
            onClick={handleApplyClick}
          >
            Apply for this Position
          </Button>
          <Text fontSize='xs' color='fg.muted' textAlign='center' mt={2}>
            You'll need to create an account or sign in to apply
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
