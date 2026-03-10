"use client";

import type { ComponentProps, ReactNode } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface LoadingButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  /** Icon shown before text. Replaced by spinner when loading. */
  icon?: ReactNode;
}

export function LoadingButton({
  loading = false,
  disabled,
  icon,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading ? <IconLoader2 className="animate-spin" /> : icon}
      {children}
    </Button>
  );
}
