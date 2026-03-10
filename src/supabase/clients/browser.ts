import { createBrowserClient } from "@supabase/ssr";
import envConfig from "@/config/app";

export function createClient() {
  return createBrowserClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL!,
    envConfig.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
}
