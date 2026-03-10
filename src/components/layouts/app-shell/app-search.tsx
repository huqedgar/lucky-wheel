"use client";

import { useTranslations } from "next-intl";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSearch } from "./app-search-provider";

type AppSearchProps = {
  className?: string;
};

export function AppSearch({ className }: AppSearchProps) {
  const { setOpen } = useAppSearch();
  const t = useTranslations();

  return (
    <Button
      variant="outline"
      className={cn(
        "group relative h-8 w-full flex-1 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-accent sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64",
        className,
      )}
      onClick={() => setOpen(true)}
    >
      <IconSearch
        aria-hidden="true"
        className="absolute inset-s-1.5 top-1/2 -translate-y-1/2"
        size={16}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <span className="ms-4">{t("AppNav.searchPlaceholder" as any)}</span>
      <kbd className="pointer-events-none absolute inset-e-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none group-hover:bg-accent sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
