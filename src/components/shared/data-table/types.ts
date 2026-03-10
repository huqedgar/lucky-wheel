import type * as React from "react";
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  Row,
  Table as TanstackTable,
} from "@tanstack/react-table";

// =============================================================================
// ROW ACTIONS
// =============================================================================

export interface RowAction<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

// =============================================================================
// BULK ACTIONS
// =============================================================================

export interface BulkActionConfig<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (rows: TData[]) => void;
  variant?: "default" | "destructive";
  requireConfirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string | ((count: number) => string);
}

// =============================================================================
// DATA TABLE
// =============================================================================

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  enableDragDrop?: boolean;
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  /** Show skeleton loading rows instead of data */
  isLoading?: boolean;
  /** Number of skeleton rows to show when loading (defaults to pageSize or 5) */
  loadingRows?: number;
  /** Content rendered on the left side of the toolbar (e.g. title, tabs) */
  toolbarLeft?: React.ReactNode;
  /** Extra content rendered after the column toggle button (e.g. add button) */
  toolbarRight?: React.ReactNode;
  getRowId?: (row: TData) => string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  bulkActions?: BulkActionConfig<TData>[];
  columnLabels?: Record<string, string>;
  noResultsText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: any;
  /** Server-side pagination: enable manual mode */
  manualPagination?: boolean;
  /** Server-side pagination: total page count from API */
  pageCount?: number;
  /** Server-side pagination: total row count from API */
  totalRowCount?: number;
  /** Controlled pagination state */
  pagination?: PaginationState;
  /** Callback when pagination changes */
  onPaginationChange?: OnChangeFn<PaginationState>;
}

// =============================================================================
// SUB-COMPONENT PROPS
// =============================================================================

export interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>;
  pageSizeOptions?: number[];
}

export interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>;
  columnLabels?: Record<string, string>;
  children?: React.ReactNode;
}

export interface DataTableBulkActionsProps<TData> {
  table: TanstackTable<TData>;
  selectedRows: Row<TData>[];
  actions: BulkActionConfig<TData>[];
}

export interface DataTableColumnHeaderProps<TData> {
  column: import("@tanstack/react-table").Column<TData>;
  title: string;
}

export interface DataTableRowActionsProps<TData> {
  row: TData;
  actions: RowAction<TData>[];
}

export interface DragHandleProps {
  id: string | number;
}

export interface DraggableRowProps<TData> {
  row: Row<TData>;
}

export interface DataTableInlineEditProps {
  id: string;
  label: string;
  defaultValue: string;
  onSubmit?: (value: string) => void;
}

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;
