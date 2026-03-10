"use client";

import { IconCheck, IconChevronDown, IconLayoutColumns } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableToolbarProps } from "./types";

export function DataTableToolbar<TData>({
  table,
  columnLabels = {},
  children,
}: DataTableToolbarProps<TData>) {
  const allColumns = table.getAllColumns();
  const hideableColumns = allColumns.filter(
    (column) => typeof column.accessorFn !== "undefined" && column.getCanHide(),
  );

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          <IconLayoutColumns />
          <span className="hidden lg:inline">Tùy chỉnh cột</span>
          <span className="lg:hidden">Cột</span>
          <IconChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {hideableColumns.map((column) => {
            const isVisible = column.getIsVisible();
            return (
              <DropdownMenuItem key={column.id} onClick={() => column.toggleVisibility(!isVisible)}>
                <span className="flex w-4 items-center justify-center">
                  {isVisible && <IconCheck className="size-4" />}
                </span>
                {columnLabels[column.id] || column.id}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {children}
    </div>
  );
}
