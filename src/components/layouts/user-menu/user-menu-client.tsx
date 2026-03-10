"use client";

import { useTranslations } from "next-intl";
import {
  IconBell,
  IconBrightness,
  IconCheck,
  IconColumns1,
  IconDeviceLaptop,
  IconHome,
  IconLayoutDashboard,
  IconLogout,
  IconMoon,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLayout } from "@/components/providers/layout-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { currentEmployeeKeys } from "@/hooks/use-current-employee";
import { useRouter } from "@/i18n/navigation";

interface UserMenuClientProps {
  user: {
    email: string;
    name?: string;
    avatar?: string;
  };
  signOutAction: () => Promise<void>;
}

export function UserMenuClient({ user, signOutAction }: UserMenuClientProps) {
  const router = useRouter();
  const t = useTranslations("UserMenu");
  const { setTheme, theme } = useTheme();
  const { layout, setLayout } = useLayout();
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
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
        <UserAvatar name={displayName} email={user.email} avatar={avatarUrl} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar name={displayName} email={user.email} avatar={avatarUrl} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                {displayName && <span className="truncate font-medium">{displayName}</span>}
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
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
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <IconUser />
            {t("profile")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/notifications")}>
            <IconBell />
            {t("notifications")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <IconLayoutDashboard />
            {t("management")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Theme submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconBrightness />
              {t("theme")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <IconSun />
                {t("themeLight")}
                {theme === "light" && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <IconMoon />
                {t("themeDark")}
                {theme === "dark" && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <IconDeviceLaptop />
                {t("themeSystem")}
                {theme === "system" && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {/* Layout toggle */}
          <DropdownMenuItem onClick={() => setLayout(layout === "fixed" ? "full" : "fixed")}>
            <IconColumns1 />
            {layout === "fixed" ? t("layoutFull") : t("layoutFixed")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOutAction()}>
          <IconLogout />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
