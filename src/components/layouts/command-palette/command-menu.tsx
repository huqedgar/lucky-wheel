"use client";

import React from "react";
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
import { SidebarData } from "@/components/layouts/app-sidebar";
import { useRouter } from "@/i18n/navigation";
import { useSearch } from "./search-provider";

export function CommandMenu() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen],
  );

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Tìm kiếm..." />
      <CommandList>
        <ScrollArea className="h-72 pe-1 pr-2">
          <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

          {(() => {
            const standalone = SidebarData.navMain.filter(
              (item) => !item.items || item.items.length === 0,
            );
            const groups = SidebarData.navMain.filter(
              (item) => item.items && item.items.length > 0,
            );
            return (
              <>
                {standalone.length > 0 && (
                  <CommandGroup heading="Tổng Quan">
                    {standalone.map((navItem) => (
                      <CommandItem
                        key={navItem.title}
                        value={navItem.title}
                        onSelect={() => runCommand(() => router.push(navItem.url))}
                      >
                        {navItem.icon && (
                          <navItem.icon className="size-4 text-muted-foreground/80" />
                        )}
                        <span>{navItem.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {groups.map((navItem) => (
                  <CommandGroup key={navItem.title} heading={navItem.title}>
                    {navItem.items!.map((subItem) => (
                      <CommandItem
                        key={`${navItem.title}-${subItem.title}`}
                        value={`${navItem.title} ${subItem.title}`}
                        onSelect={() => runCommand(() => router.push(subItem.url))}
                      >
                        {navItem.icon && (
                          <navItem.icon className="size-4 text-muted-foreground/80" />
                        )}
                        <span>{subItem.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            );
          })()}

          {SidebarData.navSecondary.length > 0 && (
            <CommandGroup heading="Khác">
              {SidebarData.navSecondary.map((item) => (
                <CommandItem
                  key={item.title}
                  value={item.title}
                  onSelect={() => runCommand(() => router.push(item.url))}
                >
                  <item.icon className="size-4 text-muted-foreground/80" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Giao Diện">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <IconSun className="size-4" />
              <span>Sáng</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <IconMoon className="size-4" />
              <span>Tối</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <IconDeviceLaptop className="size-4" />
              <span>Hệ thống</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
