import type { ReactNode } from 'react';

export interface TableColumn<T = any> {
  key: string;
  title: string;

  render: (item: T) => ReactNode;
}

export interface PaginationProps {
  count?: number;
  pageSize?: number;
  defaultPage?: number;
  page?: number;
  onPageChange?: (details: { page: number }) => void;
  onPageSizeChange?: (details: { pageSize: number }) => void;
  siblingCount?: number;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  showPageInfo?: boolean;
}

export interface EnhancedTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  stickyFirstColumn?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'line' | 'outline';
  pagination?: PaginationProps;
}
