import type { routing } from "@/i18n/routing";
import type messages from "./messages/vi.json";

// Type declarations for next-intl
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}

// Type declarations for CSS imports
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
