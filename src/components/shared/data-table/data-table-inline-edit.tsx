"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DataTableInlineEditProps } from "./types";

export const DataTableInlineEdit = React.memo(function DataTableInlineEdit({
  id,
  label,
  defaultValue,
  onSubmit,
}: DataTableInlineEditProps) {
  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const input = form.elements.namedItem(id) as HTMLInputElement;
      input.blur();
      onSubmit?.(input.value);
    },
    [id, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Input
        className="h-8 w-full border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
        defaultValue={defaultValue}
        id={id}
      />
    </form>
  );
});
