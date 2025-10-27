import {
  Card,
  CardBody,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Box,
} from '@chakra-ui/react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Job } from '../../types/jobs';

interface AdminJobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}

const getStatusBadge = (status: Job['status']) => {
  const variants = {
    active: { colorPalette: 'green', label: 'Active' },
    inactive: { colorPalette: 'red', label: 'Inactive' },
    draft: { colorPalette: 'gray', label: 'Draft' },
  };

  const variant = variants[status];
  return (
    <Badge colorPalette={variant.colorPalette} variant='outline' size='sm'>
      {variant.label}
    </Badge>
  );
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'No date';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export function AdminJobCard({ job, onEdit, onDelete }: AdminJobCardProps) {
  const navigate = useNavigate();

  const salaryText =
    job.salaryRange?.displayText ||
    job.salary_display_text ||
    'Salary not specified';

  return (
    <Card.Root
      transition='all 0.2s'
      _hover={{
        shadow: 'md',
        transform: 'translateY(-1px)',
        borderColor: 'border.emphasized',
      }}
      borderWidth='1px'
      borderColor='border.default'
      bg='bg.default'
      height='100%'
      display='flex'
      flexDirection='column'
      w='full'
    >
      <CardBody p={4} flex={1} display='flex' flexDirection='column'>
        <VStack align='start' gap={3} flex={1}>
          {/* Header: Status chip and Created date */}
          <HStack>
            {getStatusBadge(job.status)}
            <HStack gap={1} color='fg.muted' fontSize='sm'>
              <Badge variant='outline' colorPalette='muted' size='sm'>
                started on {formatDate(job.created_at || job.createdAt)}
              </Badge>
            </HStack>
          </HStack>

          {/* Title */}
          <Text fontWeight='bold'>{job.title}</Text>

          {/* Spacer to push content to bottom */}
          <Box flex={1} />

          {/* Salary Range */}
          <HStack justifyContent='space-between' w='full'>
            {' '}
            <Text color='fg.muted' fontSize='md'>
              {salaryText}
            </Text>
            {/* Manage Job Button */}
            <Button
              size='sm'
              colorPalette='primary'
              onClick={() => navigate(`/admin/candidates/${job.id}`)}
            >
              Manage Job
            </Button>{' '}
          </HStack>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}
