"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { IconDeviceLaptop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "@/i18n/navigation";
import { appCommandGroups, appCommandItems } from "./app-nav-data";
import { useAppSearch } from "./app-search-provider";

export function AppCommandMenu() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { open, setOpen } = useAppSearch();
  const t = useTranslations();

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen],
  );

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CommandInput placeholder={t("AppNav.searchPlaceholder" as any)} />
      <CommandList>
        <ScrollArea className="h-72 pe-1 pr-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <CommandEmpty>{t("AppNav.noResults" as any)}</CommandEmpty>

          {appCommandGroups.map((groupKey) => {
            const items = appCommandItems.filter((item) => item.group === groupKey);
            if (items.length === 0) return null;

            return (
              <CommandGroup
                key={groupKey}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                heading={t(groupKey as any)}
              >
                {items.map((item) => (
                  <CommandItem
                    key={item.key}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={t(item.labelKey as any)}
                    onSelect={() => runCommand(() => router.push(item.href))}
                  >
                    <item.icon className="size-4 text-muted-foreground/80" />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <span>{t(item.labelKey as any)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

          <CommandSeparator />

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <CommandGroup heading={t("AppNav.themeGroup" as any)}>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <IconSun className="size-4" />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span>{t("AppNav.themeLight" as any)}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <IconMoon className="size-4" />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span>{t("AppNav.themeDark" as any)}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <IconDeviceLaptop className="size-4" />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span>{t("AppNav.themeSystem" as any)}</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
