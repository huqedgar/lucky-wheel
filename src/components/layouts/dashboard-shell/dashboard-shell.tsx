"use client";

import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, type SystemRole } from "@/components/layouts/app-sidebar";
import { Search, SearchProvider } from "@/components/layouts/command-palette";
import { DashboardSettings, useDashboardSettings } from "@/components/layouts/dashboard-settings";
import { DynamicBreadcrumb } from "@/components/shared/dynamic-breadcrumb";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { cn } from "@/lib/utils";

interface DashboardUser {
  name: string;
  email: string;
  avatar: string;
}

export function DashboardShell({
  children,
  user,
  userRole,
}: {
  children: React.ReactNode;
  user: DashboardUser;
  userRole: SystemRole;
}) {
  const { stickyHeader, sidebarVariant } = useDashboardSettings();
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stickyHeader) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsStuck(false);
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [stickyHeader]);

  const isFloating = sidebarVariant === "floating";
  const isInset = sidebarVariant === "inset";

  return (
    <SearchProvider>
      <SidebarProvider>
        <AppSidebar user={user} userRole={userRole} />
        <SidebarInset className={cn("min-w-0", stickyHeader && isInset && "ml-2!")}>
          <div ref={sentinelRef} className="h-0 w-full" />
          <header
            className={cn(
              "flex h-16 shrink-0 items-center gap-2 border-b transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
              stickyHeader && "sticky top-0 z-10 bg-background",
              stickyHeader && isFloating && "ml-[1.5px]",
              stickyHeader && isInset && !isStuck && "rounded-t-lg",
            )}
          >
            <div className="flex w-full items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2" />
              <DynamicBreadcrumb />
              <div className="ml-auto flex items-center gap-2">
                <Search />
                <Separator orientation="vertical" />
                <ThemeSwitcher />
                <Separator orientation="vertical" />
                <NotificationBell variant="dashboard" />
                <Separator orientation="vertical" />
                <DashboardSettings />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}
