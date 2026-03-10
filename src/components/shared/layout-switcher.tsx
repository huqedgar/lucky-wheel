"use client";

import { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { IconColumns1 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/components/providers/layout-provider";
import { cn } from "@/lib/utils";

export function LayoutSwitcher({ className }: ComponentProps<typeof Button>) {
  const { layout, setLayout } = useLayout();
  const t = useTranslations("LayoutSwitcher");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const newLayout = layout === "fixed" ? "full" : "fixed";
        setLayout(newLayout);
      }}
      className={cn("size-8", className)}
      title={t("label")}
    >
      <span className="sr-only">{t("label")}</span>
      <IconColumns1 className="size-4.5" />
    </Button>
  );
}
