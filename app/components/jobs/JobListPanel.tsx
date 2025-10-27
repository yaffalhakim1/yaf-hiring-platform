import { useState, useMemo } from 'react';
import {
  VStack,
  HStack,
  Input,
  NativeSelect,
  Heading,
  Text,
  Box,
  Spinner,
  Grid,
} from '@chakra-ui/react';
import { Search, Filter } from 'lucide-react';
import {
  NoSearchResultsState,
  NoJobsState,
  LoadingState,
} from '../ui/EmptyState';
import type { Job } from '~/types/jobs';
import { JobCard } from './JobCard';

interface JobListPanelProps {
  jobs: Job[];
  selectedJobId?: string;
  onJobSelect?: (job: Job) => void;
  isLoading?: boolean;
}

const mockJobTypes = [
  'All Types',
  'full-time',
  'part-time',
  'contract',
  'internship',
];

export function JobListPanel({
  jobs,
  selectedJobId,
  onJobSelect,
  isLoading = false,
}: JobListPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Only show active jobs for public view
      if (job.status !== 'active') return false;

      // Search filter
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      // Type filter
      const matchesType = typeFilter === 'All Types' || job.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [jobs, searchTerm, typeFilter]);

  if (isLoading) {
    return (
      <LoadingState
        title='Memuat Lowongan'
        description='Sedang memuat data lowongan pekerjaan. Silakan tunggu sebentar...'
      />
    );
  }

  return (
    <VStack h='full' align='stretch' gap={4}>
      <Grid templateColumns='2fr 1fr 1fr 1fr' gap={3} alignItems='center'>
        <HStack gap={2}>
          <Input
            placeholder='Search jobs, keywords, or companies...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fontSize='sm'
          />
        </HStack>

        <NativeSelect.Root size='sm'>
          <NativeSelect.Field
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {mockJobTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Grid>

      {/* Results Count */}
      <HStack justify='space-between' align='center'>
        <Text fontSize='sm' color='fg.muted'>
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}{' '}
          found
        </Text>
        <HStack gap={1}>
          <Filter size={14} color='fg.muted' />
          <Text fontSize='sm' color='fg.muted'>
            Filters applied
          </Text>
        </HStack>
      </HStack>

      {/* Job List */}
      <VStack gap={3} align='stretch' flex={1} overflowY='auto'>
        {filteredJobs.length === 0 ? (
          jobs.length === 0 ? (
            <NoJobsState onAction={() => window.location.reload()} />
          ) : (
            <NoSearchResultsState
              onAction={() => {
                setSearchTerm('');

                setTypeFilter('All Types');
              }}
            />
          )
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={job.id === selectedJobId}
              onSelect={onJobSelect}
            />
          ))
        )}
      </VStack>
    </VStack>
  );
}
