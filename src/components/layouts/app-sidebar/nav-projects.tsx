"use client";

import { IconDots, IconFolder, IconShare, IconTrash, type Icon } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Dự Án</SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} className="flex">
            <SidebarMenuButton render={<Link href={item.url} />}>
              <item.icon />
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <SidebarMenuAction showOnHover render={<DropdownMenuTrigger />}>
                <IconDots />
                <span className="sr-only">Thêm</span>
              </SidebarMenuAction>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <IconFolder className="text-muted-foreground" />
                  <span>Xem Dự Án</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconShare className="text-muted-foreground" />
                  <span>Chia Sẻ Dự Án</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <IconTrash className="text-muted-foreground" />
                  <span>Xóa Dự Án</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>Thêm</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
