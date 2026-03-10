"use client";

import * as React from "react";
import { IconDotsVertical } from "@tabler/icons-react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableRowActionsProps, RowAction } from "./types";

export function DataTableRowActions<TData>({ row, actions }: DataTableRowActionsProps<TData>) {
  const [confirmAction, setConfirmAction] = React.useState<RowAction<TData> | null>(null);

  const handleActionClick = React.useCallback(
    (action: RowAction<TData>) => {
      if (action.variant === "destructive") {
        setConfirmAction(action);
      } else {
        action.onClick(row);
      }
    },
    [row],
  );

  const handleConfirm = React.useCallback(() => {
    if (confirmAction) {
      confirmAction.onClick(row);
      setConfirmAction(null);
    }
  }, [confirmAction, row]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            />
          }
        >
          <IconDotsVertical />
          <span className="sr-only">Mở menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-fit">
          {actions.map((action, index) => (
            <React.Fragment key={action.label}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={action.variant === "destructive" ? "destructive" : undefined}
                onClick={() => handleActionClick(action)}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn thực hiện hành động này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
