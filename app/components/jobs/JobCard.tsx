import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Box,
} from '@chakra-ui/react';
import { MapPin, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Job } from '../../types/jobs';

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  onSelect?: (job: Job) => void;
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

export function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(job);
    } else {
      navigate(`/jobs/${job.id}`);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/jobs/${job.id}/apply`);
  };

  return (
    <Card.Root
      cursor='pointer'
      transition='all 0.2s'
      _hover={{
        shadow: 'md',
        transform: 'translateY(-1px)',
        borderColor: 'border.emphasized',
      }}
      borderWidth='1px'
      borderColor={isSelected ? 'border.emphasized' : 'border.default'}
      bg={isSelected ? 'bg.subtle' : 'bg.default'}
      onClick={handleCardClick}
    >
      <CardHeader pb={3}>
        <VStack align='start' gap={2} w='full'>
          <HStack justify='space-between' w='full'>
            <Heading
              size='md'
              fontWeight='semibold'
              textOverflow='ellipsis'
              overflow='hidden'
              whiteSpace='nowrap'
            >
              {job.title}
            </Heading>
            <HStack gap={2}>
              {getStatusBadge(job.status)}
              {getTypeBadge(job.type)}
            </HStack>
          </HStack>

          <HStack gap={4} color='fg.muted' fontSize='sm'>
            {job.number_of_candidates !== undefined && (
              <HStack gap={1}>
                <Users size={14} />
                <Text>{job.number_of_candidates} applicants</Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack align='start' gap={3}>
          <Text
            color='fg.muted'
            fontSize='sm'
            lineHeight='1.5'
            overflow='hidden'
            display='-webkit-box'
            style={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {job.description}
          </Text>

          <HStack justify='space-between' w='full'>
            <Text fontWeight='medium' color='fg.default' fontSize='md'>
              {job.salaryRange?.displayText ||
                job.salary_display_text ||
                'Salary not specified'}
            </Text>

            <Button size='sm' colorPalette='primary' onClick={handleApplyClick}>
              Apply Now
            </Button>
          </HStack>

          <HStack gap={1} color='fg.muted' fontSize='xs'>
            <Calendar size={12} />
            <Text>Posted {job.createdAt}</Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}
