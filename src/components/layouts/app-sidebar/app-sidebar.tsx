"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useDashboardSettings } from "@/components/layouts/dashboard-settings";
import { Link } from "@/i18n/navigation";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { SidebarData, type SystemRole } from "./sidebar-data";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: { name: string; email: string; avatar: string };
  userRole: SystemRole;
}

export function AppSidebar({ user, userRole, ...props }: AppSidebarProps) {
  const { sidebarVariant, showRail } = useDashboardSettings();

  return (
    <Sidebar variant={sidebarVariant} collapsible={"icon"} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <Image
                src="/images/bth-logo.webp"
                className="aspect-square size-8"
                width={32}
                height={32}
                alt="Logo"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-bth-primary uppercase">
                  Truyền Máu Huyết Học
                </span>
                <span className="truncate text-xs font-medium text-bth-secondary capitalize">
                  Hệ thống quản lý
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={SidebarData.navMain} userRole={userRole} />
        <NavSecondary items={SidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      {showRail && <SidebarRail />}
    </Sidebar>
  );
}
