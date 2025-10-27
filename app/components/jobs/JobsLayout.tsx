import { JobListPanel } from './JobListPanel';
import type { Job } from '~/types/jobs';

interface JobsLayoutProps {
  jobs: Job[];
  isLoading?: boolean;
}

export function JobsLayout({ jobs, isLoading = false }: JobsLayoutProps) {
  return <JobListPanel jobs={jobs} isLoading={isLoading} />;
}
