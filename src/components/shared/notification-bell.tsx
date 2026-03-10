"use client";

import { IconBell } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import { useRealtimeInvalidation } from "@/supabase/realtime";
import { notificationKeys, useUnreadCount } from "@/queries/notifications.queries";
import { Link } from "@/i18n/navigation";

interface NotificationBellProps {
  variant: "app" | "dashboard";
}

export function NotificationBell({ variant }: NotificationBellProps) {
  const { data: employee } = useCurrentEmployee();
  const { data: unreadCount } = useUnreadCount(employee?.id);

  // Realtime: auto-invalidate notification queries on DB changes
  useRealtimeInvalidation({
    table: "notifications",
    queryKey: notificationKeys.all,
  });

  const href = variant === "app" ? "/notifications" : "/dashboard/notifications";
  const count = unreadCount ?? 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      nativeButton={false}
      render={<Link href={href} />}
    >
      <IconBell className="size-4" />
      {count > 0 && (
        <span className="text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold">
          {count < 100 ? count : "99+"}
        </span>
      )}
    </Button>
  );
}
