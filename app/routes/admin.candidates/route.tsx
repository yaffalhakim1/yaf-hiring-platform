import React from 'react';
import { Container } from '@chakra-ui/react';
import { CandidatesTable } from '../../components/candidates/CandidatesTable';
import { useCandidates } from '~/hooks/useCandidates';
import { ErrorState, LoadingState } from '~/components/ui/EmptyState';

export default function CandidatesPage() {
  const { candidates, isLoading, error } = useCandidates();

  // Get unique job titles for filter
  const jobOptions = [
    { label: 'All Jobs', value: 'all' },
    ...Array.from(
      new Set(candidates.map((c) => c.jobTitle || '').filter(Boolean))
    ).map((job) => ({
      label: job,
      value: job,
    })),
  ];

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState />;
  }

  return (
    <Container clearTop>
      <CandidatesTable
        candidates={candidates}
        showJobFilter={true}
        jobOptions={jobOptions}
      />
    </Container>
  );
}
