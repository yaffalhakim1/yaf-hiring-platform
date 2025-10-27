import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Input,
  NativeSelect,
  Grid,
} from '@chakra-ui/react';
import { DraggableResizableTable } from '../table/DraggableResizableTable';
import type { Candidate } from '~/types/jobs';

interface CandidatesTableProps {
  candidates: Candidate[];
  title?: string;
  description?: string;
  showJobFilter?: boolean;
  jobOptions?: Array<{ label: string; value: string }>;
  isLoading?: boolean;
  error?: any;
  onRetry?: () => void;
}

export function CandidatesTable({
  candidates,
  title,
  description,
  showJobFilter = true,
  jobOptions = [],
  isLoading = false,
  error = null,
  onRetry,
}: CandidatesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Reviewed', value: 'reviewed' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone?.includes(searchTerm) ||
      candidate.domicile?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || candidate.status === statusFilter;
    const matchesJob =
      !showJobFilter || jobFilter === 'all' || candidate.jobTitle === jobFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  // Define individual columns for draggable resizable table
  const columns = [
    {
      key: 'fullName',
      title: 'Name',
      render: (candidate: Candidate) => (
        <VStack align='start' gap={0}>
          <Text fontWeight='medium'>{candidate.fullName || 'N/A'}</Text>
        </VStack>
      ),
      defaultSize: 200,
      minSize: 150,
    },
    {
      key: 'email',
      title: 'Email',
      render: (candidate: Candidate) => (
        <Text fontSize='sm'>{candidate.email || 'N/A'}</Text>
      ),
      defaultSize: 200,
      minSize: 150,
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (candidate: Candidate) => (
        <Text fontSize='sm'>{candidate.phone || 'N/A'}</Text>
      ),
      defaultSize: 200,
      minSize: 150,
    },
    {
      key: 'status',
      title: 'Status',
      render: (candidate: Candidate) => (
        <Text fontSize='sm' textTransform='capitalize'>
          {candidate.status || 'pending'}
        </Text>
      ),
      defaultSize: 120,
      minSize: 100,
    },
    {
      key: 'linkedin',
      title: 'LinkedIn',
      render: (candidate: Candidate) => (
        <Text fontSize='sm' color='blue.600'>
          {candidate.linkedin || 'N/A'}
        </Text>
      ),
      defaultSize: 200,
      minSize: 150,
    },
    {
      key: 'domicile',
      title: 'Domicile',
      render: (candidate: Candidate) => (
        <Text fontSize='sm'>{candidate.domicile || 'N/A'}</Text>
      ),
      defaultSize: 200,
      minSize: 150,
    },
    {
      key: 'applied_at',
      title: 'Applied Date',
      render: (candidate: Candidate) => (
        <Text fontSize='sm'>
          {candidate.applied_at
            ? new Date(candidate.applied_at).toLocaleDateString()
            : 'N/A'}
        </Text>
      ),
      defaultSize: 150,
      minSize: 120,
    },
    ...(showJobFilter
      ? [
          {
            key: 'jobTitle',
            title: 'Applied For',
            render: (candidate: Candidate) => (
              <Text fontSize='sm' fontWeight='medium'>
                {candidate.jobTitle || 'N/A'}
              </Text>
            ),
            defaultSize: 200,
            minSize: 150,
          },
        ]
      : []),
  ];

  return (
    <VStack align='start' gap={6}>
      {/* Header */}
      <Box w='full'>
        <HStack justify='space-between' mb={4}>
          <Box>
            <Heading size='2xl' mb={2}>
              {title}
            </Heading>
            <Text color='fg.muted'>{description}</Text>
          </Box>
        </HStack>
      </Box>

      <Grid
        templateColumns={{
          base: '1fr',
          sm: '2fr 1fr',
          md: showJobFilter ? '3fr 1fr 1fr' : '3fr 1fr',
        }}
        gap={4}
        w='full'
      >
        <Input
          placeholder='Search candidates by name, email, phone, or domicile...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fontSize={{ base: 'sm', md: 'md' }}
        />

        <NativeSelect.Root w='full'>
          <NativeSelect.Field
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        {showJobFilter && (
          <NativeSelect.Root w='full' flex={1}>
            <NativeSelect.Field
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            >
              {jobOptions.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        )}
      </Grid>

      {/* Draggable & Resizable Candidates Table */}
      <DraggableResizableTable
        data={filteredCandidates}
        columns={columns}
        pagination={{
          pageSize: 10,
          showPageSizeSelector: true,
          showPageInfo: true,
          pageSizeOptions: [10, 25, 50],
        }}
      />
    </VStack>
  );
}
