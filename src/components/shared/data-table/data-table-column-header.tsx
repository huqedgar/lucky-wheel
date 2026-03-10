"use client";

import { IconArrowsUpDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { DataTableColumnHeaderProps } from "./types";

export function DataTableColumnHeader<TData>({ column, title }: DataTableColumnHeaderProps<TData>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }

  return (
    <Button
      variant="ghost-input"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <IconArrowsUpDown />
    </Button>
  );
}
