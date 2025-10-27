/**
 * UI Component State and Interface Types
 * Centralized type definitions for UI components, states, and interactions
 */

import { type ReactNode } from 'react';

// State Display Types (from EmptyState component)
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

// Form Component Types
export interface FormOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FormFieldBase {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface FormInputProps extends FormFieldBase {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface FormTextareaProps extends FormFieldBase {
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface FormSelectProps extends FormFieldBase {
  options: FormOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export interface FormFileProps extends FormFieldBase {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  value?: File[];
}

// Layout Component Types
export interface SidebarContentProps {
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export interface NavbarProps {
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

// Guard Component Types
export interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

// Error Component Types
export interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showStackTrace?: boolean;
  stackTrace?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

// Loading Component Types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  label?: string;
}

export interface LoadingSkeletonProps {
  height?: string | number;
  width?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | false;
}

// Modal/Dialog Component Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  children: ReactNode;
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

// Table Component Types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'solid' | 'outline' | 'ghost';
  colorPalette?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  key: string;
  value: any;
  operator?:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte';
}

// Toast Component Types
export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean;
}

// Pagination Component Types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationProps {
  count?: number;
  page?: number;
  pageSize?: number;
  defaultPage?: number;
  onPageChange?: (details: { page: number }) => void;
  onPageSizeChange?: (details: { pageSize: number }) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  siblingCount?: number;
}

// Search and Filter Types
export interface SearchConfig {
  query: string;
  fields: string[];
  enabled: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date';
  options: FilterOption[];
  value: any;
}

// Utility Types
export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'solid' | 'outline' | 'ghost' | 'subtle';
export type ColorPalette =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
