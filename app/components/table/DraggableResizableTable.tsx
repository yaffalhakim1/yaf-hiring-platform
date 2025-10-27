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
import { Resizable } from 're-resizable';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { GripVertical } from 'lucide-react';
import type { PaginationProps } from './types';
import { NoCandidatesState } from '../ui/EmptyState';

interface DraggableResizableTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    title: string;
    render: (item: T) => React.ReactNode;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
  }>;
  variant?: 'line' | 'outline';
  pagination?: PaginationProps;
  onColumnOrderChange?: (newOrder: string[]) => void;
}

// ==============================================================

// Sortable Column Header Component
interface SortableColumnHeaderProps {
  columnKey: string;
  title: string;
}

// individual sortable column header
const SortableColumnHeader: React.FC<SortableColumnHeaderProps> = ({
  columnKey,
  title,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      display='flex'
      alignItems='center'
      gap={2}
      cursor={isDragging ? 'grabbing' : 'grab'}
      userSelect='none'
      h='full'
      px={2}
    >
      <Box
        {...attributes}
        {...listeners}
        color='fg.muted'
        _hover={{ color: 'fg.default' }}
        transition='colors 0.2s'
      >
        <GripVertical size={14} />
      </Box>
      <Text fontWeight='medium' flex={1}>
        {title}
      </Text>
    </Box>
  );
};

// ==============================================================

export const DraggableResizableTable = <T,>({
  data,
  columns,
  variant = 'outline',
  pagination,
  onColumnOrderChange,
}: DraggableResizableTableProps<T>) => {
  const responsiveSize = useBreakpointValue({
    base: 'sm' as const,
    md: 'md' as const,
  });

  // State for column order
  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.key)
  );

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reorder columns based on columnOrder
  const orderedColumns = useMemo(() => {
    const orderMap = new Map(columnOrder.map((key, index) => [key, index]));
    return [...columns].sort(
      (a, b) => orderMap.get(a.key)! - orderMap.get(b.key)!
    );
  }, [columns, columnOrder]);

  // Handle drag end for column reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over!.id as string);

      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      setColumnOrder(newOrder);

      if (onColumnOrderChange) {
        onColumnOrderChange(newOrder);
      }
    }
  };

  // resizable update
  const updateColumnWidth = (columnKey: string, width: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnKey]: width,
    }));
  };

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

  // Show empty state if no data
  if (data.length === 0) {
    return (
      <VStack gap={4} w='full' align='stretch' justify='center' minH='400px'>
        <NoCandidatesState />
      </VStack>
    );
  }

  return (
    <VStack gap={4} w='full' align='stretch'>
      {/* Draggable & Resizable Table Container */}
      <Box borderWidth='1px' borderRadius='lg' w='full' overflow='hidden'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            <Flex direction='row' gap={0} w='full'>
              {orderedColumns.map((column, columnIndex) => (
                <Resizable
                  key={column.key}
                  size={{
                    width:
                      columnWidths[column.key] || column.defaultSize || 200,
                  }}
                  minWidth={column.minSize || 100}
                  maxWidth={500}
                  enable={{ right: columnIndex < orderedColumns.length - 1 }}
                  onResizeStop={(_e, _direction, ref, _d) => {
                    updateColumnWidth(column.key, ref.offsetWidth);
                  }}
                  handleComponent={{
                    right: (
                      <Box
                        w='1px'
                        h='full'
                        bg='black'
                        cursor='col-resize'
                        _hover={{ bg: 'border.emphasized' }}
                        transition='background-color 0.2s'
                        position='absolute'
                        right={0}
                        top={0}
                        zIndex={1}
                      />
                    ),
                  }}
                >
                  <Box h='full' overflow='hidden'>
                    <Table.Root size={responsiveSize} variant={variant}>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>
                            <SortableColumnHeader
                              columnKey={column.key}
                              title={column.title}
                            />
                          </Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {paginatedData.map((item) => (
                          <Table.Row key={(item as any).id}>
                            <Table.Cell>{column.render(item)}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Resizable>
              ))}
            </Flex>
          </SortableContext>
        </DndContext>
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
