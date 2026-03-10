"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { IconBrightness } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("ThemeSwitcher");

  const handleThemeToggle = useCallback(
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      // Set coordinates from the click event
      if (e) {
        root.style.setProperty("--x", `${e.clientX}px`);
        root.style.setProperty("--y", `${e.clientY}px`);
      }

      document.startViewTransition(() => {
        setTheme(newMode);
      });
    },
    [resolvedTheme, setTheme],
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group/toggle extend-touch-target size-8"
      onClick={handleThemeToggle}
      title={t("label")}
    >
      <IconBrightness />
      <span className="sr-only">{t("label")}</span>
    </Button>
  );
}
