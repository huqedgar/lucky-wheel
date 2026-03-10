"use client";

import { useTransition } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations, type Locale } from "next-intl";
import { IconLanguage } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const onLocaleChange = (nextLocale: string | null) => {
    startTransition(() => {
      router.replace({ pathname, params } as Parameters<typeof router.replace>[0], {
        locale: nextLocale as Locale,
      });
    });
  };

  return (
    <Select value={locale} onValueChange={onLocaleChange} disabled={isPending}>
      <SelectTrigger
        className="w-auto gap-2 border-none bg-transparent shadow-none disabled:opacity-100"
        aria-label={t("label")}
        render={<Button variant="ghost" />}
      >
        <IconLanguage className="size-4" />
        <span>{t("locale", { locale })}</span>
      </SelectTrigger>
      <SelectContent align="end">
        {routing.locales.map((cur) => (
          <SelectItem key={cur} value={cur}>
            {t("locale", { locale: cur })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
