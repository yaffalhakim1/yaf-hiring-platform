import {
  Table,
  useBreakpointValue,
  Pagination,
  ButtonGroup,
  IconButton,
  VStack,
  HStack,
  NativeSelect,
  Text,
  Flex,
  Box,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { PaginationProps } from './types';

interface ResizableTableProps<T> {
  data: T[];
  columnGroups: {
    key: string;
    columns: Array<{
      key: string;
      title: string;
      render: (item: T) => React.ReactNode;
    }>;
    defaultSize?: number;
    minSize?: number;
  }[];
  variant?: 'line' | 'outline';
  pagination?: PaginationProps;
}

export const ResizableTable = <T,>({
  data,
  columnGroups,
  variant = 'outline',
  pagination,
}: ResizableTableProps<T>) => {
  // Handle responsive sizing internally
  const responsiveSize = useBreakpointValue({
    base: 'sm' as const,
    md: 'md' as const,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(pagination?.defaultPage || 1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);

  // Use controlled or uncontrolled state
  const isControlled = pagination?.page !== undefined;
  const current = isControlled ? pagination.page! : currentPage;
  const size = pagination?.pageSize || pageSize;

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return data;

    const startIndex = (current - 1) * size;
    const endIndex = startIndex + size;
    return data.slice(startIndex, endIndex);
  }, [data, current, size, pagination]);

  // Handle page change
  const handlePageChange = (details: { page: number }) => {
    if (isControlled && pagination?.onPageChange) {
      pagination.onPageChange(details);
    } else {
      setCurrentPage(details.page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    if (pagination?.onPageSizeChange) {
      pagination.onPageSizeChange({ pageSize: newSize });
    } else {
      setPageSize(newSize);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  const totalCount = pagination?.count || data.length;
  const totalPages = Math.ceil(totalCount / size);

  return (
    <VStack gap={4} w='full' align='stretch'>
      {/* Resizable Table Container */}
      <Box borderWidth='1px' borderRadius='lg' w='full' overflow='hidden'>
        <PanelGroup direction='horizontal'>
          {columnGroups.map((group, groupIndex) => (
            <Panel
              key={group.key}
              defaultSize={group.defaultSize || 25}
              minSize={group.minSize || 10}
            >
              <Box h='full' overflow='hidden'>
                <Table.Root size={responsiveSize} variant={variant}>
                  <Table.Header>
                    <Table.Row>
                      {group.columns.map((column) => (
                        <Table.ColumnHeader key={column.key}>
                          {column.title}
                        </Table.ColumnHeader>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedData.map((item) => (
                      <Table.Row key={(item as any).id}>
                        {group.columns.map((column) => (
                          <Table.Cell key={column.key}>
                            {column.render(item)}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Panel>
          ))}

          {/* Resize Handles */}
          {columnGroups.map(
            (_, index) =>
              index < columnGroups.length - 1 && (
                <PanelResizeHandle
                  key={`resize-handle-${index}`}
                  className='w-1 bg-border.hover hover:bg-border.emphasized transition-colors cursor-col-resize'
                  style={{
                    width: '4px',
                    backgroundColor: 'var(--colors-border-default)',
                    cursor: 'col-resize',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as unknown as HTMLElement;
                    target.style.backgroundColor =
                      'var(--colors-border-emphasized)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as unknown as HTMLElement;
                    target.style.backgroundColor =
                      'var(--colors-border-default)';
                  }}
                />
              )
          )}
        </PanelGroup>
      </Box>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <Flex
          justify='space-between'
          align='center'
          gap={4}
          direction={{ base: 'column', md: 'row' }}
        >
          {/* Page Size Selector */}
          {pagination.showPageSizeSelector && (
            <HStack gap={2} align='center'>
              <Text fontSize='sm' color='fg.muted'>
                Show
              </Text>
              <NativeSelect.Root size='sm' w='auto'>
                <NativeSelect.Field
                  value={size}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  {(pagination.pageSizeOptions || [10, 25, 50, 100]).map(
                    (option: number) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    )
                  )}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Text fontSize='sm' color='fg.muted'>
                entries
              </Text>
            </HStack>
          )}

          {/* Pagination */}
          <Pagination.Root
            count={totalCount}
            pageSize={size}
            page={current}
            onPageChange={handlePageChange}
            siblingCount={pagination?.siblingCount || 1}
          >
            <ButtonGroup variant='ghost' size='sm'>
              <Pagination.PrevTrigger asChild>
                <IconButton>‹</IconButton>
              </Pagination.PrevTrigger>

              <Pagination.Items
                render={(page) => (
                  <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
                    {page.value}
                  </IconButton>
                )}
              />

              <Pagination.NextTrigger asChild>
                <IconButton>›</IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>

          {/* Page Info */}
          {pagination.showPageInfo && (
            <Text fontSize='sm' color='fg.muted'>
              Showing {(current - 1) * size + 1} to{' '}
              {Math.min(current * size, totalCount)} of {totalCount} entries
            </Text>
          )}
        </Flex>
      )}
    </VStack>
  );
};
