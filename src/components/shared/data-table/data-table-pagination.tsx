"use client";

import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PAGE_SIZE_OPTIONS, type DataTablePaginationProps } from "./types";

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [...DEFAULT_PAGE_SIZE_OPTIONS],
}: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getRowCount();

  const handlePageSizeChange = React.useCallback(
    (value: string | null) => {
      if (value) table.setPageSize(Number(value));
    },
    [table],
  );

  const handlePageInputBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const page = e.target.value ? Number(e.target.value) - 1 : 0;
      const validPage = Math.max(0, Math.min(page, table.getPageCount() - 1));
      e.target.value = String(validPage + 1);
      table.setPageIndex(validPage);
    },
    [table],
  );

  const handlePageInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const page = e.currentTarget.value ? Number(e.currentTarget.value) - 1 : 0;
        const validPage = Math.max(0, Math.min(page, table.getPageCount() - 1));
        e.currentTarget.value = String(validPage + 1);
        table.setPageIndex(validPage);
      }
    },
    [table],
  );

  return (
    <div className="flex items-center justify-between px-4">
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
        Đã chọn {selectedCount} / {totalCount} hàng.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            Số hàng mỗi trang
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-fit items-center justify-center gap-1.5 text-sm font-medium">
          <span className="hidden lg:inline">Trang</span>
          <Input
            key={table.getState().pagination.pageIndex}
            min={1}
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onBlur={handlePageInputBlur}
            onKeyDown={handlePageInputKeyDown}
            className="h-7 w-14 text-center"
          />
          <span>/ {table.getPageCount()}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Đến trang đầu</span>
            <IconChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang trước</span>
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang sau</span>
            <IconChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Đến trang cuối</span>
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
