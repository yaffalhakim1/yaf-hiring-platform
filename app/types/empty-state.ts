/**
 * Empty State Component Types
 * Types for state display components and configurations
 */

import { type ReactNode } from 'react';

export type StateType =
  | 'no-jobs'
  | 'no-search-results'
  | 'no-applications'
  | 'no-candidates'
  | 'no-data'
  | 'error'
  | 'success'
  | 'pending'
  | 'forbidden'
  | 'loading';

export interface StateDisplayProps {
  type: StateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: ReactNode;
}
