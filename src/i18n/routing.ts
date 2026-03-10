import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "@/config/app";

export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale,
});
