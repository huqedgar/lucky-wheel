"use client";

import { useTranslations } from "next-intl";
import { IconBell, IconHome, IconLogout, IconSelector, IconUser } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/shared/user-avatar";
import { currentEmployeeKeys } from "@/hooks/use-current-employee";
import { signOut } from "@/actions/auth.actions";
import { useRouter } from "@/i18n/navigation";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const t = useTranslations("UserMenu");
  // Subscribe to currentEmployee cache — no extra fetch, just reacts to cache updates
  const { data: cachedEmployee } = useQuery({
    queryKey: currentEmployeeKeys.all,
    queryFn: () => Promise.resolve(null),
    enabled: false,
  });

  const emp = cachedEmployee as { full_name?: string; avatar_url?: string | null } | undefined;
  const displayName = emp?.full_name ?? user.name;
  const avatarUrl = emp?.avatar_url ?? user.avatar;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <UserAvatar name={displayName} email={user.email} avatar={avatarUrl} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName || user.email}</span>
              {displayName && <span className="truncate text-xs">{user.email}</span>}
            </div>
            <IconSelector className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar name={displayName} email={user.email} avatar={avatarUrl} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName || user.email}</span>
                    {displayName && <span className="truncate text-xs">{user.email}</span>}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/")}>
                <IconHome />
                {t("home")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <IconUser />
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
                <IconBell />
                {t("notifications")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <IconLogout />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
