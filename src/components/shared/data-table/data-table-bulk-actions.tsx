"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { BulkActionConfig, DataTableBulkActionsProps } from "./types";

export function DataTableBulkActions<TData>({
  table,
  selectedRows,
  actions,
}: DataTableBulkActionsProps<TData>) {
  const [confirmAction, setConfirmAction] = React.useState<BulkActionConfig<TData> | null>(null);
  const selectedCount = selectedRows.length;

  const handleResetSelection = React.useCallback(() => {
    table.resetRowSelection();
  }, [table]);

  const handleActionClick = React.useCallback(
    (action: BulkActionConfig<TData>) => {
      if (action.requireConfirm) {
        setConfirmAction(action);
      } else {
        const rows = selectedRows.map((row) => row.original);
        action.onClick(rows);
      }
    },
    [selectedRows],
  );

  const handleConfirm = React.useCallback(() => {
    if (confirmAction) {
      const rows = selectedRows.map((row) => row.original);
      confirmAction.onClick(rows);
      setConfirmAction(null);
    }
  }, [confirmAction, selectedRows]);

  const getConfirmDescription = React.useCallback(() => {
    if (!confirmAction) return "";
    if (typeof confirmAction.confirmDescription === "function") {
      return confirmAction.confirmDescription(selectedCount);
    }
    return (
      confirmAction.confirmDescription ??
      `Bạn có chắc chắn muốn thực hiện hành động này cho ${selectedCount} mục đã chọn?`
    );
  }, [confirmAction, selectedCount]);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out hover:scale-105">
        <div className="flex items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur-lg">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetSelection}
                  className="size-6 rounded-full"
                />
              }
            >
              <IconX className="size-3" />
              <span className="sr-only">Bỏ chọn</span>
            </TooltipTrigger>
            <TooltipContent>Bỏ chọn (Escape)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <div className="flex items-center gap-1 text-sm">
            <Badge variant="default" className="min-w-8 rounded-lg">
              {selectedCount}
            </Badge>
            <span className="hidden sm:inline">mục</span> đã chọn
          </div>

          <Separator orientation="vertical" className="h-5" />

          {actions.map((action) => (
            <Tooltip key={action.label}>
              <TooltipTrigger
                render={
                  <Button
                    variant={action.variant === "destructive" ? "destructive" : "outline"}
                    size="icon"
                    className="size-8"
                    onClick={() => handleActionClick(action)}
                  />
                }
              >
                {action.icon}
                <span className="sr-only">{action.label}</span>
              </TooltipTrigger>
              <TooltipContent>{action.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.confirmTitle ?? "Xác nhận"}</AlertDialogTitle>
            <AlertDialogDescription>{getConfirmDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmAction?.variant === "destructive"
                  ? "bg-destructive hover:bg-destructive/90"
                  : undefined
              }
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
