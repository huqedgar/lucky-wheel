"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { NotificationBell } from "@/components/shared/notification-bell";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import { appDesktopNavEntries } from "./app-nav-data";
import { AppSearch } from "./app-search";

interface AppHeaderProps {
  userMenu?: React.ReactNode;
}

export function AppHeader({ userMenu }: AppHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container-wrapper px-6 3xl:fixed:px-0">
        <div className="flex h-(--header-height) items-center **:data-[slot=separator]:h-4! 3xl:fixed:container">
          <div className="mr-2 flex shrink-0 items-center gap-5">
            {/* Logo */}
            <Link href="/">
              <Image
                src="/svgs/bth-logo-1.svg"
                alt="Logo"
                className="h-8 min-w-12.5"
                width={50}
                height={32}
                loading="eager"
              />
            </Link>
            <p className="text-md hidden font-extrabold text-bth-primary uppercase xl:block">
              {t("Metadata.hospitalName")}
            </p>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <AppSearch className="hidden sm:flex" />
            <Separator orientation="vertical" className="hidden sm:block" />
            <NavigationMenu className="hidden overflow-hidden lg:flex">
              <NavigationMenuList>
                {appDesktopNavEntries.map((entry) => {
                  if (entry.kind === "link") {
                    const isActive =
                      entry.href === "/" ? pathname === "/" : pathname.startsWith(entry.href);

                    return (
                      <NavigationMenuItem key={entry.key}>
                        <NavigationMenuLink
                          render={<Link href={entry.href} />}
                          className={cn(navigationMenuTriggerStyle(), isActive && "bg-muted/50")}
                        >
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {t(entry.labelKey as any)}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    );
                  }

                  // Group with Trigger + Content dropdown
                  return (
                    <NavigationMenuItem key={entry.key}>
                      <NavigationMenuTrigger>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(entry.labelKey as any)}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul
                          className={cn(
                            "grid gap-1",
                            entry.items.length > 2 ? "w-100 lg:w-125 lg:grid-cols-2" : "w-75",
                          )}
                        >
                          {entry.items.map((item) => (
                            <NavListItem
                              key={item.key}
                              href={item.href}
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              title={t(item.labelKey as any)}
                              icon={<item.icon className="size-4 shrink-0 text-muted-foreground" />}
                            >
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {t(item.descriptionKey as any)}
                            </NavListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
            <Separator orientation="vertical" className="hidden lg:block" />
            <LocaleSwitcher />
            <Separator orientation="vertical" />
            <NotificationBell variant="app" />
            <Separator orientation="vertical" />
            {userMenu}
          </div>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// NavListItem — NavigationMenu dropdown content item (follows example.tsx)
// =============================================================================

function NavListItem({
  title,
  children,
  href,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink
        render={
          <Link href={href}>
            <div className="flex items-start gap-2.5">
              {icon && <span className="mt-0.5">{icon}</span>}
              <div className="flex flex-col gap-1 text-sm">
                <div className="leading-none font-medium">{title}</div>
                <div className="line-clamp-2 text-muted-foreground">{children}</div>
              </div>
            </div>
          </Link>
        }
      />
    </li>
  );
}
