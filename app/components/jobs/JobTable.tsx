import { Badge, VStack, Text, Button } from '@chakra-ui/react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { EnhancedTable, type TableColumn } from '../table';
import type { Job } from '../../types/jobs';

export interface JobTableProps {
  data: Job[];
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
}

const getStatusBadge = (status: Job['status']) => {
  const variants = {
    active: { colorPalette: 'green', label: 'Active' },
    inactive: { colorPalette: 'red', label: 'Inactive' },
    draft: { colorPalette: 'yellow', label: 'Draft' },
  };

  const variant = variants[status];
  return (
    <Badge colorPalette={variant.colorPalette} variant='solid'>
      {variant.label}
    </Badge>
  );
};

export function JobTable({ data, onEdit, onDelete }: JobTableProps) {
  const navigate = useNavigate();

  const handleViewCandidates = (job: Job) => {
    navigate('/admin/candidates');
  };

  const columns: TableColumn<Job>[] = [
    {
      key: 'position',
      title: 'Position',
      render: (job) => (
        <VStack align='start' gap={1}>
          <Text fontWeight='medium' fontSize={{ base: 'sm', md: 'md' }}>
            {job.title}
          </Text>
        </VStack>
      ),
    },

    {
      key: 'status',
      title: 'Status',
      render: (job) => getStatusBadge(job.status),
    },
    {
      key: 'salaryRange',
      title: 'Salary Range',
      render: (job) => (
        <Text fontSize={{ base: 'xs', md: 'sm' }}>
          {job.salaryRange?.displayText ||
            job.salary_display_text ||
            'Not specified'}
        </Text>
      ),
    },
    {
      key: 'applicants',
      title: 'Applicants',
      render: (job) => (
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          {job.number_of_candidates || 0}
        </Text>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (job) => (
        <Button
          size='sm'
          colorPalette='primary'
          onClick={() => handleViewCandidates(job)}
          gap={2}
        >
          <Users size={14} />
          Manage Job
        </Button>
      ),
    },
  ];

  return (
    <EnhancedTable
      data={data}
      columns={columns}
      pagination={{
        count: data.length,
        pageSize: 10,
        defaultPage: 1,
        showPageSizeSelector: true,
        pageSizeOptions: [10, 25, 50, 100],
        showPageInfo: true,
      }}
    />
  );
}
