"use client";

import * as React from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import { hasMinRole, type NavMainItem, type SystemRole } from "./sidebar-data";

export function NavMain({ items, userRole }: { items: NavMainItem[]; userRole: SystemRole }) {
  const pathname = usePathname();

  const filteredItems = React.useMemo(() => {
    return items
      .filter((item) => hasMinRole(userRole, item.minRole ?? "STAFF"))
      .map((item) => {
        if (!item.items) return item;
        const filteredSubs = item.items.filter((sub) =>
          hasMinRole(userRole, sub.minRole ?? "STAFF"),
        );
        if (filteredSubs.length === 0) return null;
        return { ...item, items: filteredSubs };
      })
      .filter(Boolean) as NavMainItem[];
  }, [items, userRole]);

  // Controlled open state per group — auto-opens groups with active children
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of filteredItems) {
      if (item.items && item.items.length > 0) {
        initial[item.title] = !!item.isActive;
      }
    }
    return initial;
  });

  // Auto-open group when navigating to a sub-item
  React.useEffect(() => {
    setOpenGroups((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const item of filteredItems) {
        if (item.items && item.items.length > 0) {
          const hasActiveChild = item.items.some(
            (sub) => pathname === sub.url || pathname.startsWith(sub.url + "/"),
          );
          if (hasActiveChild && !prev[item.title]) {
            next[item.title] = true;
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [pathname, filteredItems]);

  const standaloneItems = filteredItems.filter((item) => !item.items || item.items.length === 0);
  const groupItems = filteredItems.filter((item) => item.items && item.items.length > 0);

  return (
    <>
      {standaloneItems.length > 0 && (
        <SidebarGroup>
          <SidebarMenu>
            {standaloneItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    render={<Link href={item.url} />}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      )}
      {groupItems.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>{"Quản Lý"}</SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {groupItems.map((item) => (
              <Collapsible
                key={item.title}
                open={openGroups[item.title] ?? false}
                onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [item.title]: open }))}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={item.title} render={<CollapsibleTrigger />}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <IconChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                  </SidebarMenuButton>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items!.map((subItem) => {
                        const isSubActive =
                          pathname === subItem.url || pathname.startsWith(subItem.url + "/");
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={isSubActive}
                              render={<Link href={subItem.url} />}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  );
}
