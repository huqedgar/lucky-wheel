"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IconChevronDown, IconLayoutColumns } from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableBulkActions } from "./data-table-bulk-actions";
import { DraggableRow } from "./data-table-drag";
import { DataTablePagination } from "./data-table-pagination";
import { DEFAULT_PAGE_SIZE, type DataTableProps } from "./types";

export function DataTable<TData>({
  data: initialData,
  columns,
  enableDragDrop = false,
  enableRowSelection = false,
  enablePagination = true,
  isLoading = false,
  loadingRows,
  toolbarLeft,
  toolbarRight,
  getRowId,
  pageSizeOptions,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  bulkActions = [],
  columnLabels = {},
  noResultsText = "Không có kết quả.",
  meta,
  manualPagination = false,
  pageCount,
  totalRowCount,
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
}: DataTableProps<TData>) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [localPagination, setLocalPagination] = React.useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const pagination = controlledPagination ?? localPagination;

  const skipPageResetRef = React.useRef(false);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const sortableId = React.useId();

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const defaultGetRowId = React.useCallback(
    (row: TData, index: number) => {
      if (getRowId) return getRowId(row);
      if (typeof row === "object" && row !== null && "id" in row) {
        return String((row as Record<string, unknown>).id);
      }
      return String(index);
    },
    [getRowId],
  );

  const handlePaginationChange =
    controlledOnPaginationChange ??
    ((updater) => {
      if (skipPageResetRef.current) {
        skipPageResetRef.current = false;
        return;
      }
      setLocalPagination(updater);
    });

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table API is designed this way
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    meta,
    getRowId: defaultGetRowId,
    enableRowSelection,
    manualPagination,
    ...(manualPagination && pageCount != null ? { pageCount } : {}),
    ...(manualPagination && totalRowCount != null ? { rowCount: totalRowCount } : {}),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : enablePagination
        ? getPaginationRowModel()
        : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const tableRows = table.getRowModel().rows;
  const currentPageRowIds = React.useMemo<UniqueIdentifier[]>(
    () => tableRows.map((row) => row.id as UniqueIdentifier),
    [tableRows],
  );

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const skeletonRowCount = loadingRows ?? pagination.pageSize ?? 5;
  const visibleColumnCount = table.getVisibleFlatColumns().length;

  const skeletonBody = isLoading ? (
    <>
      {Array.from({ length: skeletonRowCount }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: visibleColumnCount }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  ) : null;

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (active && over && active.id !== over.id) {
        skipPageResetRef.current = true;
        setData((currentData) => {
          const oldIndex = currentData.findIndex(
            (item) => defaultGetRowId(item, 0) === String(active.id),
          );
          const newIndex = currentData.findIndex(
            (item) => defaultGetRowId(item, 0) === String(over.id),
          );
          return arrayMove(currentData, oldIndex, newIndex);
        });
      }
    },
    [defaultGetRowId],
  );

  const hideableColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide()),
    [table],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">{toolbarLeft}</div>
        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <IconLayoutColumns />
              <span className="hidden lg:inline">Tùy chỉnh cột</span>
              <span className="lg:hidden">Cột</span>
              <IconChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {columnLabels[column.id] || column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {toolbarRight}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        {enableDragDrop ? (
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {skeletonBody ??
                  (tableRows?.length ? (
                    <SortableContext
                      items={currentPageRowIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {tableRows.map((row) => (
                        <DraggableRow
                          key={`${row.id}-${row.getIsSelected()}-${row.getVisibleCells().length}`}
                          row={row}
                        />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        {noResultsText}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </DndContext>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {skeletonBody ??
                (tableRows?.length ? (
                  tableRows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {noResultsText}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>

      {enablePagination && table.getRowCount() > 0 && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}

      {enableRowSelection && bulkActions.length > 0 && (
        <DataTableBulkActions table={table} selectedRows={selectedRows} actions={bulkActions} />
      )}
    </div>
  );
}
