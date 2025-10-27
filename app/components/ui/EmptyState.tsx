import React from 'react';
import {
  Box,
  Button,
  EmptyState as ChakraEmptyState,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import {
  Search,
  Briefcase,
  Users,
  FileText,
  Inbox,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
} from 'lucide-react';
import type { StateType, StateDisplayProps } from '../../types/empty-state';

const stateConfig: Record<
  StateType,
  {
    icon: React.ReactNode;
    defaultTitle: string;
    defaultDescription: string;
    defaultActionText?: string;
  }
> = {
  'no-jobs': {
    icon: (
      <Box
        width={60}
        height={60}
        backgroundImage="url('/Empty State.svg')"
        backgroundSize='contain'
        backgroundRepeat='no-repeat'
        backgroundPosition='center'
      />
    ),
    defaultTitle: 'No job openings available',
    defaultDescription:
      'Create a job opening now and start the candidate process.',
    defaultActionText: 'Create a new job',
  },
  'no-search-results': {
    icon: <Search size={48} />,
    defaultTitle: 'No Search Results',
    defaultDescription:
      'No jobs match your search criteria. Try using different keywords.',
    defaultActionText: 'Reset Search',
  },
  'no-applications': {
    icon: <FileText size={48} />,
    defaultTitle: 'No Applications Yet',
    defaultDescription: 'No applicants have applied for this job opening yet.',
    defaultActionText: 'Share Job',
  },
  'no-candidates': {
    icon: <Users size={48} />,
    defaultTitle: 'No Candidates',
    defaultDescription: 'No candidates are available to review.',
  },
  'no-data': {
    icon: <Inbox size={48} />,
    defaultTitle: 'No Data',
    defaultDescription: 'No data is available to display.',
  },
  error: {
    icon: <AlertCircle size={48} />,
    defaultTitle: 'Error Occurred',
    defaultDescription:
      'An error occurred while loading data. Please try again.',
    defaultActionText: 'Try Again',
  },
  success: {
    icon: <CheckCircle size={48} />,
    defaultTitle: 'Success!',
    defaultDescription: 'Operation completed successfully.',
  },
  pending: {
    icon: <Clock size={48} />,
    defaultTitle: 'Pending',
    defaultDescription: 'Data is being processed. Please wait a moment.',
  },
  forbidden: {
    icon: <Ban size={48} />,
    defaultTitle: 'Access Denied',
    defaultDescription: 'You do not have permission to access this page.',
    defaultActionText: 'Go Back',
  },
  loading: {
    icon: <Spinner size='xl' />,
    defaultTitle: 'Loading Data',
    defaultDescription: 'Data is being loaded. Please wait a moment.',
  },
};

export default function StateDisplay({
  type,
  title,
  description,
  actionText,
  onAction,
  icon,
}: StateDisplayProps) {
  const config = stateConfig[type];

  return (
    <ChakraEmptyState.Root>
      <ChakraEmptyState.Content>
        <ChakraEmptyState.Indicator>
          {icon || config.icon}
        </ChakraEmptyState.Indicator>
        <ChakraEmptyState.Title>
          {title || config.defaultTitle}
        </ChakraEmptyState.Title>
        <ChakraEmptyState.Description>
          <VStack>
            {description || config.defaultDescription}
            {actionText || config.defaultActionText ? (
              <Button onClick={onAction} mt={4}>
                {actionText || config.defaultActionText}
              </Button>
            ) : null}
          </VStack>
        </ChakraEmptyState.Description>
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
}

// Pre-configured StateDisplay components for common use cases
export const NoJobsState = ({ onAction }: { onAction?: () => void }) => (
  <StateDisplay type='no-jobs' onAction={onAction} />
);

export const NoSearchResultsState = ({
  onAction,
}: {
  onAction?: () => void;
}) => <StateDisplay type='no-search-results' onAction={onAction} />;

export const NoApplicationsState = ({
  onAction,
}: {
  onAction?: () => void;
}) => <StateDisplay type='no-applications' onAction={onAction} />;

export const NoCandidatesState = ({ onAction }: { onAction?: () => void }) => (
  <StateDisplay type='no-candidates' onAction={onAction} />
);

export const ErrorState = ({ onAction }: { onAction?: () => void }) => (
  <StateDisplay type='error' onAction={onAction} />
);

export const NoDataState = () => <StateDisplay type='no-data' />;

export const LoadingState = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => <StateDisplay type='loading' title={title} description={description} />;
